-- Fix Categories and Duplicate Slug Issues
-- This script will populate categories and handle duplicate products

-- First, let's clean up any duplicate products
-- Find products with duplicate slugs
WITH duplicate_slugs AS (
  SELECT slug, COUNT(*) as count
  FROM products
  GROUP BY slug
  HAVING COUNT(*) > 1
)
SELECT 'Found duplicate slugs:', slug, count FROM duplicate_slugs;

-- If there are duplicates, keep the first one and delete the rest
DELETE FROM products 
WHERE id NOT IN (
  SELECT DISTINCT ON (slug) id
  FROM products
  ORDER BY slug, created_at
) AND EXISTS (
  SELECT 1 FROM (
    SELECT slug, COUNT(*) as count
    FROM products
    GROUP BY slug
    HAVING COUNT(*) > 1
  ) duplicates WHERE duplicates.slug = products.slug
);

-- Now populate the categories table
INSERT INTO product_categories (name, slug, description, display_order, is_active) VALUES
('Internal Health', 'internal-health', 'Products for internal wellness and health', 1, true),
('External Health', 'external-health', 'Products for external health and skincare', 2, true),
('Mental Wellness', 'mental-wellness', 'Products for mental clarity and wellness', 3, true),
('Traditional Remedies', 'traditional-remedies', 'Traditional African herbal remedies', 4, true),
('Vitamins & Supplements', 'vitamins-supplements', 'Vitamins and dietary supplements', 5, true),
('Natural Beauty', 'natural-beauty', 'Natural beauty and personal care products', 6, true),
('Immune Support', 'immune-support', 'Products to support immune system health', 7, true),
('Digestive Health', 'digestive-health', 'Products for digestive and gut health', 8, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Verify categories were inserted
SELECT 'Categories created:', COUNT(*) as category_count FROM product_categories WHERE is_active = true;

-- Show all categories
SELECT * FROM product_categories WHERE is_active = true ORDER BY display_order;

-- Update any products that have categories that don't exist in the categories table
-- First, let's see what categories are currently in products
SELECT DISTINCT category FROM products WHERE category IS NOT NULL;

-- Update products to use valid category names if needed
UPDATE products SET category = 'Internal Health' WHERE category NOT IN (SELECT name FROM product_categories);

-- Show final product categories
SELECT DISTINCT category, COUNT(*) as product_count FROM products GROUP BY category ORDER BY product_count DESC;
