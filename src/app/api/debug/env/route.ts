import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    STITCH_CLIENT_ID: process.env.STITCH_CLIENT_ID ? 'SET' : 'NOT_SET',
    STITCH_CLIENT_SECRET: process.env.STITCH_CLIENT_SECRET ? 'SET' : 'NOT_SET',
    STITCH_ENVIRONMENT: process.env.STITCH_ENVIRONMENT || 'NOT_SET',
    NEXT_PUBLIC_STITCH_MOCK_MODE: process.env.NEXT_PUBLIC_STITCH_MOCK_MODE || 'NOT_SET',
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
