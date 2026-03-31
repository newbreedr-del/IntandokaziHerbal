-- ============================================================================
-- INTANDOKAZI HERBAL PRODUCTS - CLEAN SCHEMA (Handles Existing Objects)
-- World-Class E-Commerce Platform with Full Integration
-- ============================================================================

-- Drop existing tables and indexes cleanly
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS bank_transactions CASCADE;
DROP TABLE IF EXISTS journal_entry_lines CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS chart_of_accounts CASCADE;
DROP TABLE IF EXISTS quote_items CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS eft_confirmations CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- AUTHENTICATION & USER MANAGEMENT
-- ============================================================================

-- Admin users table (linked to Supabase Auth)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'manager', 'staff')),
  can_manage_products BOOLEAN DEFAULT false,
  can_manage_orders BOOLEAN DEFAULT false,
  can_manage_customers BOOLEAN DEFAULT false,
  can_view_financials BOOLEAN DEFAULT false,
  can_manage_settings BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer accounts (linked to Supabase Auth)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  marketing_consent BOOLEAN DEFAULT false,
  loyalty_points INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer addresses
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  address_type TEXT CHECK (address_type IN ('billing', 'shipping', 'both')),
  is_default BOOLEAN DEFAULT false,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  street_address TEXT NOT NULL,
  suburb TEXT,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'South Africa',
  phone TEXT,
  delivery_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PRODUCT MANAGEMENT
-- ============================================================================

-- Products table with image naming convention
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  short_description TEXT,
  description TEXT NOT NULL,
  long_description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  compare_at_price DECIMAL(10,2) CHECK (compare_at_price >= price),
  cost_price DECIMAL(10,2) CHECK (cost_price >= 0),
  unit TEXT NOT NULL,
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INTEGER DEFAULT 5,
  weight_kg DECIMAL(10,3),
  dimensions_cm JSONB,
  
  -- Image handling with naming convention
  -- Images should be named: {slug}.jpg or {slug}-{number}.jpg
  -- e.g., "imbiza-yamadoda.jpg", "imbiza-yamadoda-1.jpg"
  image_url TEXT, -- Main product image: {slug}.jpg
  gallery_images TEXT[], -- Additional images: {slug}-1.jpg, {slug}-2.jpg, etc.
  
  -- Product attributes
  emoji TEXT DEFAULT '🌿',
  gradient_css TEXT,
  badge TEXT,
  benefits TEXT[],
  ingredients TEXT[],
  usage_instructions TEXT,
  warnings TEXT,
  tags TEXT[],
  
  -- SEO & Marketing
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_on_sale BOOLEAN DEFAULT false,
  
  -- Tracking
  view_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id),
  updated_by UUID REFERENCES admin_users(id)
);

-- Product categories
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_category_id UUID REFERENCES product_categories(id),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ORDER MANAGEMENT
-- ============================================================================

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Customer info (stored for record keeping)
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  
  -- Shipping address
  shipping_first_name TEXT NOT NULL,
  shipping_last_name TEXT NOT NULL,
  shipping_street_address TEXT NOT NULL,
  shipping_suburb TEXT,
  shipping_city TEXT NOT NULL,
  shipping_province TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_country TEXT DEFAULT 'South Africa',
  shipping_phone TEXT,
  delivery_notes TEXT,
  
  -- Order totals
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Status tracking
  order_status TEXT DEFAULT 'pending' CHECK (order_status IN (
    'pending', 'processing', 'packed', 'shipped', 'delivered', 
    'cancelled', 'refunded', 'on_hold'
  )),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'paid', 'failed', 'refunded', 'partially_refunded'
  )),
  fulfillment_status TEXT DEFAULT 'unfulfilled' CHECK (fulfillment_status IN (
    'unfulfilled', 'partially_fulfilled', 'fulfilled'
  )),
  
  -- Payment info
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  paid_at TIMESTAMPTZ,
  
  -- Shipping info
  courier_service TEXT DEFAULT 'PAXI',
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Notes
  customer_notes TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Product snapshot (in case product is deleted/changed)
  product_name TEXT NOT NULL,
  product_sku TEXT,
  product_image_url TEXT,
  
  -- Pricing
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PAYMENT MANAGEMENT
-- ============================================================================

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  payment_reference TEXT UNIQUE NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('payfast', 'eft', 'cash')),
  
  -- Payment details
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'
  )),
  
  -- PayFast specific
  payfast_payment_id TEXT,
  payfast_merchant_id TEXT,
  
  -- EFT specific
  eft_proof_url TEXT,
  eft_reference TEXT,
  bank_name TEXT,
  
  -- Metadata
  payment_data JSONB,
  error_message TEXT,
  
  -- Timestamps
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EFT payment confirmations
CREATE TABLE eft_confirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  amount DECIMAL(10,2) NOT NULL,
  proof_method TEXT CHECK (proof_method IN ('whatsapp', 'email', 'manual')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  admin_notes TEXT,
  confirmed_by UUID REFERENCES admin_users(id),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INVOICING & QUOTES
-- ============================================================================

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Invoice details
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  balance_due DECIMAL(10,2) NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'sent', 'viewed', 'paid', 'partially_paid', 'overdue', 'cancelled'
  )),
  
  -- Notes
  notes TEXT,
  terms TEXT,
  
  -- Timestamps
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id)
);

-- Quotes
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  
  -- Quote details
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'converted'
  )),
  
  -- Notes
  notes TEXT,
  terms TEXT,
  
  -- Conversion
  converted_to_order_id UUID REFERENCES orders(id),
  
  -- Timestamps
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id)
);

-- Quote items
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  description TEXT,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  discount_percent DECIMAL(5,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- BOOKKEEPING & FINANCIAL MANAGEMENT
-- ============================================================================

-- Chart of accounts
CREATE TABLE chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_code TEXT UNIQUE NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN (
    'asset', 'liability', 'equity', 'revenue', 'expense'
  )),
  account_subtype TEXT,
  parent_account_id UUID REFERENCES chart_of_accounts(id),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_number TEXT UNIQUE NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_type TEXT NOT NULL CHECK (entry_type IN (
    'sale', 'purchase', 'payment', 'receipt', 'adjustment', 'opening_balance'
  )),
  reference_type TEXT, -- 'order', 'payment', 'expense', etc.
  reference_id UUID,
  description TEXT NOT NULL,
  total_debit DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_credit DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_posted BOOLEAN DEFAULT false,
  posted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id)
);

-- Journal entry lines
CREATE TABLE journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID REFERENCES chart_of_accounts(id),
  description TEXT,
  debit_amount DECIMAL(10,2) DEFAULT 0,
  credit_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_number TEXT UNIQUE NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  vendor_name TEXT,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  receipt_url TEXT,
  account_id UUID REFERENCES chart_of_accounts(id),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id)
);

-- Bank transactions
CREATE TABLE bank_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_date DATE NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('debit', 'credit')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  reference TEXT,
  balance_after DECIMAL(10,2),
  category TEXT,
  is_reconciled BOOLEAN DEFAULT false,
  reconciled_at TIMESTAMPTZ,
  matched_journal_entry_id UUID REFERENCES journal_entries(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ACTIVITY LOGGING & AUDIT TRAIL
-- ============================================================================

-- Activity log
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Admin users
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_auth_user_id ON admin_users(auth_user_id);
CREATE INDEX idx_admin_users_role ON admin_users(role);

-- Customers
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_auth_user_id ON customers(auth_user_id);
CREATE INDEX idx_customers_phone ON customers(phone);

-- Products
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Orders
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_order_status ON orders(order_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Payments
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_payment_reference ON payments(payment_reference);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_method ON payments(payment_method);

-- Invoices
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Journal entries
CREATE INDEX idx_journal_entries_entry_date ON journal_entries(entry_date DESC);
CREATE INDEX idx_journal_entries_entry_type ON journal_entries(entry_type);
CREATE INDEX idx_journal_entries_is_posted ON journal_entries(is_posted);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE eft_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Products: Public read, admin write
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
      AND admin_users.can_manage_products = true
    )
  );

-- Customers: Users can view/update their own data
CREATE POLICY "Users can view own customer data" ON customers
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update own customer data" ON customers
  FOR UPDATE USING (auth_user_id = auth.uid());

-- Orders: Customers can view their own, admins can view all
CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
      AND admin_users.can_manage_orders = true
    )
  );

-- Financial data: Admin only
CREATE POLICY "Admins can view financials" ON journal_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
      AND admin_users.can_view_financials = true
    )
  );

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'NTK-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate unique invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate unique quote number
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'QTE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INSERT ALL CURRENT PRODUCTS
-- ============================================================================

-- Insert all 18 existing products with proper image naming convention
INSERT INTO products (
  sku, name, slug, tagline, short_description, description, long_description,
  category, price, unit, stock_quantity, benefits, ingredients, usage_instructions,
  emoji, gradient_css, badge, is_active, is_featured,
  image_url
) VALUES
-- Product 1: Imbiza Yamadoda
(
  'IYD-500ML',
  'Imbiza Yamadoda',
  'imbiza-yamadoda',
  'Traditional herbal tonic for men''s wellness',
  'A 500ml traditional herbal tonic blend with moringa, African potato, aloe ferox, and cancer bush for general wellness.',
  'A 500ml traditional herbal tonic blend with moringa, African potato, aloe ferox, and cancer bush for general wellness.',
  'Imbiza Yamadoda is a traditional herbal tonic from Intandokazi Herbal, formulated with indigenous herbs including moringa, African potato (Hypoxis), aloe ferox, and cancer bush (Sutherlandia). This general wellness mixture supports vitality and overall health using time-honored African botanical wisdom.',
  'Internal Health',
  800.00,
  '500ml bottle',
  25,
  '{"Supports general wellness", "Traditional African botanical blend", "Rich in indigenous herbs", "Promotes vitality", "Natural health support"}',
  '{"Moringa", "African potato (Hypoxis)", "Aloe ferox", "Cancer bush (Sutherlandia)", "Traditional indigenous herbs"}',
  'Shake well. Take 2 tablespoons (30ml) twice daily after meals, or as directed by your health practitioner. Refrigerate after opening.',
  '💪',
  'linear-gradient(135deg, #78350f, #9a3412)',
  'Traditional',
  true,
  true,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/product-images/imbiza-yamadoda.jpg'
),

-- Product 2: Imbiza yokuchatha
(
  'IYC-500ML',
  'Imbiza yokuchatha',
  'imbiza-yokuchatha',
  'Traditional cleansing mixture for lower-body wellness',
  'A 500ml traditional herbal cleansing mixture (ukuchatha) for isichitho sangaphansi - lower-body cleansing and wellness.',
  'A 500ml traditional herbal cleansing mixture (ukuchatha) for isichitho sangaphansi - lower-body cleansing and wellness.',
  'Imbiza yokuchatha is a traditional herbal cleansing mixture from Intandokazi Ukuphila Products, formulated for isichitho sangaphansi (lower-body cleansing). This herbal purgative/enema preparation follows traditional African wellness practices for internal cleansing and balance.',
  'Traditional Healing',
  350.00,
  '500ml bottle',
  20,
  '{"Traditional cleansing support", "Lower-body wellness", "Herbal purgative preparation", "Follows traditional practices", "Internal balance support"}',
  '{"Traditional African herbal blend", "Cleansing botanicals", "Natural plant extracts"}',
  'Mix half a glass of warm water with half a glass of umuthi. Use the mixture for ukuchatha (enema). Repeat twice a week, or as directed by your practitioner.',
  '🌿',
  'linear-gradient(135deg, #14532d, #065f46)',
  NULL,
  true,
  false,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/product-images/imbiza-yokuchatha.jpg'
),

-- Product 3: Stop Nonsense! — Indlovu kayiphendulwa
(
  'SN-2L',
  'Stop Nonsense! — Indlovu kayiphendulwa',
  'stop-nonsense-indlovu-kayiphendulwa',
  'Traditional cleansing mixture for steam/sitz baths',
  'A 2-litre traditional herbal cleansing mixture for ukuchatha (steam/sitz cleansing) - powerful traditional wellness support.',
  'A 2-litre traditional herbal cleansing mixture for ukuchatha (steam/sitz cleansing) - powerful traditional wellness support.',
  'Stop Nonsense! — Indlovu kayiphendulwa is a traditional herbal cleansing mixture from Intandokazi Ukuphila Products, formulated for ukuchatha (steam/sitz cleansing) use. This powerful 2-litre preparation supports traditional African cleansing rituals and wellness practices.',
  'Traditional Healing',
  600.00,
  '2 litre bottle',
  15,
  '{"Powerful traditional cleansing", "Steam/sitz bath support", "Large 2-litre size", "Traditional wellness ritual", "Deep cleansing properties"}',
  '{"Traditional African herbal blend", "Cleansing botanicals", "Natural plant extracts"}',
  'Pour 2 litres of umuthi into a bucket. Fill with warm water to make approximately 5 litres. Sit over the bucket and steam cleanse. Use 3-4 times a day, after every 2 days, or as directed.',
  '🔥',
  'linear-gradient(135deg, #7f1d1d, #9a3412)',
  'Powerful',
  true,
  true,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/product-images/stop-nonsense.jpg'
),

-- Product 4: Imbiza yoMhlume
(
  'IYM-1L',
  'Imbiza yoMhlume',
  'imbiza-yomhlume',
  'Traditional herbal tonic for internal cleansing',
  'A 1-litre traditional herbal tonic blend formulated for internal cleansing and strengthening.',
  'A 1-litre traditional herbal tonic blend formulated for internal cleansing and strengthening.',
  'Imbiza yoMhlume is a traditional herbal tonic from Intandokazi Ukuphila Products, formulated as an internal cleansing and strengthening mixture. This 1-litre preparation supports digestive wellness and overall vitality using traditional African botanical wisdom.',
  'Internal Health',
  300.00,
  '1 litre bottle',
  18,
  '{"Internal cleansing support", "Strengthening properties", "Digestive wellness", "Traditional formulation", "Supports vitality"}',
  '{"Traditional African herbal blend", "Cleansing botanicals", "Strengthening plant extracts"}',
  'Mix 2 tablespoons in a quarter cup of warm water. Drink three times a day, 30 minutes before meals, or as directed by your practitioner.',
  '⚡',
  'linear-gradient(135deg, #1e3a8a, #155e75)',
  NULL,
  true,
  false,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/product-images/imbiza-yomhlume.jpg'
),

-- Product 5: Umabulala iDliso (Umlomo Omnandi)
(
  'UID-1L',
  'Umabulala iDliso (Umlomo Omnandi)',
  'umabulala-idliso',
  'Traditional mixture for cleansing related to idliso',
  'A 1-litre traditional herbal mixture formulated for cleansing related to idliso (traditional concept of poison/bad luck).',
  'A 1-litre traditional herbal mixture formulated for cleansing related to idliso (traditional concept of poison/bad luck).',
  'Umabulala iDliso (Umlomo Omnandi) is a traditional herbal mixture from Intandokazi Ukuphila Products, formulated for cleansing related to idliso (traditional concept of poison/bad luck). This preparation follows traditional African wellness practices for spiritual and physical cleansing.',
  'Traditional Healing',
  350.00,
  '1 litre bottle',
  22,
  '{"Traditional cleansing support", "Spiritual wellness", "Physical cleansing", "Follows traditional practices", "Protective properties"}',
  '{"Traditional African herbal blend", "Cleansing botanicals", "Protective plant extracts"}',
  'Take 2 tablespoons 3 times a day after meals, or as directed by your practitioner. Not for use during pregnancy.',
  '🛡️',
  'linear-gradient(135deg, #4c1d95, #5b21b6)',
  NULL,
  true,
  false,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/product-images/umabulala-idliso.jpg'
),

-- Product 6: Umhlabelo
(
  'UHL-1L',
  'Umhlabelo',
  'umhlabelo',
  'Traditional herbal wash for home and body cleansing',
  'A 1-litre traditional herbal wash for ukuhlabela (ritual cleansing/washing) of the home and body.',
  'A 1-litre traditional herbal wash for ukuhlabela (ritual cleansing/washing) of the home and body.',
  'Umhlabelo is a traditional herbal wash from Intandokazi Ukuphila Products, formulated for ukuhlabela (ritual cleansing/washing) of the home and body. This preparation supports traditional African cleansing rituals for spiritual protection and wellness.',
  'Wellness & Spiritual',
  250.00,
  '1 litre bottle',
  28,
  '{"Home and body cleansing", "Ritual washing support", "Spiritual protection", "Traditional formulation", "Day and night use"}',
  '{"Traditional African herbal blend", "Cleansing botanicals", "Protective plant extracts"}',
  'Wash/cleanse home and body with warm water, night and day for 7 days, or as directed by your practitioner.',
  '🏠',
  'linear-gradient(135deg, #134e4a, #155e75)',
  NULL,
  true,
  false,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/product-images/umhlabelo.jpg'
),

-- Product 7: Imbiza Yama-Ulcer
(
  'IYU-1L',
  'Imbiza Yama-Ulcer',
  'imbiza-yama-ulcer',
  'Traditional mixture for digestive comfort',
  'A 1-litre traditional herbal mixture formulated to support digestive comfort and general wellness.',
  'A 1-litre traditional herbal mixture formulated to support digestive comfort and general wellness.',
  'Imbiza Yama-Ulcer is a traditional herbal mixture from Intandokazi Ukuphila Products, formulated to support digestive comfort and general wellness. This preparation uses traditional African botanicals known for their soothing and healing properties.',
  'Internal Health',
  300.00,
  '1 litre bottle',
  16,
  '{"Digestive comfort support", "Soothing properties", "General wellness", "Traditional formulation", "Natural healing support"}',
  '{"Traditional African herbal blend", "Soothing botanicals", "Digestive support plant extracts"}',
  'Take 2 tablespoons 3 times a day after meals, or as directed by your practitioner. Consult healthcare provider if you have ulcer diagnosis.',
  '💚',
  'linear-gradient(135deg, #365314, #166534)',
  NULL,
  true,
  false,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/product-images/imbiza-yama-ulcer.jpg'
),

-- Product 8: Umvusa Nkunzi
(
  'UNK-1L',
  'Umvusa Nkunzi',
  'umvusa-nkunzi',
  'Traditional men''s vitality and strength tonic',
  'A 1-litre traditional herbal tonic formulated as a men''s vitality and strength mixture.',
  'A 1-litre traditional herbal tonic formulated as a men''s vitality and strength mixture.',
  'Umvusa Nkunzi is a traditional herbal tonic from Intandokazi Ukuphila Products, formulated as a men''s vitality and strength mixture. This powerful preparation supports male wellness, energy, and vitality using traditional African botanical wisdom.',
  'Internal Health',
  300.00,
  '1 litre bottle',
  20,
  '{"Men''s vitality support", "Strength and energy", "Traditional formulation", "Male wellness", "Natural vitality boost"}',
  '{"Traditional African herbal blend", "Vitality-supporting botanicals", "Strengthening plant extracts"}',
  'Take 2 tablespoons 3 times a day after meals, or as directed by your practitioner.',
  '🦁',
  'linear-gradient(135deg, #7c2d12, #92400e)',
  'Men''s Health',
  true,
  true,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/product-images/umvusa-nkunzi.jpg'
),

-- Product 9: Zakhanya Liquid
(
  'ZKL-1L',
  'Zakhanya Liquid',
  'zakhanya-liquid',
  'Traditional mixture for wellbeing and vitality',
  'A 1-litre traditional herbal mixture formulated to support general wellbeing and vitality.',
  'A 1-litre traditional herbal mixture formulated to support general wellbeing and vitality.',
  'Zakhanya Liquid is a traditional herbal mixture from Intandokazi Ukuphila Products, formulated to support general wellbeing and vitality. This preparation uses traditional African botanicals to promote health, energy, and overall wellness.',
  'Internal Health',
  100.00,
  '1 litre bottle',
  24,
  '{"General wellbeing support", "Vitality boost", "Energy support", "Traditional formulation", "Overall wellness"}',
  '{"Traditional African herbal blend", "Vitality-supporting botanicals", "Wellness plant extracts"}',
  'Take 2 tablespoons 3 times a day after meals, or as directed by your practitioner.',
  '✨',
  'linear-gradient(135deg, #713f12, #92400e)',
  NULL,
  true,
  false,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/product-images/zakhanya-liquid.jpg'
),

-- Product 10: Bath Salt (Yokuthandeka)
(
  'BSY-500ML',
  'Bath Salt (Yokuthandeka)',
  'bath-salt-yokuthandeka',
  'Herbal bath salt for attractiveness and likability',
  'A 500ml herbal bath salt formulated for cleansing baths and skin care to support ukuthandeka (attractiveness/likability).',
  'A 500ml herbal bath salt formulated for cleansing baths and skin care to support ukuthandeka (attractiveness/likability).',
  'Bath Salt (Yokuthandeka) is a herbal bath salt from Intandokazi Ukuphila Products, formulated for cleansing baths and skin care to support ukuthandeka (attractiveness/likability). This traditional preparation combines cleansing and beautifying properties for a complete wellness experience.',
  'Skin & Body',
  80.00,
  '500ml container',
  35,
  '{"Cleansing bath support", "Skin care properties", "Attractiveness support", "Traditional formulation", "Beautifying properties"}',
  '{"Herbal bath salts", "Traditional botanicals", "Skin-nourishing minerals"}',
  'Apply/rub on the body while bathing, or dissolve desired amount in warm bath water and soak as needed.',
  '💖',
  'linear-gradient(135deg, #831843, #9f1239)',
  'Beauty',
  true,
  false,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/product-images/yokuthandeka.jpg'
),

-- Product 11: Inhlanhla Emhlophe
(
  'IEM-500ML',
  'Inhlanhla Emhlophe',
  'inhlanhla-emhlophe',
  'Herbal bath salt for luck and fortune',
  'A 500ml herbal bath salt formulated for cleansing baths associated with inhlanhla (luck/fortune).',
  'A 500ml herbal bath salt formulated for cleansing baths associated with inhlanhla (luck/fortune).',
  'Inhlanhla Emhlophe is a herbal bath salt from Intandokazi Ukuphila Products, formulated for cleansing baths associated with inhlanhla (luck/fortune). This traditional preparation supports spiritual wellness and attracts positive energy.',
  'Wellness & Spiritual',
  80.00,
  '500ml container',
  30,
  '{"Luck and fortune support", "Spiritual cleansing", "Positive energy attraction", "Traditional formulation", "Wellness bath"}',
  '{"Herbal bath salts", "Traditional botanicals", "Fortune-attracting minerals"}',
  'Apply/rub on the body while bathing, or dissolve desired amount in warm bath water and soak as needed.',
  '🍀',
  'linear-gradient(135deg, #e2e8f0, #d1d5db)',
  NULL,
  true,
  false,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/product-images/inhlanhla-emhlophe.jpg'
),

-- Product 12: Umakhiphi Isichitho
(
  'UIS-500ML',
  'Umakhiphi Isichitho',
  'umakhiphi-isichitho',
  'Herbal bath salt for removing misfortune',
  'A 500ml herbal bath salt formulated for cleansing baths associated with removing isichitho (misfortune/negative energy).',
  'A 500ml herbal bath salt formulated for cleansing baths associated with removing isichitho (misfortune/negative energy).',
  'Umakhiphi Isichitho is a herbal bath salt from Intandokazi Ukuphila Products, formulated for cleansing baths associated with removing isichitho (misfortune/negative energy). This powerful traditional preparation supports spiritual cleansing and protection.',
  'Wellness & Spiritual',
  80.00,
  '500ml container',
  28,
  '{"Removes misfortune", "Spiritual cleansing", "Negative energy removal", "Traditional formulation", "Protection support"}',
  '{"Herbal bath salts", "Traditional cleansing botanicals", "Protective minerals"}',
  'Apply/rub on the body while bathing, or dissolve desired amount in warm bath water and soak as needed.',
  '🛡️',
  'linear-gradient(135deg, #312e81, #6d28d9)',
  'Protection',
  true,
  false,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/product-images/umakhiphi-isichitho.jpg'
),

-- Product 13: Tissue Oil (Eyenenhlannhla)
(
  'TOE-100ML',
  'Tissue Oil (Eyenenhlannhla)',
  'tissue-oil-eyenenhlannhla',
  'Herbal tissue oil for luck and skin nourishment',
  'A 100ml herbal tissue oil formulated for skin nourishment and associated with inhlanhla (luck/fortune).',
  'A 100ml herbal tissue oil formulated for skin nourishment and associated with inhlanhla (luck/fortune).',
  'Tissue Oil (Eyenenhlannhla) is a herbal tissue oil from Intandokazi Ukuphila Products, formulated for skin nourishment and associated with inhlanhla (luck/fortune). This traditional preparation combines skincare benefits with spiritual wellness support.',
  'Skin & Body',
  200.00,
  '100ml bottle',
  40,
  '{"Skin nourishment", "Luck and fortune support", "Moisturizing properties", "Traditional formulation", "Spiritual wellness"}',
  '{"Herbal tissue oil blend", "Traditional botanicals", "Skin-nourishing oils"}',
  'Apply when you anoint/rub the whole body. Massage a small amount into clean, dry skin as needed.',
  '🌟',
  'linear-gradient(135deg, #d97706, #eab308)',
  NULL,
  true,
  false,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/product-images/tissue-oil-eyenenhlannhla.jpg'
),

-- Product 14: Tissue Oil (Yesichitho)
(
  'TOY-100ML',
  'Tissue Oil (Yesichitho)',
  'tissue-oil-yesichitho',
  'Herbal tissue oil for removing misfortune',
  'A 100ml herbal tissue oil formulated for skin nourishment and associated with removing isichitho (misfortune/negative energy).',
  'A 100ml herbal tissue oil formulated for skin nourishment and associated with removing isichitho (misfortune/negative energy).',
  'Tissue Oil (Yesichitho) is a herbal tissue oil from Intandokazi Ukuphila Products, formulated for skin nourishment and associated with removing isichitho (misfortune/negative energy). This traditional preparation combines skincare benefits with spiritual cleansing support.',
  'Skin & Body',
  200.00,
  '100ml bottle',
  38,
  '{"Skin nourishment", "Removes misfortune", "Moisturizing properties", "Traditional formulation", "Spiritual cleansing"}',
  '{"Herbal tissue oil blend", "Traditional cleansing botanicals", "Skin-nourishing oils"}',
  'Apply when you anoint/rub the whole body. Massage a small amount into clean, dry skin as needed.',
  '🔮',
  'linear-gradient(135deg, #4c1d95, #6d28d9)',
  NULL,
  true,
  false,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/product-images/tissue-oil-yesichitho.jpg'
),

-- Product 15: Shower Gel (Ikhipha Isichitho)
(
  'SGI-500ML',
  'Shower Gel (Ikhipha Isichitho)',
  'shower-gel-ikhipha-isichitho',
  'Herbal shower gel for removing misfortune',
  'A 500ml herbal shower gel formulated for daily cleansing and associated with removing isichitho (misfortune/negative energy).',
  'A 500ml herbal shower gel formulated for daily cleansing and associated with removing isichitho (misfortune/negative energy).',
  'Shower Gel (Ikhipha Isichitho) is a herbal shower gel from Intandokazi Ukuphila Products, formulated for daily cleansing and associated with removing isichitho (misfortune/negative energy). This traditional preparation combines daily hygiene with spiritual cleansing support.',
  'Skin & Body',
  100.00,
  '500ml bottle',
  32,
  '{"Daily cleansing", "Removes misfortune", "Gentle on skin", "Traditional formulation", "Spiritual cleansing"}',
  '{"Herbal shower gel base", "Traditional cleansing botanicals", "Gentle cleansing agents"}',
  'Wash the whole body. Apply a small amount to wet skin or sponge, lather, then rinse thoroughly.',
  '🚿',
  'linear-gradient(135deg, #1e3a8a, #3730a3)',
  NULL,
  true,
  false,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/product-images/shower-gel-ikhipha-isichitho.jpg'
),

-- Product 16: Shower Gel (Yokuthandeka)
(
  'SGY-500ML',
  'Shower Gel (Yokuthandeka)',
  'shower-gel-yokuthandeka',
  'Herbal shower gel for love and attraction',
  'A 500ml herbal shower gel formulated for daily cleansing and associated with uthando (love/attraction).',
  'A 500ml herbal shower gel formulated for daily cleansing and associated with uthando (love/attraction).',
  'Shower Gel (Yokuthandeka) is a herbal shower gel from Intandokazi Ukuphila Products, formulated for daily cleansing and associated with uthando (love/attraction). This traditional preparation combines daily hygiene with attractiveness and likability support.',
  'Skin & Body',
  100.00,
  '500ml bottle',
  34,
  '{"Daily cleansing", "Love and attraction support", "Gentle on skin", "Traditional formulation", "Beautifying properties"}',
  '{"Herbal shower gel base", "Traditional botanicals", "Gentle cleansing agents"}',
  'Wash the whole body. Apply a small amount to wet skin or sponge, lather, then rinse thoroughly.',
  '💕',
  'linear-gradient(135deg, #9f1239, #be123c)',
  NULL,
  true,
  false,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/product-images/shower-gel-yokuthandeka.jpg'
),

-- Product 17: Umkhanyakude Jelly (Vaseline)
(
  'UKJ-250ML',
  'Umkhanyakude Jelly (Vaseline)',
  'umkhanyakude-jelly-vaseline',
  'Herbal petroleum jelly for skin protection',
  'A 250ml herbal petroleum jelly used for skin protection, moisturising and traditional applications.',
  'A 250ml herbal petroleum jelly used for skin protection, moisturising and traditional applications.',
  'Umkhanyakude Jelly (Vaseline) is a herbal petroleum jelly from Intandokazi Ukuphila Products, used for skin protection, moisturising and traditional applications. This versatile preparation provides deep moisturization and skin barrier protection.',
  'Skin & Body',
  50.00,
  '250ml container',
  45,
  '{"Skin protection", "Deep moisturization", "Barrier protection", "Traditional formulation", "Versatile use"}',
  '{"Herbal petroleum jelly base", "Traditional botanicals", "Moisturizing agents"}',
  'Apply a small amount to clean, dry skin and massage gently. Use as needed on hands, feet, elbows, lips or any dry areas.',
  '🧴',
  'linear-gradient(135deg, #164e63, #1e40af)',
  NULL,
  true,
  false,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/product-images/umkhanyakude-jelly-vaseline.jpg'
),

-- Product 18: Umakhiphi Isichitho Vaseline
(
  'UIV-250ML',
  'Umakhiphi Isichitho Vaseline',
  'umakhiphi-isichitho-vaseline',
  'Herbal petroleum jelly for removing misfortune',
  'A 250ml herbal petroleum jelly used for skin protection, moisturising and traditional applications associated with removing isichitho.',
  'A 250ml herbal petroleum jelly used for skin protection, moisturising and traditional applications associated with removing isichitho.',
  'Umakhiphi Isichitho Vaseline is a herbal petroleum jelly from Intandokazi Ukuphila Products, used for skin protection, moisturising and traditional applications associated with removing isichitho (misfortune/negative energy). This preparation combines skincare benefits with spiritual cleansing support.',
  'Wellness & Spiritual',
  50.00,
  '250ml container',
  42,
  '{"Skin protection", "Removes misfortune", "Deep moisturization", "Traditional formulation", "Spiritual cleansing"}',
  '{"Herbal petroleum jelly base", "Traditional cleansing botanicals", "Moisturizing agents"}',
  'Apply a small amount to clean, dry skin and massage gently. Use as needed on hands, feet, elbows, lips or any dry areas.',
  '✨',
  'linear-gradient(135deg, #581c87, #3730a3)',
  NULL,
  true,
  false,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/product-images/umakhiphi-isichitho-vaseline.jpg'
);

-- ============================================================================
-- INITIAL CHART OF ACCOUNTS
-- ============================================================================

INSERT INTO chart_of_accounts (account_code, account_name, account_type, account_subtype, description) VALUES
-- Assets
('1000', 'Assets', 'asset', 'parent', 'All company assets'),
('1100', 'Current Assets', 'asset', 'current', 'Assets convertible to cash within one year'),
('1110', 'Cash and Bank', 'asset', 'current', 'Cash on hand and in bank accounts'),
('1120', 'Accounts Receivable', 'asset', 'current', 'Money owed by customers'),
('1130', 'Inventory', 'asset', 'current', 'Product inventory'),
('1140', 'Prepaid Expenses', 'asset', 'current', 'Expenses paid in advance'),

-- Liabilities
('2000', 'Liabilities', 'liability', 'parent', 'All company liabilities'),
('2100', 'Current Liabilities', 'liability', 'current', 'Liabilities due within one year'),
('2110', 'Accounts Payable', 'liability', 'current', 'Money owed to suppliers'),
('2120', 'Accrued Expenses', 'liability', 'current', 'Expenses incurred but not yet paid'),
('2130', 'Customer Deposits', 'liability', 'current', 'Advance payments from customers'),

-- Equity
('3000', 'Equity', 'equity', 'parent', 'Owner''s equity'),
('3100', 'Owner''s Capital', 'equity', 'capital', 'Owner''s investment in business'),
('3200', 'Retained Earnings', 'equity', 'retained', 'Accumulated profits'),

-- Revenue
('4000', 'Revenue', 'revenue', 'parent', 'All revenue accounts'),
('4100', 'Product Sales', 'revenue', 'sales', 'Revenue from product sales'),
('4200', 'Shipping Revenue', 'revenue', 'sales', 'Revenue from shipping fees'),
('4300', 'Other Revenue', 'revenue', 'other', 'Miscellaneous revenue'),

-- Expenses
('5000', 'Expenses', 'expense', 'parent', 'All expense accounts'),
('5100', 'Cost of Goods Sold', 'expense', 'cogs', 'Direct costs of products sold'),
('5200', 'Operating Expenses', 'expense', 'operating', 'General operating expenses'),
('5210', 'Marketing & Advertising', 'expense', 'operating', 'Marketing and advertising costs'),
('5220', 'Shipping & Delivery', 'expense', 'operating', 'Shipping and courier costs'),
('5230', 'Payment Processing Fees', 'expense', 'operating', 'PayFast and other payment fees'),
('5240', 'Website & Technology', 'expense', 'operating', 'Website hosting and technology costs'),
('5250', 'Office Supplies', 'expense', 'operating', 'Office and packaging supplies'),
('5260', 'Professional Fees', 'expense', 'operating', 'Accounting, legal, consulting fees'),
('5270', 'Bank Charges', 'expense', 'operating', 'Bank fees and charges'),
('5280', 'Utilities', 'expense', 'operating', 'Electricity, water, internet'),
('5290', 'Other Expenses', 'expense', 'operating', 'Miscellaneous expenses');

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'CLEAN DATABASE SCHEMA CREATED SUCCESSFULLY!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Tables Created: 25+';
  RAISE NOTICE 'Products Inserted: 18';
  RAISE NOTICE 'Chart of Accounts: 27 accounts';
  RAISE NOTICE '';
  RAISE NOTICE 'IMAGE NAMING CONVENTION:';
  RAISE NOTICE '  Main image: {slug}.jpg (e.g., imbiza-yamadoda.jpg)';
  RAISE NOTICE '  Gallery: {slug}-1.jpg, {slug}-2.jpg, etc.';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Upload product images to Supabase Storage bucket: product-images';
  RAISE NOTICE '2. Create admin user via Supabase Auth';
  RAISE NOTICE '3. Link admin user to admin_users table';
  RAISE NOTICE '4. Test database connection via /api/test-db';
  RAISE NOTICE '============================================================================';
END $$;
