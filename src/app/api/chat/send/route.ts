import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { messageSchema } from '@/lib/validation';
import { MESSAGE_RATE_LIMIT, checkRateLimit } from '@/lib/ratelimit';
import { publishToChannel } from '@/lib/ably';
import { sendTelegramNotification } from '@/lib/telegram';
import { AI_CHAT_ENABLED, AI_AGENT_ID, isAiConfigured } from '@/lib/ai/config';
import { runAssistant, type ChatTurn } from '@/lib/ai/assistant';

// Allow a bounded-but-sufficient window for the AI round-trips (tool loop +
// Gemini call). The serverless function would otherwise default to a shorter cap.
export const maxDuration = 60;

/**
 * Send a message from visitor to chat
 */
export async function POST(request: NextRequest) {
  try {
    // Get visitor ID from cookie
    const visitorId = request.cookies.get('visitor_id')?.value;

    if (!visitorId) {
      return NextResponse.json(
        { error: 'Visitor ID not found' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = messageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { conversation_id, body: messageBody } = validation.data;

    // Rate limiting (10 messages per minute)
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `message:${visitorId}:${clientIp}`;
    const rateLimit = checkRateLimit(rateLimitKey, MESSAGE_RATE_LIMIT);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many messages. Please wait before sending more.',
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime,
        },
        { status: 429 }
      );
    }

    // Verify conversation belongs to this visitor
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('id, status, assigned_agent_id')
      .eq('id', conversation_id)
      .eq('visitor_id', visitorId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 }
      );
    }

    if (conversation.status === 'closed') {
      return NextResponse.json(
        { error: 'Conversation is closed' },
        { status: 403 }
      );
    }

    // Insert message into database
    const { data: message, error: messageError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id,
        sender_type: 'visitor',
        sender_id: visitorId,
        body: messageBody,
      })
      .select()
      .single();

    if (messageError || !message) {
      console.error('Error inserting message:', messageError);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    // Publish to Ably channel
    try {
      await publishToChannel(
        `chat:${conversation_id}`,
        'message',
        {
          ...message,
          sender_type: 'visitor',
        }
      );
    } catch (ablyError) {
      console.error('Error publishing to Ably:', ablyError);
      // Message is already in DB, so we don't fail the request
    }

    // Send Telegram notification only for NEW conversations (manager hasn't replied yet)
    if (conversation.status === 'new') {
      sendTelegramNotification({
        visitorId,
        messageBody,
        conversationId: conversation_id,
        isNewConversation: true,
      }).catch(err => console.error('Telegram notification error:', err));
    }

    // Native Gemini AI responder — fully guarded, off by default (AI_CHAT_ENABLED).
    // Runs in its own try/catch so any AI failure never breaks the send: the
    // visitor message above is already saved + published.
    const shouldRespond =
      AI_CHAT_ENABLED &&
      isAiConfigured() &&
      conversation.status !== 'closed' &&
      (conversation.assigned_agent_id === null ||
        conversation.assigned_agent_id === AI_AGENT_ID);

    if (shouldRespond) {
      try {
        // Show a typing indicator while the model works.
        await publishToChannel(`chat:${conversation_id}`, 'manager_typing', {
          isTyping: true,
        });

        try {
          // Fetch recent history (oldest → newest) for the model.
          const { data: historyRows } = await supabaseAdmin
            .from('messages')
            .select('sender_type, body')
            .eq('conversation_id', conversation_id)
            .order('created_at', { ascending: true })
            .limit(30);

          const history: ChatTurn[] = (historyRows || []).map((row) => ({
            sender_type: row.sender_type as 'visitor' | 'agent',
            body: row.body as string,
          }));

          const result = await runAssistant(history);

          // Claim ownership + activate the conversation.
          await supabaseAdmin
            .from('conversations')
            .update({
              assigned_agent_id: AI_AGENT_ID,
              status: conversation.status === 'new' ? 'active' : conversation.status,
            })
            .eq('id', conversation_id);

          // Insert the AI reply as an agent message.
          const { data: aiMessage, error: aiError } = await supabaseAdmin
            .from('messages')
            .insert({
              conversation_id,
              sender_type: 'agent',
              sender_id: AI_AGENT_ID,
              body: result.reply,
            })
            .select()
            .single();

          if (aiError || !aiMessage) {
            console.error('AI responder: failed to insert reply:', aiError);
          } else {
            await publishToChannel(`chat:${conversation_id}`, 'message', {
              ...aiMessage,
              sender_type: 'agent',
            });
          }

          if (result.escalated) {
            console.log(
              `AI responder escalated conversation ${conversation_id}; reply still posted.`
            );
          }
        } finally {
          // Always clear the typing indicator.
          await publishToChannel(`chat:${conversation_id}`, 'manager_typing', {
            isTyping: false,
          });
        }
      } catch (aiResponderError) {
        console.error('AI responder error:', aiResponderError);
        // Best-effort: make sure the typing indicator is cleared.
        try {
          await publishToChannel(`chat:${conversation_id}`, 'manager_typing', {
            isTyping: false,
          });
        } catch {
          // ignore
        }
        // Do not rethrow — the visitor message was already saved + published.
      }
    }

    return NextResponse.json({
      success: true,
      message,
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
