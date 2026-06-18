import { NextRequest, NextResponse } from 'next/server';
import {
  getVisitorConversation,
  insertMessage,
  getMessageHistory,
  updateConversation,
} from '@/lib/db';
import { publishMessage, publishManagerTyping } from '@/lib/realtime';
import { messageSchema } from '@/lib/validation';
import { MESSAGE_RATE_LIMIT, checkRateLimit } from '@/lib/ratelimit';
import { sendTelegramNotification } from '@/lib/telegram';
import { AI_CHAT_ENABLED, AI_AGENT_ID, isAiConfigured } from '@/lib/ai/config';
import { runAssistant, type ChatTurn } from '@/lib/ai/assistant';

export const runtime = 'nodejs';
// Bounded window for the optional AI tool-loop + Gemini round-trips.
export const maxDuration = 60;

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

    // Telegram notification only for NEW conversations (manager hasn't replied yet).
    if (conversation.status === 'new') {
      sendTelegramNotification({
        visitorId,
        messageBody,
        conversationId: conversation_id,
        isNewConversation: true,
      }).catch((err) => console.error('Telegram notification error:', err));
    }

    // Native Gemini AI responder — fully guarded, OFF by default (AI_CHAT_ENABLED).
    // Isolated try/catch: any AI failure never breaks the send.
    // 'closed' conversations already returned 403 above → status is 'new' | 'active' here.
    const shouldRespond =
      AI_CHAT_ENABLED &&
      isAiConfigured() &&
      (conversation.assigned_agent_id === null || conversation.assigned_agent_id === AI_AGENT_ID);

    if (shouldRespond) {
      try {
        await publishManagerTyping(conversation_id, true);
        try {
          const historyRows = await getMessageHistory(conversation_id, 30);
          const history: ChatTurn[] = historyRows.map((row) => ({
            sender_type: row.sender_type,
            body: row.body,
          }));

          const result = await runAssistant(history);

          // Claim ownership + activate the conversation.
          await updateConversation(conversation_id, {
            assigned_agent_id: AI_AGENT_ID,
            status: conversation.status === 'new' ? 'active' : conversation.status,
          });

          const aiMessage = await insertMessage({
            conversation_id,
            sender_type: 'agent',
            sender_id: AI_AGENT_ID,
            body: result.reply,
          });

          try {
            await publishMessage(conversation_id, aiMessage.id);
          } catch (err) {
            console.error('AI responder: publish failed:', err);
          }

          if (result.escalated) {
            console.log(
              `AI responder escalated conversation ${conversation_id}; reply still posted.`,
            );
          }
        } finally {
          await publishManagerTyping(conversation_id, false);
        }
      } catch (aiResponderError) {
        console.error('AI responder error:', aiResponderError);
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
