/**
 * Database Verification Script
 * Checks that all required tables exist and have the correct structure
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface TableCheck {
  name: string;
  requiredColumns: string[];
  optionalColumns?: string[];
}

const tablesToCheck: TableCheck[] = [
  {
    name: 'chat_sessions',
    requiredColumns: ['id', 'session_id', 'phone', 'messages', 'created_at', 'updated_at'],
    optionalColumns: ['source'],
  },
  {
    name: 'products',
    requiredColumns: ['id', 'name', 'price', 'category', 'is_active'],
    optionalColumns: ['stock_quantity', 'short_description', 'benefits', 'image_url', 'unit'],
  },
  {
    name: 'orders',
    requiredColumns: ['id', 'order_reference', 'customer_name', 'customer_phone', 'total', 'payment_status', 'order_status'],
    optionalColumns: ['pep_store_code', 'pep_store_name', 'delivery_fee', 'transaction_id', 'paid_at'],
  },
  {
    name: 'order_items',
    requiredColumns: ['id', 'order_id', 'product_name', 'quantity', 'unit_price'],
    optionalColumns: ['product_id'],
  },
  {
    name: 'customers',
    requiredColumns: ['id', 'name', 'phone'],
    optionalColumns: ['email', 'created_at'],
  },
  {
    name: 'consultation_bookings',
    requiredColumns: ['id', 'customer_name', 'customer_phone', 'booking_date', 'status'],
    optionalColumns: ['notes', 'created_at'],
  },
  {
    name: 'available_slots',
    requiredColumns: ['id', 'slot_date', 'slot_time', 'is_available'],
    optionalColumns: ['created_at'],
  },
  {
    name: 'payments',
    requiredColumns: ['id', 'order_id', 'amount', 'status'],
    optionalColumns: ['payment_method', 'transaction_id', 'created_at'],
  },
];

async function checkTableExists(tableName: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', tableName)
    .single();

  return !error && data !== null;
}

async function getTableColumns(tableName: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_schema', 'public')
    .eq('table_name', tableName);

  if (error || !data) return [];
  return data.map((row: any) => row.column_name);
}

async function getRowCount(tableName: string): Promise<number> {
  const { count, error } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  return error ? -1 : (count || 0);
}

async function verifyDatabase() {
  console.log('🔍 Intandokazi Herbal — Database Verification\n');
  console.log(`📡 Supabase URL: ${supabaseUrl}`);
  console.log(`⏰ Check started: ${new Date().toISOString()}\n`);

  let passed = 0;
  let failed = 0;
  let warnings = 0;

  for (const table of tablesToCheck) {
    process.stdout.write(`Checking ${table.name}... `);

    const exists = await checkTableExists(table.name);

    if (!exists) {
      console.log('❌ MISSING');
      failed++;
      continue;
    }

    const columns = await getTableColumns(table.name);
    const rowCount = await getRowCount(table.name);

    // Check required columns
    const missingColumns = table.requiredColumns.filter(
      (col) => !columns.includes(col)
    );

    if (missingColumns.length > 0) {
      console.log(`⚠️  INCOMPLETE (missing: ${missingColumns.join(', ')})`);
      warnings++;
      continue;
    }

    // Check optional columns (info only)
    const presentOptional = table.optionalColumns?.filter(
      (col) => columns.includes(col)
    ) || [];

    const statusIcon = rowCount > 0 ? '✅' : '⚠️';
    const dataStatus = rowCount > 0 ? `${rowCount} rows` : 'empty';

    console.log(`${statusIcon} OK (${dataStatus})`);
    passed++;

    if (presentOptional.length > 0 && presentOptional.length < (table.optionalColumns?.length || 0)) {
      const missing = table.optionalColumns?.filter(c => !columns.includes(c)) || [];
      console.log(`   ℹ️  Optional columns missing: ${missing.join(', ')}`);
    }
  }

  // Special checks
  console.log('\n📋 Special Checks:');

  // Check chat_sessions indexes
  const { data: indexes } = await supabase
    .from('pg_indexes')
    .select('indexname')
    .eq('schemaname', 'public')
    .ilike('indexname', 'idx_chat_sessions%');

  if (indexes && indexes.length >= 2) {
    console.log('✅ chat_sessions indexes present');
    passed++;
  } else {
    console.log('⚠️  chat_sessions indexes may be missing (run add-chat-sessions.sql)');
    warnings++;
  }

  // Check RLS status
  const { data: rlsData } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .in('table_name', ['orders', 'customers', 'consultation_bookings'])
    .limit(1);

  if (rlsData && rlsData.length > 0) {
    console.log('ℹ️  RLS policies not checked (manual verification recommended)');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(50));

  if (failed === 0) {
    console.log('\n✨ Database is ready for Phase 1!');
  } else {
    console.log('\n⚠️  Some tables are missing. Run the appropriate SQL migrations.');
    process.exit(1);
  }
}

verifyDatabase().catch((err) => {
  console.error('💥 Verification failed:', err.message);
  process.exit(1);
});
