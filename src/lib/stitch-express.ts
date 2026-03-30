/**
 * Stitch Express Payment Gateway Integration
 * Documentation: https://stitch.money/docs/express
 * 
 * Stitch Express uses a simpler payment link system instead of GraphQL
 */

import axios from 'axios';

export interface StitchExpressConfig {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'production';
}

export interface PaymentLinkRequest {
  amount: number; // in cents
  merchantReference: string;
  payerName?: string;
  payerEmailAddress?: string;
  payerPhoneNumber?: string;
  collectDeliveryDetails?: boolean;
  skipCheckoutPage?: boolean;
  deliveryFee?: number; // in cents
  expiresAt?: string; // ISO date
}

export interface PaymentLinkResponse {
  success: boolean;
  data: {
    payment: {
      id: string;
      amount: number;
      status: 'PENDING' | 'PAID' | 'EXPIRED' | 'SETTLED' | 'CANCELLED';
      paidAt?: string;
      payerName?: string;
      payerEmailAddress?: string;
      payerPhoneNumber?: string;
      link: string;
      merchantReference: string;
      expireAt: string;
      deliveryDetails?: {
        firstName: string;
        lastName: string;
        phoneNumber: string;
        deliveryFee: number;
        addressDetails: {
          city: string;
          suburb: string;
          address: string;
          postCode: string;
          company?: string;
          country: string;
        };
      };
    };
  };
}

export interface PaymentStatus {
  id: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'SETTLED' | 'CANCELLED';
  paidAt?: string;
  payerName?: string;
  payerEmailAddress?: string;
  link: string;
  merchantReference: string;
}

export interface WebhookEvent {
  type: 'payment.paid' | 'payment.expired' | 'payment.settled' | 'payment.cancelled';
  data: {
    id: string;
    amount: number;
    status: string;
    merchantReference: string;
    paidAt?: string;
  };
}

class StitchExpressGateway {
  private config: StitchExpressConfig;
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(config: StitchExpressConfig) {
    this.config = config;
    // Stitch Express uses the same API URL for both environments
    this.baseUrl = 'https://api.stitch.money/api/v1';
  }

  /**
   * Get or refresh access token
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      console.log('Requesting Stitch token...');
      
      const response = await axios.post(`${this.baseUrl}/token`, {
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
        scope: 'client_paymentrequest'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Token response:', response.data);

      if (response.data.success && response.data.data?.accessToken) {
        const token = response.data.data.accessToken;
        this.accessToken = token;
        // Token expires in 15 minutes, refresh 1 minute before
        this.tokenExpiry = Date.now() + (14 * 60 * 1000);
        console.log('Token acquired successfully');
        return token;
      }

      throw new Error('Failed to get access token from response');
    } catch (error: any) {
      console.error('Stitch token error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw new Error('Failed to authenticate with Stitch: ' + (error.response?.data?.generalErrors?.[0] || error.message));
    }
  }

  /**
   * Create a payment link
   */
  async createPaymentLink(request: PaymentLinkRequest): Promise<PaymentLinkResponse> {
    try {
      const token = await this.getAccessToken();
      
      console.log('Creating payment link with amount:', request.amount, 'cents');

      const response = await axios.post<PaymentLinkResponse>(
        `${this.baseUrl}/payment-links`,
        {
          amount: Math.round(request.amount), // Ensure it's in cents
          merchantReference: request.merchantReference,
          payerName: request.payerName,
          payerEmailAddress: request.payerEmailAddress,
          payerPhoneNumber: request.payerPhoneNumber,
          collectDeliveryDetails: request.collectDeliveryDetails || false,
          skipCheckoutPage: request.skipCheckoutPage || false,
          deliveryFee: request.deliveryFee || 0,
          expiresAt: request.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Failed to create payment link:', error.response?.data || error.message);
      throw new Error('Failed to create payment link');
    }
  }

  /**
   * Get payment status by ID
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseUrl}/payment-links/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success && response.data.data.payment) {
        return response.data.data.payment;
      }

      throw new Error('Payment not found');
    } catch (error: any) {
      console.error('Failed to get payment status:', error.response?.data || error.message);
      throw new Error('Failed to get payment status');
    }
  }

  /**
   * Query payments with filters
   */
  async queryPayments(filters?: {
    startTime?: string;
    endTime?: string;
    status?: ('PENDING' | 'PAID' | 'EXPIRED' | 'SETTLED' | 'CANCELLED')[];
    merchantReference?: string;
    payerName?: string;
    limit?: number;
  }): Promise<PaymentStatus[]> {
    try {
      const token = await this.getAccessToken();

      const params = new URLSearchParams();
      if (filters?.startTime) params.append('startTime', filters.startTime);
      if (filters?.endTime) params.append('endTime', filters.endTime);
      if (filters?.status) filters.status.forEach(s => params.append('status', s));
      if (filters?.merchantReference) params.append('merchantReference', filters.merchantReference);
      if (filters?.payerName) params.append('payerName', filters.payerName);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await axios.get(
        `${this.baseUrl}/payment-links?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data || [];
    } catch (error: any) {
      console.error('Failed to query payments:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const calculatedSignature = hmac.digest('hex');
    return calculatedSignature === signature;
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<number> {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseUrl}/account/balance`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success && response.data.data.balance !== undefined) {
        return response.data.data.balance;
      }

      return 0;
    } catch (error: any) {
      console.error('Failed to get balance:', error.response?.data || error.message);
      return 0;
    }
  }

  /**
   * Create a refund for a payment
   */
  async createRefund(paymentId: string, amount: number, reason: 'DUPLICATE' | 'FRAUDULENT' | 'REQUESTED_BY_CUSTOMER'): Promise<boolean> {
    try {
      const token = await this.getAccessToken();

      await axios.post(
        `${this.baseUrl}/payment/${paymentId}/refund`,
        {
          amount: Math.round(amount), // in cents
          reason
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return true;
    } catch (error: any) {
      console.error('Failed to create refund:', error.response?.data || error.message);
      return false;
    }
  }
}

// Singleton instance
let stitchExpressInstance: StitchExpressGateway | null = null;

export function getStitchExpressClient(): StitchExpressGateway {
  if (!stitchExpressInstance) {
    const config: StitchExpressConfig = {
      clientId: process.env.STITCH_CLIENT_ID || '',
      clientSecret: process.env.STITCH_CLIENT_SECRET || '',
      environment: (process.env.STITCH_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    };

    if (!config.clientId || !config.clientSecret) {
      console.warn('Stitch Express credentials not configured. Set STITCH_CLIENT_ID and STITCH_CLIENT_SECRET environment variables.');
    }

    stitchExpressInstance = new StitchExpressGateway(config);
  }

  return stitchExpressInstance;
}

export default StitchExpressGateway;
