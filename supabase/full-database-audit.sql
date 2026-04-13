-- COMPREHENSIVE SUPABASE DATABASE AUDIT
-- This script audits all tables, relationships, and system integrity

-- ==========================================
-- SECTION 1: COMPLETE TABLE INVENTORY
-- ==========================================

RAISE NOTICE '=== COMPLETE TABLE INVENTORY ===';

CREATE TEMP TABLE table_audit AS
SELECT 
    table_name,
    table_type,
    CASE 
        WHEN table_name LIKE '%booking%' THEN 'Booking System'
        WHEN table_name LIKE '%order%' THEN 'Order System'
        WHEN table_name LIKE '%payment%' THEN 'Payment System'
        WHEN table_name LIKE '%product%' THEN 'Product System'
        WHEN table_name LIKE '%notification%' THEN 'Notification System'
        WHEN table_name LIKE '%user%' OR table_name LIKE '%auth%' THEN 'User/Auth System'
        WHEN table_name LIKE '%admin%' THEN 'Admin System'
        WHEN table_name LIKE '%setting%' THEN 'Settings System'
        WHEN table_name LIKE '%slot%' THEN 'Scheduling System'
        ELSE 'Other'
    END as system_category
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY system_category, table_name;

-- Display all tables by category
SELECT 
    system_category,
    STRING_AGG(table_name, ', ' ORDER BY table_name) as tables_in_category,
    COUNT(*) as table_count
FROM table_audit
GROUP BY system_category
ORDER BY system_category;

-- ==========================================
-- SECTION 2: TABLE DETAILS AUDIT
-- ==========================================

RAISE NOTICE '=== DETAILED TABLE ANALYSIS ===';

-- Get detailed info for each table
DO $$
DECLARE
    table_record RECORD;
    column_count INTEGER;
    index_count INTEGER;
    constraint_count INTEGER;
    trigger_count INTEGER;
BEGIN
    FOR table_record IN 
        SELECT table_name FROM table_audit ORDER BY table_name
    LOOP
        -- Count columns
        SELECT COUNT(*) INTO column_count
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = table_record.table_name;
        
        -- Count indexes
        SELECT COUNT(*) INTO index_count
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = table_record.table_name;
        
        -- Count constraints
        SELECT COUNT(*) INTO constraint_count
        FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = table_record.table_name;
        
        -- Count triggers
        SELECT COUNT(*) INTO trigger_count
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public' 
        AND event_object_table = table_record.table_name;
        
        RAISE NOTICE 'Table: % | Columns: % | Indexes: % | Constraints: % | Triggers: %', 
            table_record.table_name, column_count, index_count, constraint_count, trigger_count;
    END LOOP;
END $$;

-- ==========================================
-- SECTION 3: FOREIGN KEY RELATIONSHIPS AUDIT
-- ==========================================

RAISE NOTICE '=== FOREIGN KEY RELATIONSHIPS AUDIT ===';

-- Check all foreign key relationships
CREATE TEMP TABLE fk_audit AS
SELECT 
    tc.table_name as source_table,
    kcu.column_name as source_column,
    ccu.table_name as target_table,
    ccu.column_name as target_column,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public';

-- Display all relationships
SELECT 
    '📗 ' || source_table || '.' || source_column || 
    ' → ' || target_table || '.' || target_column as relationship,
    constraint_name
FROM fk_audit
ORDER BY source_table, target_table;

-- Check for orphaned foreign keys (referencing non-existent tables)
RAISE NOTICE '=== ORPHANED FOREIGN KEY CHECK ===';

DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphan_count
    FROM fk_audit f
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.tables t 
        WHERE t.table_schema = 'public' 
        AND t.table_name = f.target_table
    );
    
    IF orphan_count > 0 THEN
        RAISE NOTICE '❌ Found % orphaned foreign key references!', orphan_count;
        SELECT 
            source_table,
            source_column,
            target_table as missing_target_table
        FROM fk_audit f
        WHERE NOT EXISTS (
            SELECT 1 FROM information_schema.tables t 
            WHERE t.table_schema = 'public' 
            AND t.table_name = f.target_table
        );
    ELSE
        RAISE NOTICE '✅ All foreign key references are valid';
    END IF;
END $$;

-- ==========================================
-- SECTION 4: BOOKING SYSTEM SPECIFIC AUDIT
-- ==========================================

RAISE NOTICE '=== BOOKING SYSTEM AUDIT ===';

-- Check booking tables specifically
DO $$
DECLARE
    booking_tables TEXT[] := ARRAY['consultation_bookings', 'booking_payments', 'booking_notifications', 'booking_settings', 'available_slots'];
    table_exists BOOLEAN;
    column_exists BOOLEAN;
BEGIN
    FOREACH table_name IN ARRAY booking_tables
    LOOP
        -- Check if table exists
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) INTO table_exists;
        
        IF table_exists THEN
            RAISE NOTICE '✅ % exists', table_name;
            
            -- Check for calendar_event_id in consultation_bookings
            IF table_name = 'consultation_bookings' THEN
                SELECT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = table_name 
                    AND column_name = 'calendar_event_id'
                ) INTO column_exists;
                
                IF column_exists THEN
                    RAISE NOTICE '  ✅ Has calendar_event_id column';
                ELSE
                    RAISE NOTICE '  ❌ Missing calendar_event_id column';
                END IF;
                
                -- Check for created_by_agent column
                SELECT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = table_name 
                    AND column_name = 'created_by_agent'
                ) INTO column_exists;
                
                IF column_exists THEN
                    RAISE NOTICE '  ✅ Has created_by_agent column';
                ELSE
                    RAISE NOTICE '  ❌ Missing created_by_agent column';
                END IF;
            END IF;
        ELSE
            RAISE NOTICE '❌ % missing', table_name;
        END IF;
    END LOOP;
END $$;

-- ==========================================
-- SECTION 5: ORDER SYSTEM AUDIT
-- ==========================================

RAISE NOTICE '=== ORDER SYSTEM AUDIT ===';

DO $$
DECLARE
    order_tables TEXT[] := ARRAY['orders', 'order_items', 'order_notifications'];
    table_exists BOOLEAN;
BEGIN
    FOREACH table_name IN ARRAY order_tables
    LOOP
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) INTO table_exists;
        
        IF table_exists THEN
            RAISE NOTICE '✅ % exists', table_name;
        ELSE
            RAISE NOTICE '❌ % missing', table_name;
        END IF;
    END LOOP;
END $$;

-- ==========================================
-- SECTION 6: PRODUCT SYSTEM AUDIT
-- ==========================================

RAISE NOTICE '=== PRODUCT SYSTEM AUDIT ===';

DO $$
DECLARE
    product_tables TEXT[] := ARRAY['products', 'product_categories', 'product_inventory'];
    table_exists BOOLEAN;
BEGIN
    FOREACH table_name IN ARRAY product_tables
    LOOP
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) INTO table_exists;
        
        IF table_exists THEN
            RAISE NOTICE '✅ % exists', table_name;
        ELSE
            RAISE NOTICE '❌ % missing', table_name;
        END IF;
    END LOOP;
END $$;

-- ==========================================
-- SECTION 7: RLS (ROW LEVEL SECURITY) AUDIT
-- ==========================================

RAISE NOTICE '=== ROW LEVEL SECURITY AUDIT ===';

-- Check which tables have RLS enabled
CREATE TEMP TABLE rls_audit AS
SELECT 
    schemaname || '.' || tablename as table_full_name,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public';

SELECT table_full_name, rls_status FROM rls_audit ORDER BY table_full_name;

-- Check RLS policies
CREATE TEMP TABLE rls_policies_audit AS
SELECT 
    schemaname || '.' || tablename as table_name,
    policyname,
    permissive,
    roles,
    cmd as command_type,
    qual as using_qualification
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Display policies
SELECT 
    table_name,
    policyname,
    CASE WHEN permissive THEN 'Permissive' ELSE 'Restrictive' END as policy_type,
    command_type,
    COALESCE(roles, 'PUBLIC') as applicable_roles
FROM rls_policies_audit;

-- ==========================================
-- SECTION 8: INDEX PERFORMANCE AUDIT
-- ==========================================

RAISE NOTICE '=== INDEX PERFORMANCE AUDIT ===';

-- Get all indexes
CREATE TEMP TABLE index_audit AS
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Display indexes by table
SELECT 
    tablename,
    STRING_AGG(indexname, ', ' ORDER BY indexname) as indexes,
    COUNT(*) as index_count
FROM index_audit
GROUP BY tablename
ORDER BY tablename;

-- Check for missing critical indexes
RAISE NOTICE '=== CRITICAL INDEXES CHECK ===';

DO $$
DECLARE
    missing_indexes TEXT[];
BEGIN
    -- Check for booking system indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'consultation_bookings') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'consultation_bookings' AND indexname LIKE '%booking_date%') THEN
            RAISE NOTICE '❌ Missing index on consultation_bookings.booking_date';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'consultation_bookings' AND indexname LIKE '%payment_status%') THEN
            RAISE NOTICE '❌ Missing index on consultation_bookings.payment_status';
        END IF;
    END IF;
    
    -- Check for order system indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'orders' AND indexname LIKE '%order_reference%') THEN
            RAISE NOTICE '❌ Missing index on orders.order_reference';
        END IF;
    END IF;
    
    -- Check for payment system indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'booking_payments') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'booking_payments' AND indexname LIKE '%payment_reference%') THEN
            RAISE NOTICE '❌ Missing index on booking_payments.payment_reference';
        END IF;
    END IF;
    
    RAISE NOTICE '✅ Critical index check completed';
END $$;

-- ==========================================
-- SECTION 9: DATA INTEGRITY CHECKS
-- ==========================================

RAISE NOTICE '=== DATA INTEGRITY CHECKS ===';

-- Check for orphaned records in booking system
DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    -- Check booking_payments without bookings
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'booking_payments') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'consultation_bookings') THEN
        SELECT COUNT(*) INTO orphan_count
        FROM booking_payments bp
        LEFT JOIN consultation_bookings cb ON bp.booking_id = cb.id
        WHERE cb.id IS NULL;
        
        IF orphan_count > 0 THEN
            RAISE NOTICE '❌ Found % orphaned booking_payments records', orphan_count;
        ELSE
            RAISE NOTICE '✅ No orphaned booking_payments records';
        END IF;
    END IF;
    
    -- Check booking_notifications without bookings
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'booking_notifications') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'consultation_bookings') THEN
        SELECT COUNT(*) INTO orphan_count
        FROM booking_notifications bn
        LEFT JOIN consultation_bookings cb ON bn.booking_id = cb.id
        WHERE cb.id IS NULL;
        
        IF orphan_count > 0 THEN
            RAISE NOTICE '❌ Found % orphaned booking_notifications records', orphan_count;
        ELSE
            RAISE NOTICE '✅ No orphaned booking_notifications records';
        END IF;
    END IF;
    
    -- Check order_items without orders
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        SELECT COUNT(*) INTO orphan_count
        FROM order_items oi
        LEFT JOIN orders o ON oi.order_id = o.id
        WHERE o.id IS NULL;
        
        IF orphan_count > 0 THEN
            RAISE NOTICE '❌ Found % orphaned order_items records', orphan_count;
        ELSE
            RAISE NOTICE '✅ No orphaned order_items records';
        END IF;
    END IF;
END $$;

-- ==========================================
-- SECTION 10: SYSTEM SUMMARY
-- ==========================================

RAISE NOTICE '=== SYSTEM SUMMARY ===';

-- Overall statistics
SELECT 
    'TOTAL TABLES' as metric,
    COUNT(*) as value
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'

UNION ALL

SELECT 
    'BOOKING SYSTEM TABLES' as metric,
    COUNT(*) as value
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%booking%'

UNION ALL

SELECT 
    'ORDER SYSTEM TABLES' as metric,
    COUNT(*) as value
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%order%'

UNION ALL

SELECT 
    'TABLES WITH RLS ENABLED' as metric,
    COUNT(*) as value
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true

UNION ALL

SELECT 
    'TOTAL INDEXES' as metric,
    COUNT(*) as value
FROM pg_indexes 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'TOTAL FOREIGN KEYS' as metric,
    COUNT(*) as value
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND constraint_type = 'FOREIGN KEY'

ORDER BY metric;

-- ==========================================
-- SECTION 11: RECOMMENDATIONS
-- ==========================================

RAISE NOTICE '=== SYSTEM RECOMMENDATIONS ===';

DO $$
DECLARE
    missing_booking_tables INTEGER;
    missing_order_tables INTEGER;
    tables_without_rls INTEGER;
BEGIN
    -- Count missing booking tables
    SELECT 5 - COUNT(*) INTO missing_booking_tables
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('consultation_bookings', 'booking_payments', 'booking_notifications', 'booking_settings', 'available_slots');
    
    -- Count missing order tables
    SELECT 3 - COUNT(*) INTO missing_order_tables
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('orders', 'order_items', 'order_notifications');
    
    -- Count tables without RLS
    SELECT COUNT(*) INTO tables_without_rls
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND rowsecurity = false;
    
    -- Generate recommendations
    IF missing_booking_tables > 0 THEN
        RAISE NOTICE '🔧 RECOMMENDATION: Run booking system setup (missing % tables)', missing_booking_tables;
    END IF;
    
    IF missing_order_tables > 0 THEN
        RAISE NOTICE '🔧 RECOMMENDATION: Run order system setup (missing % tables)', missing_order_tables;
    END IF;
    
    IF tables_without_rls > 0 THEN
        RAISE NOTICE '🔧 RECOMMENDATION: Enable RLS on % tables for security', tables_without_rls;
    END IF;
    
    IF missing_booking_tables = 0 AND missing_order_tables = 0 AND tables_without_rls = 0 THEN
        RAISE NOTICE '✅ System appears to be properly configured!';
    END IF;
END $$;

RAISE NOTICE '=== AUDIT COMPLETE ===';
RAISE NOTICE 'Review the output above for system status and recommendations';

-- Clean up temp tables
DROP TABLE IF EXISTS table_audit;
DROP TABLE IF EXISTS fk_audit;
DROP TABLE IF EXISTS rls_audit;
DROP TABLE IF EXISTS rls_policies_audit;
DROP TABLE IF EXISTS index_audit;
