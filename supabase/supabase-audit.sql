-- COMPREHENSIVE SUPABASE DATABASE AUDIT (Supabase Compatible)
-- This script audits all tables, relationships, and system integrity

-- ==========================================
-- SECTION 1: COMPLETE TABLE INVENTORY
-- ==========================================

SELECT '=== COMPLETE TABLE INVENTORY ===' as section;

-- Get all tables with categories
SELECT 
    table_name,
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

-- Display tables by category summary
SELECT '=== TABLES BY CATEGORY SUMMARY ===' as section;

SELECT 
    system_category,
    STRING_AGG(table_name, ', ' ORDER BY table_name) as tables_in_category,
    COUNT(*) as table_count
FROM (
    SELECT 
        table_name,
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
) categorized_tables
GROUP BY system_category
ORDER BY system_category;

-- ==========================================
-- SECTION 2: DETAILED TABLE ANALYSIS
-- ==========================================

SELECT '=== DETAILED TABLE ANALYSIS ===' as section;

SELECT 
    t.table_name,
    COUNT(c.column_name) as column_count,
    COUNT(DISTINCT i.indexname) as index_count,
    COUNT(DISTINCT tc.constraint_name) as constraint_count,
    COUNT(DISTINCT tr.trigger_name) as trigger_count
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name AND c.table_schema = 'public'
LEFT JOIN pg_indexes i ON t.table_name = i.tablename AND i.schemaname = 'public'
LEFT JOIN information_schema.table_constraints tc ON t.table_name = tc.table_name AND tc.table_schema = 'public'
LEFT JOIN information_schema.triggers tr ON t.table_name = tr.event_object_table AND tr.trigger_schema = 'public'
WHERE t.table_schema = 'public' 
AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name
ORDER BY t.table_name;

-- ==========================================
-- SECTION 3: FOREIGN KEY RELATIONSHIPS AUDIT
-- ==========================================

SELECT '=== FOREIGN KEY RELATIONSHIPS AUDIT ===' as section;

SELECT 
    '📗 ' || tc.table_name || '.' || kcu.column_name || 
    ' → ' || ccu.table_name || '.' || ccu.column_name as relationship,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, ccu.table_name;

-- Check for orphaned foreign keys
SELECT '=== ORPHANED FOREIGN KEY CHECK ===' as section;

SELECT 
    tc.table_name as source_table,
    kcu.column_name as source_column,
    ccu.table_name as missing_target_table,
    'ORPHANED REFERENCE' as status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND NOT EXISTS (
        SELECT 1 FROM information_schema.tables t 
        WHERE t.table_schema = 'public' 
        AND t.table_name = ccu.table_name
    );

-- ==========================================
-- SECTION 4: BOOKING SYSTEM SPECIFIC AUDIT
-- ==========================================

SELECT '=== BOOKING SYSTEM AUDIT ===' as section;

-- Check booking tables existence
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = t.table_name
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM (VALUES 
    ('consultation_bookings'),
    ('booking_payments'),
    ('booking_notifications'),
    ('booking_settings'),
    ('available_slots')
) AS t(table_name);

-- Check for calendar integration columns in consultation_bookings
SELECT '=== CALENDAR INTEGRATION CHECK ===' as section;

SELECT 
    column_name,
    '✅ PRESENT' as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'consultation_bookings'
AND column_name IN ('calendar_event_id', 'created_by_agent')

UNION ALL

SELECT 
    'calendar_event_id' as column_name,
    '❌ MISSING' as status
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'consultation_bookings'
    AND column_name = 'calendar_event_id'
)

UNION ALL

SELECT 
    'created_by_agent' as column_name,
    '❌ MISSING' as status
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'consultation_bookings'
    AND column_name = 'created_by_agent'
);

-- ==========================================
-- SECTION 5: ORDER SYSTEM AUDIT
-- ==========================================

SELECT '=== ORDER SYSTEM AUDIT ===' as section;

SELECT 
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = t.table_name
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM (VALUES 
    ('orders'),
    ('order_items'),
    ('order_notifications')
) AS t(table_name);

-- ==========================================
-- SECTION 6: PRODUCT SYSTEM AUDIT
-- ==========================================

SELECT '=== PRODUCT SYSTEM AUDIT ===' as section;

SELECT 
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = t.table_name
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM (VALUES 
    ('products'),
    ('product_categories'),
    ('product_inventory')
) AS t(table_name);

-- ==========================================
-- SECTION 7: RLS (ROW LEVEL SECURITY) AUDIT
-- ==========================================

SELECT '=== ROW LEVEL SECURITY AUDIT ===' as section;

-- Check which tables have RLS enabled
SELECT 
    schemaname || '.' || tablename as table_full_name,
    CASE 
        WHEN rowsecurity::text = 'true' THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check RLS policies (simplified)
SELECT '=== RLS POLICIES ===' as section;

SELECT 
    schemaname || '.' || tablename as table_name,
    policyname,
    cmd as command_type,
    COALESCE(array_to_string(roles, ', '), 'PUBLIC') as applicable_roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ==========================================
-- SECTION 8: INDEX PERFORMANCE AUDIT
-- ==========================================

SELECT '=== INDEX PERFORMANCE AUDIT ===' as section;

-- Display indexes by table
SELECT 
    tablename,
    STRING_AGG(indexname, ', ' ORDER BY indexname) as indexes,
    COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Check for missing critical indexes
SELECT '=== CRITICAL INDEXES CHECK ===' as section;

SELECT 
    'consultation_bookings.booking_date' as recommended_index,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'consultation_bookings' 
            AND indexdef LIKE '%booking_date%'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'consultation_bookings')

UNION ALL

SELECT 
    'consultation_bookings.payment_status' as recommended_index,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'consultation_bookings' 
            AND indexdef LIKE '%payment_status%'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'consultation_bookings')

UNION ALL

SELECT 
    'orders.order_reference' as recommended_index,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'orders' 
            AND indexdef LIKE '%order_reference%'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders')

UNION ALL

SELECT 
    'booking_payments.payment_reference' as recommended_index,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'booking_payments' 
            AND indexdef LIKE '%payment_reference%'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'booking_payments');

-- ==========================================
-- SECTION 9: DATA INTEGRITY CHECKS
-- ==========================================

SELECT '=== DATA INTEGRITY CHECKS ===' as section;

-- Check for orphaned records in booking system
SELECT 
    'booking_payments without consultations' as integrity_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables WHERE table_name = 'booking_payments'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.tables WHERE table_name = 'consultation_bookings'
        ) THEN (
            SELECT CASE WHEN COUNT(*) > 0 
                THEN '❌ ' || COUNT(*) || ' orphaned records'
                ELSE '✅ No orphaned records'
            END
            FROM booking_payments bp
            LEFT JOIN consultation_bookings cb ON bp.booking_id = cb.id
            WHERE cb.id IS NULL
        )
        ELSE 'N/A - Tables missing'
    END as status;

SELECT 
    'booking_notifications without bookings' as integrity_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables WHERE table_name = 'booking_notifications'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.tables WHERE table_name = 'consultation_bookings'
        ) THEN (
            SELECT CASE WHEN COUNT(*) > 0 
                THEN '❌ ' || COUNT(*) || ' orphaned records'
                ELSE '✅ No orphaned records'
            END
            FROM booking_notifications bn
            LEFT JOIN consultation_bookings cb ON bn.booking_id = cb.id
            WHERE cb.id IS NULL
        )
        ELSE 'N/A - Tables missing'
    END as status;

SELECT 
    'order_items without orders' as integrity_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.tables WHERE table_name = 'orders'
        ) THEN (
            SELECT CASE WHEN COUNT(*) > 0 
                THEN '❌ ' || COUNT(*) || ' orphaned records'
                ELSE '✅ No orphaned records'
            END
            FROM order_items oi
            LEFT JOIN orders o ON oi.order_id = o.id
            WHERE o.id IS NULL
        )
        ELSE 'N/A - Tables missing'
    END as status;

-- ==========================================
-- SECTION 10: SYSTEM SUMMARY
-- ==========================================

SELECT '=== SYSTEM SUMMARY ===' as section;

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

SELECT '=== SYSTEM RECOMMENDATIONS ===' as section;

-- Generate recommendations based on audit results
SELECT 
    recommendation,
    priority
FROM (
    -- Check booking tables
    SELECT 
        'Run booking system setup - missing tables detected' as recommendation,
        'HIGH' as priority
    WHERE 5 - (
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('consultation_bookings', 'booking_payments', 'booking_notifications', 'booking_settings', 'available_slots')
    ) > 0
    
    UNION ALL
    
    -- Check order tables
    SELECT 
        'Run order system setup - missing tables detected' as recommendation,
        'HIGH' as priority
    WHERE 3 - (
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('orders', 'order_items', 'order_notifications')
    ) > 0
    
    UNION ALL
    
    -- Check RLS
    SELECT 
        'Enable RLS on tables for security' as recommendation,
        'MEDIUM' as priority
    WHERE (
        SELECT COUNT(*) FROM pg_tables 
        WHERE schemaname = 'public' 
        AND rowsecurity = false
    ) > 0
    
    UNION ALL
    
    -- Check calendar integration
    SELECT 
        'Add calendar integration columns to consultation_bookings' as recommendation,
        'MEDIUM' as priority
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'consultation_bookings' 
        AND column_name = 'calendar_event_id'
    )
    
    UNION ALL
    
    -- Success message
    SELECT 
        'System appears to be properly configured!' as recommendation,
        'INFO' as priority
    WHERE 5 - (
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('consultation_bookings', 'booking_payments', 'booking_notifications', 'booking_settings', 'available_slots')
    ) = 0
    AND 3 - (
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('orders', 'order_items', 'order_notifications')
    ) = 0
    AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'consultation_bookings' 
        AND column_name = 'calendar_event_id'
    )
) recommendations
ORDER BY 
    CASE priority 
        WHEN 'HIGH' THEN 1 
        WHEN 'MEDIUM' THEN 2 
        WHEN 'INFO' THEN 3 
    END;

SELECT '=== AUDIT COMPLETE ===' as section;
SELECT 'Review the output above for system status and recommendations' as message;
