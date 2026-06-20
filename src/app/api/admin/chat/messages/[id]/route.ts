import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getMessages, getConversationById } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * Get messages for a specific conversation (admin).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id: conversationId } = await params;
    const [messages, conversation] = await Promise.all([
      getMessages(conversationId),
      getConversationById(conversationId),
    ]);

    return NextResponse.json({ messages, conversation });
  } catch (error) {
    console.error('Error in messages endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
