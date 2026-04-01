-- Better Duplicate Cleanup Script
-- This script properly handles duplicate products and provides detailed feedback

-- First, let's see what duplicates exist
WITH duplicate_check AS (
  SELECT 
    slug, 
    COUNT(*) as duplicate_count,
    STRING_AGG(id::text, ', ') as all_ids,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created
  FROM products 
  GROUP BY slug 
  HAVING COUNT(*) > 1
)
SELECT 
  'DUPLICATE FOUND' as status,
  slug,
  duplicate_count,
  all_ids,
  first_created,
  last_created
FROM duplicate_check;

-- Show all products with their slugs for verification
SELECT 
  'ALL PRODUCTS' as status,
  id,
  name,
  slug,
  created_at
FROM products 
ORDER BY slug, created_at;

-- Now safely remove duplicates, keeping the first created one
DELETE FROM products 
WHERE id NOT IN (
  SELECT DISTINCT ON (slug) id
  FROM products
  ORDER BY slug, created_at ASC
) AND EXISTS (
  SELECT 1 FROM (
    SELECT slug, COUNT(*) as count
    FROM products
    GROUP BY slug
    HAVING COUNT(*) > 1
  ) duplicates WHERE duplicates.slug = products.slug
);

-- Show the results after cleanup
SELECT 
  'AFTER CLEANUP' as status,
  slug, 
  COUNT(*) as final_count
FROM products 
GROUP BY slug 
ORDER BY slug;

-- Final verification - show all remaining products
SELECT 
  'FINAL PRODUCTS' as status,
  COUNT(*) as total_products,
  COUNT(DISTINCT slug) as unique_slugs
FROM products;

-- Check for any remaining issues
SELECT 
  'ISSUES CHECK' as status,
  CASE 
    WHEN COUNT(*) != COUNT(DISTINCT slug) THEN 'STILL HAS DUPLICATES'
    ELSE 'NO DUPLICATES'
  END as duplicate_status
FROM products;
