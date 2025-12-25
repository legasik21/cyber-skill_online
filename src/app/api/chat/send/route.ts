import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { messageSchema } from '@/lib/validation';
import { MESSAGE_RATE_LIMIT, checkRateLimit } from '@/lib/ratelimit';
import { publishToChannel } from '@/lib/ably';
import { sendTelegramNotification } from '@/lib/telegram';

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
      .select('id, status')
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
