import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    PAYFAST_MERCHANT_ID: process.env.PAYFAST_MERCHANT_ID ? 'SET' : 'NOT_SET',
    PAYFAST_MERCHANT_KEY: process.env.PAYFAST_MERCHANT_KEY ? 'SET' : 'NOT_SET',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
  };

  return NextResponse.json({
    message: 'Environment variables check',
    environment: process.env.NODE_ENV,
    variables: envVars,
    timestamp: new Date().toISOString()
  });
}
