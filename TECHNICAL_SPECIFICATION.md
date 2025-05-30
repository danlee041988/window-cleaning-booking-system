# Somerset Window Cleaning - Technical Specification
## Lead Management & Squeegee Integration System

### 📋 System Overview

**Project**: Lead tracking and follow-up management system with Squeegee integration
**Architecture**: Cloud-native, microservices-based, security-first design
**Tech Stack**: Node.js/Express backend, React admin dashboard, PostgreSQL database
**Deployment**: AWS/DigitalOcean with auto-scaling and high availability

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  Booking Form (React)  │  Admin Dashboard (React)  │  Mobile App │
│  - Customer facing     │  - Lead management        │  - Field use│
│  - Public website      │  - Follow-up tracking     │  - Offline  │
│  - SSL/TLS encrypted   │  - Squeegee integration   │  - Real-time│
└─────────────────────────────────────────────────────────────────┘
                                    │
                               Load Balancer
                              (SSL Termination)
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│  API Gateway          │  Authentication      │  Notification    │
│  - Rate limiting      │  - JWT tokens        │  - Email service │
│  - Request routing    │  - Multi-factor auth │  - SMS alerts    │
│  - Input validation   │  - Role-based access │  - Push notify   │
├─────────────────────────────────────────────────────────────────┤
│  Lead Management API  │  Follow-up Engine    │  Integration API │
│  - CRUD operations    │  - Scheduled tasks   │  - Squeegee sync │
│  - Status tracking    │  - Alert generation  │  - Data export   │
│  - Data encryption    │  - Performance stats │  - Webhook hooks │
└─────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL Primary   │  PostgreSQL Replica  │  Redis Cache     │
│  - Encrypted at rest  │  - Read operations   │  - Session store │
│  - Daily backups      │  - Reporting queries │  - Rate limiting │
│  - Point-in-time      │  - Analytics data    │  - Temp data     │
└─────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY & MONITORING                      │
├─────────────────────────────────────────────────────────────────┤
│  WAF (Web App FW)     │  Security Monitoring │  Performance     │
│  - DDoS protection    │  - Intrusion detection│ - APM tracking  │
│  - Bot prevention     │  - Audit logging     │  - Error tracking│
│  - IP filtering       │  - Compliance reports│  - Metrics       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Design

### **Core Schema (PostgreSQL)**

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Staff/Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'sales', 'viewer')),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Lead status configuration
CREATE TABLE lead_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    order_position INTEGER NOT NULL,
    color VARCHAR(7) NOT NULL, -- Hex color
    description TEXT,
    auto_follow_up_days INTEGER,
    is_final_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Main leads table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_number VARCHAR(20) UNIQUE NOT NULL, -- SWC-2024-001
    
    -- Source tracking
    source VARCHAR(50) NOT NULL, -- 'website_form', 'phone', 'referral', 'repeat'
    source_details JSONB, -- Additional source metadata
    referrer_url TEXT,
    utm_campaign VARCHAR(100),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    
    -- Customer information (encrypted)
    customer_name_encrypted BYTEA NOT NULL,
    email_encrypted BYTEA NOT NULL,
    phone_encrypted BYTEA NOT NULL,
    address_line1_encrypted BYTEA NOT NULL,
    address_line2_encrypted BYTEA,
    town_city_encrypted BYTEA NOT NULL,
    full_postcode_encrypted BYTEA NOT NULL,
    
    -- Operational data (non-sensitive)
    postcode_area VARCHAR(10) NOT NULL, -- BS40, TA7 for scheduling
    postcode_district VARCHAR(6) NOT NULL, -- BS40 1, TA7 9 for routing
    
    -- Service details
    property_type VARCHAR(50),
    bedrooms VARCHAR(20),
    service_type VARCHAR(100) NOT NULL,
    service_frequency VARCHAR(50),
    additional_services JSONB,
    
    -- Financial
    estimated_monthly_value DECIMAL(8,2),
    estimated_annual_value DECIMAL(10,2),
    quoted_price DECIMAL(8,2),
    quote_valid_until DATE,
    
    -- Process tracking
    status_id UUID REFERENCES lead_statuses(id) NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_to UUID REFERENCES users(id),
    
    -- Follow-up scheduling
    next_follow_up TIMESTAMP,
    follow_up_count INTEGER DEFAULT 0,
    last_contact_date TIMESTAMP,
    last_contact_method VARCHAR(50),
    
    -- Integration
    squeegee_customer_id VARCHAR(100),
    squeegee_transferred_at TIMESTAMP,
    booking_confirmed BOOLEAN DEFAULT FALSE,
    booking_confirmed_at TIMESTAMP,
    first_service_date DATE,
    
    -- Quality & satisfaction
    lead_quality_score INTEGER CHECK (lead_quality_score BETWEEN 1 AND 10),
    conversion_probability DECIMAL(3,2), -- 0.00 to 1.00
    decline_reason VARCHAR(200),
    customer_satisfaction_score INTEGER CHECK (customer_satisfaction_score BETWEEN 1 AND 5),
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    form_completion_time INTEGER, -- seconds
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Lead activities/interactions
CREATE TABLE lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    
    -- Activity details
    activity_type VARCHAR(50) NOT NULL, -- 'call', 'email', 'site_visit', 'quote_sent', 'follow_up'
    activity_subtype VARCHAR(50), -- 'initial_call', 'quote_follow_up', 'site_survey'
    subject VARCHAR(200),
    description_encrypted BYTEA,
    
    -- Scheduling
    scheduled_for TIMESTAMP,
    completed_at TIMESTAMP,
    duration_minutes INTEGER,
    
    -- Outcome tracking
    outcome VARCHAR(50), -- 'successful', 'no_answer', 'busy', 'rescheduled', 'declined'
    next_action_required VARCHAR(200),
    
    -- Assignment
    assigned_to UUID REFERENCES users(id),
    completed_by UUID REFERENCES users(id),
    
    -- Communication details
    contact_method VARCHAR(50), -- 'phone', 'email', 'sms', 'in_person', 'whatsapp'
    contact_number_used VARCHAR(20),
    email_opened BOOLEAN,
    email_clicked BOOLEAN,
    
    -- File attachments
    attachments JSONB, -- File references
    
    -- Integration
    external_ref VARCHAR(100), -- Reference in other systems
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Lead notes (separate for better query performance)
CREATE TABLE lead_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    note_encrypted BYTEA NOT NULL,
    note_type VARCHAR(50) DEFAULT 'general', -- 'general', 'internal', 'customer_request'
    is_customer_visible BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Follow-up templates for automation
CREATE TABLE follow_up_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    trigger_status VARCHAR(50) NOT NULL,
    delay_days INTEGER NOT NULL,
    template_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'task', 'call'
    subject VARCHAR(200),
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Squeegee integration tracking
CREATE TABLE squeegee_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    transfer_method VARCHAR(50) NOT NULL, -- 'manual', 'batch', 'api'
    transfer_data JSONB NOT NULL, -- Data sent to Squeegee
    squeegee_response JSONB, -- Response from Squeegee
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed', 'partial'
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    transferred_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- System configuration
CREATE TABLE system_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit log for security
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Performance monitoring
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(12,4) NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- 'conversion_rate', 'response_time', 'lead_volume'
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_leads_status ON leads(status_id);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_postcode_area ON leads(postcode_area);
CREATE INDEX idx_leads_next_follow_up ON leads(next_follow_up);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_estimated_value ON leads(estimated_monthly_value);
CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_scheduled_for ON lead_activities(scheduled_for);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);

-- Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies (examples)
CREATE POLICY leads_view_policy ON leads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = current_setting('app.current_user_id')::UUID
            AND (users.role IN ('admin', 'manager') OR users.id = leads.assigned_to)
        )
    );
```

### **Initial Data Population**

```sql
-- Insert default lead statuses
INSERT INTO lead_statuses (name, display_name, order_position, color, description, auto_follow_up_days) VALUES
('new', 'New Lead', 1, '#3B82F6', 'Fresh enquiry received, needs initial contact', 1),
('contacted', 'Initial Contact Made', 2, '#10B981', 'Customer contacted, gathering requirements', 2),
('quote_requested', 'Quote/Survey Requested', 3, '#F59E0B', 'Customer wants detailed quote or site survey', 1),
('quote_sent', 'Quote Provided', 4, '#8B5CF6', 'Quote sent to customer, awaiting response', 7),
('negotiating', 'In Negotiation', 5, '#F97316', 'Discussing terms, price, or service details', 3),
('follow_up_1', 'First Follow-up', 6, '#EF4444', 'First follow-up attempt completed', 7),
('follow_up_2', 'Second Follow-up', 7, '#DC2626', 'Second follow-up attempt completed', 14),
('hot_lead', 'Hot Lead', 8, '#059669', 'Customer very interested, close to booking', 2),
('ready_for_squeegee', 'Ready for Squeegee', 9, '#06B6D4', 'Customer ready to book, transfer to main system', NULL),
('transferred_to_squeegee', 'Transferred to Squeegee', 10, '#10B981', 'Successfully added to main booking system', NULL, TRUE),
('booking_confirmed', 'Booking Confirmed', 11, '#059669', 'Customer booked and confirmed in Squeegee', NULL, TRUE),
('declined', 'Customer Declined', 12, '#6B7280', 'Customer decided not to proceed', NULL, TRUE),
('lost_contact', 'Lost Contact', 13, '#374151', 'Unable to reach customer after multiple attempts', NULL, TRUE),
('not_in_area', 'Outside Service Area', 14, '#9CA3AF', 'Customer location outside our coverage', NULL, TRUE);

-- Insert system configuration
INSERT INTO system_config (key, value, description) VALUES
('lead_number_prefix', '"SWC"', 'Prefix for lead numbers'),
('lead_number_year_format', '"YYYY"', 'Year format in lead numbers'),
('max_follow_up_attempts', '3', 'Maximum automatic follow-up attempts'),
('high_value_threshold', '100', 'Monthly value threshold for high-value alerts'),
('auto_assign_leads', 'true', 'Automatically assign leads to sales staff'),
('business_hours_start', '"09:00"', 'Business hours start time'),
('business_hours_end', '"17:00"', 'Business hours end time'),
('weekend_followups', 'false', 'Allow follow-ups on weekends'),
('notification_email', '"admin@somersetwindowcleaning.co.uk"', 'Admin notification email');

-- Create default admin user (password should be changed immediately)
INSERT INTO users (username, email, password_hash, role, first_name, last_name, is_active) VALUES
('admin', 'admin@somersetwindowcleaning.co.uk', '$2b$12$placeholder_hash', 'admin', 'System', 'Administrator', TRUE);
```

---

## 🔐 Security Implementation

### **Data Encryption Strategy**

```javascript
// encryption.js - Customer data encryption service
const crypto = require('crypto');

class EncryptionService {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32;
        this.ivLength = 16;
        this.tagLength = 16;
        this.saltLength = 32;
        
        // Encryption key derived from environment variable
        this.masterKey = crypto.scryptSync(
            process.env.ENCRYPTION_MASTER_KEY, 
            process.env.ENCRYPTION_SALT, 
            this.keyLength
        );
    }

    encrypt(plaintext) {
        if (!plaintext) return null;
        
        const iv = crypto.randomBytes(this.ivLength);
        const cipher = crypto.createCipher(this.algorithm, this.masterKey, iv);
        
        let encrypted = cipher.update(plaintext, 'utf8');
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        
        const tag = cipher.getAuthTag();
        
        // Combine IV + encrypted data + auth tag
        return Buffer.concat([iv, encrypted, tag]);
    }

    decrypt(encryptedBuffer) {
        if (!encryptedBuffer || encryptedBuffer.length === 0) return null;
        
        const iv = encryptedBuffer.slice(0, this.ivLength);
        const tag = encryptedBuffer.slice(-this.tagLength);
        const encrypted = encryptedBuffer.slice(this.ivLength, -this.tagLength);
        
        const decipher = crypto.createDecipher(this.algorithm, this.masterKey, iv);
        decipher.setAuthTag(tag);
        
        let decrypted = decipher.update(encrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        return decrypted.toString('utf8');
    }

    // Hash sensitive data for searching (one-way)
    hash(data) {
        return crypto.createHash('sha256')
            .update(data)
            .digest('hex');
    }
}

module.exports = new EncryptionService();
```

### **Authentication & Authorization**

```javascript
// auth.js - JWT-based authentication with MFA
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');

class AuthService {
    generateTokens(user) {
        const payload = {
            userId: user.id,
            role: user.role,
            permissions: this.getRolePermissions(user.role)
        };
        
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '15m',
            issuer: 'somerset-wc-lead-system',
            audience: 'somerset-wc-staff'
        });
        
        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );
        
        return { accessToken, refreshToken };
    }

    async validateMFA(user, token) {
        if (!user.mfa_secret) return false;
        
        return speakeasy.totp.verify({
            secret: user.mfa_secret,
            encoding: 'base32',
            token: token,
            window: 2 // Allow 2 time steps variance
        });
    }

    getRolePermissions(role) {
        const permissions = {
            admin: ['*'], // All permissions
            manager: [
                'leads:read', 'leads:write', 'leads:transfer',
                'users:read', 'reports:read', 'reports:export'
            ],
            sales: [
                'leads:read', 'leads:write', 'activities:write',
                'own_reports:read'
            ],
            viewer: [
                'leads:read', 'dashboard:read'
            ]
        };
        
        return permissions[role] || [];
    }

    hasPermission(userPermissions, requiredPermission) {
        if (userPermissions.includes('*')) return true;
        return userPermissions.includes(requiredPermission);
    }
}

module.exports = new AuthService();
```

---

## 🚀 API Design

### **RESTful API Endpoints**

```javascript
// routes/leads.js - Lead management endpoints
const express = require('express');
const router = express.Router();
const LeadController = require('../controllers/leadController');
const { authenticate, authorize, validateInput } = require('../middleware');

// Lead CRUD operations
router.get('/', 
    authenticate,
    authorize(['leads:read']),
    LeadController.getLeads
);

router.get('/:id', 
    authenticate,
    authorize(['leads:read']),
    LeadController.getLeadById
);

router.post('/', 
    authenticate,
    authorize(['leads:write']),
    validateInput('createLead'),
    LeadController.createLead
);

router.put('/:id', 
    authenticate,
    authorize(['leads:write']),
    validateInput('updateLead'),
    LeadController.updateLead
);

router.delete('/:id', 
    authenticate,
    authorize(['leads:delete']),
    LeadController.deleteLead
);

// Lead status management
router.put('/:id/status', 
    authenticate,
    authorize(['leads:write']),
    validateInput('updateStatus'),
    LeadController.updateLeadStatus
);

// Follow-up management
router.post('/:id/activities', 
    authenticate,
    authorize(['activities:write']),
    validateInput('createActivity'),
    LeadController.addActivity
);

router.get('/:id/activities', 
    authenticate,
    authorize(['leads:read']),
    LeadController.getLeadActivities
);

// Squeegee integration
router.post('/transfer-to-squeegee', 
    authenticate,
    authorize(['leads:transfer']),
    validateInput('transferLeads'),
    LeadController.transferToSqueegee
);

// Analytics endpoints
router.get('/analytics/conversion-funnel', 
    authenticate,
    authorize(['reports:read']),
    LeadController.getConversionFunnel
);

router.get('/analytics/performance', 
    authenticate,
    authorize(['reports:read']),
    LeadController.getPerformanceMetrics
);

module.exports = router;
```

### **Lead Controller Implementation**

```javascript
// controllers/leadController.js
const LeadService = require('../services/leadService');
const EncryptionService = require('../services/encryptionService');
const AuditService = require('../services/auditService');

class LeadController {
    async getLeads(req, res) {
        try {
            const {
                page = 1,
                limit = 25,
                status,
                assignedTo,
                postcodeArea,
                priority,
                searchTerm,
                sortBy = 'created_at',
                sortOrder = 'desc'
            } = req.query;

            const filters = {
                status,
                assignedTo,
                postcodeArea,
                priority,
                searchTerm
            };

            const result = await LeadService.getLeads({
                page: parseInt(page),
                limit: parseInt(limit),
                filters,
                sortBy,
                sortOrder,
                userRole: req.user.role,
                userId: req.user.userId
            });

            // Decrypt sensitive data for display
            result.leads = result.leads.map(lead => ({
                ...lead,
                customerName: EncryptionService.decrypt(lead.customer_name_encrypted),
                email: EncryptionService.decrypt(lead.email_encrypted),
                phone: EncryptionService.decrypt(lead.phone_encrypted),
                // Don't decrypt full address in list view for security
                displayAddress: this.createDisplayAddress(lead)
            }));

            await AuditService.log({
                userId: req.user.userId,
                action: 'VIEW_LEADS',
                resourceType: 'leads',
                metadata: { filters, count: result.total }
            });

            res.json(result);
        } catch (error) {
            console.error('Error fetching leads:', error);
            res.status(500).json({ error: 'Failed to fetch leads' });
        }
    }

    async createLead(req, res) {
        try {
            const leadData = req.body;
            
            // Encrypt sensitive data
            const encryptedData = {
                ...leadData,
                customer_name_encrypted: EncryptionService.encrypt(leadData.customerName),
                email_encrypted: EncryptionService.encrypt(leadData.email),
                phone_encrypted: EncryptionService.encrypt(leadData.phone),
                address_line1_encrypted: EncryptionService.encrypt(leadData.addressLine1),
                address_line2_encrypted: EncryptionService.encrypt(leadData.addressLine2),
                town_city_encrypted: EncryptionService.encrypt(leadData.townCity),
                full_postcode_encrypted: EncryptionService.encrypt(leadData.postcode)
            };

            // Extract postcode area for scheduling
            encryptedData.postcode_area = this.extractPostcodeArea(leadData.postcode);
            encryptedData.postcode_district = this.extractPostcodeDistrict(leadData.postcode);

            const lead = await LeadService.createLead(encryptedData, req.user.userId);

            await AuditService.log({
                userId: req.user.userId,
                action: 'CREATE_LEAD',
                resourceType: 'lead',
                resourceId: lead.id,
                metadata: { source: leadData.source }
            });

            res.status(201).json(lead);
        } catch (error) {
            console.error('Error creating lead:', error);
            res.status(500).json({ error: 'Failed to create lead' });
        }
    }

    async updateLeadStatus(req, res) {
        try {
            const { id } = req.params;
            const { statusId, notes, nextFollowUp } = req.body;

            const updatedLead = await LeadService.updateStatus(id, {
                statusId,
                notes,
                nextFollowUp,
                updatedBy: req.user.userId
            });

            await AuditService.log({
                userId: req.user.userId,
                action: 'UPDATE_LEAD_STATUS',
                resourceType: 'lead',
                resourceId: id,
                metadata: { newStatus: statusId }
            });

            res.json(updatedLead);
        } catch (error) {
            console.error('Error updating lead status:', error);
            res.status(500).json({ error: 'Failed to update lead status' });
        }
    }

    async transferToSqueegee(req, res) {
        try {
            const { leadIds } = req.body;

            const transferResults = await Promise.all(
                leadIds.map(id => LeadService.prepareForSqueegeeTransfer(id))
            );

            // Generate transfer report
            const transferReport = {
                totalLeads: leadIds.length,
                successful: transferResults.filter(r => r.success).length,
                failed: transferResults.filter(r => !r.success).length,
                results: transferResults
            };

            await AuditService.log({
                userId: req.user.userId,
                action: 'TRANSFER_TO_SQUEEGEE',
                resourceType: 'leads',
                metadata: { leadIds, results: transferReport }
            });

            res.json(transferReport);
        } catch (error) {
            console.error('Error transferring to Squeegee:', error);
            res.status(500).json({ error: 'Failed to transfer leads' });
        }
    }

    // Helper methods
    createDisplayAddress(lead) {
        const postcode = EncryptionService.decrypt(lead.full_postcode_encrypted);
        return `${lead.postcode_area} ${postcode.split(' ')[1] || ''}`;
    }

    extractPostcodeArea(postcode) {
        // Extract area (e.g., "BS40" from "BS40 1AB")
        return postcode.replace(/\s+/g, '').match(/^[A-Z]{1,2}\d{1,2}/)?.[0] || '';
    }

    extractPostcodeDistrict(postcode) {
        // Extract district (e.g., "BS40 1" from "BS40 1AB")
        const cleaned = postcode.replace(/\s+/g, '');
        const match = cleaned.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)\d[A-Z]{2}$/);
        return match ? match[1] : '';
    }
}

module.exports = new LeadController();
```

This technical specification provides the foundation for a secure, scalable lead management system. The architecture is designed to handle your current needs while being expandable for future business requirements.

Would you like me to continue with the frontend dashboard specification, or would you prefer to focus on a particular aspect of the system?