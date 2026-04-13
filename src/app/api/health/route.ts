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
      supabase: {
        configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      }
    },
    version: '1.0.0'
  };

  return NextResponse.json(health);
}
