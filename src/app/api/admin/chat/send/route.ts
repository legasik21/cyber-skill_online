import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import {
  getConversationById,
  updateConversation,
  insertMessage,
  insertAdminAction,
} from '@/lib/db';
import { publishMessage } from '@/lib/realtime';
import { adminMessageSchema } from '@/lib/validation';

export const runtime = 'nodejs';

/**
 * Send a message from admin to visitor.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { admin } = authResult;

    const body = await request.json();
    const validation = adminMessageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 },
      );
    }
    const { conversation_id, body: messageBody } = validation.data;

    const conversation = await getConversationById(conversation_id);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // First admin reply moves a 'new' conversation to 'active'.
    if (conversation.status === 'new') {
      await updateConversation(conversation_id, { status: 'active' });
    }

    const message = await insertMessage({
      conversation_id,
      sender_type: 'agent',
      sender_id: admin.id,
      body: messageBody,
    });

    await insertAdminAction({
      admin_id: admin.id,
      action_type: 'send_message',
      conversation_id,
      details: { message_id: message.id },
    });

    try {
      await publishMessage(conversation_id, message.id);
    } catch (err) {
      console.error('Error publishing message event:', err);
    }

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Error sending admin message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
