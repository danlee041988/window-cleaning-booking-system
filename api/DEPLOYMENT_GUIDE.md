# Somerset Window Cleaning API - Deployment Guide

## Prerequisites

1. **Supabase Database Password**
   - Go to https://supabase.com/dashboard/project/zrmdkyczekmzccenmatu/settings/database
   - Copy your database password

2. **EmailJS Credentials**
   - Get your credentials from https://www.emailjs.com/

3. **reCAPTCHA Secret Key**
   - Get from https://www.google.com/recaptcha/admin

## Deployment to Vercel

### Step 1: Prepare Your Repository

1. Make sure your code is pushed to GitHub
2. Update `.env` file with your Supabase password (DO NOT commit this file)

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the `/api` directory as the root directory
5. Configure Environment Variables:

```env
DATABASE_URL=postgresql://postgres.zrmdkyczekmzccenmatu:[YOUR-PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.zrmdkyczekmzccenmatu:[YOUR-PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://zrmdkyczekmzccenmatu.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpybWRreWN6ZWttemNjZW5tYXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NzE4MjIsImV4cCI6MjA2NDA0NzgyMn0.CpW8RIaUjDH9H2q2l-L6hGb66a0s4whFkbBQThsca1w
EMAILJS_PUBLIC_KEY=[YOUR-KEY]
EMAILJS_PRIVATE_KEY=[YOUR-KEY]
EMAILJS_SERVICE_ID=[YOUR-SERVICE-ID]
EMAILJS_TEMPLATE_ID=[YOUR-TEMPLATE-ID]
RECAPTCHA_SECRET_KEY=[YOUR-KEY]
JWT_SECRET=[GENERATE-A-SECURE-KEY]
JWT_REFRESH_SECRET=[GENERATE-ANOTHER-SECURE-KEY]
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://somerset-admin-dashboard.vercel.app
BCRYPT_ROUNDS=12
SESSION_EXPIRES_HOURS=24
```

6. Click "Deploy"

### Step 3: Set Up Database

After deployment, you need to run database migrations:

1. Install Vercel CLI: `npm i -g vercel`
2. Link to your project: `vercel link`
3. Pull environment variables: `vercel env pull`
4. Run migrations:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

### Step 4: Update Frontend Applications

1. **Booking Form** - Update the API URL in `.env`:
   ```env
   REACT_APP_API_URL=https://your-api.vercel.app
   ```

2. **Admin Dashboard** - Update the API URL:
   - Go to your Vercel dashboard for the admin project
   - Update environment variable:
   ```env
   REACT_APP_API_URL=https://your-api.vercel.app/api
   ```
   - Redeploy the admin dashboard

## Alternative: Deploy to Render

If you prefer Render (better for long-running Node.js apps):

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use these settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add all environment variables from above

## Post-Deployment Checklist

- [ ] Test booking form submission
- [ ] Verify emails are being sent
- [ ] Login to admin dashboard
- [ ] Check that leads are being stored
- [ ] Test all CRUD operations
- [ ] Verify CORS is working correctly

## Security Notes

1. **Never commit `.env` files**
2. **Use strong JWT secrets** (generate with: `openssl rand -base64 32`)
3. **Keep your Supabase password secure**
4. **Enable Row Level Security (RLS) in Supabase for production**

## Monitoring

Consider setting up:
- Vercel Analytics for API monitoring
- Supabase Dashboard for database monitoring
- Error tracking (Sentry, LogRocket, etc.)