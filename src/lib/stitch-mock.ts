/**
 * Mock Stitch Payment Gateway for Testing
 * Use this while waiting for real credentials to be activated
 */

export interface MockPaymentRequest {
  amount: number;
  reference: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  description: string;
  redirectUrl?: string;
}

export interface MockPaymentResponse {
  success: boolean;
  paymentId: string;
  paymentUrl: string;
  status: string;
  reference: string;
}

class MockStitchGateway {
  private mockPayments: Map<string, any> = new Map();

  /**
   * Create a mock payment link
   */
  async createPaymentLink(request: MockPaymentRequest): Promise<MockPaymentResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const paymentId = 'mock_' + Math.random().toString(36).substring(7);
    
    // Store mock payment
    this.mockPayments.set(paymentId, {
      id: paymentId,
      amount: request.amount,
      reference: request.reference,
      customerEmail: request.customerEmail,
      customerName: request.customerName,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });

    // Create mock payment URL that redirects back
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUrl = request.redirectUrl || `${baseUrl}/store/order-confirmation?ref=${request.reference}`;
    
    // Mock Stitch payment page URL (will redirect immediately for testing)
    const mockPaymentUrl = `${baseUrl}/api/payments/stitch-mock/pay?paymentId=${paymentId}&redirect=${encodeURIComponent(redirectUrl)}`;

    return {
      success: true,
      paymentId,
      paymentUrl: mockPaymentUrl,
      status: 'PENDING',
      reference: request.reference
    };
  }

  /**
   * Get mock payment status
   */
  async getPaymentStatus(paymentId: string): Promise<any> {
    const payment = this.mockPayments.get(paymentId);
    
    if (!payment) {
      throw new Error('Payment not found');
    }

    return {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      reference: payment.reference,
      paidAt: payment.paidAt
    };
  }

  /**
   * Mark payment as paid (for testing)
   */
  async markAsPaid(paymentId: string): Promise<void> {
    const payment = this.mockPayments.get(paymentId);
    
    if (payment) {
      payment.status = 'PAID';
      payment.paidAt = new Date().toISOString();
      this.mockPayments.set(paymentId, payment);
    }
  }
}

// Singleton instance
let mockInstance: MockStitchGateway | null = null;

export function getMockStitchClient(): MockStitchGateway {
  if (!mockInstance) {
    mockInstance = new MockStitchGateway();
  }
  return mockInstance;
}

export default MockStitchGateway;
