/**
 * Stitch Payment Gateway Integration
 * Documentation: https://stitch.money/docs
 */

import axios from 'axios';

export interface StitchConfig {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'production';
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  reference: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  description: string;
  successUrl: string;
  cancelUrl: string;
  webhookUrl: string;
}

export interface PaymentResponse {
  id: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  reference: string;
  amount: number;
}

export interface PaymentStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  reference: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

class StitchPaymentGateway {
  private config: StitchConfig;
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(config: StitchConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production' 
      ? 'https://api.stitch.money/graphql'
      : 'https://api.sandbox.stitch.money/graphql';
  }

  /**
   * Get OAuth access token for Stitch API
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl.replace('/graphql', '')}/connect/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          scope: 'client_paymentrequest'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry to 5 minutes before actual expiry
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;
      
      return this.accessToken;
    } catch (error) {
      console.error('Failed to get Stitch access token:', error);
      throw new Error('Failed to authenticate with Stitch');
    }
  }

  /**
   * Create a payment request
   */
  async createPaymentRequest(request: PaymentRequest): Promise<PaymentResponse> {
    const token = await this.getAccessToken();

    const mutation = `
      mutation CreatePaymentRequest($input: ClientPaymentInitiationRequestInput!) {
        clientPaymentInitiationRequestCreate(input: $input) {
          paymentInitiationRequest {
            id
            url
            state {
              __typename
              ... on PaymentInitiationRequestCompleted {
                date
                amount
                payer {
                  ... on PaymentInitiationBankAccountPayer {
                    accountNumber
                    bankId
                  }
                }
              }
              ... on PaymentInitiationRequestPending {
                __typename
              }
              ... on PaymentInitiationRequestCancelled {
                date
                reason
              }
            }
          }
        }
      }
    `;

    const variables = {
      input: {
        amount: {
          quantity: Math.round(request.amount * 100).toString(), // Convert to cents
          currency: request.currency
        },
        payerReference: request.reference,
        beneficiaryReference: request.reference,
        externalReference: request.reference,
        beneficiaryName: 'Nthandokazi Herbal',
        beneficiaryBankId: 'nedbank', // Update with your bank
        beneficiaryAccountNumber: '1234567890', // Update with your account
        redirectUrl: request.successUrl,
        cancelUrl: request.cancelUrl,
        webhookUrl: request.webhookUrl
      }
    };

    try {
      const response = await axios.post(
        this.baseUrl,
        {
          query: mutation,
          variables
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      const paymentRequest = response.data.data.clientPaymentInitiationRequestCreate.paymentInitiationRequest;

      return {
        id: paymentRequest.id,
        url: paymentRequest.url,
        status: 'pending',
        reference: request.reference,
        amount: request.amount
      };
    } catch (error: any) {
      console.error('Failed to create Stitch payment request:', error);
      throw new Error(error.response?.data?.message || 'Failed to create payment request');
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const token = await this.getAccessToken();

    const query = `
      query GetPaymentRequest($id: ID!) {
        node(id: $id) {
          ... on PaymentInitiationRequest {
            id
            url
            state {
              __typename
              ... on PaymentInitiationRequestCompleted {
                date
                amount
              }
              ... on PaymentInitiationRequestPending {
                __typename
              }
              ... on PaymentInitiationRequestCancelled {
                date
                reason
              }
            }
          }
        }
      }
    `;

    try {
      const response = await axios.post(
        this.baseUrl,
        {
          query,
          variables: { id: paymentId }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      const payment = response.data.data.node;
      const state = payment.state.__typename;

      let status: PaymentStatus['status'] = 'pending';
      if (state === 'PaymentInitiationRequestCompleted') {
        status = 'completed';
      } else if (state === 'PaymentInitiationRequestCancelled') {
        status = 'cancelled';
      }

      return {
        id: payment.id,
        status,
        reference: paymentId,
        amount: 0, // Amount would be in the state
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get Stitch payment status:', error);
      throw new Error('Failed to retrieve payment status');
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Implement HMAC verification for webhook security
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    
    return signature === expectedSignature;
  }
}

// Singleton instance
let stitchInstance: StitchPaymentGateway | null = null;

export function getStitchClient(): StitchPaymentGateway {
  if (!stitchInstance) {
    const config: StitchConfig = {
      clientId: process.env.STITCH_CLIENT_ID || '',
      clientSecret: process.env.STITCH_CLIENT_SECRET || '',
      environment: (process.env.STITCH_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    };

    if (!config.clientId || !config.clientSecret) {
      throw new Error('Stitch credentials not configured. Please set STITCH_CLIENT_ID and STITCH_CLIENT_SECRET environment variables.');
    }

    stitchInstance = new StitchPaymentGateway(config);
  }

  return stitchInstance;
}

export default StitchPaymentGateway;
