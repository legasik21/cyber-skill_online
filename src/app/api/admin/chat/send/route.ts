import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { adminMessageSchema } from '@/lib/validation';
import { publishToChannel } from '@/lib/ably';

/**
 * Send a message from admin to visitor
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await requireAdmin(request);
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { admin } = authResult;

    // Parse and validate request body
    const body = await request.json();
    const validation = adminMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { conversation_id, body: messageBody } = validation.data;

    // Verify conversation exists
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('id, status')
      .eq('id', conversation_id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Insert message into database
    const { data: message, error: messageError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id,
        sender_type: 'agent',
        sender_id: admin.id,
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

    // Log admin action
    await supabaseAdmin
      .from('admin_actions')
      .insert({
        admin_id: admin.id,
        action_type: 'send_message',
        conversation_id,
        details: {
          message_id: message.id,
        },
      });

    // Publish to Ably channel
    try {
      await publishToChannel(
        `chat:${conversation_id}`,
        'message',
        {
          ...message,
          sender_type: 'agent',
        }
      );
    } catch (ablyError) {
      console.error('Error publishing to Ably:', ablyError);
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error sending admin message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
