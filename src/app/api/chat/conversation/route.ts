import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { CONVERSATION_RATE_LIMIT, checkRateLimit } from '@/lib/ratelimit';

/**
 * Create a new conversation for a visitor
 */
export async function POST(request: NextRequest) {
  try {
    // Get visitor ID from cookie
    const visitorId = request.cookies.get('visitor_id')?.value;

    if (!visitorId) {
      return NextResponse.json(
        { error: 'Visitor ID not found' },
        { status: 401 }
      );
    }

    // Rate limiting (3 conversations per hour per visitor)
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `conversation:${visitorId}:${clientIp}`;
    const rateLimit = checkRateLimit(rateLimitKey, CONVERSATION_RATE_LIMIT);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many conversation requests',
          resetTime: rateLimit.resetTime,
        },
        { status: 429 }
      );
    }

    // Check if visitor already has an active conversation
    const { data: existingConversations } = await supabaseAdmin
      .from('conversations')
      .select('id, created_at')
      .eq('visitor_id', visitorId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    // If there's a recent active conversation (within 1 hour), return it
    if (existingConversations && existingConversations.length > 0) {
      const existingConv = existingConversations[0];
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const convCreatedAt = new Date(existingConv.created_at);

      if (convCreatedAt > oneHourAgo) {
        return NextResponse.json({
          conversation_id: existingConv.id,
          existing: true,
        });
      }
    }

    // Create new conversation
    const { data: conversation, error } = await supabaseAdmin
      .from('conversations')
      .insert({
        visitor_id: visitorId,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return NextResponse.json(
        { error: 'Failed to create conversation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      conversation_id: conversation.id,
      existing: false,
    });
  } catch (error) {
    console.error('Error in conversation creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get conversation details
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID required' },
        { status: 400 }
      );
    }

    // Get visitor ID from cookie
    const visitorId = request.cookies.get('visitor_id')?.value;

    if (!visitorId) {
      return NextResponse.json(
        { error: 'Visitor ID not found' },
        { status: 401 }
      );
    }

    // Fetch conversation
    const { data: conversation, error } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('visitor_id', visitorId)
      .single();

    if (error || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Fetch messages for this conversation
    const { data: messages } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      conversation,
      messages: messages || [],
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
