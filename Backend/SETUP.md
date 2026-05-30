# 🔧 Decentralized TenderChain — Complete Setup Guide

## 📋 Prerequisites (Install These First)

| Software | Version | Download |
|----------|---------|----------|
| Node.js | v18+ | https://nodejs.org |
| PostgreSQL | v14+ | https://www.postgresql.org/download/ |
| VS Code | Latest | https://code.visualstudio.com |
| MetaMask | Browser Extension | https://metamask.io |
| Git | Latest | https://git-scm.com |

---

## 🚀 Step-by-Step Setup

### Step 1: Navigate to Backend Folder
```bash
cd d:\tender\Dayitva\Backend
```

### Step 2: Install All Dependencies
```bash
npm install
```
This installs all packages from `package.json` including:
- Express, Prisma, JWT, bcrypt, ethers, zod, winston, socket.io, etc.

### Step 3: Setup PostgreSQL Database

**Option A: Local PostgreSQL (Recommended for Development)**
1. Install PostgreSQL from https://www.postgresql.org/download/
2. Open pgAdmin or terminal
3. Create database:
```sql
CREATE DATABASE tenderchain;
```
4. Your connection string will be:
```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/tenderchain?schema=public"
```

**Option B: Supabase (Free Tier - Production)**
1. Go to https://supabase.com → Sign up → Create new project
2. In Project Settings → Database → Connection string
3. Copy the URI (use "Session pooler" string)
4. Replace `[YOUR-PASSWORD]` with your actual password

### Step 4: Configure Environment Variables

1. The `.env` file is already created. Open it and update:
```
# CHANGE THIS to your actual PostgreSQL connection string
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/tenderchain?schema=public"

# Keep these as-is for development
JWT_SECRET="dev-jwt-secret-tenderchain-2026-min-32-chars!!"
JWT_REFRESH_SECRET="dev-jwt-refresh-tenderchain-2026-min-32-chars!!"
PORT=4000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
BLOCKCHAIN_SIMULATION_MODE="true"
```

### Step 5: Generate Prisma Client & Push Schema

```bash
# Generate Prisma client from schema
npx prisma generate

# Push schema to database (creates all 14 tables)
npx prisma db push
```

✅ **Verify**: Check your PostgreSQL database - you should see these tables:
`users`, `tenders`, `bids`, `refresh_tokens`, `nonces`, `tender_files`, `vendor_profiles`, `audit_logs`, `notifications`, `blockchain_txs`, `disputes`, `news_feed`

### Step 6: Start the Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Decentralized TenderChain API Server
   Port: 4000
   Environment: development
   Frontend URL: http://localhost:3000
   Blockchain Mode: 🟡 SIMULATION
   API: http://localhost:4000/api
   Health: http://localhost:4000/api/health
```

✅ **Test**: Open browser and visit http://localhost:4000/api/health

### Step 7: Verify Frontend Integration

The frontend runs on **http://localhost:3000** (in a separate terminal).
```bash
cd Frontend
npm run dev
```

---

## 🧪 Testing the API (Using curl or Postman)

### 1. Health Check
```bash
curl http://localhost:4000/api/health
```

### 2. Register an Officer
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rajesh Kumar",
    "email": "rajesh@nic.in",
    "password": "password123",
    "role": "officer",
    "designation": "Director (Procurement)",
    "ministry": "Ministry of Road Transport",
    "ministryCode": "MORTH-IND",
    "permissions": ["CREATE_TENDER", "PUBLISH_BLOCKCHAIN", "APPROVE_KYC"]
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "rajesh@nic.in", "password": "password123"}'
```

Save the `accessToken` from response - you'll need it for authenticated requests.

### 4. Get MetaMask Nonce
```bash
curl -X POST http://localhost:4000/api/auth/nonce \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD17"}'
```

### 5. Create a Tender (using the accessToken)
```bash
curl -X POST http://localhost:4000/api/tenders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Construction of 6-Lane Highway NH-150D",
    "description": "EPC contract for construction of 6-lane access controlled Greenfield highway from km 42.000 to km 76.000 in Maharashtra.",
    "ministry": "Ministry of Road Transport and Highways",
    "budget": 12400000000,
    "deadline": "2026-12-31T17:00:00.000Z",
    "msmeQuota": true,
    "criteria": [
      "Minimum annual turnover of ₹300 Cr",
      "Successful completion of 2 similar highway projects",
      "Solvency certificate of minimum ₹150 Cr"
    ]
  }'
```

### 6. List All Tenders (Public - no auth required)
```bash
curl http://localhost:4000/api/tenders
```

---

## 📡 API Testing Workflow

### Complete Workflow:
1. **Register** an Officer → get JWT token
2. **Create Tender** with Officer token
3. **Register** a Vendor → get JWT token
4. **Submit Bid** on tender with Vendor token
5. **Reveal Bid** after deadline with Vendor token
6. **Evaluate Tender** and declare winner with Officer token
7. **Check Notifications** for both users

---

## 🔗 Smart Contract Deployment (Local Ganache)

### Step 1: Start Ganache
- Open Ganache and start a workspace on port `7545`
- Use Chain ID `1337`
- Copy one of the Ganache private keys for the officer account

### Step 2: Configure `.env`
Set the local blockchain values:
```
ETH_RPC_URL="http://127.0.0.1:7545"
ETH_CHAIN_ID=1337
OFFICER_PRIVATE_KEY="your-ganache-private-key"
CONTRACT_ADDRESS="YOUR_DEPLOYED_CONTRACT_ADDRESS"
BLOCKCHAIN_SIMULATION_MODE="true"
```

### Step 3: Compile & Deploy
```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network ganache
```

### Step 4: Update Contract Address
After deployment, copy the contract address and update `.env`:
```
CONTRACT_ADDRESS="0xDEPLOYED_CONTRACT_ADDRESS"
```

### Step 5: Connect MetaMask
- Add a new network in MetaMask
- Network Name: `Ganache Local`
- RPC URL: `http://127.0.0.1:7545`
- Chain ID: `1337`
- Currency Symbol: `ETH`

---

## ❓ Troubleshooting

### "ECONNREFUSED :5432"
- PostgreSQL is not running. Start it from Services or pgAdmin.

### "DATABASE_URL not set"
- Copy `.env.example` to `.env` and fill in your database URL.

### "PrismaClientInitializationError"
- Run `npx prisma generate` and `npx prisma db push` again.

### "Port 4000 already in use"
- Change `PORT` in `.env` to something else (e.g., 4001).

### "Module not found"
- Run `npm install` again from the Backend directory.

---

## 📁 What's Already Done (Automated)
✅ All 36 backend files created
✅ TypeScript configuration
✅ Prisma schema with 14 tables
✅ Express server with middleware
✅ JWT auth + MetaMask verification
✅ All API endpoints (20+ routes)
✅ Multi-criteria scoring engine
✅ Smart contract (Solidity)
✅ Socket.io for real-time
✅ Winston logging
✅ Rate limiting
✅ Error handling
✅ README + SETUP documentation

## 📝 What You Need to Do Manually
1. Install Node.js and PostgreSQL
2. Create PostgreSQL database (`tenderchain`)
3. Update `.env` with your `DATABASE_URL`
4. Run `npm install`
5. Run `npx prisma generate && npx prisma db push`
6. Run `npm run dev` to start server
7. (Optional) Deploy smart contract to local Ganache