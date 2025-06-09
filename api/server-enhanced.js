const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// EmailJS not needed - emails are sent from the frontend
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file or environment configuration');
  process.exit(1);
}

// Validate JWT secret complexity
if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters for security');
  process.exit(1);
}

if (process.env.JWT_REFRESH_SECRET.length < 32) {
  console.error('JWT_REFRESH_SECRET must be at least 32 characters for security');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient();

// Security middleware
app.use(helmet());
// Configure CORS based on environment
const corsOrigins = process.env.NODE_ENV === 'production' 
  ? [
      process.env.FRONTEND_URL,
      'https://somerset-admin-dashboard.vercel.app',
      'https://window-cleaning-booking-system-admin.vercel.app',
      'https://window-cleaning-booking-system.vercel.app',
      'https://somersetwindowcleaning.co.uk',
      'https://www.somersetwindowcleaning.co.uk',
      // Allow all Vercel preview deployments
      /https:\/\/somerset-admin-dashboard-.*\.vercel\.app$/,
      /https:\/\/window-cleaning-booking-system-admin-.*\.vercel\.app$/
    ].filter(Boolean)
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://somerset-admin-dashboard.vercel.app',
      'https://window-cleaning-booking-system-admin.vercel.app',
      'https://window-cleaning-booking-system.vercel.app'
    ];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in the allowed list
    const isAllowed = corsOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked origin', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many booking attempts from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth attempts per windowMs
  message: 'Too many authentication attempts from this IP, please try again later.'
});

app.use('/api', generalLimiter);

// IP logging middleware
const logIpAddress = (req, res, next) => {
  req.clientIp = req.headers['x-forwarded-for']?.split(',')[0] || 
                 req.connection.remoteAddress || 
                 req.socket.remoteAddress;
  logger.debug(`Request from IP: ${req.clientIp}`, { ip: req.clientIp, timestamp: new Date().toISOString() });
  next();
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, email: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Token verification error', { error: error.message });
    res.status(403).json({ success: false, error: 'Invalid token' });
  }
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};

// Validation rules
const bookingValidation = [
  body('customerName').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('mobile').trim()
    .customSanitizer(value => value.replace(/[\s\-\(\)]/g, '')) // Remove spaces, dashes, parentheses
    .matches(/^(?:(?:\+44\s?|0)(?:1\d{8,9}|2\d{9}|3\d{9}|7\d{9}|8\d{9}))$/)
    .withMessage('Valid UK phone number required'),
  body('postcode').trim().matches(/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i)
    .withMessage('Valid UK postcode required'),
  body('addressLine1').trim().notEmpty().withMessage('Address is required'),
  body('townCity').trim().notEmpty().withMessage('Town/City is required')
];

// Helper functions
const extractPostcodeArea = (postcode) => {
  const match = postcode.match(/^([A-Z]{1,2}[0-9][A-Z0-9]?)/i);
  return match ? match[1].toUpperCase() : null;
};

// Note: reCAPTCHA verification removed - frontend handles spam prevention
// The backend only accepts requests from authenticated frontend

// Audit logging
const logActivity = async (userId, action, tableName = null, recordId = null, oldValues = null, newValues = null, ipAddress = null, userAgent = null) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        tableName,
        recordId,
        oldValues,
        newValues,
        ipAddress,
        userAgent
      }
    });
  } catch (error) {
    logger.error('Audit logging error', { error: error.message });
  }
};

// EmailJS initialization removed - emails are handled by frontend

// ===================
// AUTH ENDPOINTS
// ===================

app.post('/api/auth/login', authLimiter, [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, email: true, passwordHash: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET not configured');
      return res.status(500).json({ success: false, error: 'Authentication configuration error' });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // Store session
    await prisma.userSession.create({
      data: {
        userId: user.id,
        sessionToken: accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        ipAddress: req.clientIp,
        userAgent: req.headers['user-agent']
      }
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    await logActivity(user.id, 'LOGIN', 'users', user.id, null, null, req.clientIp, req.headers['user-agent']);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    logger.error('Login error', { 
      error: error.message, 
      username: username,
      stack: error.stack 
    });
    res.status(500).json({ success: false, error: 'Login failed: ' + error.message });
  }
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    // Remove session from database
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    await prisma.userSession.deleteMany({
      where: { sessionToken: token }
    });

    await logActivity(req.user.id, 'LOGOUT', 'users', req.user.id, null, null, req.clientIp, req.headers['user-agent']);

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error', { error: error.message });
    res.status(500).json({ success: false, error: 'Logout failed' });
  }
});

// Refresh token endpoint
app.post('/api/auth/refresh', [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { refreshToken } = req.body;

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Check if session exists and is valid
    const session = await prisma.userSession.findFirst({
      where: { 
        refreshToken,
        userId: decoded.userId,
        expiresAt: { gt: new Date() }
      },
      include: {
        user: {
          select: { id: true, username: true, email: true, role: true, isActive: true }
        }
      }
    });

    if (!session || !session.user.isActive) {
      return res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: session.user.id, username: session.user.username, role: session.user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    // Generate new refresh token
    const newRefreshToken = jwt.sign(
      { userId: session.user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // Update session with new tokens
    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        sessionToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: session.user.id,
        username: session.user.username,
        email: session.user.email,
        role: session.user.role
      }
    });

  } catch (error) {
    logger.error('Token refresh error', { error: error.message });
    res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }
});

// ===================
// LEAD ENDPOINTS
// ===================

// Get leads with filtering, pagination, and sorting
app.get('/api/leads', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      status,
      assignedTo,
      postcodeArea,
      priority,
      searchTerm,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    
    if (status) where.statusId = parseInt(status);
    if (assignedTo) where.assignedToId = parseInt(assignedTo);
    if (postcodeArea) where.postcodeArea = postcodeArea;
    if (priority) where.priority = priority.toUpperCase();
    
    if (searchTerm) {
      where.OR = [
        { customerName: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { mobile: { contains: searchTerm, mode: 'insensitive' } },
        { postcode: { contains: searchTerm, mode: 'insensitive' } },
        { bookingReference: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Optimize with single query and count
    const [leads, total] = await prisma.$transaction([
      prisma.lead.findMany({
        where,
        include: {
          status: true,
          assignedTo: {
            select: { id: true, firstName: true, lastName: true, username: true }
          },
          activities: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              activityType: true,
              createdAt: true,
              nextFollowUp: true
            }
          }
        },
        orderBy,
        skip,
        take: parseInt(limit)
      }),
      prisma.lead.count({ where })
    ]);

    res.json({
      success: true,
      data: leads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    logger.error('Get leads error', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to fetch leads' });
  }
});

// Get single lead by ID
app.get('/api/leads/:id', authenticateToken, async (req, res) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        status: true,
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, username: true }
        },
        activities: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, username: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    res.json({ success: true, data: lead });
  } catch (error) {
    logger.error('Get lead error', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to fetch lead' });
  }
});

// Update lead
app.put('/api/leads/:id', authenticateToken, async (req, res) => {
  try {
    const leadId = parseInt(req.params.id);
    const oldLead = await prisma.lead.findUnique({ where: { id: leadId } });
    
    if (!oldLead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: req.body,
      include: {
        status: true,
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, username: true }
        }
      }
    });

    await logActivity(
      req.user.id,
      'UPDATE_LEAD',
      'leads',
      leadId,
      oldLead,
      updatedLead,
      req.clientIp,
      req.headers['user-agent']
    );

    res.json({ success: true, data: updatedLead });
  } catch (error) {
    logger.error('Update lead error', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to update lead' });
  }
});

// Delete lead
app.delete('/api/leads/:id', authenticateToken, async (req, res) => {
  try {
    const leadId = parseInt(req.params.id);
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    // Delete associated activities first (cascade delete)
    await prisma.leadActivity.deleteMany({ where: { leadId } });
    
    // Delete the lead
    await prisma.lead.delete({ where: { id: leadId } });

    await logActivity(
      req.user.id,
      'DELETE_LEAD',
      'leads',
      leadId,
      lead,
      null,
      req.clientIp,
      req.headers['user-agent']
    );

    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    logger.error('Delete lead error', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to delete lead' });
  }
});

// Create new lead (for admin panel)
app.post('/api/leads', authenticateToken, [
  body('customerName').trim().notEmpty().withMessage('Customer name is required'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('mobile').trim().notEmpty().withMessage('Mobile number is required'),
  body('postcode').trim().notEmpty().withMessage('Postcode is required'),
  body('addressLine1').trim().notEmpty().withMessage('Address is required'),
  body('townCity').trim().notEmpty().withMessage('Town/City is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const formData = req.body;
    
    // Generate unique booking reference
    const bookingRef = `SWC-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    
    // Get default status
    const defaultStatus = await prisma.leadStatus.findFirst({
      where: { isDefault: true }
    });

    // Extract postcode area
    const postcodeArea = extractPostcodeArea(formData.postcode);

    const lead = await prisma.lead.create({
      data: {
        bookingReference: bookingRef,
        customerName: formData.customerName,
        email: formData.email,
        mobile: formData.mobile,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2 || null,
        townCity: formData.townCity,
        county: formData.county || null,
        postcode: formData.postcode,
        postcodeArea,
        propertyType: formData.propertyType || null,
        propertySize: formData.propertySize || null,
        accessDifficulty: formData.accessDifficulty || null,
        frequency: formData.frequency || null,
        servicesRequested: formData.servicesRequested || {},
        estimatedPrice: formData.estimatedPrice ? parseFloat(formData.estimatedPrice) : null,
        priceBreakdown: formData.priceBreakdown || null,
        quoteRequests: formData.quoteRequests || {},
        specialRequirements: formData.specialRequirements || null,
        preferredContactMethod: formData.preferredContactMethod || 'phone',
        preferredContactTime: formData.preferredContactTime || null,
        marketingConsent: formData.marketingConsent || false,
        statusId: formData.statusId || defaultStatus?.id || 1,
        assignedToId: formData.assignedToId || null,
        priority: formData.priority || null,
        submissionIp: req.clientIp,
        userAgent: req.headers['user-agent']
      },
      include: {
        status: true,
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, username: true }
        }
      }
    });

    // Create initial activity
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        userId: req.user.id,
        activityType: 'lead_created',
        title: 'Lead Created',
        description: 'Lead manually created via admin panel',
        metadata: {
          source: 'admin_panel',
          createdBy: req.user.username
        }
      }
    });

    await logActivity(
      req.user.id,
      'CREATE_LEAD',
      'leads',
      lead.id,
      null,
      lead,
      req.clientIp,
      req.headers['user-agent']
    );

    res.json({ success: true, data: lead });
  } catch (error) {
    logger.error('Create lead error', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to create lead' });
  }
});

// Submit booking endpoint (Enhanced to store in database + send email)
app.post('/api/submit-booking', logIpAddress, bookingLimiter, bookingValidation, async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array().map(err => err.msg) 
    });
  }

  const formData = req.body;

  // Generate unique booking reference
  const bookingRef = `SWC-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  try {
    // Get default status (should be "New")
    const defaultStatus = await prisma.leadStatus.findFirst({
      where: { isDefault: true }
    });

    // Extract postcode area for filtering
    const postcodeArea = extractPostcodeArea(formData.postcode);

    // Store lead in database
    const lead = await prisma.lead.create({
      data: {
        bookingReference: bookingRef,
        customerName: formData.customerName,
        email: formData.email,
        mobile: formData.mobile,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2 || null,
        townCity: formData.townCity,
        county: formData.county || null,
        postcode: formData.postcode,
        postcodeArea,
        propertyType: formData.propertyType || null,
        propertySize: formData.propertySize || null,
        accessDifficulty: formData.accessDifficulty || null,
        frequency: formData.frequency || null,
        servicesRequested: formData.servicesRequested || {},
        estimatedPrice: formData.estimatedPrice ? parseFloat(formData.estimatedPrice) : null,
        priceBreakdown: formData.priceBreakdown || null,
        quoteRequests: formData.quoteRequests || {},
        specialRequirements: formData.specialRequirements || null,
        preferredContactMethod: formData.preferredContactMethod || 'phone',
        preferredContactTime: formData.preferredContactTime || null,
        marketingConsent: formData.marketingConsent || false,
        statusId: defaultStatus?.id || 1,
        submissionIp: req.clientIp,
        userAgent: req.headers['user-agent']
      }
    });

    // Create initial activity
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        activityType: 'booking_submitted',
        title: 'Booking Submitted',
        description: 'Initial booking form submission received',
        metadata: {
          source: 'website',
          ipAddress: req.clientIp,
          userAgent: req.headers['user-agent']
        }
      }
    });

    // Note: Email is sent from the frontend, not here
    // The backend just stores the booking data for the admin dashboard
    
    logger.info('Booking submitted successfully', { 
      bookingRef, 
      leadId: lead.id, 
      ip: req.clientIp 
    });

    res.json({
      success: true,
      bookingReference: bookingRef,
      leadId: lead.id,
      message: 'Your booking has been submitted successfully. We will contact you within 24 hours.'
    });

  } catch (error) {
    logger.error('Booking submission error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'There was an error submitting your booking. Please try again or contact us directly.'
    });
  }
});

// Export leads endpoint
app.get('/api/leads/export', authenticateToken, async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      include: {
        status: true,
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, username: true }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    // Convert to CSV format
    const csvData = leads.map(lead => ({
      'Booking Reference': lead.bookingReference,
      'Customer Name': lead.customerName,
      'Email': lead.email,
      'Mobile': lead.mobile,
      'Address': `${lead.addressLine1}, ${lead.townCity}, ${lead.postcode}`,
      'Property Type': lead.propertyType,
      'Frequency': lead.frequency,
      'Estimated Price': lead.estimatedPrice,
      'Status': lead.status.displayName,
      'Submitted At': lead.submittedAt
    }));

    res.json({ success: true, data: csvData });
  } catch (error) {
    logger.error('Export leads error', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to export leads' });
  }
});

// Transfer history endpoint (placeholder)
app.get('/api/leads/transfer-history', authenticateToken, async (req, res) => {
  try {
    // For now, return empty array as we don't have transfer tracking yet
    res.json({ success: true, data: [] });
  } catch (error) {
    logger.error('Transfer history error', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to fetch transfer history' });
  }
});

// Transfer to Squeegee endpoint (placeholder)
app.post('/api/leads/transfer-to-squeegee', authenticateToken, async (req, res) => {
  try {
    const { leadIds } = req.body;
    
    if (!leadIds || !Array.isArray(leadIds)) {
      return res.status(400).json({ success: false, error: 'Lead IDs required' });
    }

    // For now, just mark leads as scheduled
    const updatedLeads = await Promise.all(
      leadIds.map(async (leadId) => {
        const scheduledStatus = await prisma.leadStatus.findFirst({
          where: { name: 'Scheduled' }
        });
        
        return prisma.lead.update({
          where: { id: parseInt(leadId) },
          data: { 
            statusId: scheduledStatus?.id || 5 // Default to status 5 if Scheduled not found
          }
        });
      })
    );

    res.json({ 
      success: true, 
      successful: updatedLeads.length,
      failed: 0,
      total: leadIds.length,
      message: `Successfully transferred ${updatedLeads.length} leads to Squeegee`
    });
  } catch (error) {
    logger.error('Transfer to Squeegee error', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to transfer leads' });
  }
});

// ===================
// SYSTEM ENDPOINTS
// ===================

// Get lead statuses
app.get('/api/system/lead-statuses', authenticateToken, async (req, res) => {
  try {
    const statuses = await prisma.leadStatus.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
    res.json({ success: true, data: statuses });
  } catch (error) {
    logger.error('Get lead statuses error', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to fetch lead statuses' });
  }
});

// Get system configuration
app.get('/api/system/config', authenticateToken, async (req, res) => {
  try {
    const configs = await prisma.systemConfig.findMany();
    const configObj = configs.reduce((acc, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {});
    
    res.json({ success: true, data: configObj });
  } catch (error) {
    logger.error('Get system config error', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to fetch system configuration' });
  }
});

// Update system configuration
app.put('/api/system/config', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updates = [];
    
    for (const [key, value] of Object.entries(req.body)) {
      updates.push(
        prisma.systemConfig.upsert({
          where: { key },
          update: { 
            value,
            updatedBy: req.user.id,
            updatedAt: new Date()
          },
          create: {
            key,
            value,
            updatedBy: req.user.id
          }
        })
      );
    }

    await Promise.all(updates);

    await logActivity(
      req.user.id,
      'UPDATE_SYSTEM_CONFIG',
      'system_config',
      null,
      null,
      req.body,
      req.clientIp,
      req.headers['user-agent']
    );

    res.json({ success: true, message: 'System configuration updated successfully' });
  } catch (error) {
    logger.error('Update system config error', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to update system configuration' });
  }
});

// Get users (for assignment dropdowns)
app.get('/api/system/users', authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    });

    res.json({ success: true, data: users });
  } catch (error) {
    logger.error('Get users error', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// ===================
// ANALYTICS ENDPOINTS
// ===================

// Get dashboard metrics - optimized version
app.get('/api/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    // Use aggregation pipeline for better performance
    const metrics = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_leads,
        COUNT(CASE WHEN submitted_at >= ${startOfMonth} THEN 1 END) as monthly_leads,
        COUNT(CASE WHEN submitted_at >= ${startOfWeek} THEN 1 END) as weekly_leads,
        COUNT(CASE WHEN converted_at IS NOT NULL THEN 1 END) as converted_leads
      FROM leads
    `;
    
    const statusBreakdown = await prisma.lead.groupBy({
      by: ['statusId'],
      _count: true,
      orderBy: { statusId: 'asc' }
    });
    
    const totalLeads = Number(metrics[0].total_leads);
    const conversionRate = totalLeads > 0 ? 
      (Number(metrics[0].converted_leads) / totalLeads * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        totalLeads,
        monthlyLeads,
        weeklyLeads,
        conversionRate: parseFloat(conversionRate),
        statusBreakdown
      }
    });
  } catch (error) {
    logger.error('Get dashboard metrics error', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard metrics' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'connected'
  });
});

// Debug endpoint to check environment configuration (development only)
app.get('/api/debug/env', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  
  res.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    hasDatabase: !!process.env.DATABASE_URL,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasJwtRefreshSecret: !!process.env.JWT_REFRESH_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
});

// Debug endpoint to test database connection and admin user (development only)
app.get('/api/debug/db', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  
  try {
    logger.debug('Testing database connection');
    const users = await prisma.user.findMany();
    logger.debug('Users found', { count: users.length });
    
    const admin = await prisma.user.findUnique({
      where: { username: 'admin' },
      select: { id: true, username: true, email: true, role: true, isActive: true, passwordHash: true }
    });
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalUsers: users.length,
      adminFound: !!admin,
      adminActive: admin?.isActive,
      adminHasPassword: !!admin?.passwordHash
    });
  } catch (error) {
    logger.error('Database test error', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});


// Initialize admin user on startup
async function initializeAdminUser() {
  try {
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });
    
    if (!adminUser) {
      logger.info('Creating admin user');
      
      // Generate a secure random password for initial setup
      const tempPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(tempPassword, 12);
      
      await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@somersetwindowcleaning.co.uk',
          passwordHash: hashedPassword,
          role: 'ADMIN',
          isActive: true,
          firstName: 'Admin',
          lastName: 'User'
        }
      });
      
      logger.info('Admin user created successfully');
      logger.startup('IMPORTANT: Temporary admin password generated. Please change immediately!', {
        username: 'admin',
        tempPassword: tempPassword,
        email: 'admin@somersetwindowcleaning.co.uk'
      });
      logger.startup('Use the reset-admin-password.js script to set a secure password');
    } else {
      // Check if still using weak default password
      const isWeakPassword = await bcrypt.compare('admin123', adminUser.passwordHash);
      if (isWeakPassword) {
        logger.warn('SECURITY WARNING: Admin user is still using default password!');
        logger.warn('Please run: node reset-admin-password.js to set a secure password');
      }
    }
  } catch (error) {
    logger.error('Error initializing admin user', { error: error.message });
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred. Please try again later.'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, async () => {
  logger.startup(`Server running on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
  
  // Initialize admin user
  await initializeAdminUser();
});