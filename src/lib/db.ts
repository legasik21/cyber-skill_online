// Self-hosted PostgreSQL data-access layer (node-postgres `pg`).
//
// Replaces the former Supabase JS query-builder. A single Pool is created lazily
// and cached on globalThis so Next's dev HMR / the standalone server reuse one pool.
// Connections are not opened until the first query, so `next build` never needs the DB.

import { Pool } from 'pg';

// ---- Row types (shared with the client where imported as types only) ----
export interface Conversation {
  id: string;
  visitor_id: string;
  status: 'new' | 'active' | 'closed';
  assigned_agent_id: string | null;
  created_at: string;
  last_message_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'visitor' | 'agent';
  sender_id: string | null;
  body: string;
  created_at: string;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  action_type: string;
  conversation_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  created_at: string;
}

export interface ConversationListItem extends Conversation {
  last_message: { body: string; sender_type: string; created_at: string } | null;
}

// ---- Pool singleton ----
declare global {
  // eslint-disable-next-line no-var
  var __cyberskillPgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Missing DATABASE_URL environment variable');
  }
  const p = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  // node-postgres emits 'error' on idle clients (DB restart / network drop).
  // Without a listener Node treats it as an uncaught exception and crashes the
  // whole server — log it and let the pool recycle the connection instead.
  p.on('error', (err) => {
    console.error('[db] idle client error:', err);
  });
  return p;
}

export const pool: Pool = global.__cyberskillPgPool ?? (global.__cyberskillPgPool = createPool());

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}

// ---- Conversations ----
export async function createConversation(visitorId: string): Promise<Conversation> {
  const rows = await query<Conversation>(
    `INSERT INTO conversations (visitor_id, status) VALUES ($1, 'new') RETURNING *`,
    [visitorId],
  );
  if (!rows[0]) throw new Error('INSERT conversations returned no row');
  return rows[0];
}

export async function getVisitorConversation(
  id: string,
  visitorId: string,
): Promise<Conversation | null> {
  const rows = await query<Conversation>(
    `SELECT * FROM conversations WHERE id = $1 AND visitor_id = $2`,
    [id, visitorId],
  );
  return rows[0] ?? null;
}

export async function getConversationById(id: string): Promise<Conversation | null> {
  const rows = await query<Conversation>(`SELECT * FROM conversations WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function getLatestActiveConversation(visitorId: string): Promise<Conversation | null> {
  const rows = await query<Conversation>(
    `SELECT * FROM conversations WHERE visitor_id = $1 AND status = 'active'
     ORDER BY created_at DESC LIMIT 1`,
    [visitorId],
  );
  return rows[0] ?? null;
}

export async function updateConversation(
  id: string,
  fields: { status?: Conversation['status']; assigned_agent_id?: string | null },
): Promise<Conversation | null> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  let i = 1;
  if (fields.status !== undefined) {
    sets.push(`status = $${i++}`);
    vals.push(fields.status);
  }
  if (fields.assigned_agent_id !== undefined) {
    sets.push(`assigned_agent_id = $${i++}`);
    vals.push(fields.assigned_agent_id);
  }
  if (sets.length === 0) return getConversationById(id);
  vals.push(id);
  const rows = await query<Conversation>(
    `UPDATE conversations SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
    vals,
  );
  return rows[0] ?? null;
}

export async function deleteConversationsOlderThan(cutoffIso: string): Promise<number> {
  const rows = await query<{ id: string }>(
    `DELETE FROM conversations WHERE last_message_at < $1 RETURNING id`,
    [cutoffIso],
  );
  return rows.length;
}

export async function listConversations(opts: {
  status?: string;
  limit: number;
  offset: number;
}): Promise<{ conversations: ConversationListItem[]; total: number }> {
  const { status, limit, offset } = opts;
  const filtered = Boolean(status && status !== 'all');

  const listParams: unknown[] = [limit, offset];
  if (filtered) listParams.push(status);
  const conversations = await query<ConversationListItem>(
    `SELECT c.*,
       (SELECT json_build_object('body', m.body, 'sender_type', m.sender_type, 'created_at', m.created_at)
          FROM messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1) AS last_message
     FROM conversations c
     ${filtered ? 'WHERE c.status = $3' : ''}
     ORDER BY c.last_message_at DESC
     LIMIT $1 OFFSET $2`,
    listParams,
  );

  const countRows = await query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM conversations ${filtered ? 'WHERE status = $1' : ''}`,
    filtered ? [status] : [],
  );
  return { conversations, total: Number(countRows[0]?.count ?? 0) };
}

// ---- Messages ----
export async function insertMessage(input: {
  conversation_id: string;
  sender_type: 'visitor' | 'agent';
  sender_id: string | null;
  body: string;
}): Promise<Message> {
  const rows = await query<Message>(
    `INSERT INTO messages (conversation_id, sender_type, sender_id, body)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [input.conversation_id, input.sender_type, input.sender_id, input.body],
  );
  if (!rows[0]) throw new Error('INSERT messages returned no row');
  return rows[0];
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  return query<Message>(
    `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
    [conversationId],
  );
}

export async function getMessageById(id: string): Promise<Message | null> {
  const rows = await query<Message>(`SELECT * FROM messages WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function getMessageHistory(
  conversationId: string,
  limit: number,
): Promise<{ sender_type: 'visitor' | 'agent'; body: string }[]> {
  return query<{ sender_type: 'visitor' | 'agent'; body: string }>(
    `SELECT sender_type, body FROM messages
     WHERE conversation_id = $1 ORDER BY created_at ASC LIMIT $2`,
    [conversationId, limit],
  );
}

// ---- Admin action audit log ----
export async function insertAdminAction(input: {
  admin_id: string;
  action_type: string;
  conversation_id: string | null;
  details: Record<string, unknown> | null;
}): Promise<void> {
  await query(
    `INSERT INTO admin_actions (admin_id, action_type, conversation_id, details)
     VALUES ($1, $2, $3, $4)`,
    // node-postgres serializes a plain object to JSON for the jsonb column.
    [input.admin_id, input.action_type, input.conversation_id, input.details],
  );
}

// ---- Admin users (credential auth) ----
export async function getAdminUserByEmail(email: string): Promise<AdminUser | null> {
  const rows = await query<AdminUser>(
    `SELECT * FROM admin_users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    [email],
  );
  return rows[0] ?? null;
}
