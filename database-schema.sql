-- Somerset Window Cleaning Lead Management Database Schema
-- This schema supports all booking form data and admin dashboard requirements

-- Users table for admin authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    is_active BOOLEAN DEFAULT true,
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(32),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lead statuses for customizable workflow
CREATE TABLE lead_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Hex color code
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default lead statuses
INSERT INTO lead_statuses (name, description, color, sort_order, is_default) VALUES
('New', 'Newly submitted booking request', '#3B82F6', 1, true),
('Contacted', 'Initial contact made with customer', '#F59E0B', 2, false),
('Quote Sent', 'Quote has been provided to customer', '#8B5CF6', 3, false),
('Accepted', 'Customer has accepted the quote', '#10B981', 4, false),
('Scheduled', 'Job has been scheduled', '#06B6D4', 5, false),
('Completed', 'Job has been completed', '#059669', 6, false),
('Cancelled', 'Booking was cancelled', '#EF4444', 7, false),
('Lost', 'Lead did not convert', '#6B7280', 8, false);

-- Main leads table storing all booking form submissions
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    
    -- Customer Information
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    
    -- Address Information
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    town_city VARCHAR(100) NOT NULL,
    county VARCHAR(100),
    postcode VARCHAR(10) NOT NULL,
    postcode_area VARCHAR(5), -- Extracted from postcode for filtering
    
    -- Property Details
    property_type VARCHAR(50), -- 'house', 'flat', 'commercial', etc.
    property_size VARCHAR(20), -- 'small', 'medium', 'large'
    access_difficulty VARCHAR(20), -- 'easy', 'moderate', 'difficult'
    frequency VARCHAR(20), -- 'one-off', 'monthly', 'quarterly', etc.
    
    -- Services Requested (JSON for flexibility)
    services_requested JSONB NOT NULL DEFAULT '{}',
    
    -- Pricing Information
    estimated_price DECIMAL(10,2),
    price_breakdown JSONB, -- Store detailed pricing calculation
    
    -- Quote Requests (JSON for multiple quotes)
    quote_requests JSONB DEFAULT '{}',
    
    -- Additional Information
    special_requirements TEXT,
    preferred_contact_method VARCHAR(20) DEFAULT 'phone',
    preferred_contact_time VARCHAR(50),
    marketing_consent BOOLEAN DEFAULT false,
    
    -- Lead Management
    status_id INTEGER REFERENCES lead_statuses(id) DEFAULT 1,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to INTEGER REFERENCES users(id),
    source VARCHAR(50) DEFAULT 'website', -- Lead source tracking
    
    -- Follow-up Information
    next_follow_up TIMESTAMP,
    follow_up_notes TEXT,
    
    -- Technical Information
    submission_ip VARCHAR(45),
    user_agent TEXT,
    
    -- Timestamps
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    first_contacted_at TIMESTAMP,
    last_contacted_at TIMESTAMP,
    converted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_leads_status ON leads(status_id);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_postcode_area ON leads(postcode_area);
CREATE INDEX idx_leads_submitted_at ON leads(submitted_at);
CREATE INDEX idx_leads_next_follow_up ON leads(next_follow_up);
CREATE INDEX idx_leads_priority ON leads(priority);

-- Activities table for tracking all interactions with leads
CREATE TABLE lead_activities (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    
    activity_type VARCHAR(50) NOT NULL, -- 'call', 'email', 'visit', 'quote_sent', 'status_change', etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    outcome VARCHAR(50), -- 'successful', 'no_answer', 'callback_requested', etc.
    
    -- Scheduling for follow-ups
    scheduled_for TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Additional data (flexible JSON field)
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_activities_scheduled_for ON lead_activities(scheduled_for);
CREATE INDEX idx_activities_activity_type ON lead_activities(activity_type);

-- System configuration table for customizable settings
CREATE TABLE system_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default system configuration
INSERT INTO system_config (key, value, description, category) VALUES
('business_info', '{"name": "Somerset Window Cleaning", "phone": "", "email": "", "address": ""}', 'Business contact information', 'general'),
('pricing_config', '{"base_rates": {}, "multipliers": {}, "quote_validity_days": 30}', 'Pricing configuration', 'pricing'),
('notification_settings', '{"email_notifications": true, "sms_notifications": false}', 'Notification preferences', 'notifications'),
('lead_assignment', '{"auto_assign": false, "round_robin": false, "default_assignee": null}', 'Lead assignment rules', 'workflow'),
('follow_up_defaults', '{"initial_follow_up_hours": 24, "reminder_intervals": [1, 3, 7]}', 'Follow-up timing defaults', 'workflow');

-- Audit log for tracking system changes
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Sessions table for authentication
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();