import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { updateConversation, insertAdminAction } from '@/lib/db';
import { assignConversationSchema } from '@/lib/validation';

export const runtime = 'nodejs';

/**
 * Assign conversation to an agent.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { admin } = authResult;

    const body = await request.json();
    const validation = assignConversationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 },
      );
    }
    const { conversation_id, agent_id } = validation.data;

    const conversation = await updateConversation(conversation_id, { assigned_agent_id: agent_id });
    if (!conversation) {
      return NextResponse.json({ error: 'Failed to assign conversation' }, { status: 500 });
    }

    await insertAdminAction({
      admin_id: admin.id,
      action_type: 'assign_conversation',
      conversation_id,
      details: { agent_id },
    });

    return NextResponse.json({ success: true, conversation });
  } catch (error) {
    console.error('Error in assign endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
