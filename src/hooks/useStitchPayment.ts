"use client";

import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export interface PaymentData {
  amount: number;
  reference: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  description: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export function useStitchPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async (data: PaymentData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/payments/stitch/create', {
        ...data,
        currency: 'ZAR'
      });

      if (response.data.success) {
        // Redirect to Stitch payment page
        window.location.href = response.data.payment.url;
        return response.data.payment;
      } else {
        throw new Error(response.data.error || 'Payment creation failed');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create payment';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (paymentId: string) => {
    try {
      const response = await axios.get(`/api/payments/stitch/status?paymentId=${paymentId}`);
      return response.data.status;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to check payment status';
      toast.error(errorMessage);
      throw err;
    }
  };

  return {
    createPayment,
    checkPaymentStatus,
    loading,
    error
  };
}
