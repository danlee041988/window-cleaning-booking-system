# Vercel Environment Variables Setup

## Required Environment Variables

To fix the admin dashboard authentication, these environment variables must be set in your Vercel dashboard:

### 1. Database Configuration
```
DATABASE_URL=postgresql://postgres.zrmdkyczekmzccenmatu:ga6Y1BrAH1cqEZu@aws-0-eu-west-2.pooler.supabase.com/postgres
```

### 2. JWT Authentication
```
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_REFRESH_SECRET=your_secure_refresh_secret_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. EmailJS Configuration (if needed for API)
```
EMAILJS_SERVICE_ID=service_your_id
EMAILJS_TEMPLATE_ID=template_your_id
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key
```

### 4. Other Configuration
```
NODE_ENV=production
FRONTEND_URL=https://window-cleaning-booking-system.vercel.app
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your API project: `window-cleaning-booking-system`
3. Go to Settings → Environment Variables
4. Add each variable above with the correct values

## Generate JWT Secrets

You can generate secure JWT secrets using Node.js:

```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

## After Setting Environment Variables

1. Redeploy your API (trigger a new deployment)
2. Test authentication: 
   ```bash
   curl -X POST https://window-cleaning-booking-system-6k15.vercel.app/api/auth/login \
   -H "Content-Type: application/json" \
   -d '{"username": "admin", "password": "admin123"}'
   ```

## Expected Success Response
```json
{
  "success": true,
  "user": {
    "id": 3,
    "username": "admin",
    "email": "admin@somersetwindowcleaning.co.uk",
    "role": "ADMIN"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```