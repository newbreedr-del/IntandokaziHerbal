import { NextRequest, NextResponse } from 'next/server';
import { getRespondIOClient } from '@/lib/respondio';
import { z } from 'zod';

const SendMessageSchema = z.object({
  to: z.string(),
  message: z.string(),
  type: z.enum(['text', 'order_confirmation', 'payment_reminder']).optional(),
  metadata: z.record(z.any()).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = SendMessageSchema.parse(body);

    const respondIOClient = getRespondIOClient();
    
    const result = await respondIOClient.sendMessage({
      to: validatedData.to,
      message: validatedData.message,
      metadata: validatedData.metadata
    });

    return NextResponse.json({
      success: true,
      messageId: result.id
    });
  } catch (error: any) {
    console.error('Send message error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid message data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
