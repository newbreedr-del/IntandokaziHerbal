import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/service'

export async function GET(request: NextRequest) {
  // Validate agent secret
  const secret = request.headers.get('x-agent-secret')
  if (secret !== process.env.AGENT_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q) {
    return NextResponse.json({ error: 'Missing query param: q' }, { status: 400 })
  }

  try {
    const supabase = createServiceClient()
    const lowStockThreshold = parseInt(process.env.LOW_STOCK_THRESHOLD || '5')
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://intandokaziherbal.co.za'

    // Search across name, short_description, category, tags
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug, short_description, price, stock_quantity, low_stock_threshold, is_active, image_url, category, tags')
      .eq('is_active', true)
      .or(`name.ilike.%${q}%,short_description.ilike.%${q}%,category.ilike.%${q}%`)
      .order('stock_quantity', { ascending: false })
      .limit(5)

    if (error) {
      console.error('[Agent Products Search] DB error:', error)
      return NextResponse.json({ error: 'Failed to search products' }, { status: 500 })
    }

    const results = (products || []).map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      currency: 'ZAR',
      inStock: p.stock_quantity > 0,
      stockCount: p.stock_quantity,
      lowStock: p.stock_quantity > 0 && p.stock_quantity <= (p.low_stock_threshold || lowStockThreshold),
      description: p.short_description || '',
      category: p.category,
      productUrl: `${siteUrl}/products/${p.slug}`
    }))

    console.log(`[Agent Products Search] "${q}" → ${results.length} results`)

    return NextResponse.json({ results })

  } catch (error: any) {
    console.error('[Agent Products Search] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
