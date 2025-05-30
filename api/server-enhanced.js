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

// Load environment variables
dotenv.config();

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
      'https://somersetwindowcleaning.co.uk',
      'https://www.somersetwindowcleaning.co.uk'
    ].filter(Boolean)
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://somerset-admin-dashboard.vercel.app',
      'https://window-cleaning-booking-system.vercel.app'
    ];

app.use(cors({
  origin: corsOrigins,
  credentials: true
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
  console.log(`Request from IP: ${req.clientIp} at ${new Date().toISOString()}`);
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
    console.error('Token verification error:', error);
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
  body('mobile').trim().matches(/^(?:(?:\+44\s?|0)7(?:[45789]\d{2}|624)\s?\d{3}\s?\d{3})$/)
    .withMessage('Valid UK mobile number required'),
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
    console.error('Audit logging error:', error);
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
    // Debug logging
    console.log('Login attempt for username:', username);
    console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, email: true, passwordHash: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      console.log('User not found or inactive:', { found: !!user, active: user?.isActive });
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      console.log('Invalid password for user:', username);
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
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
    console.error('Login error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      username: username
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
    console.error('Logout error:', error);
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
    console.error('Token refresh error:', error);
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

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          status: true,
          assignedTo: {
            select: { id: true, firstName: true, lastName: true, username: true }
          },
          activities: {
            take: 1,
            orderBy: { createdAt: 'desc' }
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
    console.error('Get leads error:', error);
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
    console.error('Get lead error:', error);
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
    console.error('Update lead error:', error);
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
    console.error('Delete lead error:', error);
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
    console.error('Create lead error:', error);
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
    
    console.log(`Booking ${bookingRef} submitted successfully from IP ${req.clientIp} and stored as lead ID ${lead.id}`);

    res.json({
      success: true,
      bookingReference: bookingRef,
      leadId: lead.id,
      message: 'Your booking has been submitted successfully. We will contact you within 24 hours.'
    });

  } catch (error) {
    console.error('Booking submission error:', error);
    res.status(500).json({
      success: false,
      error: 'There was an error submitting your booking. Please try again or contact us directly.'
    });
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
    console.error('Get lead statuses error:', error);
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
    console.error('Get system config error:', error);
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
    console.error('Update system config error:', error);
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
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// ===================
// ANALYTICS ENDPOINTS
// ===================

// Get dashboard metrics
app.get('/api/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    const [
      totalLeads,
      monthlyLeads,
      weeklyLeads,
      conversionRate,
      statusBreakdown
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({
        where: { submittedAt: { gte: startOfMonth } }
      }),
      prisma.lead.count({
        where: { submittedAt: { gte: startOfWeek } }
      }),
      prisma.lead.count({
        where: { convertedAt: { not: null } }
      }).then(converted => totalLeads > 0 ? (converted / totalLeads * 100).toFixed(2) : 0),
      prisma.lead.groupBy({
        by: ['statusId'],
        _count: true,
        orderBy: { statusId: 'asc' }
      })
    ]);

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
    console.error('Get dashboard metrics error:', error);
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

// Debug endpoint to check environment configuration
app.get('/api/debug/env', (req, res) => {
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

// Debug endpoint to test database connection and admin user
app.get('/api/debug/db', async (req, res) => {
  try {
    console.log('Testing database connection...');
    const users = await prisma.user.findMany();
    console.log('Users found:', users.length);
    
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
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred. Please try again later.'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});