-- Verify and Setup Booking System Tables
-- This script checks what exists and creates missing tables

-- First, let's see what tables currently exist
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    RAISE NOTICE '=== CHECKING EXISTING TABLES ===';
    
    -- Check consultation_bookings
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'consultation_bookings'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ consultation_bookings exists';
    ELSE
        RAISE NOTICE '❌ consultation_bookings missing - will create';
    END IF;
    
    -- Check booking_payments
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'booking_payments'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ booking_payments exists';
    ELSE
        RAISE NOTICE '❌ booking_payments missing - will create';
    END IF;
    
    -- Check booking_notifications
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'booking_notifications'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ booking_notifications exists';
    ELSE
        RAISE NOTICE '❌ booking_notifications missing - will create';
    END IF;
    
    -- Check booking_settings
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'booking_settings'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ booking_settings exists';
    ELSE
        RAISE NOTICE '❌ booking_settings missing - will create';
    END IF;
END $$;

-- Create missing tables
RAISE NOTICE '=== CREATING MISSING TABLES ===';

-- Consultation Bookings Table (most important)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'consultation_bookings'
    ) THEN
        RAISE NOTICE 'Creating consultation_bookings table...';
        
        CREATE TABLE consultation_bookings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          slot_id UUID,
          
          -- Client Information
          client_name VARCHAR(255) NOT NULL,
          client_email VARCHAR(255) NOT NULL,
          client_phone VARCHAR(50) NOT NULL,
          client_notes TEXT,
          
          -- Booking Details
          booking_date DATE NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          duration_minutes INTEGER DEFAULT 60,
          consultation_type VARCHAR(50) DEFAULT 'video',
          
          -- Payment Information
          amount DECIMAL(10, 2) NOT NULL DEFAULT 1500.00,
          payment_status VARCHAR(50) DEFAULT 'pending',
          payment_reference VARCHAR(255),
          payment_method VARCHAR(50),
          
          -- Status and Notifications
          booking_status VARCHAR(50) DEFAULT 'confirmed',
          admin_notified BOOLEAN DEFAULT false,
          client_notified BOOLEAN DEFAULT false,
          reminder_sent BOOLEAN DEFAULT false,
          
          -- Calendar Integration
          calendar_event_id TEXT,
          created_by_agent TEXT,
          
          -- Timestamps
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          cancelled_at TIMESTAMP WITH TIME ZONE,
          completed_at TIMESTAMP WITH TIME ZONE
        );
        
        RAISE NOTICE '✅ consultation_bookings created';
    END IF;
END $$;

-- Booking Payments Table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'booking_payments'
    ) THEN
        RAISE NOTICE 'Creating booking_payments table...';
        
        CREATE TABLE booking_payments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          booking_id UUID REFERENCES consultation_bookings(id) ON DELETE CASCADE,
          
          -- Payment Details
          amount DECIMAL(10, 2) NOT NULL,
          payment_method VARCHAR(50) NOT NULL,
          payment_reference VARCHAR(255) UNIQUE,
          payment_status VARCHAR(50) DEFAULT 'pending',
          
          -- PayFast/Payment Gateway Data
          payment_gateway VARCHAR(50),
          gateway_transaction_id VARCHAR(255),
          gateway_response JSONB,
          
          -- Receipt Information
          receipt_number VARCHAR(100) UNIQUE,
          receipt_url TEXT,
          receipt_sent BOOLEAN DEFAULT false,
          
          -- Timestamps
          paid_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE '✅ booking_payments created';
    END IF;
END $$;

-- Booking Notifications Table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'booking_notifications'
    ) THEN
        RAISE NOTICE 'Creating booking_notifications table...';
        
        CREATE TABLE booking_notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          booking_id UUID REFERENCES consultation_bookings(id) ON DELETE CASCADE,
          
          -- Notification Details
          notification_type VARCHAR(50) NOT NULL,
          recipient_type VARCHAR(50) NOT NULL,
          recipient_email VARCHAR(255),
          recipient_phone VARCHAR(50),
          
          -- Content
          subject VARCHAR(255),
          message TEXT,
          
          -- Status
          status VARCHAR(50) DEFAULT 'pending',
          sent_at TIMESTAMP WITH TIME ZONE,
          error_message TEXT,
          
          -- Timestamps
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE '✅ booking_notifications created';
    END IF;
END $$;

-- Booking Settings Table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'booking_settings'
    ) THEN
        RAISE NOTICE 'Creating booking_settings table...';
        
        CREATE TABLE booking_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          
          -- Pricing
          consultation_price DECIMAL(10, 2) DEFAULT 1500.00,
          currency VARCHAR(10) DEFAULT 'ZAR',
          
          -- Timing
          default_duration_minutes INTEGER DEFAULT 60,
          buffer_time_minutes INTEGER DEFAULT 15,
          advance_booking_days INTEGER DEFAULT 30,
          min_notice_hours INTEGER DEFAULT 24,
          
          -- Notifications
          admin_email VARCHAR(255),
          admin_phone VARCHAR(50),
          send_whatsapp_notifications BOOLEAN DEFAULT true,
          send_email_notifications BOOLEAN DEFAULT true,
          
          -- Business Hours
          business_hours JSONB DEFAULT '{"monday": {"open": "09:00", "close": "17:00"}, "tuesday": {"open": "09:00", "close": "17:00"}, "wednesday": {"open": "09:00", "close": "17:00"}, "thursday": {"open": "09:00", "close": "17:00"}, "friday": {"open": "09:00", "close": "17:00"}, "saturday": {"closed": true}, "sunday": {"closed": true}}'::jsonb,
          
          -- Payment Gateway
          payment_gateway VARCHAR(50) DEFAULT 'payfast',
          payment_gateway_config JSONB,
          
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Insert default settings
        INSERT INTO booking_settings (
          consultation_price,
          admin_email,
          admin_phone
        ) VALUES (
          1500.00,
          'nthandokazi@intandokaziherbal.co.za',
          '27768435876'
        );
        
        RAISE NOTICE '✅ booking_settings created with default settings';
    END IF;
END $$;

-- Add missing columns to existing tables
RAISE NOTICE '=== ADDING MISSING COLUMNS ===';

-- Check if calendar_event_id column exists in consultation_bookings
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'consultation_bookings'
    ) THEN
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'consultation_bookings' 
            AND column_name = 'calendar_event_id'
        ) THEN
            RAISE NOTICE 'Adding calendar_event_id column to consultation_bookings...';
            ALTER TABLE consultation_bookings ADD COLUMN calendar_event_id TEXT;
            RAISE NOTICE '✅ calendar_event_id column added';
        ELSE
            RAISE NOTICE '✅ calendar_event_id column already exists';
        END IF;
        
        -- Check for created_by_agent column
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'consultation_bookings' 
            AND column_name = 'created_by_agent'
        ) THEN
            RAISE NOTICE 'Adding created_by_agent column to consultation_bookings...';
            ALTER TABLE consultation_bookings ADD COLUMN created_by_agent TEXT;
            RAISE NOTICE '✅ created_by_agent column added';
        ELSE
            RAISE NOTICE '✅ created_by_agent column already exists';
        END IF;
    END IF;
END $$;

-- Create indexes
RAISE NOTICE '=== CREATING INDEXES ===';

CREATE INDEX IF NOT EXISTS idx_bookings_date ON consultation_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON consultation_bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON consultation_bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_client_email ON consultation_bookings(client_email);
CREATE INDEX IF NOT EXISTS idx_bookings_calendar_event_id ON consultation_bookings(calendar_event_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON booking_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON booking_payments(payment_reference);
CREATE INDEX IF NOT EXISTS idx_notifications_booking ON booking_notifications(booking_id);

-- Create triggers for updated_at
RAISE NOTICE '=== CREATING TRIGGERS ===';

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_consultation_bookings_updated_at ON consultation_bookings;
CREATE TRIGGER update_consultation_bookings_updated_at
  BEFORE UPDATE ON consultation_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_booking_payments_updated_at ON booking_payments;
CREATE TRIGGER update_booking_payments_updated_at
  BEFORE UPDATE ON booking_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_booking_settings_updated_at ON booking_settings;
CREATE TRIGGER update_booking_settings_updated_at
  BEFORE UPDATE ON booking_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
RAISE NOTICE '=== ENABLING RLS ===';

ALTER TABLE consultation_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_settings ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Anyone can create bookings" ON consultation_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view bookings" ON consultation_bookings FOR SELECT USING (true);
CREATE POLICY "Anyone can manage bookings" ON consultation_bookings FOR ALL USING (true);

CREATE POLICY "Anyone can manage payments" ON booking_payments FOR ALL USING (true);
CREATE POLICY "Anyone can manage notifications" ON booking_notifications FOR ALL USING (true);
CREATE POLICY "Anyone can manage settings" ON booking_settings FOR ALL USING (true);

-- Grant permissions
RAISE NOTICE '=== GRANTING PERMISSIONS ===';

GRANT ALL ON consultation_bookings TO authenticated;
GRANT ALL ON booking_payments TO authenticated;
GRANT ALL ON booking_notifications TO authenticated;
GRANT ALL ON booking_settings TO authenticated;

GRANT SELECT ON consultation_bookings TO anon;
GRANT INSERT ON consultation_bookings TO anon;

-- Final verification
RAISE NOTICE '=== FINAL VERIFICATION ===';

SELECT 
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = t.table_name 
            AND column_name = 'calendar_event_id'
        ) THEN '✅ Has calendar_event_id'
        ELSE '❌ Missing calendar_event_id'
    END as calendar_check
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('consultation_bookings', 'booking_payments', 'booking_notifications', 'booking_settings')
ORDER BY table_name;

RAISE NOTICE '=== SETUP COMPLETE ===';
RAISE NOTICE 'All booking system tables are now ready!';
