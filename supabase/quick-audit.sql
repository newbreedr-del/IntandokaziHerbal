-- QUICK DATABASE AUDIT - Simple and Focused
-- This will show you exactly what exists and what's missing

-- 1. ALL TABLES IN DATABASE
SELECT 'ALL TABLES:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. BOOKING SYSTEM STATUS
SELECT 'BOOKING SYSTEM STATUS:' as info;
SELECT 
    'consultation_bookings' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'consultation_bookings' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'booking_payments' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'booking_payments' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'booking_notifications' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'booking_notifications' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'booking_settings' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'booking_settings' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'available_slots' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'available_slots' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END as status;

-- 3. ORDER SYSTEM STATUS
SELECT 'ORDER SYSTEM STATUS:' as info;
SELECT 
    'orders' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'order_items' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'order_notifications' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_notifications' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END as status;

-- 4. CALENDAR INTEGRATION CHECK
SELECT 'CALENDAR INTEGRATION:' as info;
SELECT 
    'calendar_event_id column' as item,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consultation_bookings' AND column_name = 'calendar_event_id' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'created_by_agent column' as item,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consultation_bookings' AND column_name = 'created_by_agent' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END as status;

-- 5. TOTAL COUNTS
SELECT 'TOTAL COUNTS:' as info;
SELECT 
    'Total Tables' as metric,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'

UNION ALL

SELECT 
    'Booking Tables' as metric,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%booking%'

UNION ALL

SELECT 
    'Order Tables' as metric,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%order%';

-- 6. WHAT NEEDS TO BE DONE
SELECT 'RECOMMENDATIONS:' as info;
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'consultation_bookings' AND table_schema = 'public')
        THEN 'RUN: supabase/create-booking-system.sql'
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consultation_bookings' AND column_name = 'calendar_event_id' AND table_schema = 'public')
        THEN 'ADD: calendar_event_id and created_by_agent columns'
        ELSE 'System appears ready'
    END as action_needed;
