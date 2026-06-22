'use client';

import { useState } from 'react';
// Locale-aware router: the order API returns locale-agnostic paths
// (e.g. /order/success); this prefixes /de automatically for German visitors.
import { useRouter } from '@/i18n/navigation';
import { useOrderToken } from './useOrderToken';

interface OrderData {
  email: string;
  discordTag: string;
  service: string;
  message?: string;
  page?: string;
  orderDetails?: Record<string, any>;
}

interface UseOrderSubmitReturn {
  submitOrder: (data: OrderData) => Promise<void>;
  isSubmitting: boolean;
}

/**
 * Hook for submitting orders across all service pages
 * Handles API call and redirect to success/error pages
 */
export function useOrderSubmit(): UseOrderSubmitReturn {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getToken, refresh } = useOrderToken();

  const submitOrder = async (data: OrderData) => {
    setIsSubmitting(true);
    try {
      const post = (formToken: string | null) =>
        fetch('/api/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, formToken }),
        });

      let response = await post(getToken());
      let result = await response.json().catch(() => ({} as Record<string, unknown>));
      // A long-open tab may carry a stale/used token: fetch a fresh one, retry once.
      if (result?.error === 'invalid_token') {
        const fresh = await refresh();
        if (fresh) {
          response = await post(fresh);
          result = await response.json().catch(() => ({} as Record<string, unknown>));
        }
      }
      void refresh(); // prime a fresh token for any subsequent order

      if (result?.redirect) {
        router.push(result.redirect as string);
      } else if (result?.success) {
        router.push('/order/success');
      } else {
        router.push('/order/error');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      router.push('/order/error?reason=server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitOrder,
    isSubmitting,
  };
}
