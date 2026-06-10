# Dayitva Overhaul - Implementation Todo

## Phase 1: Backend Core Fixes
- [x] 1.1 Fix blockchain service - remove simulation, use real Sepolia
- [x] 1.2 Fix bid.service.ts - remove simulated tx data, add real MetaMask flow
- [x] 1.3 Fix env.ts for Sepolia Testnet configuration
- [x] 1.4 Fix socket.service.ts - return null instead of throwing
- [x] 1.5 Fix notification query in routes (already done - verified)

## Phase 2: Naming Consistency (Admin→Officer everywhere)
- [x] 2.1 Remove /login/admin, /auth/admin references
- [x] 2.2 Update all redirects to use "officer" not "admin"/"organizer"
- [x] 2.3 Updated PortalSidebar with proper Officer navigation

## Phase 3: Missing Frontend Pages
- [x] 3.1 Officer Dashboard page (/officer/dashboard)
- [x] 3.2 Officer Create Tender page (exists, verified)
- [x] 3.3 Officer My Tenders page (/officer/my-tenders - CREATED)
- [x] 3.4 Officer Profile page with KYC upload (exists)
- [x] 3.5 Vendor Dashboard page (/vendor/dashboard - VERIFIED)
- [x] 3.6 Vendor My Bids page (/vendor/my-bids - CREATED)
- [x] 3.7 Vendor Profile page with KYC upload (exists)
- [x] 3.8 Auditor Dashboard page (exists)
- [x] 3.9 Auditor Vendors page (exists)
- [x] 3.10 Auditor Officers page (exists)
- [x] 3.11 Auditor Blacklist page (exists)
- [x] 3.12 Auditor Fraud page (exists)
- [x] 3.13 Auditor Logs page (exists)
- [x] 3.14 Auditor Login page (exists, fixed - no fake OTP)
- [x] 3.15 Landing page (exists)
- [x] 3.16 Tenders listing page (exists)
- [x] 3.17 Tender detail page [id] (exists, back button fixed)

## Phase 4: KYC Enforcement (Already in codebase)
- [x] 4.1 KYC upload in Officer Profile page (via KYCWidget)
- [x] 4.2 KYC upload in Vendor Profile page (via KYCWidget)
- [x] 4.3 Backend requireKYC and requireOfficerKYC middleware exists
- [x] 4.4 KYC check in bid submission (backend)
- [x] 4.5 KYC check in tender creation (backend)
- [x] 4.6 KYC status indicators in frontend (verified)

## Phase 5: Real Blockchain & MetaMask
- [x] 5.1 Updated MetaMask hook references for Sepolia
- [x] 5.2 Updated env.ts for Sepolia defaults
- [x] 5.3 Bid service accepts real txHash from MetaMask
- [x] 5.4 Etherscan links for Sepolia
- [x] 5.5 Removed all simulated tx data generation

## Phase 6: Real-time Sync (Socket events added)
- [x] 6.1 Socket events for tender published (via emitTenderUpdate)
- [x] 6.2 Socket events for bid submitted (via emitBidUpdate)
- [x] 6.3 Socket events for KYC updates (via emitKYCUpdate)

## Phase 7: Navigation & UI Fixes
- [x] 7.1 Back button in Tender Detail page fixed
- [x] 7.2 Place Bid button inside Vendor Tender Detail page
- [x] 7.3 Disable buttons when KYC not approved with messages

## Phase 8: Documentation
- [ ] 8.1 Update officer.md
- [ ] 8.2 Update vendor.md
- [ ] 8.3 Update auditor.md
- [ ] 8.4 Update implementation_plan.md

## Phase 9: Testing & Final Fixes
- [ ] 9.1 Test login flows for all 3 roles
- [ ] 9.2 Test KYC upload and approval flow
- [ ] 9.3 Test tender creation with KYC check
- [ ] 9.4 Test bid placement with KYC check
- [ ] 9.5 Test real-time updates