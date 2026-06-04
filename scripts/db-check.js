require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabase() {
  console.log('🔍 Intandokazi Herbal — Database Verification\n');
  console.log(`📡 Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log(`⏰ Check started: ${new Date().toISOString()}\n`);

  const tables = [
    { name: 'chat_sessions', minCols: ['session_id', 'phone', 'messages'] },
    { name: 'products', minCols: ['name', 'price', 'category'] },
    { name: 'orders', minCols: ['order_reference', 'customer_name', 'total'] },
    { name: 'order_items', minCols: ['order_id', 'product_name', 'quantity'] },
    { name: 'customers', minCols: ['name', 'phone'] },
    { name: 'consultation_bookings', minCols: ['customer_name', 'booking_date'] },
    { name: 'available_slots', minCols: ['slot_date', 'slot_time'] },
  ];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table.name)
        .select('*', { count: 'exact' })
        .limit(1);

      if (error) {
        console.log(`❌ ${table.name}: ${error.message}`);
        continue;
      }

      const rowCount = count ?? 0;
      const columns = data && data[0] ? Object.keys(data[0]) : [];
      const missingCols = table.minCols.filter(c => !columns.includes(c));

      if (missingCols.length > 0) {
        console.log(`⚠️  ${table.name}: missing columns [${missingCols.join(', ')}]`);
      } else {
        const status = rowCount > 0 ? `✅ (${rowCount} rows)` : '✅ (empty)';
        console.log(`${table.name}: ${status}`);
        if (columns.length > 0) {
          console.log(`   Columns: ${columns.slice(0, 6).join(', ')}${columns.length > 6 ? '...' : ''}`);
        }
      }
    } catch (err) {
      console.log(`❌ ${table.name}: ${err.message}`);
    }
  }

  // Check chat_sessions specific structure
  console.log('\n📋 chat_sessions detailed check:');
  try {
    const { data } = await supabase.from('chat_sessions').select('*').limit(1);
    if (data && data[0]) {
      const cols = Object.keys(data[0]);
      const hasSessionId = cols.includes('session_id');
      const hasPhone = cols.includes('phone');
      const hasMessages = cols.includes('messages');
      const hasUpdatedAt = cols.includes('updated_at');

      console.log(`   session_id column: ${hasSessionId ? '✅' : '❌'}`);
      console.log(`   phone column: ${hasPhone ? '✅' : '❌'}`);
      console.log(`   messages column: ${hasMessages ? '✅' : '❌'}`);
      console.log(`   updated_at column: ${hasUpdatedAt ? '✅' : '❌'}`);
    } else {
      console.log('   Table is empty but exists - structure check passed');
    }
  } catch (err) {
    console.log(`   Error: ${err.message}`);
  }

  // Check products sample
  console.log('\n📋 Products sample:');
  try {
    const { data } = await supabase
      .from('products')
      .select('name, price, category, is_active, stock_quantity')
      .eq('is_active', true)
      .limit(3);

    if (data && data.length > 0) {
      data.forEach(p => {
        console.log(`   - ${p.name}: R${p.price} (${p.category}, stock: ${p.stock_quantity})`);
      });
    } else {
      console.log('   No active products found');
    }
  } catch (err) {
    console.log(`   Error: ${err.message}`);
  }

  console.log('\n✨ Database verification complete!');
}

checkDatabase().catch(err => {
  console.error('💥 Fatal error:', err.message);
  process.exit(1);
});
