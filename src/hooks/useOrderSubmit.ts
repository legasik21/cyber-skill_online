'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

  const submitOrder = async (data: OrderData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (result.redirect) {
        router.push(result.redirect);
      } else if (result.success) {
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
