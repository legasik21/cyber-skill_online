import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
  sha256Hex,
  solvePow as solvePowClient,
  countLeadingZeroBits as clzClient,
} from '@/lib/powClient';
import {
  verifyPow,
  issueFormChallenge,
  verifyFormToken,
  countLeadingZeroBits as clzServer,
  POW_BITS,
} from '@/lib/formToken';

// The whole PoW scheme only works if the client's hand-rolled SHA-256 produces
// the EXACT same digest as the server's Node `crypto`. If these ever diverge,
// real browsers would compute nonces the server rejects — silently blocking
// every real customer. These tests are the guardrail against that.
describe('client SHA-256 parity with Node crypto', () => {
  it('matches the canonical NIST vectors', () => {
    expect(sha256Hex('')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
    expect(sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('matches Node crypto for many varied inputs (incl. PoW input shape)', () => {
    for (let i = 0; i < 300; i++) {
      const challenge = crypto.randomBytes(16).toString('hex');
      const s = `${challenge}:${i * 7919}`;
      const node = crypto.createHash('sha256').update(s).digest('hex');
      expect(sha256Hex(s)).toBe(node);
    }
  });

  it('leading-zero-bit counters agree on random digests', () => {
    for (let i = 0; i < 100; i++) {
      const d = crypto.randomBytes(32);
      expect(clzClient(d)).toBe(clzServer(d));
    }
  });
});

describe('Proof-of-Work end-to-end', () => {
  it('a nonce solved by the CLIENT solver is accepted by the SERVER verifier', async () => {
    const challenge = crypto.randomBytes(16).toString('hex');
    const bits = 14;
    const nonce = await solvePowClient(challenge, bits);
    expect(nonce).not.toBeNull();
    expect(verifyPow(challenge, nonce as string, bits)).toBe(true);
    // A wrong nonce must NOT satisfy the difficulty.
    expect(verifyPow(challenge, `${nonce}0000`, bits)).toBe(false);
  });

  it(
    'verifyFormToken accepts a real client proof after think-time, and enforces every gate',
    async () => {
      const { token, challenge, difficulty } = issueFormChallenge();
      expect(difficulty).toBe(POW_BITS);

      // Fresh token submitted instantly = bot speed -> too_fast (age gate first).
      expect(verifyFormToken(`${token}~0`)).toMatchObject({ ok: false, reason: 'too_fast' });

      const nonce = await solvePowClient(challenge, difficulty);
      expect(nonce).not.toBeNull();

      // Wait past the 3s minimum think-time, then exercise the gates.
      await new Promise((r) => setTimeout(r, 3100));

      // Correct age but no proof -> pow_missing.
      expect(verifyFormToken(token)).toMatchObject({ ok: false, reason: 'pow_missing' });
      // Correct age, bogus proof -> pow_invalid.
      expect(verifyFormToken(`${token}~999999999`)).toMatchObject({
        ok: false,
        reason: 'pow_invalid',
      });
      // Correct age + valid proof -> ok (consumes the single-use nonce).
      expect(verifyFormToken(`${token}~${nonce}`)).toEqual({ ok: true });
      // Same token again -> replay.
      expect(verifyFormToken(`${token}~${nonce}`)).toMatchObject({ ok: false, reason: 'replay' });
    },
    20000,
  );

  it('rejects tampered signatures and malformed tokens', () => {
    const { token } = issueFormChallenge();
    expect(verifyFormToken('')).toMatchObject({ ok: false, reason: 'missing' });
    expect(verifyFormToken('garbage')).toMatchObject({ ok: false, reason: 'malformed' });
    expect(verifyFormToken(`${token}x`)).toMatchObject({ ok: false, reason: 'badsig' });
  });
});
