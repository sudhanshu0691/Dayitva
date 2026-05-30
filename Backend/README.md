# 🏛️ Decentralized TenderChain — Backend

A production-ready, secure, scalable backend for **Blockchain-Based Transparent E-Procurement & Tender Management System**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| Database | PostgreSQL (Supabase Free Tier) |
| ORM | Prisma |
| Auth | JWT + MetaMask Wallet Signature |
| Blockchain | Ethers.js v6 (Local Ganache) |
| Smart Contracts | Solidity + Hardhat |
| File Storage | IPFS (Pinata) + AWS S3 (Free Tier) |
| Validation | Zod |
| Logging | Winston |
| Security | Helmet, CORS, Rate Limiting, Reentrancy Guard |
| Realtime | Socket.io |

## 📁 Project Structure

```
Backend/
├── prisma/
│   └── schema.prisma          # Database schema (14 tables)
├── contracts/
│   └── DecentralizedTenderChain.sol  # Smart contract
├── scripts/
│   └── deploy.ts              # Hardhat deployment
├── src/
│   ├── config/                # Env, DB, CORS, Contract config
│   ├── middleware/             # Auth, RoleGuard, RateLimiter, Validate, ErrorHandler
│   ├── routes/                # Route definitions
│   ├── controllers/           # HTTP handlers
│   ├── services/              # Business logic
│   ├── validators/            # Zod schemas
│   ├── types/                 # TypeScript interfaces
│   └── utils/                 # Logger, JWT helpers
├── hardhat.config.ts          # Hardhat config
├── .env.example               # Environment template
├── package.json
└── tsconfig.json
```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL (or Supabase account for free tier)
- MetaMask wallet (for blockchain features)

### 2. Install Dependencies

```bash
cd Backend
npm install
```

### 3. Database Setup

```bash
# Copy environment file
cp .env.example .env
# Edit .env with your DATABASE_URL

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 4. Start Development Server

```bash
npm run dev
```

Server starts at: **http://localhost:4000/api**
Health check: **http://localhost:4000/api/health**

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register user (officer/vendor) |
| POST | `/api/auth/login` | ❌ | Login with email/password |
| POST | `/api/auth/nonce` | ❌ | Get MetaMask nonce |
| POST | `/api/auth/metamask` | ❌ | Login with MetaMask signature |
| POST | `/api/auth/refresh` | ❌ | Refresh JWT token |
| POST | `/api/auth/logout` | ✅ | Logout |
| GET | `/api/auth/me` | ✅ | Current user profile |

### Tenders
| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/tenders` | ❌ | Public |
| GET | `/api/tenders/:id` | ❌ | Public |
| POST | `/api/tenders` | ✅ | Officer |
| PUT | `/api/tenders/:id` | ✅ | Officer |
| PATCH | `/api/tenders/:id/status` | ✅ | Officer |
| DELETE | `/api/tenders/:id` | ✅ | Officer |

### Bids
| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| POST | `/api/tenders/:id/bids` | ✅ | Vendor |
| POST | `/api/tenders/:id/bids/reveal` | ✅ | Vendor |
| GET | `/api/tenders/:id/bids` | ✅ | Officer |
| POST | `/api/tenders/:id/evaluate` | ✅ | Officer |

### Users & KYC
| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/users/me` | ✅ | Any |
| PUT | `/api/users/profile` | ✅ | Any |
| POST | `/api/kyc/:vendorId/verify` | ✅ | Officer |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | ✅ | List notifications |
| POST | `/api/notifications/mark-read` | ✅ | Mark as read |
| GET | `/api/notifications/unread-count` | ✅ | Unread count |

## 🔐 Authentication Flow

### MetaMask Wallet
1. **Register** with email/password + wallet address
2. **Request nonce**: `POST /api/auth/nonce` → returns message to sign
3. **Sign** message in MetaMask
4. **Login**: `POST /api/auth/metamask` with signature → returns JWT

### Multi-Criteria Scoring
```
Total = (PriceScore × 40%) + (FinancialStrength × 15%)
      + (PastExperience × 15%) + (PerformanceFeedback × 10%)
      + (TechnicalCapability × 10%) + (Compliance × 5%)
      + (ProposalQuality × 5%)
```

## 🔗 Smart Contract

### Local Ganache Deployment
```bash
# Compile
npx hardhat compile

# Deploy to Ganache
npx hardhat run scripts/deploy.ts --network ganache
```

MetaMask should be connected to the local Ganache network using RPC URL `http://127.0.0.1:7545` and Chain ID `1337`.

### Contract Functions
| Function | Description |
|----------|-------------|
| `createTender()` | Create new tender (officer) |
| `submitBid()` | Submit encrypted bid (vendor) |
| `revealBid()` | Reveal bid after deadline |
| `evaluateWithWinner()` | Declare winner (officer) |
| `getTender()` | View tender details |
| `getBid()` | View bid details |
| `authorizeOfficer()` | Add new officer (owner) |
| `blacklistVendor()` | Blacklist vendor (owner) |

## 🛡️ Security Features

- JWT with short-lived access tokens (15min) + refresh tokens (7 days)
- MetaMask signature verification (never store private keys)
- Password hashing with bcrypt (salt rounds: 12)
- Role-based access control (officer/vendor/public)
- Rate limiting on auth endpoints
- Helmet security headers
- CORS with whitelisted origins
- Zod input validation
- Smart contract: ReentrancyGuard, Pausable, Ownable
- Local blockchain development with Ganache and MetaMask

## 🌐 Frontend Integration

The backend is fully compatible with the existing Next.js frontend at `Frontend/`. 
The API contract matches the frontend's TypeScript types in `src/types/index.ts`.

For real-time updates:
1. Frontend connects via Socket.io to `http://localhost:4000`
2. Emit `join-user` with userId for notifications
3. Emit `join-tender` with tenderId for tender updates

## License

MIT