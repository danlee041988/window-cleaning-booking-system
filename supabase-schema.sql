-- Somerset Window Cleaning Admin Dashboard Database Schema
-- This file creates all the tables and security policies needed for the admin system

-- Enable Row Level Security
ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create ENUM types for better data consistency
CREATE TYPE customer_status AS ENUM ('new', 'contacted', 'quoted', 'booked', 'completed', 'cancelled', 'lost');
CREATE TYPE booking_type AS ENUM ('residential', 'commercial', 'custom_quote', 'general_enquiry');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE staff_role AS ENUM ('admin', 'staff', 'viewer');
CREATE TYPE note_type AS ENUM ('general', 'follow_up', 'quote_sent', 'payment', 'complaint', 'compliment');

-- Staff/Users table for authentication and role management
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role staff_role DEFAULT 'staff',
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table - main customer records
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic contact information
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    preferred_contact_method TEXT,
    
    -- Address information
    address_line1 TEXT,
    address_line2 TEXT,
    town_city TEXT,
    postcode TEXT,
    
    -- Customer management
    status customer_status DEFAULT 'new',
    customer_type TEXT, -- 'residential', 'commercial', etc.
    lead_source TEXT DEFAULT 'website_booking',
    
    -- Important dates
    first_contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_contact_date TIMESTAMP WITH TIME ZONE,
    next_follow_up_date TIMESTAMP WITH TIME ZONE,
    
    -- Flags and preferences
    is_active BOOLEAN DEFAULT true,
    newsletter_opt_in BOOLEAN DEFAULT false,
    
    -- Staff assignment
    assigned_staff_id UUID REFERENCES public.staff(id),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings/Enquiries table - stores all service requests
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Customer relationship
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    
    -- Booking details
    booking_type booking_type NOT NULL,
    status booking_status DEFAULT 'pending',
    
    -- Service information
    property_type TEXT,
    bedrooms TEXT,
    service_frequency TEXT,
    
    -- Pricing
    base_price DECIMAL(10,2),
    additional_charges DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2),
    
    -- Dates
    preferred_start_date DATE,
    actual_start_date DATE,
    last_service_date DATE,
    next_service_date DATE,
    
    -- Service details for different booking types
    
    -- Standard residential details
    has_conservatory BOOLEAN DEFAULT false,
    conservatory_surcharge DECIMAL(10,2) DEFAULT 0,
    has_extension BOOLEAN DEFAULT false,
    extension_surcharge DECIMAL(10,2) DEFAULT 0,
    additional_services JSONB DEFAULT '{}',
    
    -- Commercial details
    commercial_details JSONB DEFAULT '{}',
    
    -- Custom quote details
    custom_quote_details JSONB DEFAULT '{}',
    
    -- General enquiry details
    general_enquiry_details JSONB DEFAULT '{}',
    
    -- Quote requests (solar panels, conservatory roof, etc.)
    quote_requests JSONB DEFAULT '{}',
    
    -- Additional information
    booking_notes TEXT,
    special_requirements TEXT,
    access_instructions TEXT,
    
    -- Staff tracking
    assigned_staff_id UUID REFERENCES public.staff(id),
    quote_sent_date TIMESTAMP WITH TIME ZONE,
    quote_amount DECIMAL(10,2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer notes table - for tracking all interactions
CREATE TABLE IF NOT EXISTS public.customer_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    staff_id UUID NOT NULL REFERENCES public.staff(id),
    
    note_type note_type DEFAULT 'general',
    subject TEXT,
    content TEXT NOT NULL,
    
    -- Follow-up tracking
    is_follow_up_required BOOLEAN DEFAULT false,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    follow_up_completed BOOLEAN DEFAULT false,
    
    -- Visibility and flags
    is_private BOOLEAN DEFAULT false, -- Only visible to creator and admins
    is_important BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table - track all important actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    staff_id UUID REFERENCES public.staff(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    
    old_values JSONB,
    new_values JSONB,
    
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service schedules table - for tracking recurring services
CREATE TABLE IF NOT EXISTS public.service_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    
    -- Schedule details
    frequency_weeks INTEGER, -- 4, 8, 12 weekly
    start_date DATE NOT NULL,
    end_date DATE, -- NULL for ongoing
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_paused BOOLEAN DEFAULT false,
    pause_reason TEXT,
    pause_until DATE,
    
    -- Pricing for this schedule
    price_per_visit DECIMAL(10,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_postcode ON public.customers(postcode);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_assigned_staff ON public.customers(assigned_staff_id);

CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_type ON public.bookings(booking_type);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_next_service ON public.service_schedules(start_date);

CREATE INDEX IF NOT EXISTS idx_notes_customer_id ON public.customer_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.customer_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_notes_follow_up ON public.customer_notes(follow_up_date) WHERE is_follow_up_required = true;

-- Row Level Security Policies

-- Staff table policies
CREATE POLICY "Staff can view all staff" ON public.staff FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can manage staff" ON public.staff FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'admin')
);

-- Customers table policies
CREATE POLICY "Staff can view all customers" ON public.customers FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND is_active = true)
);

CREATE POLICY "Staff can update customers" ON public.customers FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND is_active = true)
);

CREATE POLICY "Staff can insert customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND is_active = true)
);

-- Bookings table policies
CREATE POLICY "Staff can view all bookings" ON public.bookings FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND is_active = true)
);

CREATE POLICY "Staff can update bookings" ON public.bookings FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND is_active = true)
);

CREATE POLICY "Staff can insert bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND is_active = true)
);

-- Customer notes policies
CREATE POLICY "Staff can view customer notes" ON public.customer_notes FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND is_active = true)
    AND (
        is_private = false 
        OR staff_id = auth.uid() 
        OR EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'admin')
    )
);

CREATE POLICY "Staff can insert notes" ON public.customer_notes FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND is_active = true)
    AND staff_id = auth.uid()
);

-- Audit logs policies
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'admin')
);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_schedules_updated_at BEFORE UPDATE ON public.service_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log(
    p_action TEXT,
    p_table_name TEXT,
    p_record_id UUID,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (
        staff_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        created_at
    ) VALUES (
        auth.uid(),
        p_action,
        p_table_name,
        p_record_id,
        p_old_values,
        p_new_values,
        NOW()
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert initial admin user (you'll need to update this with your actual email)
INSERT INTO public.staff (email, full_name, role, is_active) 
VALUES ('admin@somersetwindowcleaning.com', 'Admin User', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;