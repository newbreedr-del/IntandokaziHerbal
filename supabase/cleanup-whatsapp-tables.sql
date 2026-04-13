-- ============================================================================
-- SUPABASE CLEANUP - Remove WhatsApp/Messaging Related Tables
-- ============================================================================
-- This script removes all WhatsApp and messaging-related tables and columns
-- Keeps only store, admin, and booking functionality
-- ============================================================================

-- STEP 1: Drop WhatsApp-related tables (if they exist)
-- ============================================================================

-- Drop contacts table (WhatsApp contacts)
DROP TABLE IF EXISTS contacts CASCADE;

-- Drop conversation_history table (WhatsApp chat history)
DROP TABLE IF EXISTS conversation_history CASCADE;

-- Drop message_queue_log table (WhatsApp message queue)
DROP TABLE IF EXISTS message_queue_log CASCADE;

-- Drop sessions table (WhatsApp sessions - if not Cal.com sessions)
-- Note: Only drop if it's WhatsApp-related, not booking sessions
-- DROP TABLE IF EXISTS sessions CASCADE;

-- Drop any other messaging tables
DROP TABLE IF EXISTS whatsapp_messages CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS respondio_messages CASCADE;

-- STEP 2: Remove WhatsApp-related columns from existing tables
-- ============================================================================

-- Remove whatsapp_notifications from customers table
ALTER TABLE customers 
DROP COLUMN IF EXISTS whatsapp_notifications CASCADE;

-- Remove send_whatsapp_notifications from booking_settings
ALTER TABLE booking_settings 
DROP COLUMN IF EXISTS send_whatsapp_notifications CASCADE;

-- Update consultation_type to remove 'whatsapp' option
-- First, update any existing 'whatsapp' bookings to 'phone'
UPDATE consultation_bookings 
SET consultation_type = 'phone' 
WHERE consultation_type = 'whatsapp';

-- Then add a constraint to prevent 'whatsapp' type
ALTER TABLE consultation_bookings 
DROP CONSTRAINT IF EXISTS consultation_bookings_consultation_type_check;

ALTER TABLE consultation_bookings
ADD CONSTRAINT consultation_bookings_consultation_type_check 
CHECK (consultation_type IN ('video', 'phone', 'in-person'));

-- STEP 3: Clean up EFT confirmations WhatsApp proof type
-- ============================================================================

-- Update any WhatsApp proof types to 'upload'
UPDATE eft_confirmations 
SET proof_type = 'upload' 
WHERE proof_type = 'whatsapp';

-- Update constraint to remove 'whatsapp' option
ALTER TABLE eft_confirmations 
DROP CONSTRAINT IF EXISTS eft_confirmations_proof_type_check;

ALTER TABLE eft_confirmations
ADD CONSTRAINT eft_confirmations_proof_type_check 
CHECK (proof_type IN ('email', 'upload'));

-- STEP 4: Verify remaining tables (Store-related only)
-- ============================================================================

-- List all remaining tables (for verification)
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- STEP 5: Success message
-- ============================================================================

SELECT '✅ WhatsApp cleanup completed successfully!' as status,
       'The following tables should remain:' as note;

SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;

-- ============================================================================
-- EXPECTED REMAINING TABLES (Store & Admin Only):
-- ============================================================================
-- ✅ addresses
-- ✅ admin_users
-- ✅ activity_log
-- ✅ available_slots (booking system)
-- ✅ booking_notifications (booking system)
-- ✅ booking_payments (booking system)
-- ✅ booking_settings (booking system)
-- ✅ consultation_bookings (booking system)
-- ✅ customers
-- ✅ eft_confirmations
-- ✅ invoices
-- ✅ order_items
-- ✅ orders
-- ✅ payments
-- ✅ products
-- ✅ quote_items
-- ✅ quotes
-- ✅ reviews
-- 
-- ❌ REMOVED:
-- ❌ contacts (WhatsApp)
-- ❌ conversation_history (WhatsApp)
-- ❌ message_queue_log (WhatsApp)
-- ❌ whatsapp_messages (WhatsApp)
-- ============================================================================
