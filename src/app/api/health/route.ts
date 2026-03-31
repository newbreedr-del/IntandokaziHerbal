import { NextResponse } from 'next/server';

/**
 * Health check endpoint
 * Useful for monitoring and deployment verification
 */
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    integrations: {
      payfast: {
        configured: !!(process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_MERCHANT_KEY)
      },
      respondio: {
        configured: !!(process.env.RESPONDIO_API_KEY && process.env.RESPONDIO_CHANNEL_ID),
        widgetConfigured: !!process.env.NEXT_PUBLIC_RESPONDIO_WORKSPACE_ID
      }
    },
    version: '1.0.0'
  };

  return NextResponse.json(health);
}
