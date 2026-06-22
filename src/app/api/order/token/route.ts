import { NextResponse } from 'next/server';
import { issueFormToken } from '@/lib/formToken';

// Issue a fresh signed form token on every request — never cached, never reused.
// The client fetches this when the order form mounts and submits it back to
// /api/order, where the signature, age and single-use are verified.
export const dynamic = 'force-dynamic';

export async function GET() {
  const token = issueFormToken();
  return NextResponse.json(
    { token },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  );
}
