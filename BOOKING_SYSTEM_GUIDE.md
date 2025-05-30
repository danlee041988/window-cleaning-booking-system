# Somerset Window Cleaning - Booking System Guide

## ✅ System Status: FULLY OPERATIONAL

The booking system is now fully functional and tested. Customer bookings are being successfully submitted and appear in the admin dashboard.

---

## 🎯 How the System Works

### 1. **Customer Journey**
- Customer fills out the booking form on your website
- Form validates UK phone numbers (mobile and landline)
- Upon submission, booking is sent to the API
- Customer receives confirmation with booking reference
- Data is stored securely in the database

### 2. **Admin Dashboard**
- All bookings appear immediately in the admin dashboard
- Staff can view, manage, and update booking status
- Full customer relationship management capabilities

---

## 🔐 Admin Dashboard Access

### **Live URL**: https://window-cleaning-booking-system-admin.vercel.app/

### **Login Credentials**:
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Please change the admin password after your first login for security.

---

## ✅ What's Working

1. **Phone Validation** - Now accepts:
   - UK mobile numbers (07xxx, 08xxx)
   - UK landline numbers (01xxx, 02xxx, 03xxx)
   - With or without spaces, dashes, parentheses
   - International format (+44)

2. **Booking Submission**:
   - Form data is validated
   - Booking reference generated (e.g., SWC-1748643526054-1A1A9069)
   - Data saved to database
   - Confirmation shown to customer

3. **Admin Dashboard Features**:
   - View all leads/bookings
   - Separate confirmed bookings from enquiries
   - Follow-up system for customer management
   - Analytics showing conversion rates and annual values
   - Squeegee CRM transfer capability

---

## 🧪 Testing the System

### **Test Form Available**: Open `test-website-form.html` in your browser

This test page allows you to:
1. Submit a test booking
2. Check if it appears in the admin dashboard
3. Verify the entire flow is working

### **Test Results** (30/05/2025):
- ✅ Form submission: Working
- ✅ API endpoint: Responding correctly
- ✅ Database storage: Confirmed
- ✅ Admin visibility: Bookings appear immediately

---

## 📊 Admin Dashboard Features

### **Dashboard Overview**
- Total leads count
- New enquiries today
- Confirmed bookings
- Total annual value calculations

### **Lead Management**
- Filter by status (New, Contacted, Quote Sent, etc.)
- Search by name, email, postcode
- Bulk actions for multiple leads
- Individual lead details and history

### **Follow-up System**
- Automatic follow-up reminders
- Track customer interactions
- Schedule callbacks
- Complete follow-up workflow

### **Analytics**
- Conversion funnel visualization
- Property type breakdown
- Lead source analysis
- Revenue projections

### **Squeegee Transfer**
- Export confirmed bookings to Squeegee CRM
- Batch transfer capability
- Transfer history tracking

---

## 🚨 Troubleshooting

### **If bookings aren't appearing:**
1. Check browser console for errors
2. Verify API is running: https://window-cleaning-booking-system-6k15.vercel.app/api/health
3. Ensure you're logged into admin dashboard
4. Try refreshing the leads page

### **Common Issues:**
- **"Valid UK phone number required"** - Fixed, now accepts all UK numbers
- **Blue screen in admin** - Fixed, React hooks issue resolved
- **401 Unauthorized** - Log in with admin credentials

---

## 🔒 Security Notes

1. All data is encrypted in transit (HTTPS)
2. Authentication required for admin access
3. Session tokens expire for security
4. Database hosted securely on Vercel

---

## 📞 Next Steps

1. **Change admin password** - Use the settings page after login
2. **Add staff users** - Create accounts for your team
3. **Configure email notifications** - Set up automated emails
4. **Customize status workflow** - Match your business process

---

## 📋 Summary

Your booking system is fully operational. Customers can submit bookings through your website, and all submissions appear immediately in the admin dashboard at https://window-cleaning-booking-system-admin.vercel.app/

Login with username `admin` and password `admin123` to start managing your bookings.

For any issues, check the API health at: https://window-cleaning-booking-system-6k15.vercel.app/api/health