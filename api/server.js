const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const emailjs = require('@emailjs/nodejs');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many booking attempts from this IP, please try again later.'
});

// IP logging middleware
const logIpAddress = (req, res, next) => {
  req.clientIp = req.headers['x-forwarded-for']?.split(',')[0] || 
                 req.connection.remoteAddress || 
                 req.socket.remoteAddress;
  console.log(`Request from IP: ${req.clientIp} at ${new Date().toISOString()}`);
  next();
};

// Validation rules
const bookingValidation = [
  body('customerName').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('mobile').trim().matches(/^(?:(?:\+44\s?|0)7(?:[45789]\d{2}|624)\s?\d{3}\s?\d{3})$/)
    .withMessage('Valid UK mobile number required'),
  body('postcode').trim().matches(/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i)
    .withMessage('Valid UK postcode required'),
  body('addressLine1').trim().notEmpty().withMessage('Address is required'),
  body('townCity').trim().notEmpty().withMessage('Town/City is required'),
  body('recaptchaToken').notEmpty().withMessage('reCAPTCHA verification required')
];

// Verify reCAPTCHA
async function verifyRecaptcha(token, clientIp) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}&remoteip=${clientIp}`;
  
  try {
    const response = await fetch(verifyUrl, { method: 'POST' });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

// Initialize EmailJS
emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

// Submit booking endpoint
app.post('/api/submit-booking', logIpAddress, bookingLimiter, bookingValidation, async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array().map(err => err.msg) 
    });
  }

  const { recaptchaToken, ...formData } = req.body;

  // Verify reCAPTCHA
  const isRecaptchaValid = await verifyRecaptcha(recaptchaToken, req.clientIp);
  if (!isRecaptchaValid) {
    return res.status(400).json({ 
      success: false, 
      error: 'reCAPTCHA verification failed. Please try again.' 
    });
  }

  // Generate unique booking reference
  const bookingRef = `SWC-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  try {
    // Prepare email data with sanitized inputs
    const emailData = {
      bookingReference: bookingRef,
      submissionDate: new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }),
      submissionIp: req.clientIp,
      ...sanitizeFormData(formData)
    };

    // Send email via EmailJS
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      emailData
    );

    console.log(`Booking ${bookingRef} submitted successfully from IP ${req.clientIp}`);

    res.json({
      success: true,
      bookingReference: bookingRef,
      message: 'Your booking has been submitted successfully. We will contact you within 24 hours.'
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      error: 'There was an error submitting your booking. Please try again or contact us directly.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Sanitize form data
function sanitizeFormData(data) {
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Remove any HTML tags and trim whitespace
      sanitized[key] = value.replace(/<[^>]*>/g, '').trim();
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeFormData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred. Please try again later.'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});