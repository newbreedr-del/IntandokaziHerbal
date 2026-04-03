import { NextRequest, NextResponse } from 'next/server';
import { getRespondIOClient } from '@/lib/respondio';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, message, type = 'test' } = body;

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone and message are required' },
        { status: 400 }
      );
    }

    const client = getRespondIOClient();

    // Send test message
    const result = await client.sendMessage({
      to: phone,
      message,
      metadata: {
        type,
        source: 'intandokazi_herbal',
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Respond.io test error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send message',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const apiToken = process.env.RESPONDIO_API_TOKEN;
    const apiUrl = process.env.RESPONDIO_API_URL;
    const spaceId = process.env.RESPONDIO_SPACE_ID;

    return NextResponse.json({
      configured: !!apiToken,
      apiUrl: apiUrl || 'https://api.respond.io',
      spaceId: spaceId || 'Not set',
      tokenLength: apiToken?.length || 0,
      tokenPreview: apiToken ? `${apiToken.substring(0, 20)}...` : 'Not set'
    });
  } catch (error: any) {
    console.error('Respond.io config check error:', error);
    return NextResponse.json(
      { error: 'Failed to check configuration' },
      { status: 500 }
    );
  }
}
