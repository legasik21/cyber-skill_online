import { NextRequest, NextResponse } from 'next/server';
import {
  getVisitorConversation,
  insertMessage,
  getMessageHistory,
  getMessageCount,
  updateConversation,
  setConversationAiState,
  incrementAiAnswerCount,
  incrementOffTopic,
  resetOffTopic,
} from '@/lib/db';
import { publishMessage, publishManagerTyping, publishAiState } from '@/lib/realtime';
import { messageSchema } from '@/lib/validation';
import { MESSAGE_RATE_LIMIT, checkRateLimit } from '@/lib/ratelimit';
import {
  sendTelegramNotification,
  sendHandoffNotification,
  sendEscalationNotification,
} from '@/lib/telegram';
import {
  AI_CHAT_ENABLED,
  AI_AGENT_ID,
  isAiConfigured,
  OFF_TOPIC_LIMIT,
  AI_ANSWER_CAP,
  CANNED,
} from '@/lib/ai/config';
import { runAssistant, type ChatTurn } from '@/lib/ai/assistant';
import { classifyTopic } from '@/lib/ai/topic';

export const runtime = 'nodejs';
// Bounded window for the optional AI tool-loop + Gemini round-trips.
export const maxDuration = 60;

/** Insert an AI/agent message (owned by the AI agent) and publish it. Best-effort publish. */
async function postAgentMessage(conversationId: string, body: string) {
  const msg = await insertMessage({
    conversation_id: conversationId,
    sender_type: 'agent',
    sender_id: AI_AGENT_ID,
    body,
  });
  try {
    await publishMessage(conversationId, msg.id);
  } catch (err) {
    console.error('AI responder: publish failed:', err);
  }
  return msg;
}

/**
 * Send a message from visitor to chat.
 */
export async function POST(request: NextRequest) {
  try {
    const visitorId = request.cookies.get('visitor_id')?.value;
    if (!visitorId) {
      return NextResponse.json({ error: 'Visitor ID not found' }, { status: 401 });
    }

    const body = await request.json();
    const validation = messageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 },
      );
    }
    const { conversation_id, body: messageBody } = validation.data;

    // Rate limiting (10 messages per minute).
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`message:${visitorId}:${clientIp}`, MESSAGE_RATE_LIMIT);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many messages. Please wait before sending more.',
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime,
        },
        { status: 429 },
      );
    }

    // Verify conversation belongs to this visitor.
    const conversation = await getVisitorConversation(conversation_id, visitorId);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 },
      );
    }
    if (conversation.status === 'closed') {
      return NextResponse.json({ error: 'Conversation is closed' }, { status: 403 });
    }

    // The visitor's message is ALWAYS accepted + persisted + broadcast, regardless of
    // AI state — this is what keeps the visitor able to chat after an admin takeover.
    const message = await insertMessage({
      conversation_id,
      sender_type: 'visitor',
      sender_id: visitorId,
      body: messageBody,
    });

    // Realtime broadcast (best-effort: the message is already persisted).
    try {
      await publishMessage(conversation_id, message.id);
    } catch (err) {
      console.error('Error publishing message event:', err);
    }

    // Telegram notification only for the FIRST message of a NEW conversation. Gating
    // on the message count (the just-inserted message makes it 1) avoids duplicate
    // "New Chat Started!" alerts if the visitor sends again before the AI claims the
    // conversation and flips it to 'active'.
    if (conversation.status === 'new' && (await getMessageCount(conversation_id)) === 1) {
      sendTelegramNotification({
        visitorId,
        messageBody,
        conversationId: conversation_id,
        isNewConversation: true,
      }).catch((err) => console.error('Telegram notification error:', err));
    }

    // Native Gemini AI responder — fully guarded, OFF by default (AI_CHAT_ENABLED).
    // The model is SKIPPED entirely when the conversation's AI is paused (admin
    // takeover, off-topic cutoff, or answer cap). Isolated try/catch: any AI failure
    // never breaks the send. 'closed' already returned 403 → status is 'new'|'active'.
    const aiActive =
      AI_CHAT_ENABLED &&
      isAiConfigured() &&
      (conversation.assigned_agent_id === null || conversation.assigned_agent_id === AI_AGENT_ID);

    if (aiActive && !conversation.ai_paused) {
      try {
        const historyRows = await getMessageHistory(conversation_id, 30);
        const history: ChatTurn[] = historyRows.map((row) => ({
          sender_type: row.sender_type,
          body: row.body,
        }));

        // Claim ownership + activate the conversation (so future turns route to the
        // AI and an admin can take over later).
        const claimOwnership = () =>
          updateConversation(conversation_id, {
            assigned_agent_id: AI_AGENT_ID,
            status: conversation.status === 'new' ? 'active' : conversation.status,
          });

        // ---- Feature 3: off-topic guard + token-saving cutoff ----
        const topic = await classifyTopic(history, messageBody);

        if (topic === 'off') {
          const offTopicRun = await incrementOffTopic(conversation_id);
          await claimOwnership();
          if (offTopicRun >= OFF_TOPIC_LIMIT) {
            // Cutoff: pause the AI for this conversation, send ONE static line, no more LLM.
            await setConversationAiState(conversation_id, {
              ai_paused: true,
              pause_reason: 'off-topic',
            });
            await postAgentMessage(conversation_id, CANNED.offTopicPaused);
            // Best-effort: let any open admin/visitor stream reflect the pause live.
            await publishAiState(conversation_id, true, 'off-topic').catch((err) =>
              console.error('publishAiState (off-topic) failed:', err),
            );
          } else {
            // Static canned refusal (no model call) + counted strike.
            await postAgentMessage(conversation_id, CANNED.offTopicRefusal);
          }
        } else {
          // On-topic resets the off-topic run, then the assistant answers.
          if (conversation.consecutive_off_topic > 0) {
            await resetOffTopic(conversation_id);
          }

          await publishManagerTyping(conversation_id, true);
          try {
            const result = await runAssistant(history, { conversationId: conversation_id });

            await claimOwnership();
            await postAgentMessage(conversation_id, result.reply);

            // ---- Feature 5: per-conversation answer cap → human handoff ----
            const answerCount = await incrementAiAnswerCount(conversation_id);
            if (answerCount >= AI_ANSWER_CAP) {
              await setConversationAiState(conversation_id, {
                ai_paused: true,
                pause_reason: 'cap',
              });
              await postAgentMessage(conversation_id, CANNED.capHandoff);
              await publishAiState(conversation_id, true, 'cap').catch((err) =>
                console.error('publishAiState (cap) failed:', err),
              );
              sendHandoffNotification(conversation_id, answerCount).catch((err) =>
                console.error('Handoff notification error:', err),
              );
            }

            if (result.escalated) {
              // The assistant layer already fired the Telegram escalation alert
              // (escalate_to_human tool or the fallback safety net) — this is just a trace.
              console.log(
                `AI responder escalated conversation ${conversation_id}; team alerted; reply still posted.`,
              );
            }
          } finally {
            // Own try/catch: a typing-indicator NOTIFY failure must never replace the
            // real assistant error (which the outer catch logs) or escape this block.
            try {
              await publishManagerTyping(conversation_id, false);
            } catch {
              // ignore
            }
          }
        }
      } catch (aiResponderError) {
        console.error('AI responder error:', aiResponderError);
        // Lead-safety net: an AI crash leaves the visitor with no reply — alert a human
        // so the conversation is never silently abandoned.
        sendEscalationNotification(
          conversation_id,
          `AI responder crashed: ${aiResponderError instanceof Error ? aiResponderError.message : String(aiResponderError)}`,
        ).catch((err) => console.error('Escalation (AI-error) notify failed:', err));
        try {
          await publishManagerTyping(conversation_id, false);
        } catch {
          // ignore
        }
      }
    }

    return NextResponse.json({ success: true, message, remaining: rateLimit.remaining });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
