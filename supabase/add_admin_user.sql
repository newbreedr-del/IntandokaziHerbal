-- Add mandubusabelo@gmail.com as admin user
-- Run this in Supabase SQL Editor

INSERT INTO admin_users (
  email,
  full_name,
  role,
  can_manage_products,
  can_manage_orders,
  can_manage_customers,
  can_view_financials,
  can_manage_settings,
  is_active
) VALUES (
  'mandubusabelo@gmail.com',
  'Mandu Sabelo',
  'admin',
  true,
  true,
  true,
  true,
  true,
  true
) ON CONFLICT (email) DO UPDATE SET
  is_active = true,
  updated_at = NOW();
