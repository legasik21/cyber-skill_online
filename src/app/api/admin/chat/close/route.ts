import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { updateConversation, insertAdminAction } from '@/lib/db';
import { publishConversationClosed } from '@/lib/realtime';
import { closeConversationSchema } from '@/lib/validation';

export const runtime = 'nodejs';

/**
 * Close a conversation.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { admin } = authResult;

    const body = await request.json();
    const validation = closeConversationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 },
      );
    }
    const { conversation_id } = validation.data;

    const conversation = await updateConversation(conversation_id, { status: 'closed' });
    if (!conversation) {
      return NextResponse.json({ error: 'Failed to close conversation' }, { status: 500 });
    }

    await insertAdminAction({
      admin_id: admin.id,
      action_type: 'close_conversation',
      conversation_id,
      details: {},
    });

    // Notify the visitor's stream that the conversation is closed (best-effort).
    try {
      await publishConversationClosed(conversation_id);
    } catch (err) {
      console.error('Error publishing conversation closed event:', err);
    }

    return NextResponse.json({ success: true, conversation });
  } catch (error) {
    console.error('Error in close endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
