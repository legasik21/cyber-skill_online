import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

/**
 * Get list of active conversations for admin
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await requireAdmin(request);
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'active';
    
    const offset = (page - 1) * limit;

    // Fetch conversations
    let query = supabaseAdmin
      .from('conversations')
      .select(`
        *,
        messages (
          id,
          body,
          sender_type,
          created_at
        )
      `, { count: 'exact' })
      .order('last_message_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: conversations, error, count } = await query;

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }

    // Format conversations with last message
    const formattedConversations = conversations?.map(conv => {
      const lastMessage = conv.messages && conv.messages.length > 0
        ? conv.messages[conv.messages.length - 1]
        : null;

      return {
        ...conv,
        last_message: lastMessage,
        messages: undefined, // Remove full messages array
      };
    });

    return NextResponse.json({
      conversations: formattedConversations || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error in conversations endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
