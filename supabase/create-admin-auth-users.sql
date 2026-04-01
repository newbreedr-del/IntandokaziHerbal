-- Create admin users in Supabase Auth and admin_users table
-- Run this in Supabase SQL Editor

-- Step 1: Create admin users in Supabase Auth
-- Note: These need to be created manually in Supabase Dashboard > Authentication > Users
-- Or use the auth.admin API

-- Step 2: Add admin users to admin_users table
INSERT INTO admin_users (
  id,
  email,
  full_name,
  role,
  can_manage_products,
  can_manage_orders,
  can_manage_customers,
  can_view_financials,
  can_manage_settings,
  is_active,
  created_at
) VALUES 
(
  gen_random_uuid(),
  'admin@intandokaziherbal.co.za',
  'Admin User',
  'super_admin',
  true,
  true,
  true,
  true,
  true,
  true,
  NOW()
),
(
  gen_random_uuid(),
  'nthandokazi@intandokaziherbal.co.za',
  'Nthandokazi Mokoatle',
  'admin',
  true,
  true,
  true,
  true,
  true,
  true,
  NOW()
),
(
  gen_random_uuid(),
  'manager@intandokaziherbal.co.za',
  'Manager',
  'admin',
  true,
  true,
  true,
  true,
  true,
  true,
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

-- Step 3: Verify the admin users were created
SELECT * FROM admin_users WHERE email IN (
  'admin@intandokaziherbal.co.za',
  'nthandokazi@intandokaziherbal.co.za', 
  'manager@intandokaziherbal.co.za'
);
