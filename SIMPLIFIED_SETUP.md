# 🎯 Somerset Window Cleaning - Simplified Booking System

## What We've Done

### ✅ Removed Complex Backend
- No more database issues
- No more authentication problems  
- No more API errors
- Just simple, reliable email notifications

### ✅ Streamlined Booking Process
- Reduced from 4 steps to 3 steps
- Combined Property Details + Review into one page
- Faster completion for customers
- All information visible on one screen

### ✅ EmailJS Integration Only
- Direct email to your inbox
- Simple booking references (e.g. SWC-ABC123)
- All customer details in the email
- 100% reliable delivery

## How It Works Now

1. **Step 1**: Customer selects service type and pricing
2. **Step 2**: Additional services (if residential booking)
3. **Step 3**: Contact details + Review + Submit
4. **Confirmation**: Thank you page with booking reference

## Email Configuration

Make sure your `.env` file has these values:

```env
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_key
```

## What You'll Receive

Each booking email includes:
- Customer name, email, phone
- Full property address
- Service type and frequency
- All additional services selected
- Pricing breakdown
- Total amount
- Booking reference
- Submission timestamp
- Any special notes

## Testing

1. Run locally:
   ```bash
   npm start
   ```

2. Fill out a test booking

3. Check your email

## Deployment

Your form is automatically deployed via Vercel. Any push to the main branch will trigger a new deployment.

## Future Enhancements (Optional)

When you're ready, you can add:
- Google Sheets integration for record keeping
- Zapier automation
- Simple analytics
- Email templates with React Email

But for now, **it just works!** 🎉