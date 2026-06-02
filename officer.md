# Decentralized TenderChain — Officer Module Documentation

## Role Overview
The **Officer** role represents government officials who create and manage tenders on the platform. Officers require full KYC approval before they can publish any tenders.

## Permissions
- ✅ Create tenders (after KYC approved)
- ✅ Manage own tenders (edit, close, evaluate)
- ✅ View bids on owned tenders
- ✅ Declare winner on tenders
- ✅ View vendor KYC status (read-only)
- ❌ Approve/Reject KYC (Auditor only)
- ❌ View other officer's tenders
- ❌ Access auditor dashboard

## Page Structure

| Route | Page | Description |
|-------|------|-------------|
| `/officer` | Officer Dashboard | KYC status banner, action cards, tenders list |
| `/officer/create-tender` | Create Tender | KYC-gated tender creation form |
| `/officer/profile` | Officer Profile | Profile info + KYC upload section |
| `/tenders/[id]` | Tender Detail | View tender, bids, declare winner |

## UI Behavior

### KYC Status Banner (Dashboard)
- **Pending/UnderReview/Rejected**: Shows warning banner with "Complete KYC Now" button linking to `/officer/profile`
- **Approved**: Shows success banner with green checkmark
- **Create Tender button**: Disabled with "KYC Required" tooltip when not approved

### Officer Profile
- Displays all profile information
- Shows KYCWidget component with:
  - Current KYC status badge
  - Upload documents section (disabled if already approved)
  - Auditor remarks display
  - Submission history

### Tender Detail Page
- Back button navigates to Officer Dashboard (`/officer`) using `router.back()`
- Real-time bid updates via Socket.IO
- Blockchain transaction links to Etherscan

## User Flows

### 1. KYC Verification Flow
```
Login → Dashboard → Profile → Upload Documents → Wait for Auditor → 
KYC Approved → Can Create Tenders
```

### 2. Tender Creation Flow  
```
Dashboard → Create Tender → Fill Details → Publish on Blockchain →
MetaMask Confirmation → Transaction Hash Stored → 
Real-time Broadcast to Vendors → Etherscan Link Shown
```

### 3. Bid Evaluation Flow
```
Tender Detail → View Bids → Score Bids → Select Winner →
Submit to Blockchain → Winner Declared → Real-time Notification
```

## Backend APIs

### Authentication
- `POST /api/auth/login` - Officer login
- `POST /api/auth/register` - Officer registration
- `GET /api/auth/me` - Current user profile

### Tenders
- `POST /api/tenders` - Create tender (KYC required)
- `GET /api/tenders` - List officer's tenders
- `GET /api/tenders/:id` - Get tender details
- `PUT /api/tenders/:id` - Update tender
- `POST /api/tenders/:id/publish` - Publish on blockchain

### KYC
- `POST /api/kyc/submit` - Submit KYC documents
- `GET /api/kyc/status` - Get KYC status

### Blockchain
- `POST /api/blockchain/transaction` - Store MetaMask tx
- `GET /api/blockchain/contract-info` - Get contract details

## Database Changes
- `users` table: `kycStatus`, `kycDocuments`, `kycRemarks`, `kycReviewedBy`, `kycReviewedAt`
- `kyc_requests` table: KYC submission & review records
- `blockchain_txs` table: Transaction records with Etherscan links

## Real-Time Behavior
- Officer receives real-time bid notifications via Socket.IO
- Tender detail page updates bids in real-time
- KYC status changes push notifications to officer

## Blockchain Interactions
- **MetaMask Required**: Creating/publishing tenders requires MetaMask
- **Sepolia Testnet**: All transactions on Ethereum Sepolia
- **Etherscan Links**: Every transaction generates a verification link
- **Contract Functions**: `createTender()`, `evaluateWithWinner()`

## Validation Rules
- Officer must have `kycStatus === "Approved"` to create tenders
- Tender budget must be positive number
- Deadline must be in the future
- Tender title and description required