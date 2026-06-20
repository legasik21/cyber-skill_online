import { NextRequest, NextResponse } from 'next/server';
import {
  getLatestActiveConversation,
  createConversation,
  getVisitorConversation,
  getMessages,
} from '@/lib/db';
import { CONVERSATION_RATE_LIMIT, checkRateLimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';

/**
 * Create a new conversation for a visitor (reuses a recent active one).
 */
export async function POST(request: NextRequest) {
  try {
    const visitorId = request.cookies.get('visitor_id')?.value;
    if (!visitorId) {
      return NextResponse.json({ error: 'Visitor ID not found' }, { status: 401 });
    }

    // Rate limiting (3 conversations per hour per visitor).
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`conversation:${visitorId}:${clientIp}`, CONVERSATION_RATE_LIMIT);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many conversation requests', resetTime: rateLimit.resetTime },
        { status: 429 },
      );
    }

    // Reuse a recent (<1h) active conversation if present.
    const existing = await getLatestActiveConversation(visitorId);
    if (existing) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (new Date(existing.created_at) > oneHourAgo) {
        return NextResponse.json({ conversation_id: existing.id, existing: true });
      }
    }

    const conversation = await createConversation(visitorId);
    return NextResponse.json({ conversation_id: conversation.id, existing: false });
  } catch (error) {
    console.error('Error in conversation creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Get conversation details + messages (visitor-scoped).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    const visitorId = request.cookies.get('visitor_id')?.value;
    if (!visitorId) {
      return NextResponse.json({ error: 'Visitor ID not found' }, { status: 401 });
    }

    const conversation = await getVisitorConversation(conversationId, visitorId);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const messages = await getMessages(conversationId);
    return NextResponse.json({ conversation, messages });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
