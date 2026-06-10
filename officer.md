# Dayitva — Officer Module Documentation

## Role Overview
The **Officer** role represents government officials who create and manage tenders. Officers require full KYC approval by an Auditor before they can publish any tenders.

## Permissions
- ✅ Create tenders (after KYC approved by Auditor)
- ✅ Manage own tenders (edit, close, evaluate, declare winner)
- ✅ View bids on owned tenders
- ✅ Publish tenders on blockchain (real MetaMask tx)
- ❌ Approve/Reject KYC (Auditor only)
- ❌ View other officer's tenders
- ❌ Access auditor dashboard

## Page Structure

| Route | Page | Description |
|-------|------|-------------|
| `/officer/dashboard` | Officer Dashboard | KYC status banner, stats, action cards, tenders list |
| `/officer/create-tender` | Create Tender | KYC-gated multi-step tender creation form |
| `/officer/my-tenders` | My Tenders | Searchable list of all officer's tenders |
| `/officer/profile` | Officer Profile | Profile info + KYC upload section |
| `/tenders/[id]` | Tender Detail | View tender, bids, evaluate, declare winner |

## UI Behavior

### KYC Status Banner (Dashboard & My Tenders)
- **Pending/UnderReview/Rejected**: Warning banner with "Complete KYC Now" button
- **Approved**: Success banner with green checkmark
- **Create Tender button**: Disabled with "KYC Required" message when not approved
- Links to `/officer/profile` for KYC document upload

### Officer Profile
- Displays all profile information
- Shows KYCWidget component with:
  - Current KYC status badge (Approved/Rejected/Pending/UnderReview)
  - Upload documents section (disabled if already approved)
  - Auditor remarks display
  - Submission history

### Tender Detail Page
- Back button returns to Officer Dashboard (`/officer/dashboard`)
- Real-time bid updates via Socket.IO
- Blockchain tx hash links to Sepolia Etherscan

## User Flows

### 1. Complete KYC → Create Tender
```
Login → /officer/dashboard → Profile (/officer/profile) → 
Upload KYC Documents → Auditor Reviews → KYC Approved → 
Create Tender (/officer/create-tender) → Publish on Blockchain →
MetaMask Confirmation → Real-time Broadcast to Vendors
```

### 2. Bid Evaluation Flow
```
Tender Detail → View Bids → Score with Multi-Criteria →
Select Winner → Winner Declared → 
Real-time Notification to All Bidders
```

## Backend APIs

### Authentication
- `POST /api/auth/login` - Officer login
- `POST /api/auth/register` - Officer registration
- `GET /api/auth/me` - Current user profile

### Tenders
- `POST /api/tenders` - Create tender (requireOfficerKYC)
- `GET /api/tenders` - List tenders (public)
- `GET /api/tenders/my` - List officer's tenders
- `GET /api/tenders/:id` - Get tender details
- `PUT /api/tenders/:id` - Update tender
- `POST /api/tenders/:id/evaluate` - Evaluate & declare winner
- `POST /api/tenders/:id/publish-blockchain` - Store tx hash

### KYC
- `POST /api/kyc/submit` - Submit KYC documents to IPFS
- `GET /api/kyc/status` - Get KYC status

## Database Schema
- `officers` table: `kycStatus`, `kycDocuments`, `kycRemarks`, `kycReviewedBy`
- `officer_kyc_requests` table: KYC submission & review records
- `blockchain_txs` table: Transaction records with Etherscan links

## Real-Time Behavior (Socket.IO)
- Live bid notifications on tender detail page
- KYC status changes push notifications
- Tender publishes broadcast to vendor dashboard

## Blockchain Integration
- **Network**: Ethereum Sepolia Testnet (Chain ID: 11155111)
- **Wallet**: MetaMask required for transactions
- **Contract**: `createTender()` function
- **Explorer**: `https://sepolia.etherscan.io/tx/{txHash}`
- **Scoring**: Multi-criteria (Price 40%, Financial 15%, Experience 15%, Feedback 10%, Technical 10%, Compliance 5%, Quality 5%)

## Validation Rules
- KYC must be `"Approved"` before creating tenders
- Tender budget must be positive number
- Deadline must be in the future
- Title min 5 chars, Description min 20 chars