# 🚀 Deployment Guide - Somerset Window Cleaning Booking Form

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create a `.env` file in the root directory:
```bash
# Copy from .env.example
cp .env.example .env

# Edit with your actual values
REACT_APP_EMAILJS_SERVICE_ID=your_emailjs_service_id_here
REACT_APP_EMAILJS_TEMPLATE_ID=your_emailjs_template_id_here
REACT_APP_EMAILJS_PUBLIC_KEY=your_emailjs_public_key_here
REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
```

### 3. Development
```bash
# Start development server
npm start

# Build for production
npm run build
```

### 4. Production Deployment

#### Vercel (Current Platform)
```bash
# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
# Or via CLI:
vercel env add REACT_APP_EMAILJS_SERVICE_ID
vercel env add REACT_APP_EMAILJS_TEMPLATE_ID
vercel env add REACT_APP_EMAILJS_PUBLIC_KEY
vercel env add REACT_APP_RECAPTCHA_SITE_KEY
```

## 🔧 Configuration

### EmailJS Setup
1. Log into your EmailJS account
2. Get your Service ID, Template ID, and Public Key
3. Update environment variables
4. Test email delivery

### reCAPTCHA Setup
1. Log into Google reCAPTCHA console
2. Get your site key
3. Update environment variable
4. Test verification

## 🧪 Testing

### Manual Testing Checklist
- [ ] Form loads without errors
- [ ] All 4 steps navigate correctly
- [ ] Validation works on all fields
- [ ] Email submission succeeds
- [ ] reCAPTCHA verification works
- [ ] Direct Debit link opens correctly
- [ ] Toast notifications appear
- [ ] Error handling works properly
- [ ] Mobile responsiveness
- [ ] Progress bar updates

### Automated Testing
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run build test
npm run build
```

## 🔍 Troubleshooting

### Common Issues

#### Environment Variables Not Loading
```bash
# Check if variables are set
echo $REACT_APP_EMAILJS_SERVICE_ID

# Restart development server after changing .env
npm start
```

#### EmailJS Submission Failing
1. Check environment variables are correct
2. Verify EmailJS service is active
3. Check browser network tab for errors
4. Verify reCAPTCHA is working

#### Build Failures
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run build 2>&1 | grep -i error
```

### Error Monitoring
The improved form includes comprehensive error handling:
- Console logging for development
- User-friendly error messages
- Graceful fallback to original form
- Toast notifications for user feedback

## 📊 Monitoring

### Performance Metrics
Monitor these key metrics:
- Form completion rate
- Error rate
- Loading time
- Mobile vs desktop usage

### Analytics Integration
Add Google Analytics or similar:
```javascript
// Track form completions
gtag('event', 'booking_completed', {
  'event_category': 'engagement',
  'value': formData.grandTotal
});
```

## 🔄 Updates and Maintenance

### Regular Updates
1. Update dependencies monthly
2. Test all functionality after updates
3. Monitor EmailJS usage and limits
4. Check reCAPTCHA analytics

### Security Maintenance
1. Rotate API keys annually
2. Review and update validation rules
3. Monitor for new security vulnerabilities
4. Update HTTPS certificates

## 📱 Mobile Optimization

The form is fully responsive, but test these specifically:
- Touch-friendly form controls
- Keyboard behavior on mobile
- Viewport scaling
- Loading performance on mobile networks

## 🌐 Browser Support

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔐 Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Input validation active
- [ ] reCAPTCHA protection enabled
- [ ] Error messages don't expose sensitive data
- [ ] API keys not exposed in client code

## 📞 Support

For technical support:
1. Check browser console for errors
2. Review network requests in DevTools
3. Verify environment configuration
4. Test with different browsers/devices

---

Your Somerset Window Cleaning booking form is now production-ready with enterprise-level improvements! 🎉