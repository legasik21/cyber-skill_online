import type { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { getConversationById } from '@/lib/db';
import { sseResponse } from '@/lib/realtime';

// SSE stream of realtime events for an authenticated admin (any conversation).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversation_id');
  if (!conversationId) return new Response('conversation_id required', { status: 400 });

  const conversation = await getConversationById(conversationId);
  if (!conversation) return new Response('Conversation not found', { status: 404 });

  return sseResponse(conversationId, request.signal);
}
