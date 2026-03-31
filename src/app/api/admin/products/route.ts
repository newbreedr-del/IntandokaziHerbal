import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Fetch all products (admin view with inactive products)
export async function GET(request: NextRequest) {
  try {
    // Check NextAuth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has product management permissions
    const permissions = (session.user as any).permissions;
    if (!permissions?.can_manage_products) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // 'active', 'inactive', 'all'

    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    // Check NextAuth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has product management permissions
    const permissions = (session.user as any).permissions;
    if (!permissions?.can_manage_products) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const supabase = await createClient();

    const body = await request.json();
    const {
      name,
      slug,
      sku,
      tagline,
      short_description,
      description,
      long_description,
      category,
      price,
      compare_at_price,
      cost_price,
      unit,
      stock_quantity,
      low_stock_threshold,
      weight_kg,
      dimensions_cm,
      emoji,
      gradient_css,
      badge,
      benefits,
      ingredients,
      usage_instructions,
      warnings,
      tags,
      meta_title,
      meta_description,
      meta_keywords,
      is_active,
      is_featured,
      is_new,
      is_on_sale,
    } = body;

    // Validate required fields
    if (!name || !slug || !description || !category || !price || !unit) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug, description, category, price, unit' },
        { status: 400 }
      );
    }

    // Generate image URL based on slug
    const image_url = `https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/${slug}.jpg`;

    // Insert product
    const { data: insertedProducts, error } = await supabase
      .from('products')
      .insert({
        name,
        slug,
        sku,
        tagline,
        short_description,
        description,
        long_description,
        category,
        price,
        compare_at_price,
        cost_price,
        unit,
        stock_quantity: stock_quantity || 0,
        low_stock_threshold: low_stock_threshold || 5,
        weight_kg,
        dimensions_cm,
        image_url,
        emoji: emoji || '🌿',
        gradient_css,
        badge,
        benefits,
        ingredients,
        usage_instructions,
        warnings,
        tags,
        meta_title,
        meta_description,
        meta_keywords,
        is_active: is_active !== undefined ? is_active : true,
        is_featured: is_featured || false,
        is_new: is_new || false,
        is_on_sale: is_on_sale || false,
        created_by: session.user.email,
        updated_by: session.user.email,
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!insertedProducts || insertedProducts.length === 0) {
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }

    const product = insertedProducts[0];

    // Log activity
    await supabase.from('activity_log').insert({
      user_email: session.user.email,
      action: 'create_product',
      entity_type: 'product',
      entity_id: product.id,
      new_values: product,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update product
export async function PUT(request: NextRequest) {
  try {
    // Check NextAuth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has product management permissions
    const permissions = (session.user as any).permissions;
    if (!permissions?.can_manage_products) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const supabase = await createClient();

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Get old values for audit log
    const { data: oldProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching product:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!oldProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update image URL if slug changed
    if (updates.slug && updates.slug !== oldProduct?.slug) {
      updates.image_url = `https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/${updates.slug}.jpg`;
    }

    // Update product
    const { data: updatedProducts, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_by: session.user.email,
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!updatedProducts || updatedProducts.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = updatedProducts[0];

    // Log activity
    await supabase.from('activity_log').insert({
      user_email: session.user.email,
      action: 'update_product',
      entity_type: 'product',
      entity_id: product.id,
      old_values: oldProduct,
      new_values: product,
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  try {
    // Check NextAuth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has product management permissions
    const permissions = (session.user as any).permissions;
    if (!permissions?.can_manage_products) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Get product for audit log
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    // Soft delete - set is_active to false instead of actual deletion
    const { error } = await supabase
      .from('products')
      .update({ is_active: false, updated_by: session.user.email })
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_email: session.user.email,
      action: 'delete_product',
      entity_type: 'product',
      entity_id: id,
      old_values: product,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
