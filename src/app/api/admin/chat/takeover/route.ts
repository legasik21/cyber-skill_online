import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import {
  getConversationById,
  setConversationAiState,
  updateConversation,
  insertAdminAction,
} from '@/lib/db';
import { publishAiState } from '@/lib/realtime';
import { takeoverSchema } from '@/lib/validation';
import { AI_AGENT_ID } from '@/lib/ai/config';

export const runtime = 'nodejs';

/**
 * Admin AI takeover / resume (Feature 4).
 *   paused=true  → manager takes over: pause the AI (reason 'human') and assign the
 *                  conversation to this admin. The visitor's window stays OPEN and
 *                  writable; only the AI auto-reply is stopped.
 *   paused=false → resume the AI: clear the pause, reset the guard/cap counters so
 *                  the assistant gets a fresh allowance, and hand ownership back.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { admin } = authResult;

    const body = await request.json();
    const validation = takeoverSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 },
      );
    }
    const { conversation_id, paused } = validation.data;

    const existing = await getConversationById(conversation_id);
    if (!existing) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (paused) {
      await setConversationAiState(conversation_id, { ai_paused: true, pause_reason: 'human' });
      await updateConversation(conversation_id, {
        assigned_agent_id: admin.id,
        status: existing.status === 'new' ? 'active' : existing.status,
      });
    } else {
      await setConversationAiState(conversation_id, {
        ai_paused: false,
        pause_reason: null,
        ai_answer_count: 0,
        consecutive_off_topic: 0,
      });
      await updateConversation(conversation_id, { assigned_agent_id: AI_AGENT_ID });
    }

    await insertAdminAction({
      admin_id: admin.id,
      action_type: paused ? 'ai_takeover' : 'ai_resume',
      conversation_id,
      details: { paused },
    });

    // Notify the visitor's stream so the widget can show a small system note. This
    // NEVER closes or disables the visitor input.
    try {
      await publishAiState(conversation_id, paused, paused ? 'human' : null);
    } catch (err) {
      console.error('Error publishing ai_state event:', err);
    }

    return NextResponse.json({ success: true, ai_paused: paused });
  } catch (error) {
    console.error('Error in takeover endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
