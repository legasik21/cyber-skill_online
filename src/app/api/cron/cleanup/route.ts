import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

/**
 * Cron job to cleanup old conversations (30-day retention)
 * Triggered by Vercel Cron or similar
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate cutoff date (30 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    console.log(`[Cleanup] Starting cleanup for conversations older than ${cutoffDate.toISOString()}`);

    // Find old conversations
    const { data: oldConversations, error: selectError } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .lt('last_message_at', cutoffDate.toISOString());

    if (selectError) {
      console.error('[Cleanup] Error selecting old conversations:', selectError);
      return NextResponse.json(
        { error: 'Failed to select conversations' },
        { status: 500 }
      );
    }

    const conversationCount = oldConversations?.length || 0;

    if (conversationCount === 0) {
      console.log('[Cleanup] No conversations to cleanup');
      return NextResponse.json({
        success: true,
        deleted: 0,
        message: 'No conversations to cleanup',
      });
    }

    // Delete old conversations (messages will be cascaded)
    const { error: deleteError } = await supabaseAdmin
      .from('conversations')
      .delete()
      .lt('last_message_at', cutoffDate.toISOString());

    if (deleteError) {
      console.error('[Cleanup] Error deleting conversations:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete conversations' },
        { status: 500 }
      );
    }

    console.log(`[Cleanup] Successfully deleted ${conversationCount} conversations`);

    // Log cleanup action
    await supabaseAdmin
      .from('admin_actions')
      .insert({
        admin_id: '00000000-0000-0000-0000-000000000000', // System user
        action_type: 'cleanup_old_data',
        conversation_id: null,
        details: {
          deleted_count: conversationCount,
          cutoff_date: cutoffDate.toISOString(),
          timestamp: new Date().toISOString(),
        },
      });

    return NextResponse.json({
      success: true,
      deleted: conversationCount,
      cutoff_date: cutoffDate.toISOString(),
    });
  } catch (error) {
    console.error('[Cleanup] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
