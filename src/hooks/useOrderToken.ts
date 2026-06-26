'use client';

import { useCallback, useEffect, useRef } from 'react';
import { solvePow } from '@/lib/powClient';

/**
 * Fetches a signed order-form token (+ PoW challenge) when the form mounts and
 * solves the Proof-of-Work in the background while the user fills the form — so
 * by submit time the token already satisfies the server's minimum think-time AND
 * carries a valid proof. `getToken()` returns the combined `<token>~<nonce>`
 * string that every submit path already sends as `formToken`, so no form code
 * changes. `refresh()` fetches a fresh token and re-solves the PoW (awaiting it),
 * used to recover when a token goes stale/used or a fast submit raced the proof.
 * Returns null on network failure so callers degrade rather than hard-fail.
 */
export function useOrderToken() {
  // Holds the combined `<token>~<nonce>` (or a bare token until the PoW is ready).
  const tokenRef = useRef<string | null>(null);

  const refresh = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/order/token', { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      const token = typeof data?.token === 'string' ? data.token : null;
      if (!token) {
        tokenRef.current = null;
        return null;
      }
      const challenge = typeof data?.challenge === 'string' ? data.challenge : '';
      const difficulty = typeof data?.difficulty === 'number' ? data.difficulty : 0;
      // Make the bare token usable immediately; if a very fast submit races the
      // proof, the server replies invalid_token and the submit path retries via
      // refresh() (which awaits the proof below).
      tokenRef.current = token;
      if (challenge && difficulty > 0) {
        const nonce = await solvePow(challenge, difficulty);
        tokenRef.current = nonce ? `${token}~${nonce}` : token;
      }
      return tokenRef.current;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const getToken = useCallback(() => tokenRef.current, []);

  return { getToken, refresh };
}
