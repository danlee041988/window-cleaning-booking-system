#!/bin/bash

# Somerset Window Cleaning API Deployment Script
# This script automates the deployment of the API backend to Vercel

set -e

echo "🚀 Somerset Window Cleaning API Deployment Script"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "window-cleaning-booking-system/api/package.json" ]; then
    echo -e "${RED}Error: Not in the correct directory!${NC}"
    echo "Please run this script from: /Users/danlee/CascadeProjects/somerset-window-cleaning-website"
    exit 1
fi

# Navigate to API directory
cd window-cleaning-booking-system/api

echo -e "\n${YELLOW}Step 1: Installing dependencies...${NC}"
npm install

echo -e "\n${YELLOW}Step 2: Setting up Prisma...${NC}"
npx prisma generate

echo -e "\n${YELLOW}Step 3: Checking environment variables...${NC}"
if [ ! -f ".env.production" ]; then
    echo -e "${RED}Warning: .env.production file not found!${NC}"
    echo "Please create .env.production with the following variables:"
    echo "  - DATABASE_URL"
    echo "  - DIRECT_URL" 
    echo "  - JWT_SECRET"
    echo "  - JWT_REFRESH_SECRET"
    echo "  - FRONTEND_URL"
    read -p "Press enter to continue after creating .env.production..."
fi

echo -e "\n${YELLOW}Step 4: Running database migrations...${NC}"
read -p "Have you configured the DATABASE_URL in .env.production? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma migrate deploy
else
    echo -e "${RED}Skipping migrations. Please run manually: npx prisma migrate deploy${NC}"
fi

echo -e "\n${YELLOW}Step 5: Deploying to Vercel...${NC}"
echo "You will be prompted to:"
echo "  1. Link to an existing project or create new"
echo "  2. Configure project settings"
echo "  3. Set environment variables"

read -p "Ready to deploy? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel --prod
    
    echo -e "\n${GREEN}✅ Deployment complete!${NC}"
    echo -e "\n${YELLOW}Next steps:${NC}"
    echo "1. Note your API URL from the deployment output"
    echo "2. Update the frontend configurations with the new API URL:"
    echo "   - window-cleaning-booking-system/src/config/environment.js"
    echo "   - admin-dashboard/src/services/api.ts"
    echo "3. Test the deployment using the verification checklist"
    echo "4. Run verification tests:"
    echo "   curl https://[YOUR-API-URL]/api/health"
else
    echo "Deployment cancelled."
fi

echo -e "\n${YELLOW}Post-deployment checklist:${NC}"
echo "[ ] API health check passes"
echo "[ ] Database connection verified" 
echo "[ ] Test booking submission works"
echo "[ ] Admin dashboard can retrieve leads"
echo "[ ] Authentication flow works"
echo "[ ] CORS configured correctly"

echo -e "\n${GREEN}Script complete!${NC}"