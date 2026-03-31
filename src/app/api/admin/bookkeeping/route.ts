import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch financial data
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('auth_user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!adminUser || !adminUser.can_view_financials) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const reportType = searchParams.get('report') || 'summary';
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    switch (reportType) {
      case 'summary':
        return await getFinancialSummary(supabase, startDate, endDate);
      case 'profit_loss':
        return await getProfitLoss(supabase, startDate, endDate);
      case 'balance_sheet':
        return await getBalanceSheet(supabase);
      case 'cash_flow':
        return await getCashFlow(supabase, startDate, endDate);
      case 'expenses':
        return await getExpenses(supabase, startDate, endDate);
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getFinancialSummary(supabase: any, startDate: string | null, endDate: string | null) {
  const dateFilter = startDate && endDate 
    ? { gte: startDate, lte: endDate }
    : {};

  // Revenue from paid orders
  let revenueQuery = supabase
    .from('orders')
    .select('total_amount, subtotal, shipping_cost, tax_amount')
    .eq('payment_status', 'paid');

  if (startDate) revenueQuery = revenueQuery.gte('created_at', startDate);
  if (endDate) revenueQuery = revenueQuery.lte('created_at', endDate);

  const { data: orders } = await revenueQuery;

  const totalRevenue = orders?.reduce((sum, o) => sum + parseFloat(o.total_amount), 0) || 0;
  const totalShipping = orders?.reduce((sum, o) => sum + parseFloat(o.shipping_cost), 0) || 0;
  const totalTax = orders?.reduce((sum, o) => sum + parseFloat(o.tax_amount), 0) || 0;

  // Expenses
  let expenseQuery = supabase
    .from('expenses')
    .select('total_amount, category');

  if (startDate) expenseQuery = expenseQuery.gte('expense_date', startDate);
  if (endDate) expenseQuery = expenseQuery.lte('expense_date', endDate);

  const { data: expenses } = await expenseQuery;

  const totalExpenses = expenses?.reduce((sum, e) => sum + parseFloat(e.total_amount), 0) || 0;

  // Expenses by category
  const expensesByCategory = expenses?.reduce((acc: any, e) => {
    if (!acc[e.category]) acc[e.category] = 0;
    acc[e.category] += parseFloat(e.total_amount);
    return acc;
  }, {}) || {};

  // Net profit
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Outstanding invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('balance_due')
    .in('status', ['sent', 'viewed', 'overdue']);

  const accountsReceivable = invoices?.reduce((sum, i) => sum + parseFloat(i.balance_due), 0) || 0;

  return NextResponse.json({
    summary: {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      totalShipping,
      totalTax,
      accountsReceivable,
    },
    expensesByCategory,
    period: { startDate, endDate },
  });
}

async function getProfitLoss(supabase: any, startDate: string | null, endDate: string | null) {
  // Revenue
  let revenueQuery = supabase
    .from('orders')
    .select('subtotal, shipping_cost, tax_amount, created_at')
    .eq('payment_status', 'paid');

  if (startDate) revenueQuery = revenueQuery.gte('created_at', startDate);
  if (endDate) revenueQuery = revenueQuery.lte('created_at', endDate);

  const { data: orders } = await revenueQuery;

  const productSales = orders?.reduce((sum, o) => sum + parseFloat(o.subtotal), 0) || 0;
  const shippingRevenue = orders?.reduce((sum, o) => sum + parseFloat(o.shipping_cost), 0) || 0;
  const totalRevenue = productSales + shippingRevenue;

  // Cost of Goods Sold (COGS)
  const { data: orderItems } = await supabase
    .from('order_items')
    .select(`
      quantity,
      products!inner(cost_price),
      orders!inner(payment_status, created_at)
    `)
    .eq('orders.payment_status', 'paid');

  const cogs = orderItems?.reduce((sum, item) => {
    const costPrice = item.products?.cost_price || 0;
    return sum + (parseFloat(costPrice) * item.quantity);
  }, 0) || 0;

  const grossProfit = totalRevenue - cogs;
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // Operating Expenses
  let expenseQuery = supabase
    .from('expenses')
    .select('total_amount, category');

  if (startDate) expenseQuery = expenseQuery.gte('expense_date', startDate);
  if (endDate) expenseQuery = expenseQuery.lte('expense_date', endDate);

  const { data: expenses } = await expenseQuery;

  const operatingExpenses = expenses?.reduce((acc: any, e) => {
    if (!acc[e.category]) acc[e.category] = 0;
    acc[e.category] += parseFloat(e.total_amount);
    return acc;
  }, {}) || {};

  const totalOperatingExpenses = Object.values(operatingExpenses).reduce((sum: number, val: any) => sum + val, 0);

  const operatingIncome = grossProfit - totalOperatingExpenses;
  const netIncome = operatingIncome; // Simplified - no other income/expenses

  return NextResponse.json({
    revenue: {
      productSales,
      shippingRevenue,
      total: totalRevenue,
    },
    cogs,
    grossProfit,
    grossMargin,
    operatingExpenses,
    totalOperatingExpenses,
    operatingIncome,
    netIncome,
    period: { startDate, endDate },
  });
}

async function getBalanceSheet(supabase: any) {
  // Assets
  const { data: products } = await supabase
    .from('products')
    .select('stock_quantity, cost_price')
    .eq('is_active', true);

  const inventory = products?.reduce((sum, p) => {
    const cost = parseFloat(p.cost_price || 0);
    return sum + (cost * p.stock_quantity);
  }, 0) || 0;

  const { data: invoices } = await supabase
    .from('invoices')
    .select('balance_due')
    .in('status', ['sent', 'viewed', 'overdue']);

  const accountsReceivable = invoices?.reduce((sum, i) => sum + parseFloat(i.balance_due), 0) || 0;

  // Get cash from latest bank transaction
  const { data: latestTransaction } = await supabase
    .from('bank_transactions')
    .select('balance_after')
    .order('transaction_date', { ascending: false })
    .limit(1)
    .single();

  const cash = parseFloat(latestTransaction?.balance_after || 0);

  const totalAssets = cash + accountsReceivable + inventory;

  // Liabilities
  const { data: unpaidExpenses } = await supabase
    .from('expenses')
    .select('total_amount')
    .eq('payment_method', 'credit'); // Assuming unpaid

  const accountsPayable = unpaidExpenses?.reduce((sum, e) => sum + parseFloat(e.total_amount), 0) || 0;

  const totalLiabilities = accountsPayable;

  // Equity
  const totalEquity = totalAssets - totalLiabilities;

  return NextResponse.json({
    assets: {
      cash,
      accountsReceivable,
      inventory,
      total: totalAssets,
    },
    liabilities: {
      accountsPayable,
      total: totalLiabilities,
    },
    equity: {
      total: totalEquity,
    },
    asOfDate: new Date().toISOString().split('T')[0],
  });
}

async function getCashFlow(supabase: any, startDate: string | null, endDate: string | null) {
  // Operating Activities - Cash from sales
  let ordersQuery = supabase
    .from('orders')
    .select('total_amount, created_at')
    .eq('payment_status', 'paid');

  if (startDate) ordersQuery = ordersQuery.gte('created_at', startDate);
  if (endDate) ordersQuery = ordersQuery.lte('created_at', endDate);

  const { data: orders } = await ordersQuery;
  const cashFromSales = orders?.reduce((sum, o) => sum + parseFloat(o.total_amount), 0) || 0;

  // Operating Activities - Cash paid for expenses
  let expensesQuery = supabase
    .from('expenses')
    .select('total_amount, expense_date');

  if (startDate) expensesQuery = expensesQuery.gte('expense_date', startDate);
  if (endDate) expensesQuery = expensesQuery.lte('expense_date', endDate);

  const { data: expenses } = await expensesQuery;
  const cashPaidExpenses = expenses?.reduce((sum, e) => sum + parseFloat(e.total_amount), 0) || 0;

  const netCashFromOperations = cashFromSales - cashPaidExpenses;

  // Investing Activities (simplified - none for now)
  const netCashFromInvesting = 0;

  // Financing Activities (simplified - none for now)
  const netCashFromFinancing = 0;

  const netCashChange = netCashFromOperations + netCashFromInvesting + netCashFromFinancing;

  return NextResponse.json({
    operating: {
      cashFromSales,
      cashPaidExpenses,
      net: netCashFromOperations,
    },
    investing: {
      net: netCashFromInvesting,
    },
    financing: {
      net: netCashFromFinancing,
    },
    netCashChange,
    period: { startDate, endDate },
  });
}

async function getExpenses(supabase: any, startDate: string | null, endDate: string | null) {
  let query = supabase
    .from('expenses')
    .select('*')
    .order('expense_date', { ascending: false });

  if (startDate) query = query.gte('expense_date', startDate);
  if (endDate) query = query.lte('expense_date', endDate);

  const { data: expenses } = await query;

  const totalExpenses = expenses?.reduce((sum, e) => sum + parseFloat(e.total_amount), 0) || 0;

  const byCategory = expenses?.reduce((acc: any, e) => {
    if (!acc[e.category]) {
      acc[e.category] = { total: 0, count: 0, items: [] };
    }
    acc[e.category].total += parseFloat(e.total_amount);
    acc[e.category].count += 1;
    acc[e.category].items.push(e);
    return acc;
  }, {}) || {};

  return NextResponse.json({
    expenses,
    totalExpenses,
    byCategory,
    period: { startDate, endDate },
  });
}

// POST - Create expense
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('auth_user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!adminUser || !adminUser.can_view_financials) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const {
      expense_date,
      category,
      vendor_name,
      description,
      amount,
      tax_amount,
      payment_method,
      receipt_url,
      notes,
    } = body;

    if (!expense_date || !category || !description || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate expense number
    const expenseNumber = `EXP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const totalAmount = parseFloat(amount) + parseFloat(tax_amount || 0);

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert({
        expense_number: expenseNumber,
        expense_date,
        category,
        vendor_name,
        description,
        amount: parseFloat(amount),
        tax_amount: parseFloat(tax_amount || 0),
        total_amount: totalAmount,
        payment_method,
        receipt_url,
        notes,
        created_by: adminUser.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: adminUser.id,
      user_email: adminUser.email,
      action: 'create_expense',
      entity_type: 'expense',
      entity_id: expense.id,
      new_values: expense,
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
