-- Customer Management System
-- This creates tables for managing customers, EFT confirmations, and communication logs

-- Drop existing tables if they exist
DROP TABLE IF EXISTS communication_logs CASCADE;
DROP TABLE IF EXISTS eft_confirmations CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Create customers table
CREATE TABLE customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL UNIQUE,
    whatsapp_number TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    province TEXT,
    postal_code TEXT,
    preferred_contact_method TEXT DEFAULT 'whatsapp',
    customer_type TEXT DEFAULT 'retail',
    tags TEXT[],
    notes TEXT,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    last_order_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    respondio_contact_id TEXT
);

-- Create EFT confirmations table
CREATE TABLE eft_confirmations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    order_reference TEXT,
    amount DECIMAL(10,2) NOT NULL,
    payment_reference TEXT NOT NULL,
    bank_name TEXT,
    account_holder TEXT,
    payment_date DATE NOT NULL,
    proof_of_payment_url TEXT,
    status TEXT DEFAULT 'pending',
    verified_by TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create communication logs table
CREATE TABLE communication_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    communication_type TEXT NOT NULL,
    channel TEXT NOT NULL,
    direction TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    sent_by TEXT,
    recipient TEXT NOT NULL,
    status TEXT DEFAULT 'sent',
    respondio_message_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_created ON customers(created_at DESC);
CREATE INDEX idx_eft_confirmations_status ON eft_confirmations(status);
CREATE INDEX idx_eft_confirmations_created ON eft_confirmations(created_at DESC);
CREATE INDEX idx_eft_confirmations_customer ON eft_confirmations(customer_id);
CREATE INDEX idx_communication_logs_customer ON communication_logs(customer_id);
CREATE INDEX idx_communication_logs_order ON communication_logs(order_id);
CREATE INDEX idx_communication_logs_created ON communication_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE eft_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view customers" ON customers;
DROP POLICY IF EXISTS "Public can create customers" ON customers;
DROP POLICY IF EXISTS "Public can update customers" ON customers;
DROP POLICY IF EXISTS "Public can view eft confirmations" ON eft_confirmations;
DROP POLICY IF EXISTS "Public can create eft confirmations" ON eft_confirmations;
DROP POLICY IF EXISTS "Public can update eft confirmations" ON eft_confirmations;
DROP POLICY IF EXISTS "Public can view communication logs" ON communication_logs;
DROP POLICY IF EXISTS "Public can create communication logs" ON communication_logs;

-- Create RLS policies
CREATE POLICY "Public can view customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Public can create customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update customers" ON customers FOR UPDATE USING (true);

CREATE POLICY "Public can view eft confirmations" ON eft_confirmations FOR SELECT USING (true);
CREATE POLICY "Public can create eft confirmations" ON eft_confirmations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update eft confirmations" ON eft_confirmations FOR UPDATE USING (true);

CREATE POLICY "Public can view communication logs" ON communication_logs FOR SELECT USING (true);
CREATE POLICY "Public can create communication logs" ON communication_logs FOR INSERT WITH CHECK (true);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_eft_confirmations_updated_at ON eft_confirmations;
CREATE TRIGGER update_eft_confirmations_updated_at 
    BEFORE UPDATE ON eft_confirmations
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON customers TO anon;
GRANT ALL ON customers TO authenticated;
GRANT ALL ON eft_confirmations TO anon;
GRANT ALL ON eft_confirmations TO authenticated;
GRANT ALL ON communication_logs TO anon;
GRANT ALL ON communication_logs TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create function to sync customer data from orders
CREATE OR REPLACE FUNCTION sync_customer_from_order()
RETURNS TRIGGER AS $$
DECLARE
    customer_record customers%ROWTYPE;
BEGIN
    -- Check if customer exists by phone
    SELECT * INTO customer_record FROM customers WHERE phone = NEW.customer_phone;
    
    IF NOT FOUND THEN
        -- Create new customer
        INSERT INTO customers (
            first_name,
            last_name,
            email,
            phone,
            whatsapp_number,
            total_orders,
            total_spent,
            last_order_date
        ) VALUES (
            split_part(NEW.customer_name, ' ', 1),
            COALESCE(split_part(NEW.customer_name, ' ', 2), ''),
            NEW.customer_email,
            NEW.customer_phone,
            NEW.customer_phone,
            1,
            NEW.total,
            NEW.created_at
        );
    ELSE
        -- Update existing customer
        UPDATE customers SET
            total_orders = total_orders + 1,
            total_spent = total_spent + NEW.total,
            last_order_date = NEW.created_at,
            email = COALESCE(NEW.customer_email, email)
        WHERE phone = NEW.customer_phone;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-sync customers from orders
DROP TRIGGER IF EXISTS sync_customer_on_order_create ON orders;
CREATE TRIGGER sync_customer_on_order_create
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION sync_customer_from_order();
