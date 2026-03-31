/**
 * PayFast Payment Gateway Integration
 * Documentation: https://developers.payfast.co.za/docs
 */

import crypto from 'crypto';

export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  environment: 'sandbox' | 'production';
}

export interface PayFastPaymentData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first?: string;
  name_last?: string;
  email_address?: string;
  cell_number?: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  item_description?: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_str4?: string;
  custom_str5?: string;
  custom_int1?: string;
  custom_int2?: string;
  custom_int3?: string;
  custom_int4?: string;
  custom_int5?: string;
  email_confirmation?: string;
  confirmation_address?: string;
  payment_method?: string;
}

export interface PayFastITNData {
  m_payment_id: string;
  pf_payment_id: string;
  payment_status: 'COMPLETE' | 'FAILED' | 'PENDING' | 'CANCELLED';
  item_name: string;
  item_description?: string;
  amount_gross: string;
  amount_fee: string;
  amount_net: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_str4?: string;
  custom_str5?: string;
  custom_int1?: string;
  custom_int2?: string;
  custom_int3?: string;
  custom_int4?: string;
  custom_int5?: string;
  name_first?: string;
  name_last?: string;
  email_address?: string;
  merchant_id: string;
  signature: string;
}

export class PayFastGateway {
  private config: PayFastConfig;
  private baseUrl: string;

  constructor(config: PayFastConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production'
      ? 'https://www.payfast.co.za/eng/process'
      : 'https://sandbox.payfast.co.za/eng/process';
  }

  /**
   * Generate MD5 signature for PayFast
   */
  generateSignature(data: Record<string, string>, passphrase?: string): string {
    // Helper function to encode with uppercase hex and spaces as +
    const pfEncode = (str: string): string => {
      return encodeURIComponent(str.trim())
        .replace(/%20/g, '+')
        .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
        .replace(/%([0-9a-f]{2})/gi, (match, hex) => '%' + hex.toUpperCase());
    };
    
    // Create parameter string with alphabetically sorted keys
    let paramString = '';
    const sortedKeys = Object.keys(data).sort();
    
    for (const key of sortedKeys) {
      if (key !== 'signature') {
        paramString += `${key}=${pfEncode(data[key])}&`;
      }
    }
    
    // Remove last ampersand
    paramString = paramString.slice(0, -1);
    
    // Add passphrase if provided
    if (passphrase) {
      paramString += `&passphrase=${pfEncode(passphrase)}`;
    }
    
    // Debug logging - remove in production
    console.log('=== PAYFAST SIGNATURE DEBUG ===');
    console.log('Parameter String:', paramString);
    console.log('Passphrase:', passphrase);
    console.log('Environment:', this.config.environment);
    console.log('Merchant ID:', this.config.merchantId);
    console.log('Merchant Key:', this.config.merchantKey);
    
    // Generate MD5 hash (must be lowercase)
    const signature = crypto.createHash('md5').update(paramString).digest('hex');
    console.log('Generated Signature:', signature);
    console.log('=== END DEBUG ===');
    
    return signature;
  }

  /**
   * Create payment data with signature
   */
  createPayment(paymentData: Omit<PayFastPaymentData, 'merchant_id' | 'merchant_key'>): PayFastPaymentData & { signature: string } {
    const data: PayFastPaymentData = {
      merchant_id: this.config.merchantId,
      merchant_key: this.config.merchantKey,
      ...paymentData,
    };

    // Convert to string record for signature
    const dataForSignature: Record<string, string> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        dataForSignature[key] = String(value);
      }
    });

    const signature = this.generateSignature(dataForSignature, this.config.passphrase);

    return {
      ...data,
      signature,
    };
  }

  /**
   * Verify ITN (Instant Transaction Notification) signature
   */
  verifyITNSignature(itnData: PayFastITNData): boolean {
    const receivedSignature = itnData.signature;
    
    // Create data object without signature
    const dataForSignature: Record<string, string> = {};
    Object.entries(itnData).forEach(([key, value]) => {
      if (key !== 'signature' && value !== undefined && value !== null && value !== '') {
        dataForSignature[key] = String(value);
      }
    });

    const calculatedSignature = this.generateSignature(dataForSignature, this.config.passphrase);
    
    return receivedSignature === calculatedSignature;
  }

  /**
   * Get PayFast payment URL
   */
  getPaymentUrl(): string {
    return this.baseUrl;
  }

  /**
   * Validate payment amount
   */
  validateAmount(amount: number): boolean {
    return amount >= 5; // PayFast minimum is R5
  }
}

/**
 * Get PayFast client instance
 */
export function getPayFastClient(): PayFastGateway {
  const config: PayFastConfig = {
    merchantId: process.env.PAYFAST_MERCHANT_ID || '',
    merchantKey: process.env.PAYFAST_MERCHANT_KEY || '',
    passphrase: process.env.PAYFAST_PASSPHRASE || '',
    environment: (process.env.PAYFAST_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
  };

  if (!config.merchantId || !config.merchantKey) {
    console.warn('PayFast credentials not configured');
  }

  return new PayFastGateway(config);
}
