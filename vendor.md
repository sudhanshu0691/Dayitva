# Decentralized TenderChain — Vendor Module Documentation

## Role Overview
The **Vendor** role represents companies/businesses that bid on government tenders. Vendors require full KYC approval before they can submit bids.

## Permissions
- ✅ Browse live tenders
- ✅ Submit bids (after KYC approved)
- ✅ Reveal bids (commit-reveal scheme)
- ✅ View own bid history
- ❌ Create tenders
- ❌ Approve/Reject KYC (Auditor only)
- ❌ View other vendor bids
- ❌ Access officer or auditor dashboard

## Page Structure

| Route | Page | Description |
|-------|------|-------------|
| `/vendor` | Vendor Workspace | Main vendor landing page |
| `/vendor/dashboard` | Vendor Dashboard | Live tenders, KYC status banner |
| `/vendor/profile` | Company Profile | Company info + KYC upload section |
| `/tenders/[id]` | Tender Detail | View tender, Place Bid button |

## UI Behavior

### KYC Status Banner (Dashboard)
- **Pending/UnderReview/Rejected**: Shows warning banner with "Complete KYC Now" button linking to `/vendor/profile`
- **Approved**: Shows success banner with green checkmark
- **Place Bid button**: Disabled with "KYC Required" warning when not approved

### Vendor Profile
- Displays company information
- Shows KYCWidget component with:
  - Current KYC status badge
  - Upload documents section (disabled if already approved)
  - Auditor remarks display
  - Submission history

### Tender Detail Page
- **Place Bid button**: Prominent CTA button
- **KYC Restriction**: If KYC not approved:
  - Button disabled with warning message
  - Link to complete KYC in profile
- Back button navigates to Vendor Dashboard (`/vendor/dashboard`) using `router.back()`
- Real-time tender updates via Socket.IO

## User Flows

### 1. KYC Verification Flow
```
Login → Dashboard → Profile → Upload Documents → Wait for Auditor → 
KYC Approved → Can Place Bids
```

### 2. Bid Submission Flow
```
Dashboard → Browse Tenders → Select Tender → View Details → 
Place Bid → MetaMask Confirmation → Transaction Hash Stored → 
Real-time Notification to Officer → Etherscan Link Shown
```

### 3. Bid Reveal Flow
```
My Bids → Select Bid → Reveal Parameters → MetaMask Confirmation →
Bid Scored → Results Published
```

## Backend APIs

### Authentication
- `POST /api/auth/login` - Vendor login
- `POST /api/auth/register` - Vendor registration
- `GET /api/auth/me` - Current user profile

### Tenders
- `GET /api/tenders` - List all tenders
- `GET /api/tenders/:id` - Get tender details

### Bids
- `POST /api/tenders/:id/bids` - Submit bid (KYC required)
- `GET /api/bids/mine` - Get own bids

### KYC
- `POST /api/kyc/submit` - Submit KYC documents
- `GET /api/kyc/status` - Get KYC status

### Blockchain
- `POST /api/blockchain/transaction` - Store MetaMask tx
- `GET /api/blockchain/contract-info` - Get contract details

## Database Changes
- `users` table: `kycStatus`, `kycDocuments`, `kycRemarks`, `kycReviewedBy`, `kycReviewedAt`
- `kyc_requests` table: KYC submission & review records
- `bids` table: Bid data with blockchain transaction hashes
- `blockchain_txs` table: Transaction records with Etherscan links

## Real-Time Behavior
- Vendor receives real-time tender updates via Socket.IO
- New tenders instantly appear on Vendor Dashboard
- KYC status changes push notifications to vendor

## Blockchain Interactions
- **MetaMask Required**: Placing bids requires MetaMask
- **Sepolia Testnet**: All transactions on Ethereum Sepolia
- **Etherscan Links**: Every transaction generates a verification link
- **Contract Functions**: `submitBid()`, `revealBid()`

## Validation Rules
- Vendor must have `kycStatus === "Approved"` to submit bids
- Cannot bid on own tenders (officer role check)
- Bid amount must be positive
- Cannot bid after deadline has passed
- One bid per tender per vendor