'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Fetches a signed order-form token when the form mounts (so by submit time it
 * already satisfies the server's minimum think-time check) and keeps it in a
 * ref. `refresh()` fetches a new one — used to recover gracefully when a token
 * goes stale on a long-open tab, or after a submit consumes one. Returns null
 * on network failure so callers can degrade rather than hard-fail.
 */
export function useOrderToken() {
  const tokenRef = useRef<string | null>(null);

  const refresh = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/order/token', { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      tokenRef.current = typeof data?.token === 'string' ? data.token : null;
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
