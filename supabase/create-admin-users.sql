-- Create admin users in the database
-- This will use the actual schema from the database

-- Insert admin users with correct column names
INSERT INTO admin_users (id, email, full_name, role, can_manage_products, can_manage_orders, can_manage_customers, can_view_financials, can_manage_settings, is_active, created_at, updated_at) VALUES
(
  gen_random_uuid(),
  'admin@nthandokazi.co.za',
  'Admin User',
  'super_admin',
  true,  -- can_manage_products
  true,  -- can_manage_orders
  true,  -- can_manage_customers
  true,  -- can_view_financials
  true,  -- can_manage_settings
  true,  -- is_active
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'mandubusabelo@gmail.com',
  'Mandu Sabelo',
  'admin',
  true,  -- can_manage_products
  true,  -- can_manage_orders
  true,  -- can_manage_customers
  true,  -- can_view_financials
  true,  -- can_manage_settings
  true,  -- is_active
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  can_manage_products = EXCLUDED.can_manage_products,
  can_manage_orders = EXCLUDED.can_manage_orders,
  can_manage_customers = EXCLUDED.can_manage_customers,
  can_view_financials = EXCLUDED.can_view_financials,
  can_manage_settings = EXCLUDED.can_manage_settings,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
