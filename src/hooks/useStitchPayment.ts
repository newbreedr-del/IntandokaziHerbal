"use client";

import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface PaymentRequest {
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

  const createPayment = async (request: PaymentRequest) => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      // Use mock mode if real credentials aren't working
      const useMockMode = process.env.NEXT_PUBLIC_STITCH_MOCK_MODE === 'true';
      const endpoint = useMockMode ? '/api/payments/stitch-mock/create' : '/api/payments/stitch-express/create';
      
      if (useMockMode) {
        console.log('🎭 Using MOCK payment mode for testing');
      }
      
      const response = await axios.post(endpoint, {
        amount: request.amount,
        reference: request.reference,
        customerEmail: request.customerEmail,
        customerName: request.customerName,
        customerPhone: request.customerPhone,
        description: request.description,
        redirectUrl: `${baseUrl}/store/order-confirmation?ref=${request.reference}&email=${encodeURIComponent(request.customerEmail)}&name=${encodeURIComponent(request.customerName)}`
      });

      if (response.data.paymentUrl) {
        toast.success('Redirecting to payment...');
        // Redirect to Stitch Express payment page
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to create payment';
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
