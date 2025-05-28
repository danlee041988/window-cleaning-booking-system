// Example backend API endpoint for secure form submission
// This should be implemented in your backend service (Node.js/Express example)

const express = require('express');
const rateLimit = require('express-rate-limit');
const emailjs = require('@emailjs/nodejs');
const { body, validationResult } = require('express-validator');
const axios = require('axios');

// Rate limiting
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many booking attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const validateBooking = [
  body('customerName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Invalid name format'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  
  body('phone')
    .matches(/^(\+44|0)7\d{9}$/)
    .withMessage('Invalid UK mobile number'),
  
  body('addressLine1')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Invalid address'),
  
  body('postcode')
    .matches(/^([A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}|GIR\s?0AA)$/i)
    .withMessage('Invalid UK postcode'),
  
  body('recaptchaToken')
    .notEmpty()
    .withMessage('reCAPTCHA verification required'),
];

// Main endpoint handler
async function submitBooking(req, res) {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { recaptchaToken, ...formData } = req.body;

    // Verify reCAPTCHA
    const recaptchaVerified = await verifyRecaptcha(recaptchaToken, req.ip);
    if (!recaptchaVerified) {
      return res.status(400).json({ 
        success: false, 
        error: 'reCAPTCHA verification failed' 
      });
    }

    // Sanitize data
    const sanitizedData = sanitizeFormData(formData);

    // Store in database (implement your database logic)
    const bookingId = await storeBooking(sanitizedData);

    // Send email via EmailJS (server-side)
    const emailResult = await sendEmailNotification(sanitizedData, bookingId);

    // Send confirmation email to customer
    await sendCustomerConfirmation(sanitizedData, bookingId);

    // Log for analytics
    logBookingAnalytics(sanitizedData);

    // Return success response
    res.json({
      success: true,
      bookingId,
      message: 'Booking submitted successfully',
      estimatedResponseTime: '24-48 hours'
    });

  } catch (error) {
    console.error('Booking submission error:', error);
    
    // Don't expose internal errors to client
    res.status(500).json({
      success: false,
      error: 'An error occurred processing your booking. Please try again or contact us directly.',
      reference: generateErrorReference()
    });
  }
}

// Verify reCAPTCHA token
async function verifyRecaptcha(token, ip) {
  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token,
          remoteip: ip
        }
      }
    );
    
    return response.data.success && response.data.score > 0.5;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

// Sanitize form data
function sanitizeFormData(data) {
  const sanitized = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Remove HTML tags and escape special characters
      sanitized[key] = value
        .replace(/<[^>]*>/g, '')
        .replace(/[&<>"']/g, (match) => {
          const escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
          };
          return escapeMap[match];
        })
        .trim();
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeFormData(value);
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
}

// Store booking in database
async function storeBooking(data) {
  // Implement your database logic here
  // Example with MongoDB:
  /*
  const booking = new Booking({
    ...data,
    status: 'pending',
    createdAt: new Date(),
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });
  
  const saved = await booking.save();
  return saved._id.toString();
  */
  
  // Placeholder implementation
  return 'BOOK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Send email notification via EmailJS (server-side)
async function sendEmailNotification(data, bookingId) {
  try {
    // Initialize EmailJS with private key (server-side only)
    emailjs.init({
      publicKey: process.env.EMAILJS_PUBLIC_KEY,
      privateKey: process.env.EMAILJS_PRIVATE_KEY
    });

    const templateParams = {
      bookingId,
      ...formatEmailData(data),
      to_email: process.env.ADMIN_EMAIL
    };

    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      templateParams
    );

    return response;
  } catch (error) {
    console.error('Email notification error:', error);
    // Don't fail the booking if email fails
    return null;
  }
}

// Send confirmation to customer
async function sendCustomerConfirmation(data, bookingId) {
  // Implement customer confirmation email
  // Could use a different template or service
}

// Log analytics
function logBookingAnalytics(data) {
  // Implement analytics logging (Google Analytics, Mixpanel, etc.)
  console.log('Booking analytics:', {
    type: data.bookingType,
    value: data.grandTotal,
    postcode: data.postcode.substring(0, 4) + '***', // Partial postcode for privacy
    timestamp: new Date()
  });
}

// Generate error reference for support
function generateErrorReference() {
  return 'ERR-' + Date.now().toString(36).toUpperCase();
}

// Format email data (similar to client-side version)
function formatEmailData(data) {
  // Implementation similar to client-side formatEmailData
  return data;
}

// Express route setup
const router = express.Router();
router.post('/submit-booking', bookingLimiter, validateBooking, submitBooking);

module.exports = router;