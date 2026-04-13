-- 🌿 Remove Vitamins and Supplements from Product Catalog
-- Run this in Supabase SQL Editor to remove supplement products

-- Delete supplement products
DELETE FROM products 
WHERE category = 'Supplements' 
   OR name ILIKE '%capsule%'
   OR name ILIKE '%supplement%'
   OR name ILIKE '%vitamin%'
   OR description ILIKE '%supplement%'
   OR description ILIKE '%vitamin%'
   OR tags ILIKE '%supplement%'
   OR tags ILIKE '%vitamin%';

-- Update any products that might have supplement-related tags
UPDATE products 
SET tags = REPLACE(REPLACE(tags, 'supplement', ''), 'vitamin', '')
WHERE tags ILIKE '%supplement%' OR tags ILIKE '%vitamin%';

-- Remove empty tags
UPDATE products 
SET tags = NULL 
WHERE tags = '' OR tags = '{}';

-- Verify supplements were removed
SELECT 
  COUNT(*) as remaining_products,
  COUNT(CASE WHEN category = 'Supplements' THEN 1 END) as supplement_products,
  COUNT(CASE WHEN name ILIKE '%vitamin%' OR name ILIKE '%supplement%' THEN 1 END) as vitamin_supplement_names
FROM products 
WHERE is_active = true;

-- Show remaining products by category
SELECT 
  category,
  COUNT(*) as product_count,
  STRING_AGG(name, ', ' ORDER BY name) as products
FROM products 
WHERE is_active = true
GROUP BY category
ORDER BY category;

-- Note: This script removes all supplement and vitamin products
-- Your product catalog now focuses on: Teas, Skincare, Tonics, Oils, Balms
