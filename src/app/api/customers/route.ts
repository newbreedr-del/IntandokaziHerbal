import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch customers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('id');
    const phone = searchParams.get('phone');
    const search = searchParams.get('search');

    let query = supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (customerId) {
      query = query.eq('id', customerId);
    }

    if (phone) {
      query = query.eq('phone', phone);
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: customers, error } = await query;

    if (error) {
      console.error('Error fetching customers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: 500 }
      );
    }

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Fetch customers API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      whatsappNumber,
      addressLine1,
      addressLine2,
      city,
      province,
      postalCode,
      preferredContactMethod,
      customerType,
      tags,
      notes
    } = body;

    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: 'First name, last name, and phone are required' },
        { status: 400 }
      );
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        whatsapp_number: whatsappNumber || phone,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        province,
        postal_code: postalCode,
        preferred_contact_method: preferredContactMethod || 'whatsapp',
        customer_type: customerType || 'retail',
        tags: tags || [],
        notes
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      return NextResponse.json(
        { error: 'Failed to create customer', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    console.error('Create customer API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update customer
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, ...updates } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Convert camelCase to snake_case for database
    const dbUpdates: any = {};
    Object.keys(updates).forEach(key => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      dbUpdates[snakeKey] = updates[key];
    });

    const { data: customer, error } = await supabase
      .from('customers')
      .update(dbUpdates)
      .eq('id', customerId)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      return NextResponse.json(
        { error: 'Failed to update customer' },
        { status: 500 }
      );
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Update customer API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
