import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function verifyAgentSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-agent-secret');
  return secret === process.env.AGENT_API_SECRET;
}

// GET /api/agent/products/search?q=umuthi
export async function GET(request: NextRequest) {
  if (!verifyAgentSecret(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim();
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query && !category) {
      return NextResponse.json(
        { success: false, error: 'Search query (q) or category is required' },
        { status: 400 }
      );
    }

    let dbQuery = supabase
      .from('products')
      .select('id, name, slug, description, short_description, category, price, unit, stock_quantity, is_active, image_url, emoji')
      .eq('is_active', true)
      .limit(limit);

    if (query) {
      const escapedQuery = query.replace(/[%_,]/g, '').slice(0, 80);
      dbQuery = dbQuery.or(`name.ilike.%${escapedQuery}%,description.ilike.%${escapedQuery}%,category.ilike.%${escapedQuery}%,short_description.ilike.%${escapedQuery}%`);
    }

    if (category) {
      dbQuery = dbQuery.eq('category', category);
    }

    let { data: products, error } = await dbQuery;

    if (error) {
      console.error('[Agent Product Search] Error:', error);
      return NextResponse.json({ success: false, error: 'Failed to search products' }, { status: 500 });
    }

    // Fallback pass: if no matches and query provided, retry with a simpler search similar to admin API
    if (query && (!products || products.length === 0)) {
      const escapedQuery = query.replace(/[%_,]/g, '').slice(0, 80);
      const fallbackQuery = supabase
        .from('products')
        .select('id, name, slug, description, short_description, category, price, unit, stock_quantity, is_active, image_url, emoji')
        .eq('is_active', true)
        .or(`name.ilike.%${escapedQuery}%,description.ilike.%${escapedQuery}%`)
        .limit(limit);

      const fallbackResult = await fallbackQuery;
      if (!fallbackResult.error && fallbackResult.data) {
        products = fallbackResult.data;
      }
    }

    return NextResponse.json({
      success: true,
      products: products || [],
      count: products?.length || 0
    });
  } catch (error: any) {
    console.error('[Agent Product Search] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
