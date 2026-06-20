import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { deleteConversationsOlderThan, insertAdminAction } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * Cron job to cleanup old conversations (30-day retention). Messages cascade.
 * Call with Authorization: Bearer $CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    // Never run the bulk delete without a configured secret — fail closed.
    if (!cronSecret) {
      console.error('[Cleanup] CRON_SECRET is not set; refusing to run');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }
    // Constant-time comparison of the bearer token.
    const provided = Buffer.from(request.headers.get('authorization') ?? '');
    const expected = Buffer.from(`Bearer ${cronSecret}`);
    if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    const cutoffIso = cutoffDate.toISOString();

    console.log(`[Cleanup] Starting cleanup for conversations older than ${cutoffIso}`);

    const deleted = await deleteConversationsOlderThan(cutoffIso);

    if (deleted === 0) {
      console.log('[Cleanup] No conversations to cleanup');
      return NextResponse.json({
        success: true,
        deleted: 0,
        message: 'No conversations to cleanup',
      });
    }

    console.log(`[Cleanup] Successfully deleted ${deleted} conversations`);

    await insertAdminAction({
      admin_id: '00000000-0000-0000-0000-000000000000', // system user
      action_type: 'cleanup_old_data',
      conversation_id: null,
      details: {
        deleted_count: deleted,
        cutoff_date: cutoffIso,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true, deleted, cutoff_date: cutoffIso });
  } catch (error) {
    console.error('[Cleanup] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
