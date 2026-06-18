import type { NextRequest } from 'next/server';
import { getVisitorConversation } from '@/lib/db';
import { sseResponse } from '@/lib/realtime';

// SSE stream of realtime events for a visitor's own conversation.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const visitorId = request.cookies.get('visitor_id')?.value;
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversation_id');

  if (!conversationId) return new Response('conversation_id required', { status: 400 });
  if (!visitorId) return new Response('Visitor ID not found', { status: 401 });

  // Authorize: this visitor must own the conversation.
  const conversation = await getVisitorConversation(conversationId, visitorId);
  if (!conversation) return new Response('Conversation not found', { status: 404 });

  return sseResponse(conversationId, request.signal);
}
