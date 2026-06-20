// Self-hosted realtime: Postgres LISTEN/NOTIFY fanned out to in-process SSE streams.
//
// Replaces Ably. One dedicated LISTEN client per Node process receives NOTIFY on the
// `chat_events` channel and dispatches to the SSE connections subscribed to that
// conversation. Publishers issue NOTIFY through the shared pool. Because the signal
// travels through Postgres, this also works correctly across multiple app processes.
//
// NOTIFY payloads stay tiny (well under Postgres' ~8 KB limit): a `message` event
// carries only the row id and the Hub fetches the full row before fan-out.

import { Client } from 'pg';
import { pool, getMessageById } from '@/lib/db';

const CHANNEL = 'chat_events';

export type ChatEventType = 'message' | 'conversation_closed' | 'manager_typing' | 'ai_state';

type Sender = (event: string, data: string) => void;

interface Hub {
  client: Client | null;
  connecting: Promise<void> | null;
  subs: Map<string, Set<Sender>>;
}

declare global {
  // eslint-disable-next-line no-var
  var __cyberskillRealtimeHub: Hub | undefined;
}

const hub: Hub =
  global.__cyberskillRealtimeHub ??
  (global.__cyberskillRealtimeHub = { client: null, connecting: null, subs: new Map() });

async function ensureListening(): Promise<void> {
  if (hub.client) return;
  if (hub.connecting) return hub.connecting;

  hub.connecting = (async () => {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error('Missing DATABASE_URL environment variable');

    const client = new Client({ connectionString });
    client.on('notification', (msg) => {
      void onNotify(msg.payload);
    });
    client.on('error', (err) => {
      console.error('[realtime] LISTEN client error:', err);
      hub.client = null; // next subscribe()/publish() reconnects
      client.end().catch(() => {});
    });
    await client.connect();
    await client.query(`LISTEN ${CHANNEL}`);
    hub.client = client;
  })();

  try {
    await hub.connecting;
  } catch (err) {
    console.error('[realtime] ensureListening: failed to establish LISTEN connection:', err);
    throw err;
  } finally {
    hub.connecting = null;
  }
}

async function onNotify(payload: string | undefined): Promise<void> {
  if (!payload) return;
  let evt: {
    conversationId: string;
    type: ChatEventType;
    messageId?: string;
    isTyping?: boolean;
    paused?: boolean;
    reason?: string | null;
  };
  try {
    evt = JSON.parse(payload);
  } catch {
    return;
  }

  const set = hub.subs.get(evt.conversationId);
  if (!set || set.size === 0) return;

  let event: string;
  let data: string;
  if (evt.type === 'message') {
    if (!evt.messageId) return;
    const message = await getMessageById(evt.messageId);
    if (!message) return;
    event = 'message';
    data = JSON.stringify(message);
  } else if (evt.type === 'conversation_closed') {
    event = 'conversation_closed';
    data = JSON.stringify({ conversation_id: evt.conversationId, status: 'closed' });
  } else if (evt.type === 'manager_typing') {
    event = 'manager_typing';
    data = JSON.stringify({ isTyping: Boolean(evt.isTyping) });
  } else if (evt.type === 'ai_state') {
    event = 'ai_state';
    data = JSON.stringify({ paused: Boolean(evt.paused), reason: evt.reason ?? null });
  } else {
    return;
  }

  for (const send of set) {
    try {
      send(event, data);
    } catch {
      // A broken stream is cleaned up on its own abort handler; ignore here.
    }
  }
}

async function subscribe(conversationId: string, send: Sender): Promise<() => void> {
  await ensureListening();
  let set = hub.subs.get(conversationId);
  if (!set) {
    set = new Set();
    hub.subs.set(conversationId, set);
  }
  set.add(send);
  return () => {
    const s = hub.subs.get(conversationId);
    if (s) {
      s.delete(send);
      if (s.size === 0) hub.subs.delete(conversationId);
    }
  };
}

/**
 * Build an SSE Response bound to a conversation. Emits named events
 * (`message`, `conversation_closed`, `manager_typing`) mirroring the old Ably
 * channel, plus heartbeat comments. Tears down on client disconnect.
 */
export function sseResponse(conversationId: string, signal: AbortSignal): Response {
  const encoder = new TextEncoder();
  let unsub: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const safeEnqueue = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          closed = true;
        }
      };
      const send: Sender = (event, data) => safeEnqueue(`event: ${event}\ndata: ${data}\n\n`);

      const teardown = () => {
        if (closed) return;
        closed = true;
        if (heartbeat) clearInterval(heartbeat);
        if (unsub) unsub();
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      // Tell EventSource to retry quickly, then open the stream.
      safeEnqueue(`retry: 3000\n: connected\n\n`);
      try {
        unsub = await subscribe(conversationId, send);
      } catch (err) {
        // DB/LISTEN unavailable: emit a clean error event and tear down rather than
        // leaving a rejected start promise / unhandled rejection.
        console.error('[realtime] sseResponse: subscribe failed:', err);
        safeEnqueue(`event: error\ndata: ${JSON.stringify({ error: 'stream_unavailable' })}\n\n`);
        teardown();
        return;
      }
      heartbeat = setInterval(() => safeEnqueue(`: ping\n\n`), 20_000);

      if (signal.aborted) teardown();
      else signal.addEventListener('abort', teardown);
    },
    cancel() {
      closed = true;
      if (heartbeat) clearInterval(heartbeat);
      if (unsub) unsub();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      // Defensive: disable proxy buffering (harmless under Traefik, which streams).
      'X-Accel-Buffering': 'no',
    },
  });
}

// ---- Publishers (NOTIFY via the shared pool) ----
async function notify(payload: Record<string, unknown>): Promise<void> {
  await pool.query(`SELECT pg_notify($1, $2)`, [CHANNEL, JSON.stringify(payload)]);
}

export async function publishMessage(conversationId: string, messageId: string): Promise<void> {
  await notify({ conversationId, type: 'message', messageId });
}

export async function publishConversationClosed(conversationId: string): Promise<void> {
  await notify({ conversationId, type: 'conversation_closed' });
}

export async function publishManagerTyping(conversationId: string, isTyping: boolean): Promise<void> {
  await notify({ conversationId, type: 'manager_typing', isTyping });
}

/**
 * Broadcast an AI-state change (paused/resumed) to the visitor's stream so the
 * widget can show a small system note ("A team member is now with you") without
 * ever closing or disabling the visitor's input.
 */
export async function publishAiState(
  conversationId: string,
  paused: boolean,
  reason: string | null,
): Promise<void> {
  await notify({ conversationId, type: 'ai_state', paused, reason });
}
