# EmailJS Setup Guide

## 🎯 Overview
EmailJS is currently **not configured**, which means confirmation emails won't be sent after form submission. The booking will still be saved to your database, but no email confirmation will be sent.

## ⚠️ Current Status
- ❌ **EmailJS not configured** - emails are being skipped
- ✅ **Form submissions work** - data is saved to your database
- ✅ **All other functionality works** - the form is fully functional

## 🛠 How to Set Up EmailJS

### Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### Step 2: Create Email Service
1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. **Note down your Service ID** (e.g., `service_abc123`)

### Step 3: Create Email Template
1. Go to **Email Templates**
2. Click **Create New Template**
3. Use this template content:

```html
Subject: New Window Cleaning Booking - {{booking_reference}}

Hello,

You have received a new window cleaning booking:

**Booking Details:**
- Reference: {{booking_reference}}
- Customer: {{customer_name}}
- Email: {{customer_email}}
- Phone: {{customer_phone}}
- Property: {{property_address}}
- Type: {{property_type}}
- Frequency: {{frequency}}
- Estimated Price: {{estimated_price}}
- Services: {{services_requested}}
- Contact Preference: {{preferred_contact}}
- Special Requirements: {{special_requirements}}
- Submitted: {{submission_date}}

Please contact the customer within 24 hours.

Best regards,
Window Cleaning Booking System
```

4. **Note down your Template ID** (e.g., `template_xyz789`)

### Step 4: Get Public Key
1. Go to **Account** → **General**
2. Find your **Public Key** (e.g., `abc123xyz`)

### Step 5: Configure Your Website

You have two options:

#### Option A: For GitHub Pages (Recommended)
Add these environment variables to your GitHub repository:

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add these repository secrets:
   - `EMAILJS_SERVICE_ID`: Your service ID
   - `EMAILJS_TEMPLATE_ID`: Your template ID  
   - `EMAILJS_PUBLIC_KEY`: Your public key

#### Option B: For Local Testing
1. Copy `.env.template` to `.env`:
   ```bash
   cp .env.template .env
   ```

2. Edit `.env` and add your credentials:
   ```
   EMAILJS_SERVICE_ID=service_your_actual_id
   EMAILJS_TEMPLATE_ID=template_your_actual_id
   EMAILJS_PUBLIC_KEY=your_actual_public_key
   ```

## 🧪 Testing EmailJS

1. After configuration, check browser console for:
   - ✅ `"EmailJS loaded successfully"`
   - ✅ `"Confirmation email sent successfully"`
   
2. If you see warnings:
   - ❌ `"EmailJS not configured - email sending skipped"`
   - This means environment variables aren't set properly

## 📧 Expected Email Flow

Once configured:
1. Customer submits booking form
2. Booking is saved to database
3. **Confirmation email is sent to `info@somersetwindowcleaning.co.uk`**
4. Email contains all booking details
5. You can respond to customer within 24 hours

## 🔍 Troubleshooting

### Email Not Sending?
1. Check browser console for errors
2. Verify all three credentials are correct
3. Test your EmailJS service directly on EmailJS.com
4. Check if Gmail/email provider needs "less secure apps" enabled

### Still Not Working?
The form will continue to work without EmailJS:
- ✅ Bookings are saved to database
- ✅ Customer sees success message
- ❌ No email confirmation (manual follow-up needed)

## 🚀 Benefits of Setting Up EmailJS

- ✅ **Instant notifications** of new bookings
- ✅ **All booking details** in one email
- ✅ **Professional customer service** with quick response
- ✅ **Backup system** if database notifications fail

---

**Need help?** The booking system works perfectly without EmailJS, but setting it up will improve your customer service significantly!