// Signed, short-lived form token — a core defense against bots that POST
// directly to /api/order. A token is issued per form render (GET /api/order/token)
// and verified on submit. It carries {issuedAt, nonce, powChallenge, powBits}
// HMAC-signed with the server-only FORM_TOKEN_SECRET. Verification enforces a
// minimum think-time (too fast = bot), a maximum age (stale), single-use
// (replay), and a Proof-of-Work (hashcash) bound to the signed challenge — all
// in memory, no third party. No PII is ever included.
//
// Proof-of-Work: the token embeds a random `c` (challenge) and `d` (difficulty
// in leading zero bits). The client must find a nonce so that
// sha256(`${c}:${nonce}`) has >= d leading zero bits, then submit it appended to
// the token as `<token>~<nonce>`. The server re-derives the challenge from its
// OWN signed copy (so the client can't weaken it) and verifies the proof with a
// single hash — cheap to check, costly to produce. This adds real per-submission
// CPU cost that throttles mass/automated spam while staying sub-second for a
// real browser. Set FORM_POW_BITS=0 to disable instantly without a redeploy.
import crypto from 'crypto';

const SECRET = process.env.FORM_TOKEN_SECRET || '';

// A real human takes more than a few seconds to fill the lead form; a token
// submitted faster than this almost certainly came from a script.
const MIN_AGE_MS = 3_000;
// After this the token is considered stale; the client should fetch a fresh one.
const MAX_AGE_MS = 60 * 60 * 1000; // 60 minutes

// PoW difficulty in leading zero BITS. 16 ≈ tens of thousands of hashes — well
// under a second in any modern browser, but a per-submission cost for bots.
// Clamped to a sane range; 0 disables PoW (escape hatch).
export const POW_BITS = (() => {
  const n = Number.parseInt(process.env.FORM_POW_BITS ?? '', 10);
  if (Number.isFinite(n)) return Math.max(0, Math.min(24, n));
  return 16;
})();

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
  n: string; // nonce (single-use id)
  c: string; // PoW challenge (hex)
  d: number; // PoW difficulty (leading zero bits)
}

function sign(body: string): string {
  return crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
}

/** True when a server secret is configured. When false, callers should fail OPEN. */
export function formTokenConfigured(): boolean {
  return SECRET.length > 0;
}

/** Count leading zero bits in a digest buffer. */
export function countLeadingZeroBits(buf: Uint8Array): number {
  let bits = 0;
  for (const byte of buf) {
    if (byte === 0) {
      bits += 8;
      continue;
    }
    let mask = 0x80;
    while (mask && (byte & mask) === 0) {
      bits++;
      mask >>= 1;
    }
    break;
  }
  return bits;
}

/** Verify a Proof-of-Work nonce for a challenge at a difficulty (server-side, Node crypto). */
export function verifyPow(challenge: string, nonce: string, bits: number): boolean {
  if (bits <= 0) return true;
  if (!nonce) return false;
  const digest = crypto.createHash('sha256').update(`${challenge}:${nonce}`).digest();
  return countLeadingZeroBits(digest) >= bits;
}

/** Brute-force a PoW nonce (used by tests and as a server-side reference solver). */
export function solvePow(challenge: string, bits: number, maxIterations = 5_000_000): string | null {
  if (bits <= 0) return '0';
  for (let i = 0; i < maxIterations; i++) {
    const nonce = i.toString();
    const digest = crypto.createHash('sha256').update(`${challenge}:${nonce}`).digest();
    if (countLeadingZeroBits(digest) >= bits) return nonce;
  }
  return null;
}

export interface IssuedChallenge {
  token: string;
  challenge: string;
  difficulty: number;
}

/** Issue a fresh single-use token plus its PoW challenge. Never cache the response. */
export function issueFormChallenge(): IssuedChallenge {
  const payload: TokenPayload = {
    t: Date.now(),
    n: crypto.randomBytes(12).toString('base64url'),
    c: crypto.randomBytes(16).toString('hex'),
    d: POW_BITS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const token = `${body}.${sign(body)}`;
  return { token, challenge: payload.c, difficulty: payload.d };
}

/** Back-compat: issue just the token string. */
export function issueFormToken(): string {
  return issueFormChallenge().token;
}

export type TokenReason =
  | 'missing'
  | 'malformed'
  | 'badsig'
  | 'too_fast'
  | 'stale'
  | 'replay'
  | 'pow_missing'
  | 'pow_invalid';

export type TokenVerdict = { ok: true } | { ok: false; reason: TokenReason };

/**
 * Verify a submitted token of the form `<token>` or `<token>~<powNonce>`. On
 * success the token's nonce is consumed so it can never be replayed. Caller must
 * have a FORM_TOKEN_SECRET configured; check formTokenConfigured() first to fail
 * open on misconfiguration. The nonce is consumed ONLY after every check passes,
 * so a failed PoW never burns a token.
 */
export function verifyFormToken(combined: unknown): TokenVerdict {
  if (typeof combined !== 'string' || combined.length === 0) {
    return { ok: false, reason: 'missing' };
  }
  // Split off the PoW nonce (base64url/hex token never contains '~').
  const tilde = combined.indexOf('~');
  const token = tilde === -1 ? combined : combined.slice(0, tilde);
  const powNonce = tilde === -1 ? '' : combined.slice(tilde + 1);

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
  if (
    typeof payload?.t !== 'number' ||
    typeof payload?.n !== 'string' ||
    typeof payload?.c !== 'string' ||
    typeof payload?.d !== 'number'
  ) {
    return { ok: false, reason: 'malformed' };
  }

  const now = Date.now();
  sweep(now);
  const age = now - payload.t;
  if (age < MIN_AGE_MS) return { ok: false, reason: 'too_fast' };
  if (age > MAX_AGE_MS) return { ok: false, reason: 'stale' };
  if (usedNonces.has(payload.n)) return { ok: false, reason: 'replay' };

  // Proof-of-Work — bound to the server's OWN signed challenge & difficulty.
  if (payload.d > 0) {
    if (!powNonce) return { ok: false, reason: 'pow_missing' };
    if (!verifyPow(payload.c, powNonce, payload.d)) return { ok: false, reason: 'pow_invalid' };
  }

  usedNonces.set(payload.n, payload.t + MAX_AGE_MS);
  return { ok: true };
}
