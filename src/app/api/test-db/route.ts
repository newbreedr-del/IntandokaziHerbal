import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (connectionError) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        error: connectionError.message,
        details: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          anonKeySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        }
      }, { status: 500 });
    }

    // Get product count and sample data
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('name, category, price, is_active')
      .eq('is_active', true)
      .limit(5);

    if (productsError) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to fetch products',
        error: productsError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      data: {
        totalProducts: products?.length || 0,
        sampleProducts: products || [],
        databaseInfo: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          anonKeySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        }
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
