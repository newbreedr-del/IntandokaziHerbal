"use client";

import { useState, useRef } from 'react';
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

export function usePayFastPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const createPayment = async (request: PaymentRequest) => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      
      const response = await axios.post('/api/payments/payfast/create', {
        amount: request.amount,
        reference: request.reference,
        customerEmail: request.customerEmail,
        customerName: request.customerName,
        customerPhone: request.customerPhone,
        itemName: request.description,
        itemDescription: request.items?.map(i => `${i.name} x${i.quantity}`).join(', '),
        returnUrl: `${baseUrl}/store/order-confirmation?payment_id=${request.reference}&status=success`,
        cancelUrl: `${baseUrl}/store/checkout?cancelled=true`,
      });

      if (response.data.success && response.data.paymentData) {
        toast.success('Redirecting to PayFast...');
        
        console.log('=== FRONTEND PAYFAST DEBUG ===');
        console.log('Payment URL:', response.data.paymentUrl);
        console.log('Payment Data:', response.data.paymentData);
        console.log('=== END FRONTEND DEBUG ===');
        
        // Create and submit form to PayFast
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = response.data.paymentUrl;
        form.style.display = 'none';

        // Add all payment data as hidden inputs
        Object.entries(response.data.paymentData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        formRef.current = form;
        
        // Submit form to redirect to PayFast
        form.submit();
      } else {
        throw new Error('No payment data received');
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

  return {
    createPayment,
    loading,
    error
  };
}
