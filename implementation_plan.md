# Implementation Plan

Fix all critical bugs, errors, and inconsistencies across the Dayitva (Decentralized TenderChain) system to ensure login works properly, blockchain integration operates correctly, and all user flows function without errors.

The system has 5 distinct user roles (officer, vendor, auditor, public, admin) with independent login flows. Multiple inconsistencies exist between backend models, frontend types, route definitions, and component logic. The blockchain part uses Ganache with MetaMask but has simulation fallbacks that need refinement. This plan addresses every identified issue systematically.

[Types]

Fix all 3 type mismatch clusters that cause runtime errors and broken UI.

1. **TenderStatus type fix (critical)**:
   - Backend `types/index.ts`: `TenderStatus` = `"Draft" | "Open" | "Closed" | "UnderEvaluation" | "Awarded" | "Cancelled"` (correct)
   - Frontend `types/index.ts`: Change `"Under Evaluation"` → `"UnderEvaluation"` to match backend
   - Frontend `lib/constants.ts`: Change `UNDER_EVALUATION: "UnderEvaluation"` (already correct value, keep)
   - Remove `"Expired"` from frontend tender status display since backend has it in Prisma enum but types don't

2. **Notification model alignment**:
   - Backend `prisma/schema.prisma`: Notification model has `userId`, `vendorId`, `officerId` fields
   - Notification routes query by `userId` but services create with `vendorId`/`officerId`
   - Fix: Route handlers should check both `vendorId` and `officerId` when querying by `userId`
   - Or simpler: services should use `userId` field when creating notifications, not `vendorId`/`officerId`

3. **Remove Public role (scope simplification)**:
   - Remove `/public/login` and `/public/register` page files and all references
   - Remove `"public"` from `RegisterRequest` role type in frontend `authService.ts`
   - Remove public role redirect logic from `ClientProviders.tsx` and login pages
   - No backend changes needed since backend never supported it

[Files]

Modify 25+ files across frontend and backend to fix all inconsistencies.

**Files to modify:**

1. `Frontend/src/types/index.ts` — Fix TenderStatus: `"Under Evaluation"` → `"UnderEvaluation"`, add missing `"Expired"` and `"Cancelled"` statuses
2. `Frontend/src/lib/constants.ts` — Add missing `EXPIRED` constant
3. `Frontend/src/context/AppContext.tsx` — Fix notification query to use both `vendorId` and `officerId`
4. `Frontend/src/services/authService.ts` — Remove `"public"` and `"auditor"` from `RegisterRequest` role enum
5. `Frontend/src/services/api.ts` — Fix response interceptor to not show toasts for 401 errors (already handled by token refresh)
6. `Frontend/src/hooks/useAuth.ts` — Remove `register` from export as it's unused pattern
7. `Frontend/src/app/public/login/page.tsx` — **DELETE** entire file
8. `Frontend/src/app/public/register/page.tsx` — **DELETE** entire file
9. `Frontend/src/app/public/page.tsx` — **DELETE** entire file (if exists)
10. `Frontend/src/app/login/page.tsx` — Fix redirect after login to go to correct dashboards; remove "public" role handling
11. `Frontend/src/app/login/vendor/page.tsx` — Fix redirect from `/vendor` to `/vendor/dashboard`
12. `Frontend/src/app/login/organizer/page.tsx` — Fix redirect from `/admin` to `/officer` (consistency)
13. `Frontend/src/app/register/page.tsx` — Remove auditor registration tab (auditor has separate flow); fix vendor/officer registration to properly handle email verification redirect
14. `Frontend/src/app/officer/page.tsx` — Deprecate, redirect to `/admin`
15. `Frontend/src/app/officer/dashboard/page.tsx` — Deprecate or fix to load proper data
16. `Frontend/src/app/auth/vendor/page.tsx` — Fix redirect to correct login page
17. `Frontend/src/app/auth/admin/page.tsx` — Fix redirect to correct login page
18. `Frontend/src/app/auditor/login/page.tsx` — Remove fake OTP modal, show real authentication flow
19. `Frontend/src/components/ClientProviders.tsx` — Remove public role routing, fix redirect logic for authenticated users
20. `Frontend/src/routes/notifications.routes.ts` — Fix query to use `OR` condition for `vendorId`/`officerId` with the authenticated user ID

**Backend files to modify:**

21. `Backend/src/routes/notifications.routes.ts` — Fix notification query to use `OR: [{ vendorId: userId }, { officerId: userId }]` instead of `userId`
22. `Backend/src/services/auth.service.ts` — Add `"auditor"` to the `findUserById` function or create dedicated function
23. `Backend/src/services/blockchain.service.ts` — Fix `generateTxData` simulation to use `ethers.Wallet.createRandom()` for consistent address generation
24. `Backend/src/controllers/notification.controller.ts` (if exists) — Fix controller to match service

**Files with no changes needed but verified correct:**
- `Backend/src/types/index.ts` — Types are correct
- `Backend/prisma/schema.prisma` — Schema is correct (no structural changes)
- `Backend/contracts/DecentralizedTenderChain.sol` — Contract logic is correct
- `Backend/src/middleware/auth.ts` — JWT auth correct

[Functions]

Fix 12+ function implementations across services, controllers, and hooks.

1. `Backend/src/routes/notifications.routes.ts` — Fix `GET /api/notifications` handler:
   - Change `where: { userId: myId }` → `where: { OR: [{ vendorId: myId }, { officerId: myId }] }`
   - Fix `POST mark-read` handler similarly
   - Fix `GET unread-count` handler similarly
   - Fix `DELETE /` handler similarly

2. `Frontend/src/context/AppContext.tsx` — Fix `fetchNotifications`:
   - Update to handle the fixed backend response format

3. `Frontend/src/app/login/page.tsx`:
   - `handleCredentialLogin`: Fix redirect path — officer goes to `/admin`, vendor goes to `/vendor`
   
4. `Frontend/src/app/login/vendor/page.tsx`:
   - `handleCredentialLogin`: Fix redirect from `/vendor` to `/vendor`
   
5. `Frontend/src/app/login/organizer/page.tsx`:
   - `handleCredentialLogin`: Fix redirect from `/admin` to `/admin`

6. `Frontend/src/app/register/page.tsx`:
   - Remove auditor registration tab entirely (auditor registers via `/auditor/register`)
   - Fix `handleVendorSubmit` and `handleOfficerSubmit` to not require file upload for registration
   
7. `Frontend/src/app/auditor/login/page.tsx`:
   - Remove fake OTP modal flow
   - After login, redirect to `/auditor/dashboard` directly

8. `Frontend/src/app/vendor/page.tsx`:
   - Fix `handleBidSubmit` to use proper API endpoint
   - Fix `submitSimpleBid` to show proper success/error handling

9. `Frontend/src/components/ClientProviders.tsx`:
   - Remove public user redirect logic
   - Fix `useEffect` redirect condition to check all 3 roles properly

10. `Frontend/src/app/page.tsx`:
    - Fix `tenderService.listTenders()` to use proper params for the landing page
    - Remove broken news API reference if `/api/live-news` route doesn't work

[Classes]

No class modifications needed. All backend services use function-based exports (except `AuditorService` which is a class — already correct).

[Dependencies]

No new dependencies needed. All packages are installed and correctly versioned.

[Testing]

Verify by starting both backend and frontend, then testing each user flow manually.

Test flows to verify:
1. **Officer Registration** → Email verification → Login → Dashboard → Create Tender
2. **Vendor Registration** → Email verification → Login → Dashboard → Submit Bid
3. **Auditor Registration** → Login → Auditor Dashboard → Approve/Reject KYC
4. **Blockchain** → MetaMask connect → Submit blockchain transaction → Verify tx stored
5. **Notifications** → After bid submission/bid reveal → Notification appears in dashboard

[Implementation Order]

Apply changes in 6 phases to minimize conflicts and ensure testability after each phase.

Phase 1: Backend notification fix (1 file, 4 function changes)
Phase 2: Frontend type fixes and dead code removal (6 files)
Phase 3: Login/register flow fixes (6 files)
Phase 4: Auditors page fix and routing cleanup (3 files)
Phase 5: Blockchain integration verification (2 files)
Phase 6: End-to-end testing and verification