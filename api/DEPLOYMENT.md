# API Deployment Guide

## Prerequisites

1. **Database Setup**
   - PostgreSQL database (local, cloud, or service provider)
   - Database URL in the format: `postgresql://username:password@hostname:port/database_name`

2. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in all required values with your actual credentials
   - **NEVER commit the .env file to version control**

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Repository Setup**
   ```bash
   # Make sure your code is in a Git repository
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Vercel Deployment**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set root directory to `/api`
   - Configure environment variables in Vercel dashboard (see Environment Variables section)

3. **Database Setup**
   ```bash
   # After deployment, run database migrations
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

### Option 2: Render

1. Create a new Web Service
2. Connect your GitHub repository
3. Use build command: `npm install`
4. Use start command: `npm start`
5. Add environment variables (see Environment Variables section)

## Environment Variables Setup

**In your deployment platform (Vercel/Render), set these variables:**

### Required Variables
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - Secure random string (min 32 characters)
- `JWT_REFRESH_SECRET` - Different secure random string (min 32 characters)
- `FRONTEND_URL` - Your frontend application URL
- `NODE_ENV` - Set to "production"

### Optional Variables
- `EMAILJS_SERVICE_ID` - If using EmailJS for notifications
- `EMAILJS_TEMPLATE_ID` - EmailJS template ID
- `EMAILJS_PUBLIC_KEY` - EmailJS public key
- `EMAILJS_PRIVATE_KEY` - EmailJS private key

## Generate Secure Secrets

Use these commands to generate secure JWT secrets:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET  
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Post-Deployment Testing

1. **Health Check**
   ```bash
   curl https://your-api-domain.com/api/health
   ```

2. **Database Connection**
   ```bash
   curl https://your-api-domain.com/api/debug/db
   ```

3. **Authentication Test**
   ```bash
   curl -X POST https://your-api-domain.com/api/auth/login \
   -H "Content-Type: application/json" \
   -d '{"username": "admin", "password": "your_admin_password"}'
   ```

## Frontend Configuration

Update your frontend applications with the new API URL:

### Main Booking Form
```env
REACT_APP_API_URL=https://your-api-domain.com
```

### Admin Dashboard
```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

## Security Checklist

- [ ] All environment variables are set in deployment platform (not in code)
- [ ] JWT secrets are random and secure (minimum 32 characters)
- [ ] Database connection uses SSL in production
- [ ] CORS is configured with specific origins (not wildcard)
- [ ] Rate limiting is enabled
- [ ] No debug endpoints exposed in production

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify database is accessible from deployment platform
   - Ensure database exists and has correct permissions

2. **Authentication Not Working**
   - Verify JWT_SECRET is set correctly
   - Check that admin user exists in database
   - Ensure CORS allows your frontend domain

3. **Booking Submissions Failing**
   - Check FRONTEND_URL matches your actual frontend domain
   - Verify CORS configuration
   - Test API endpoints individually

### Support

For deployment issues:
1. Check deployment platform logs
2. Verify all environment variables are set
3. Test individual API endpoints
4. Check database connection and migrations