import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Check if products table exists and has data
    const { data: products, error, count } = await supabase
      .from('products')
      .select('id, name, slug, sku, category, price', { count: 'exact' })
      .limit(10);

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: error.message,
        details: error,
      });
    }

    return NextResponse.json({
      status: 'success',
      totalProducts: count,
      sampleProducts: products,
      message: count === 0 
        ? 'Products table exists but is empty. You need to add products first.'
        : `Found ${count} products in database`,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
    });
  }
}
