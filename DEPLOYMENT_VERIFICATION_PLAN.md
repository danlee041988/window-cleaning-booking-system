# Somerset Window Cleaning - Comprehensive Deployment & Verification Plan

## System Architecture Overview

### Components
1. **Booking Form (Frontend)** - https://window-cleaning-booking-system.vercel.app
2. **Admin Dashboard** - https://somerset-admin-dashboard.vercel.app/dashboard  
3. **API Backend** - To be deployed to Vercel

### Technology Stack
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT tokens
- **Email**: EmailJS (handled by frontend)
- **Hosting**: Vercel

## Pre-Deployment Checklist

### 1. Environment Variables Setup
Create a `.env.production` file in the API directory with:

```env
# Database Configuration (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.zrmdkyczekmzccenmatu:[YOUR-PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.zrmdkyczekmzccenmatu:[YOUR-PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:5432/postgres"

# Supabase Configuration
SUPABASE_URL="https://zrmdkyczekmzccenmatu.supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"

# JWT Configuration
JWT_SECRET=[GENERATE-SECURE-SECRET]
JWT_REFRESH_SECRET=[GENERATE-SECURE-REFRESH-SECRET]
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://window-cleaning-booking-system.vercel.app

# Security
BCRYPT_ROUNDS=12
SESSION_EXPIRES_HOURS=24
```

### 2. Database Setup
```bash
# In the API directory
cd window-cleaning-booking-system/api

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed initial data (if applicable)
npx prisma db seed
```

## Step-by-Step Deployment Instructions

### Phase 1: Deploy API Backend to Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Navigate to API directory**
```bash
cd /Users/danlee/CascadeProjects/somerset-window-cleaning-website/window-cleaning-booking-system/api
```

3. **Initialize Vercel project**
```bash
vercel
```
- Select "Y" to set up and deploy
- Choose your scope/team
- Link to existing project: No
- Project name: `somerset-window-cleaning-api`
- Directory: `./`
- Override settings: No

4. **Configure Environment Variables in Vercel Dashboard**
```bash
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
vercel env add JWT_SECRET production
vercel env add JWT_REFRESH_SECRET production
vercel env add JWT_EXPIRES_IN production
vercel env add JWT_REFRESH_EXPIRES_IN production
vercel env add NODE_ENV production
vercel env add FRONTEND_URL production
vercel env add BCRYPT_ROUNDS production
vercel env add SESSION_EXPIRES_HOURS production
```

5. **Deploy to Production**
```bash
vercel --prod
```

6. **Note the deployment URL** (e.g., `https://somerset-window-cleaning-api.vercel.app`)

### Phase 2: Update Frontend Configuration

1. **Update Booking Form API URL**
- Location: `window-cleaning-booking-system/src/config/environment.js`
- Update the API URL to your deployed backend

2. **Update Admin Dashboard API URL**
- Location: `admin-dashboard/src/services/api.ts`
- Update the base URL to your deployed backend

3. **Update CORS Origins in Backend**
- Ensure both frontend URLs are in the CORS whitelist

### Phase 3: Configure Database Access

1. **Verify Supabase Connection**
```bash
# Test database connection
npx prisma db pull
```

2. **Create Admin User**
```sql
-- Connect to Supabase SQL Editor
INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active)
VALUES (
  'admin',
  'admin@somersetwindowcleaning.co.uk',
  '$2a$12$[HASHED_PASSWORD]', -- Use bcrypt to hash password
  'Admin',
  'User',
  'ADMIN',
  true
);
```

## Complete Data Field Verification Checklist

### Form Fields to Database Mapping

| Form Field | Database Column | Type | Required | Notes |
|------------|----------------|------|----------|-------|
| **Customer Information** |
| customerName | customer_name | String | Yes | Full name |
| email | email | String | Yes | Valid email format |
| mobile | mobile | String | Yes | UK mobile format |
| **Address Details** |
| addressLine1 | address_line1 | String | Yes | |
| addressLine2 | address_line2 | String | No | |
| townCity | town_city | String | Yes | |
| county | county | String | No | |
| postcode | postcode | String | Yes | UK postcode format |
| postcodeArea | postcode_area | String | Auto | Extracted from postcode |
| **Property Information** |
| propertyType | property_type | String | No | house/flat/bungalow/commercial |
| bedrooms | property_size | String | No | Stored as property size |
| **Service Details** |
| selectedFrequency | frequency | String | No | one-time/weekly/fortnightly/monthly |
| hasConservatory | services_requested | JSON | No | Part of JSON object |
| hasExtension | services_requested | JSON | No | Part of JSON object |
| additionalServices | services_requested | JSON | No | Conservatory roof/Fascia/Gutter |
| **Pricing Information** |
| estimatedPrice | estimated_price | Decimal | No | Total calculated price |
| priceBreakdown | price_breakdown | JSON | No | Detailed breakdown |
| quoteRequests | quote_requests | JSON | No | Custom quote flags |
| **Contact Preferences** |
| preferredContactMethod | preferred_contact_method | String | Yes | phone/email/text |
| preferredContactTime | preferred_contact_time | String | No | morning/afternoon/evening |
| specialRequirements | special_requirements | Text | No | Additional notes |
| marketingConsent | marketing_consent | Boolean | Yes | GDPR consent |
| **System Fields** |
| bookingReference | booking_reference | String | Auto | SWC-timestamp-hash |
| submissionIp | submission_ip | String | Auto | Client IP |
| userAgent | user_agent | String | Auto | Browser info |
| submittedAt | submitted_at | DateTime | Auto | Submission timestamp |

## Post-Deployment Verification Steps

### 1. API Health Check
```bash
# Test API endpoint
curl https://[YOUR-API-URL]/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-05-29T...",
  "environment": "production"
}
```

### 2. Database Connectivity Test
```bash
# Via API endpoint (create a test endpoint if needed)
curl https://[YOUR-API-URL]/api/system/health

# Check Prisma connection
vercel logs --prod
```

### 3. Booking Form Submission Test

1. **Submit Test Booking**
   - Go to https://window-cleaning-booking-system.vercel.app
   - Fill all fields with test data
   - Submit form
   - Note the booking reference

2. **Verify in Database**
```sql
-- In Supabase SQL Editor
SELECT * FROM leads 
WHERE booking_reference = 'SWC-[YOUR-REF]'
ORDER BY submitted_at DESC
LIMIT 1;
```

3. **Check All Fields**
   - Verify each field from the form is stored correctly
   - Check JSON fields are properly formatted
   - Confirm calculated fields (postcode_area) are populated

### 4. Admin Dashboard Verification

1. **Login Test**
   - Go to https://somerset-admin-dashboard.vercel.app
   - Login with admin credentials
   - Verify JWT token is received

2. **Lead Display Test**
   - Navigate to Leads page
   - Verify test booking appears
   - Check all fields are displayed correctly

3. **Lead Management Test**
   - Change lead status
   - Assign to user
   - Add activity/note
   - Verify changes persist

### 5. Integration Test Checklist

- [ ] **Form → API**
  - [ ] Form submission reaches API
  - [ ] All fields are transmitted
  - [ ] Validation works correctly
  - [ ] Error handling displays properly

- [ ] **API → Database**
  - [ ] Lead record created
  - [ ] All fields stored correctly
  - [ ] JSON fields properly formatted
  - [ ] Timestamps accurate

- [ ] **Database → Admin**
  - [ ] Leads retrieved successfully
  - [ ] Filtering works
  - [ ] Sorting works
  - [ ] Pagination works

- [ ] **Authentication Flow**
  - [ ] Login works
  - [ ] JWT tokens valid
  - [ ] Protected routes secured
  - [ ] Logout clears session

### 6. Performance & Security Checks

1. **Rate Limiting Test**
```bash
# Test booking endpoint rate limit (5 requests/15 min)
for i in {1..6}; do
  curl -X POST https://[API-URL]/api/submit-booking \
    -H "Content-Type: application/json" \
    -d '{"test": true}'
done
```

2. **CORS Verification**
```javascript
// From browser console on booking form
fetch('https://[API-URL]/api/health')
  .then(r => r.json())
  .then(console.log)
```

3. **SSL Certificate Check**
```bash
# Verify HTTPS is working
curl -I https://[API-URL]
```

## Monitoring & Maintenance

### Daily Checks
1. Monitor Vercel dashboard for errors
2. Check Supabase database metrics
3. Review API response times

### Weekly Tasks
1. Review audit logs
2. Check for failed bookings
3. Monitor database growth

### Monthly Tasks
1. Review and rotate JWT secrets
2. Update dependencies
3. Backup database
4. Review security logs

## Troubleshooting Guide

### Common Issues & Solutions

1. **Database Connection Errors**
   - Check DATABASE_URL in Vercel env vars
   - Verify Supabase is accessible
   - Check connection pool limits

2. **CORS Errors**
   - Verify frontend URLs in CORS config
   - Check for trailing slashes
   - Ensure credentials: true is set

3. **Authentication Failures**
   - Verify JWT_SECRET matches
   - Check token expiration
   - Confirm user is active

4. **Missing Form Data**
   - Check field mapping
   - Verify JSON serialization
   - Review validation rules

## Success Criteria

The deployment is considered successful when:

1. ✅ API is accessible at production URL
2. ✅ All form fields are captured in database
3. ✅ No data loss between submission and storage
4. ✅ Admin dashboard displays all lead data
5. ✅ Authentication works for admin users
6. ✅ Lead management features functional
7. ✅ Rate limiting prevents abuse
8. ✅ CORS properly configured
9. ✅ SSL certificates valid
10. ✅ Error handling works gracefully

## Emergency Rollback Plan

If critical issues arise:

1. **Immediate Actions**
   ```bash
   # Rollback to previous deployment
   vercel rollback
   ```

2. **Database Rollback**
   ```bash
   # If schema changes were made
   npx prisma migrate rollback
   ```

3. **Update Frontend URLs**
   - Revert to previous API endpoints
   - Clear browser caches

## Contact Information

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Project Repository**: [Your GitHub URL]
- **Emergency Contact**: [Your contact info]

---

Last Updated: May 29, 2025