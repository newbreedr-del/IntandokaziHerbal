import crypto from 'crypto';

export interface PayGatePaymentData {
  PAYGATE_ID: string;
  REFERENCE: string;
  AMOUNT: string;
  CURRENCY: string;
  RETURN_URL: string;
  TRANSACTION_DATE: string;
  LOCALE: string;
  COUNTRY: string;
  EMAIL: string;
  PAY_METHOD?: string;
  PAY_METHOD_DETAIL?: string;
  NOTIFY_URL: string;
  USER1?: string;
  USER2?: string;
  USER3?: string;
  CHECKSUM: string;
}

export class PayGateService {
  private paygateId: string;
  private paygateSecret: string;
  private paygateUrl: string;

  constructor() {
    this.paygateId = process.env.PAYGATE_ID || '';
    this.paygateSecret = process.env.PAYGATE_SECRET || '';
    this.paygateUrl = process.env.PAYGATE_URL || 'https://secure.paygate.co.za/payweb3/process.trans';

    if (!this.paygateId || !this.paygateSecret) {
      console.warn('PayGate credentials not configured');
    }
  }

  /**
   * Generate MD5 checksum for PayGate
   */
  private generateChecksum(data: Record<string, string>): string {
    // Sort keys alphabetically and concatenate values
    const sortedKeys = Object.keys(data).sort();
    const values = sortedKeys.map(key => data[key]).join('');
    const checksumString = values + this.paygateSecret;
    
    return crypto.createHash('md5').update(checksumString).digest('hex');
  }

  /**
   * Create payment data for PayGate
   */
  createPaymentData(params: {
    reference: string;
    amount: number;
    email: string;
    returnUrl: string;
    notifyUrl: string;
    payMethod?: 'CC' | 'BT' | 'EW' | 'PC'; // CC=Credit Card, BT=Bank Transfer, EW=eWallet, PC=Capitec Pay
    description?: string;
  }): PayGatePaymentData {
    const transactionDate = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    
    const data: Record<string, string> = {
      PAYGATE_ID: this.paygateId,
      REFERENCE: params.reference,
      AMOUNT: Math.round(params.amount * 100).toString(), // Amount in cents
      CURRENCY: 'ZAR',
      RETURN_URL: params.returnUrl,
      TRANSACTION_DATE: transactionDate,
      LOCALE: 'en-za',
      COUNTRY: 'ZAF',
      EMAIL: params.email,
      NOTIFY_URL: params.notifyUrl,
    };

    // Add payment method if specified
    if (params.payMethod) {
      data.PAY_METHOD = params.payMethod;
      
      // For Capitec Pay specifically
      if (params.payMethod === 'PC') {
        data.PAY_METHOD_DETAIL = 'CAPITEC';
      }
    }

    // Add optional user fields
    if (params.description) {
      data.USER1 = params.description;
    }

    // Generate checksum
    const checksum = this.generateChecksum(data);

    return {
      ...data,
      CHECKSUM: checksum,
    } as PayGatePaymentData;
  }

  /**
   * Verify checksum from PayGate response
   */
  verifyChecksum(data: Record<string, string>): boolean {
    const receivedChecksum = data.CHECKSUM;
    delete data.CHECKSUM;

    const calculatedChecksum = this.generateChecksum(data);
    
    return receivedChecksum === calculatedChecksum;
  }

  /**
   * Get PayGate payment URL
   */
  getPaymentUrl(): string {
    return this.paygateUrl;
  }

  /**
   * Initiate payment and get PAY_REQUEST_ID
   */
  async initiatePayment(paymentData: PayGatePaymentData): Promise<{
    success: boolean;
    payRequestId?: string;
    error?: string;
    redirectUrl?: string;
  }> {
    try {
      // Convert payment data to form-encoded string
      const formData = new URLSearchParams();
      Object.entries(paymentData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Make request to PayGate
      const response = await fetch(this.paygateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const responseText = await response.text();
      
      // Parse response (key=value pairs separated by &)
      const responseData: Record<string, string> = {};
      responseText.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) {
          responseData[key] = decodeURIComponent(value);
        }
      });

      // Verify response checksum
      if (!this.verifyChecksum({ ...responseData })) {
        return {
          success: false,
          error: 'Invalid response checksum',
        };
      }

      // Check for errors
      if (responseData.ERROR) {
        return {
          success: false,
          error: responseData.ERROR,
        };
      }

      // Get PAY_REQUEST_ID
      const payRequestId = responseData.PAY_REQUEST_ID;
      if (!payRequestId) {
        return {
          success: false,
          error: 'No PAY_REQUEST_ID received',
        };
      }

      // Build redirect URL
      const redirectUrl = `https://secure.paygate.co.za/payweb3/process.trans?PAY_REQUEST_ID=${payRequestId}`;

      return {
        success: true,
        payRequestId,
        redirectUrl,
      };
    } catch (error) {
      console.error('PayGate initiation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Query transaction status
   */
  async queryTransaction(payRequestId: string): Promise<{
    success: boolean;
    status?: string;
    error?: string;
    data?: Record<string, string>;
  }> {
    try {
      const queryData = {
        PAYGATE_ID: this.paygateId,
        PAY_REQUEST_ID: payRequestId,
        REFERENCE: '', // Will be returned by PayGate
      };

      const checksum = this.generateChecksum(queryData);
      const formData = new URLSearchParams({
        ...queryData,
        CHECKSUM: checksum,
      });

      const response = await fetch('https://secure.paygate.co.za/payweb3/query.trans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const responseText = await response.text();
      
      // Parse response
      const responseData: Record<string, string> = {};
      responseText.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) {
          responseData[key] = decodeURIComponent(value);
        }
      });

      return {
        success: true,
        status: responseData.TRANSACTION_STATUS,
        data: responseData,
      };
    } catch (error) {
      console.error('PayGate query error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const paygateService = new PayGateService();
