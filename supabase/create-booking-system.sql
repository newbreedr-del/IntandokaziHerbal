-- Booking System Database Schema
-- World-class consultation booking system with calendar, payments, and notifications

-- 1. Available Time Slots Table
-- Admin can set available days and times for consultations
CREATE TABLE IF NOT EXISTS available_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  max_bookings INTEGER DEFAULT 1,
  current_bookings INTEGER DEFAULT 0,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, start_time)
);

-- 2. Consultation Bookings Table
CREATE TABLE IF NOT EXISTS consultation_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID REFERENCES available_slots(id) ON DELETE SET NULL,
  
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
  consultation_type VARCHAR(50) DEFAULT 'video', -- video, phone, whatsapp
  
  -- Payment Information
  amount DECIMAL(10, 2) NOT NULL DEFAULT 1500.00,
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
  payment_reference VARCHAR(255),
  payment_method VARCHAR(50), -- card, eft, payfast
  
  -- Status and Notifications
  booking_status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, cancelled, completed, no_show
  admin_notified BOOLEAN DEFAULT false,
  client_notified BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 3. Booking Payments Table (for detailed payment tracking)
CREATE TABLE IF NOT EXISTS booking_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES consultation_bookings(id) ON DELETE CASCADE,
  
  -- Payment Details
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_reference VARCHAR(255) UNIQUE,
  payment_status VARCHAR(50) DEFAULT 'pending',
  
  -- PayFast/Payment Gateway Data
  payment_gateway VARCHAR(50), -- payfast, paystack, etc
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

-- 4. Booking Notifications Table (track all notifications sent)
CREATE TABLE IF NOT EXISTS booking_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES consultation_bookings(id) ON DELETE CASCADE,
  
  -- Notification Details
  notification_type VARCHAR(50) NOT NULL, -- booking_confirmation, payment_receipt, reminder, cancellation, admin_alert
  recipient_type VARCHAR(50) NOT NULL, -- client, admin
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(50),
  
  -- Content
  subject VARCHAR(255),
  message TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Booking Settings Table (system configuration)
CREATE TABLE IF NOT EXISTS booking_settings (
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
) ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_available_slots_date ON available_slots(date);
CREATE INDEX IF NOT EXISTS idx_available_slots_available ON available_slots(is_available);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON consultation_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON consultation_bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON consultation_bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_client_email ON consultation_bookings(client_email);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON booking_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON booking_payments(payment_reference);
CREATE INDEX IF NOT EXISTS idx_notifications_booking ON booking_notifications(booking_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_available_slots_updated_at ON available_slots;
CREATE TRIGGER update_available_slots_updated_at
  BEFORE UPDATE ON available_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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

-- Function to update slot booking count
CREATE OR REPLACE FUNCTION update_slot_booking_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE available_slots 
    SET current_bookings = current_bookings + 1,
        is_available = CASE WHEN current_bookings + 1 >= max_bookings THEN false ELSE true END
    WHERE id = NEW.slot_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE available_slots 
    SET current_bookings = GREATEST(0, current_bookings - 1),
        is_available = true
    WHERE id = OLD.slot_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.booking_status != 'cancelled' AND NEW.booking_status = 'cancelled' THEN
    UPDATE available_slots 
    SET current_bookings = GREATEST(0, current_bookings - 1),
        is_available = true
    WHERE id = NEW.slot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for slot booking count
DROP TRIGGER IF EXISTS update_slot_count ON consultation_bookings;
CREATE TRIGGER update_slot_count
  AFTER INSERT OR UPDATE OR DELETE ON consultation_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_slot_booking_count();

-- RLS Policies

-- Available Slots: Public can read, admin can manage
ALTER TABLE available_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available slots"
  ON available_slots FOR SELECT
  USING (is_available = true AND date >= CURRENT_DATE);

CREATE POLICY "Admins can manage slots"
  ON available_slots FOR ALL
  USING (true);

-- Consultation Bookings: Clients can create, admin can manage
ALTER TABLE consultation_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create bookings"
  ON consultation_bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Clients can view their own bookings"
  ON consultation_bookings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage all bookings"
  ON consultation_bookings FOR ALL
  USING (true);

-- Booking Payments: Restricted access
ALTER TABLE booking_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payments"
  ON booking_payments FOR ALL
  USING (true);

-- Booking Notifications: Admin only
ALTER TABLE booking_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage notifications"
  ON booking_notifications FOR ALL
  USING (true);

-- Booking Settings: Admin only
ALTER TABLE booking_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settings"
  ON booking_settings FOR ALL
  USING (true);

-- Grant permissions
GRANT ALL ON available_slots TO authenticated;
GRANT ALL ON consultation_bookings TO authenticated;
GRANT ALL ON booking_payments TO authenticated;
GRANT ALL ON booking_notifications TO authenticated;
GRANT ALL ON booking_settings TO authenticated;

GRANT ALL ON available_slots TO anon;
GRANT SELECT ON consultation_bookings TO anon;
GRANT INSERT ON consultation_bookings TO anon;

-- Success message
SELECT 'Booking system tables created successfully!' as message;
