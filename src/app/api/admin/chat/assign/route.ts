import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { assignConversationSchema } from '@/lib/validation';

/**
 * Assign conversation to an agent
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
    const validation = assignConversationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { conversation_id, agent_id } = validation.data;

    // Update conversation
    const { data: conversation, error } = await supabaseAdmin
      .from('conversations')
      .update({
        assigned_agent_id: agent_id,
      })
      .eq('id', conversation_id)
      .select()
      .single();

    if (error) {
      console.error('Error assigning conversation:', error);
      return NextResponse.json(
        { error: 'Failed to assign conversation' },
        { status: 500 }
      );
    }

    // Log admin action
    await supabaseAdmin
      .from('admin_actions')
      .insert({
        admin_id: admin.id,
        action_type: 'assign_conversation',
        conversation_id,
        details: {
          agent_id,
        },
      });

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error('Error in assign endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
