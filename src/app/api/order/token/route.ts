import { NextRequest, NextResponse } from 'next/server';
import { issueFormChallenge } from '@/lib/formToken';
import { checkRateLimit, TOKEN_ISSUE_RATE_LIMIT } from '@/lib/ratelimit';

// Issue a fresh signed form token (+ PoW challenge) on every request — never
// cached, never reused. The client fetches this when the order form mounts,
// solves the PoW during the time the user spends filling the form, and submits
// the proof back to /api/order, where the signature, age, single-use and PoW are
// all verified. A generous per-IP cap throttles bulk token farming without
// affecting a human who reloads the page a few times.
export const dynamic = 'force-dynamic';

function clientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  return (
    (xff ? xff.split(',').map((s) => s.trim()).filter(Boolean).pop() : null) ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function GET(request: NextRequest) {
  const ip = clientIp(request);
  const rl = checkRateLimit(`order-token:${ip}`, TOKEN_ISSUE_RATE_LIMIT);
  if (!rl.allowed) {
    console.warn(`[order/token] rate limited (ip=${ip})`);
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  }

  const { token, challenge, difficulty } = issueFormChallenge();
  return NextResponse.json(
    { token, challenge, difficulty },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  );
}
