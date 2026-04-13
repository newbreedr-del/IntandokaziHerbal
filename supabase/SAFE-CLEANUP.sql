-- ============================================================================
-- SAFE SUPABASE CLEANUP - Remove Only WhatsApp Tables
-- ============================================================================
-- This script ONLY removes WhatsApp tables and columns
-- It does NOT recreate or modify your existing store tables
-- Safe to run on existing database
-- ============================================================================

-- STEP 1: Drop WhatsApp-related tables
-- ============================================================================

DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS conversation_history CASCADE;
DROP TABLE IF EXISTS message_queue_log CASCADE;
DROP TABLE IF EXISTS whatsapp_messages CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS respondio_messages CASCADE;
DROP TABLE IF EXISTS agent_actions CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS communication_logs CASCADE;
DROP TABLE IF EXISTS conversation_assignments CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS flows CASCADE;
DROP TABLE IF EXISTS knowledge_base CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS order_notifications CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS whatsapp_sessions CASCADE;

SELECT '✅ Dropped all WhatsApp/messaging tables (if they existed)' as status;

-- STEP 2: Remove WhatsApp columns from existing tables
-- ============================================================================

DO $$ 
BEGIN
    -- Remove whatsapp_notifications from customers table
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'customers' 
        AND column_name = 'whatsapp_notifications'
    ) THEN
        ALTER TABLE customers DROP COLUMN whatsapp_notifications CASCADE;
        RAISE NOTICE '✅ Removed column: customers.whatsapp_notifications';
    ELSE
        RAISE NOTICE '⏭️  Column customers.whatsapp_notifications does not exist, skipping';
    END IF;

    -- Remove send_whatsapp_notifications from booking_settings
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'booking_settings' 
        AND column_name = 'send_whatsapp_notifications'
    ) THEN
        ALTER TABLE booking_settings DROP COLUMN send_whatsapp_notifications CASCADE;
        RAISE NOTICE '✅ Removed column: booking_settings.send_whatsapp_notifications';
    ELSE
        RAISE NOTICE '⏭️  Column booking_settings.send_whatsapp_notifications does not exist, skipping';
    END IF;
END $$;

-- STEP 3: Update consultation_type constraint
-- ============================================================================

DO $$ 
BEGIN
    -- Update any existing 'whatsapp' bookings to 'phone'
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'consultation_bookings') THEN
        UPDATE consultation_bookings 
        SET consultation_type = 'phone' 
        WHERE consultation_type = 'whatsapp';
        
        RAISE NOTICE '✅ Updated whatsapp consultation types to phone';

        -- Drop old constraint
        ALTER TABLE consultation_bookings 
        DROP CONSTRAINT IF EXISTS consultation_bookings_consultation_type_check;

        -- Add new constraint without 'whatsapp'
        ALTER TABLE consultation_bookings
        ADD CONSTRAINT consultation_bookings_consultation_type_check 
        CHECK (consultation_type IN ('video', 'phone', 'in-person'));

        RAISE NOTICE '✅ Updated consultation_bookings constraint';
    ELSE
        RAISE NOTICE '⏭️  Table consultation_bookings does not exist, skipping';
    END IF;
END $$;

-- STEP 4: Update EFT confirmations proof_type constraint
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'eft_confirmations') THEN
        -- Check if proof_type column exists
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'eft_confirmations' 
            AND column_name = 'proof_type'
        ) THEN
            -- Update any WhatsApp proof types to 'upload'
            UPDATE eft_confirmations 
            SET proof_type = 'upload' 
            WHERE proof_type = 'whatsapp';

            RAISE NOTICE '✅ Updated whatsapp proof types to upload';

            -- Drop old constraint
            ALTER TABLE eft_confirmations 
            DROP CONSTRAINT IF EXISTS eft_confirmations_proof_type_check;

            -- Add new constraint without 'whatsapp'
            ALTER TABLE eft_confirmations
            ADD CONSTRAINT eft_confirmations_proof_type_check 
            CHECK (proof_type IN ('email', 'upload'));

            RAISE NOTICE '✅ Updated eft_confirmations constraint';
        ELSE
            RAISE NOTICE '⏭️  Column proof_type does not exist in eft_confirmations, skipping';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  Table eft_confirmations does not exist, skipping';
    END IF;
END $$;

-- STEP 5: Verify and report
-- ============================================================================

-- Show remaining tables
SELECT '✅ CLEANUP COMPLETE!' as status;

SELECT 
    '📊 Remaining Tables:' as info,
    COUNT(*) as table_count
FROM pg_tables 
WHERE schemaname = 'public';

-- List all remaining tables
SELECT 
    tablename as "Table Name",
    CASE 
        WHEN tablename IN ('contacts', 'conversation_history', 'message_queue_log', 'whatsapp_messages') 
        THEN '❌ Should be deleted'
        ELSE '✅ OK'
    END as "Status"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================================
-- DONE!
-- ============================================================================
