-- ============================================================================
-- ADD MISSING COLUMNS TO PRODUCTS TABLE
-- ============================================================================
-- This adds columns that the code expects but are missing from your table
-- ============================================================================

-- Add is_active column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE '✅ Added column: products.is_active';
    ELSE
        RAISE NOTICE '⏭️  Column products.is_active already exists';
    END IF;
END $$;

-- Add is_featured column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'is_featured'
    ) THEN
        ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Added column: products.is_featured';
    ELSE
        RAISE NOTICE '⏭️  Column products.is_featured already exists';
    END IF;
END $$;

-- Add views column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'views'
    ) THEN
        ALTER TABLE products ADD COLUMN views INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Added column: products.views';
    ELSE
        RAISE NOTICE '⏭️  Column products.views already exists';
    END IF;
END $$;

-- Add sales_count column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'sales_count'
    ) THEN
        ALTER TABLE products ADD COLUMN sales_count INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Added column: products.sales_count';
    ELSE
        RAISE NOTICE '⏭️  Column products.sales_count already exists';
    END IF;
END $$;

-- Add slug column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'slug'
    ) THEN
        ALTER TABLE products ADD COLUMN slug TEXT UNIQUE;
        RAISE NOTICE '✅ Added column: products.slug';
    ELSE
        RAISE NOTICE '⏭️  Column products.slug already exists';
    END IF;
END $$;

SELECT '✅ Products table columns updated!' as status;
