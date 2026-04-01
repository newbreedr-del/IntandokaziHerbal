-- Create admin users in the database
-- This will replace the hardcoded admin users in auth.ts

-- Insert admin users
INSERT INTO admin_users (id, email, name, role, permissions, created_at, updated_at) VALUES
(
  gen_random_uuid(),
  'admin@nthandokazi.co.za',
  'Admin User',
  'super_admin',
  '{"can_manage_products": true, "can_manage_orders": true, "can_manage_customers": true, "can_view_financials": true, "can_manage_settings": true}',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'mandubusabelo@gmail.com',
  'Mandu Sabelo',
  'admin',
  '{"can_manage_products": true, "can_manage_orders": true, "can_manage_customers": true, "can_view_financials": true, "can_manage_settings": true}',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  updated_at = NOW();

-- Create a simple password hash (in production, use proper hashing)
-- For now, we'll use a simple approach with admin123
UPDATE admin_users SET password_hash = 'admin123' WHERE email IN ('admin@nthandokazi.co.za', 'mandubusabelo@gmail.com');
