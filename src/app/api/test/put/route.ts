import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    console.log('=== SIMPLE PUT TEST ===');
    console.log('Request received');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    return NextResponse.json({ 
      message: 'PUT endpoint working',
      received: body 
    });
  } catch (error) {
    console.error('PUT test error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'GET endpoint working' });
}
