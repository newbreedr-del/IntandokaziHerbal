-- ============================================================================
-- FIX: Add all missing columns to products table and activity_log table
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Products: unit
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT '500ml';

-- Products: tagline
ALTER TABLE products ADD COLUMN IF NOT EXISTS tagline TEXT;

-- Products: long_description
ALTER TABLE products ADD COLUMN IF NOT EXISTS long_description TEXT;

-- Products: weight_kg
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(10,3);

-- Products: dimensions_cm
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions_cm TEXT;

-- Products: emoji
ALTER TABLE products ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '🌿';

-- Products: gradient_css
ALTER TABLE products ADD COLUMN IF NOT EXISTS gradient_css TEXT;

-- Products: badge
ALTER TABLE products ADD COLUMN IF NOT EXISTS badge TEXT;

-- Products: benefits (array)
ALTER TABLE products ADD COLUMN IF NOT EXISTS benefits TEXT[];

-- Products: is_new
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;

-- Products: is_on_sale
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_on_sale BOOLEAN DEFAULT false;

-- Products: meta_keywords
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_keywords TEXT;

-- ============================================================================
-- Fix activity_log table to match what the API inserts
-- ============================================================================
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS old_values JSONB;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS new_values JSONB;

-- ============================================================================
-- available_slots table (for booking availability management)
-- ============================================================================
CREATE TABLE IF NOT EXISTS available_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  max_bookings INTEGER DEFAULT 1,
  current_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, start_time)
);

ALTER TABLE available_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read available slots" ON available_slots;
CREATE POLICY "Public can read available slots"
  ON available_slots FOR SELECT
  TO anon, authenticated
  USING (is_available = true);

SELECT '✅ All missing columns added successfully!' as status;
