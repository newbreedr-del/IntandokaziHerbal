import { createServiceClient } from '@/utils/supabase/service';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const SUPER_ADMIN_EMAIL = 'mandubusabelo@gmail.com';

function isSuperAdmin(session: any): boolean {
  return (
    session?.user?.email === SUPER_ADMIN_EMAIL ||
    (session?.user as any)?.role === 'super_admin'
  );
}

// GET - Fetch all AI settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('ai_settings')
      .select('key, value, updated_by, updated_at')
      .order('key');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const settings: Record<string, any> = {};
    for (const row of data ?? []) {
      settings[row.key] = { ...row.value, _updated_by: row.updated_by, _updated_at: row.updated_at };
    }

    return NextResponse.json({ settings });
  } catch (err) {
    console.error('[AI Settings GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update a specific AI settings key
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'key and value are required' }, { status: 400 });
    }

    const allowed = ['llm_config', 'persona', 'knowledge_base'];
    if (!allowed.includes(key)) {
      return NextResponse.json({ error: `Invalid key. Must be one of: ${allowed.join(', ')}` }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('ai_settings')
      .upsert({
        key,
        value,
        updated_by: session.user.email,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, setting: data });
  } catch (err) {
    console.error('[AI Settings PUT]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
