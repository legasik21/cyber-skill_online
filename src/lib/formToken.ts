// Signed, short-lived form token — the core defense against bots that POST
// directly to /api/order. A token is issued per form render (GET /api/order/token)
// and verified on submit. It carries {issuedAt, nonce} HMAC-signed with the
// server-only FORM_TOKEN_SECRET. Verification enforces a minimum think-time
// (too fast = bot), a maximum age (stale), and single-use (replay) — all in
// memory. No PII is ever included.
import crypto from 'crypto';

const SECRET = process.env.FORM_TOKEN_SECRET || '';

// A real human takes more than a few seconds to fill the lead form; a token
// submitted faster than this almost certainly came from a script.
const MIN_AGE_MS = 3_000;
// After this the token is considered stale; the client should fetch a fresh one.
const MAX_AGE_MS = 60 * 60 * 1000; // 60 minutes

// Single-use: remember spent nonces until they would have expired anyway.
const usedNonces = new Map<string, number>();
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [nonce, exp] of usedNonces) {
    if (exp < now) usedNonces.delete(nonce);
  }
}

interface TokenPayload {
  t: number; // issuedAt (epoch ms)
  n: string; // nonce
}

function sign(body: string): string {
  return crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
}

/** True when a server secret is configured. When false, callers should fail OPEN. */
export function formTokenConfigured(): boolean {
  return SECRET.length > 0;
}

/** Issue a fresh single-use token. Never cache the response. */
export function issueFormToken(): string {
  const payload: TokenPayload = {
    t: Date.now(),
    n: crypto.randomBytes(12).toString('base64url'),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body)}`;
}

export type TokenReason =
  | 'missing'
  | 'malformed'
  | 'badsig'
  | 'too_fast'
  | 'stale'
  | 'replay';

export type TokenVerdict =
  | { ok: true }
  | { ok: false; reason: TokenReason };

/**
 * Verify a submitted token. On success the token's nonce is consumed so it can
 * never be replayed. Caller must have a FORM_TOKEN_SECRET configured; check
 * formTokenConfigured() first if you want to fail open on misconfiguration.
 */
export function verifyFormToken(token: unknown): TokenVerdict {
  if (typeof token !== 'string' || token.length === 0) {
    return { ok: false, reason: 'missing' };
  }
  const dot = token.indexOf('.');
  if (dot < 1 || dot === token.length - 1) {
    return { ok: false, reason: 'malformed' };
  }
  const body = token.slice(0, dot);
  const providedSig = token.slice(dot + 1);
  const expectedSig = sign(body);

  // Timing-safe signature comparison.
  const a = Buffer.from(providedSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: 'badsig' };
  }

  let payload: TokenPayload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return { ok: false, reason: 'malformed' };
  }
  if (typeof payload?.t !== 'number' || typeof payload?.n !== 'string') {
    return { ok: false, reason: 'malformed' };
  }

  const now = Date.now();
  sweep(now);
  const age = now - payload.t;
  if (age < MIN_AGE_MS) return { ok: false, reason: 'too_fast' };
  if (age > MAX_AGE_MS) return { ok: false, reason: 'stale' };
  if (usedNonces.has(payload.n)) return { ok: false, reason: 'replay' };

  usedNonces.set(payload.n, payload.t + MAX_AGE_MS);
  return { ok: true };
}
