# TenderChain - Complete Setup & Deployment Guide

## 🚀 Project Overview

**Decentralized TenderChain** is a production-ready, blockchain-based E-Procurement & Tender Management System with:

- **Frontend**: Next.js 15 + React 19 + Tailwind CSS + TypeScript
- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io
- **Blockchain**: Ethereum + Smart Contracts
- **File Storage**: IPFS (Pinata) + AWS S3
- **Database**: PostgreSQL (Supabase Free Tier recommended)

---

## 📋 Prerequisites

### Required Software
- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher
- **Git**
- **PostgreSQL** (or Supabase account for cloud database)

### Required Accounts
- **Supabase** (for PostgreSQL) - https://supabase.com (Free tier available)
- **Pinata** (for IPFS) - https://pinata.cloud (Free tier: 1GB storage)
- **AWS Account** (for S3) - https://aws.amazon.com (Free tier available)
- **Ganache** (for local Ethereum) or use Infura/Alchemy

---

## 🔧 Backend Setup

### 1. Navigate to Backend Directory

```bash
cd Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create a `.env` file in the Backend directory (copy from `.env.example`):

```bash
cp .env.example .env
```

### 4. Configure Environment Variables

Edit `.env` with your credentials:

```env
# ============================================
# DATABASE (PostgreSQL - Supabase)
# ============================================
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# ============================================
# JWT AUTHENTICATION
# ============================================
JWT_SECRET="your-super-secret-key-min-32-chars-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-chars-change-in-production"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=4000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# ============================================
# PINATA (IPFS)
# ============================================
PINATA_API_KEY="your_pinata_api_key"
PINATA_SECRET_KEY="your_pinata_secret_key"

# ============================================
# AWS S3
# ============================================
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_REGION="ap-south-1"
AWS_S3_BUCKET="tenderchain-documents"

# ============================================
# ETHEREUM / BLOCKCHAIN
# ============================================
ETH_RPC_URL="http://127.0.0.1:7545"
ETH_CHAIN_ID=1337
CONTRACT_ADDRESS=""
OFFICER_PRIVATE_KEY=""
BLOCKCHAIN_SIMULATION_MODE="true"

# ============================================
# SOCKET.IO
# ============================================
SOCKET_CORS_ORIGIN="http://localhost:3000"

# ============================================
# LOGGING
# ============================================
LOG_LEVEL="debug"
```

### 5. Setup Database

#### Option A: Use Supabase (Recommended)

1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to Project Settings > Database > Connection String
4. Copy the connection string and update `DATABASE_URL` in `.env`
5. Run migrations:

```bash
npm run prisma:push
npm run prisma:seed
```

#### Option B: Use Local PostgreSQL

```bash
# Create database
createdb tenderchain

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/tenderchain"

# Push schema
npm run prisma:push
npm run prisma:seed
```

### 6. Compile TypeScript

```bash
npm run build
```

### 7. Start Development Server

```bash
npm run dev
```

Expected output:
```
🚀 Decentralized TenderChain API Server
   Port: 4000
   Environment: development
   Frontend URL: http://localhost:3000
   API: http://localhost:4000/api
   Health: http://localhost:4000/api/health
```

### 8. Test API Health

```bash
curl http://localhost:4000/api/health
```

---

## 💻 Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd Frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create a `.env.local` file in the Frontend directory:

```env
# ============================================
# API CONFIGURATION
# ============================================
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

# ============================================
# APPLICATION
# ============================================
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_DEBUG=false

# ============================================
# BLOCKCHAIN (Optional - for MetaMask)
# ============================================
NEXT_PUBLIC_CHAIN_ID=1337
NEXT_PUBLIC_RPC_URL=http://localhost:7545
```

### 4. Install Socket.io Client (if not already installed)

```bash
npm install socket.io-client
```

### 5. Start Development Server

```bash
npm run dev
```

Expected output:
```
 ▲ Next.js 15.1.0
 - Local:        http://localhost:3000
```

### 6. Open in Browser

```
http://localhost:3000
```

---

## 🔐 Security Setup

### 1. Update JWT Secrets

Generate secure random strings:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Update in `.env`:
```env
JWT_SECRET="<generated-value>"
JWT_REFRESH_SECRET="<generated-value>"
```

### 2. CORS Configuration

Update `FRONTEND_URL` in backend `.env`:
```env
FRONTEND_URL="https://yourdomain.com"  # Production URL
```

### 3. Database Security

- Change default PostgreSQL password
- Enable SSL connection for database
- Use environment variables for all credentials
- Never commit `.env` to Git

### 4. API Rate Limiting

Already configured in backend middleware:
- General limiter: 100 requests per 15 minutes
- Auth limiter: 5 requests per 15 minutes

---

## 🔗 API Endpoints Reference

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login with email/password
POST   /api/auth/logout            - Logout and revoke tokens
POST   /api/auth/refresh           - Refresh access token
POST   /api/auth/nonce             - Get nonce for MetaMask
POST   /api/auth/metamask          - Login with MetaMask signature
GET    /api/auth/me                - Get current user profile
```

### Users
```
GET    /api/users/:id              - Get user profile
PUT    /api/users/profile          - Update user profile
GET    /api/users/kyc/status       - Get KYC status
POST   /api/users/kyc/submit       - Submit KYC documents
GET    /api/users/kyc/pending      - List pending KYC (Officer only)
PUT    /api/users/kyc/:id/verify   - Verify KYC (Officer only)
GET    /api/users                  - List all users (Officer only)
DELETE /api/users/:id              - Delete user (Officer only)
```

### Tenders
```
GET    /api/tenders                - List tenders (public)
GET    /api/tenders/:id            - Get tender details (public)
POST   /api/tenders                - Create tender (Officer only)
PUT    /api/tenders/:id            - Update tender (Officer only)
PATCH  /api/tenders/:id/status     - Update tender status (Officer only)
DELETE /api/tenders/:id            - Delete tender (Officer only)
POST   /api/tenders/:id/bids       - Submit bid (Vendor only)
GET    /api/tenders/:id/bids       - Get bids (Officer only)
POST   /api/tenders/:id/evaluate   - Evaluate tender (Officer only)
```

### Notifications
```
GET    /api/notifications          - Get notifications
GET    /api/notifications/unread-count - Get unread count
POST   /api/notifications/mark-read - Mark as read
DELETE /api/notifications/:id      - Delete notification
```

### Disputes
```
POST   /api/disputes               - Create dispute
GET    /api/disputes               - List disputes (Officer only)
GET    /api/disputes/:id           - Get dispute details
GET    /api/disputes/tender/:id    - Get disputes for tender
PUT    /api/disputes/:id/status    - Update dispute status (Officer only)
```

### Dashboard & Reports
```
GET    /api/dashboard/officer      - Officer dashboard stats
GET    /api/dashboard/vendor       - Vendor dashboard stats
GET    /api/dashboard/analytics    - System analytics (Officer only)
GET    /api/reports/tenders        - Tender reports
GET    /api/reports/bids           - Bid reports
GET    /api/reports/kyc            - KYC reports (Officer only)
```

### File Uploads
```
POST   /api/uploads/ipfs           - Upload to IPFS
POST   /api/uploads/s3             - Upload to S3
GET    /api/uploads/:hash          - Get IPFS file
DELETE /api/uploads/:key           - Delete S3 file
```

---

## 🧪 Testing

### Test Backend APIs

```bash
# Test API health
curl http://localhost:4000/api/health

# Test registration
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Officer",
    "email": "officer@test.com",
    "password": "Test@123456",
    "role": "officer"
  }'

# Test login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "officer@test.com",
    "password": "Test@123456"
  }'
```

### Test Frontend

1. Open http://localhost:3000
2. Register as Officer or Vendor
3. Create tender (Officer only)
4. Submit bids (Vendor only)
5. Verify KYC (Officer only)
6. Check notifications and dashboard

---

## 📦 Production Deployment

### Backend Deployment (Heroku/Railway)

#### Using Heroku:

```bash
# Install Heroku CLI
brew install heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Add environment variables
heroku config:set DATABASE_URL="your-database-url"
heroku config:set JWT_SECRET="your-secret"
heroku config:set FRONTEND_URL="https://your-frontend.com"

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### Using Railway:

1. Go to railway.app
2. Create new project
3. Add GitHub repository
4. Add PostgreSQL service
5. Add environment variables
6. Deploy

### Frontend Deployment (Vercel)

#### Using Vercel (Recommended):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to configure
```

Or connect GitHub repository to Vercel Dashboard:

1. Go to https://vercel.com
2. Import GitHub repository
3. Set environment variables in Project Settings
4. Auto-deploy on push

#### Environment Variables for Production:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
```

### Database Migration to Production

```bash
# Update DATABASE_URL in .env
DATABASE_URL="production-database-url"

# Run migrations
npm run prisma:push

# (Optional) Run seeds
npm run prisma:seed
```

---

## 🐛 Troubleshooting

### Common Issues

#### "Cannot find module 'crypto'"
```bash
npm install --legacy-peer-deps
npm rebuild
```

#### Database Connection Error
- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Check firewall rules
- Ensure proper credentials

#### CORS Errors
- Update `FRONTEND_URL` in backend `.env`
- Ensure frontend and backend are on same network
- Check Socket.io CORS configuration

#### Port Already in Use
```bash
# Kill process on port 4000 (Backend)
lsof -ti:4000 | xargs kill -9

# Kill process on port 3000 (Frontend)
lsof -ti:3000 | xargs kill -9
```

#### Socket.io Connection Failed
- Check `SOCKET_CORS_ORIGIN` matches frontend URL
- Ensure backend server is running
- Check network connectivity

---

## 📚 Additional Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Express.js Docs**: https://expressjs.com
- **Prisma Docs**: https://www.prisma.io/docs
- **Socket.io Docs**: https://socket.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

---

## 📞 Support

For issues and questions:

1. Check the documentation
2. Search GitHub issues
3. Create new issue with:
   - Error message
   - Steps to reproduce
   - Environment details (Node version, OS, etc.)
   - Screenshots/logs

---

## 📄 License

This project is open source. See LICENSE file for details.

---

## 🙏 Acknowledgments

- Built with Next.js, Express, and Prisma
- UI Components inspired by modern design patterns
- Security practices based on OWASP guidelines

---

**Happy Coding! 🚀**
