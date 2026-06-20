import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { listConversations } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * Get list of conversations for admin (each with its last message + total count).
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(request.url);
    const rawPage = parseInt(searchParams.get('page') || '1', 10);
    const rawLimit = parseInt(searchParams.get('limit') || '50', 10);
    if (Number.isNaN(rawPage) || Number.isNaN(rawLimit) || rawPage < 1 || rawLimit < 1) {
      return NextResponse.json({ error: 'Invalid pagination params' }, { status: 400 });
    }
    const page = rawPage;
    const limit = Math.min(rawLimit, 100); // hard cap to bound the query/response
    const status = searchParams.get('status') || 'all';
    const offset = (page - 1) * limit;

    const { conversations, total } = await listConversations({ status, limit, offset });

    return NextResponse.json({ conversations, total, page, limit });
  } catch (error) {
    console.error('Error in conversations endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
