# Dayitva – Test Case Specification

**Project**: Dayitva – Decentralized TenderChain  
**Version**: 1.0.0  
**Document Type**: Test Case Specification (TCS)  
**Date**: 2025-06-02  
**Environment**: Development / QA  
**Base URL (Backend)**: `http://localhost:4000`  
**Base URL (Frontend)**: `http://localhost:3000`  

---

## Table of Contents

| # | Module | Test Cases |
|---|--------|-----------|
| 1 | Authentication | TC-001 to TC-005 |
| 2 | KYC Verification | TC-006 to TC-008 |
| 3 | Tender Management | TC-009 to TC-013 |
| 4 | Bidding System | TC-014 to TC-017 |
| 5 | Dispute Resolution | TC-018 to TC-020 |
| 6 | File Upload (IPFS / S3) | TC-021 to TC-022 |
| 7 | Real-time Notifications | TC-023 to TC-024 |
| 8 | Role-Based Access Control | TC-025 |

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Test Passed |
| ❌ | Test Failed |
| ⏳ | Pending Execution |
| 🚫 | Blocked |

---

## Module 1 – Authentication

---

### TC-001: User Registration (Vendor)

| Field | Details |
|-------|---------|
| **Test ID** | TC-001 |
| **Module** | Authentication |
| **Priority** | Critical |
| **Type** | Functional |

**Objective**: Verify that a new user (Vendor role) can register successfully.

**Preconditions**:
- Backend server is running on port 4000.
- Database is connected and migrated.

**Steps**:
1. Send `POST /api/auth/register` with the following body:
   ```json
   {
     "name": "Test Vendor",
     "email": "vendor@dayitva.test",
     "password": "Vendor@1234",
     "role": "VENDOR"
   }
   ```
2. Check HTTP response status.
3. Verify the response body contains `accessToken`, `refreshToken`, and `user` object.
4. Confirm user is persisted in the database via `GET /api/users/profile`.

**Expected Result**:
- HTTP Status: `201 Created`
- Response contains `accessToken` and `refreshToken`
- User record exists in DB with hashed password (not plaintext)

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

### TC-002: User Login

| Field | Details |
|-------|---------|
| **Test ID** | TC-002 |
| **Module** | Authentication |
| **Priority** | Critical |
| **Type** | Functional |

**Objective**: Verify that a registered user can login with valid credentials.

**Preconditions**:
- User registered via TC-001 exists.

**Steps**:
1. Send `POST /api/auth/login`:
   ```json
   {
     "email": "vendor@dayitva.test",
     "password": "Vendor@1234"
   }
   ```
2. Capture returned `accessToken`.
3. Send `GET /api/users/profile` with `Authorization: Bearer <accessToken>`.
4. Verify profile data matches registered user.

**Expected Result**:
- HTTP Status: `200 OK`
- `accessToken` and `refreshToken` are returned
- Profile endpoint returns correct user data

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

### TC-003: Login with Invalid Credentials

| Field | Details |
|-------|---------|
| **Test ID** | TC-003 |
| **Module** | Authentication |
| **Priority** | High |
| **Type** | Negative |

**Objective**: Ensure login fails gracefully with wrong credentials.

**Preconditions**: Registered user from TC-001.

**Steps**:
1. Send `POST /api/auth/login` with wrong password:
   ```json
   {
     "email": "vendor@dayitva.test",
     "password": "WrongPass@999"
   }
   ```
2. Observe HTTP status and error message.

**Expected Result**:
- HTTP Status: `401 Unauthorized`
- Error message: `"Invalid credentials"` (no sensitive data exposed)

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

### TC-004: JWT Token Refresh

| Field | Details |
|-------|---------|
| **Test ID** | TC-004 |
| **Module** | Authentication |
| **Priority** | High |
| **Type** | Functional |

**Objective**: Verify that an expired access token can be refreshed using the refresh token.

**Preconditions**:
- Valid `refreshToken` from TC-002 is available.

**Steps**:
1. Send `POST /api/auth/refresh` with:
   ```json
   { "refreshToken": "<refreshToken>" }
   ```
2. Use the new `accessToken` to call `GET /api/users/profile`.

**Expected Result**:
- HTTP Status: `200 OK`
- New `accessToken` is issued
- New token is valid for protected routes

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

### TC-005: Password Reset Workflow

| Field | Details |
|-------|---------|
| **Test ID** | TC-005 |
| **Module** | Authentication |
| **Priority** | Medium |
| **Type** | Functional |

**Objective**: Verify the full password reset flow.

**Preconditions**: Registered user with a valid email.

**Steps**:
1. Send `POST /api/auth/forgot-password` with `{ "email": "vendor@dayitva.test" }`.
2. Capture the reset token from email / response (test mode).
3. Send `POST /api/auth/reset-password` with token and new password.
4. Login with new password using TC-002 flow.

**Expected Result**:
- HTTP Status: `200 OK` at each step
- Login succeeds with new password
- Old password no longer works

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

## Module 2 – KYC Verification

---

### TC-006: Vendor Submits KYC Documents

| Field | Details |
|-------|---------|
| **Test ID** | TC-006 |
| **Module** | KYC |
| **Priority** | High |
| **Type** | Functional |

**Objective**: Verify a Vendor can submit KYC documents for review.

**Preconditions**:
- Vendor logged in (TC-002); `accessToken` available.
- Valid document files prepared (PDF/JPG < 5 MB).

**Steps**:
1. Send `POST /api/users/kyc/submit` as multipart form-data with:
   - `documentType`: `"COMPANY_REGISTRATION"`
   - `file`: sample PDF
2. Check response for KYC submission ID.
3. Send `GET /api/users/kyc/status` and verify status is `PENDING`.

**Expected Result**:
- HTTP Status: `201 Created`
- KYC status is `PENDING`
- Document stored on IPFS or S3

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

### TC-007: Officer Approves KYC

| Field | Details |
|-------|---------|
| **Test ID** | TC-007 |
| **Module** | KYC |
| **Priority** | High |
| **Type** | Functional |

**Objective**: Verify an Officer can approve a submitted KYC request.

**Preconditions**:
- TC-006 completed (KYC in PENDING state).
- Officer account logged in with valid `accessToken`.

**Steps**:
1. Officer sends `PUT /api/users/kyc/:id/review` with body:
   ```json
   { "status": "APPROVED", "remarks": "Documents verified" }
   ```
2. Vendor queries `GET /api/users/kyc/status`.

**Expected Result**:
- HTTP Status: `200 OK`
- KYC status changes to `APPROVED`
- Vendor receives real-time notification

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

### TC-008: Officer Rejects KYC

| Field | Details |
|-------|---------|
| **Test ID** | TC-008 |
| **Module** | KYC |
| **Priority** | Medium |
| **Type** | Functional |

**Objective**: Verify an Officer can reject a KYC with a valid reason.

**Preconditions**: TC-006 completed.

**Steps**:
1. Officer sends `PUT /api/users/kyc/:id/review` with:
   ```json
   { "status": "REJECTED", "remarks": "Documents unclear" }
   ```
2. Verify Vendor's KYC status shows `REJECTED` with reason.

**Expected Result**:
- HTTP Status: `200 OK`
- KYC status is `REJECTED`
- Rejection reason persisted and returned

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

## Module 3 – Tender Management

---

### TC-009: Officer Creates a Tender

| Field | Details |
|-------|---------|
| **Test ID** | TC-009 |
| **Module** | Tenders |
| **Priority** | Critical |
| **Type** | Functional |

**Objective**: Verify an Officer can create a new public tender.

**Preconditions**:
- Officer logged in with valid `accessToken`.

**Steps**:
1. Send `POST /api/tenders` with:
   ```json
   {
     "title": "Road Construction – Phase 1",
     "description": "Construction of 5km highway section",
     "budget": 5000000,
     "deadline": "2025-09-30T23:59:59Z",
     "category": "INFRASTRUCTURE"
   }
   ```
2. Capture `tenderId` from response.
3. Send `GET /api/tenders/:tenderId` and verify data.

**Expected Result**:
- HTTP Status: `201 Created`
- Tender status is `OPEN`
- Tender visible in `GET /api/tenders` listing

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

### TC-010: List and Filter Tenders

| Field | Details |
|-------|---------|
| **Test ID** | TC-010 |
| **Module** | Tenders |
| **Priority** | High |
| **Type** | Functional |

**Objective**: Verify tenders can be listed with filter and search parameters.

**Preconditions**: At least one tender created (TC-009).

**Steps**:
1. Send `GET /api/tenders?status=OPEN&category=INFRASTRUCTURE&search=Road`.
2. Verify results are filtered correctly.
3. Test pagination with `?page=1&limit=10`.

**Expected Result**:
- HTTP Status: `200 OK`
- Results match applied filters
- Pagination metadata (`total`, `page`, `limit`) present in response

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

### TC-011: Update a Tender

| Field | Details |
|-------|---------|
| **Test ID** | TC-011 |
| **Module** | Tenders |
| **Priority** | Medium |
| **Type** | Functional |

**Objective**: Verify an Officer can update tender details before the deadline.

**Preconditions**: TC-009 completed; Officer token available.

**Steps**:
1. Send `PUT /api/tenders/:tenderId` with updated `budget: 5500000`.
2. Verify updated value with `GET /api/tenders/:tenderId`.

**Expected Result**:
- HTTP Status: `200 OK`
- Budget reflects `5500000`

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

### TC-012: Vendor Cannot Create a Tender

| Field | Details |
|-------|---------|
| **Test ID** | TC-012 |
| **Module** | Tenders |
| **Priority** | High |
| **Type** | Negative / RBAC |

**Objective**: Verify that a Vendor cannot create a tender (role restriction).

**Preconditions**: Vendor logged in with valid `accessToken`.

**Steps**:
1. Send `POST /api/tenders` with Vendor token.

**Expected Result**:
- HTTP Status: `403 Forbidden`
- Error message: `"Insufficient permissions"`

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

### TC-013: Delete a Tender

| Field | Details |
|-------|---------|
| **Test ID** | TC-013 |
| **Module** | Tenders |
| **Priority** | Medium |
| **Type** | Functional |

**Objective**: Verify an Officer can delete a tender.

**Preconditions**: TC-009 completed.

**Steps**:
1. Send `DELETE /api/tenders/:tenderId` with Officer token.
2. Verify with `GET /api/tenders/:tenderId`.

**Expected Result**:
- HTTP Status: `200 OK` on delete
- Follow-up `GET` returns `404 Not Found`

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

## Module 4 – Bidding System

---

### TC-014: Vendor Submits a Bid

| Field | Details |
|-------|---------|
| **Test ID** | TC-014 |
| **Module** | Bidding |
| **Priority** | Critical |
| **Type** | Functional |

**Objective**: Verify a KYC-approved Vendor can submit a bid on an open tender.

**Preconditions**:
- TC-007 (Vendor KYC Approved) and TC-009 (Tender Created) completed.
- Vendor `accessToken` available.

**Steps**:
1. Send `POST /api/tenders/:tenderId/bids` with:
   ```json
   {
     "amount": 4800000,
     "proposal": "We will complete the project in 8 months using high-grade materials.",
     "timeline": "8 months"
   }
   ```
2. Capture `bidId` from response.

**Expected Result**:
- HTTP Status: `201 Created`
- Bid appears in `GET /api/tenders/:tenderId/bids`

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

### TC-015: Officer Views and Evaluates Bids

| Field | Details |
|-------|---------|
| **Test ID** | TC-015 |
| **Module** | Bidding |
| **Priority** | High |
| **Type** | Functional |

**Objective**: Verify an Officer can list and review all bids on a tender.

**Preconditions**: TC-014 completed.

**Steps**:
1. Officer sends `GET /api/tenders/:tenderId/bids`.
2. Verify bid list contains TC-014 bid with correct amount.

**Expected Result**:
- HTTP Status: `200 OK`
- Bid details (amount, proposal, status) visible

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

### TC-016: Officer Awards a Bid

| Field | Details |
|-------|---------|
| **Test ID** | TC-016 |
| **Module** | Bidding |
| **Priority** | Critical |
| **Type** | Functional |

**Objective**: Verify an Officer can award the tender to a winning bid.

**Preconditions**: TC-015 completed.

**Steps**:
1. Officer sends `PUT /api/tenders/:tenderId/bids/:bidId/award`.
2. Check bid status and tender status.

**Expected Result**:
- HTTP Status: `200 OK`
- Awarded bid status: `AWARDED`
- Tender status changes to `CLOSED`
- Vendor receives real-time notification

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

### TC-017: Vendor Updates/Deletes Own Bid Before Deadline

| Field | Details |
|-------|---------|
| **Test ID** | TC-017 |
| **Module** | Bidding |
| **Priority** | Medium |
| **Type** | Functional |

**Objective**: Verify a Vendor can update or retract their bid before the tender deadline.

**Preconditions**: TC-014 completed; tender deadline is in the future.

**Steps**:
1. Vendor sends `PUT /api/tenders/:tenderId/bids/:bidId` with `amount: 4700000`.
2. Verify updated amount.
3. Vendor sends `DELETE /api/tenders/:tenderId/bids/:bidId`.
4. Verify bid is removed.

**Expected Result**:
- HTTP Status: `200 OK` for update
- HTTP Status: `200 OK` for delete
- Bid no longer appears in listing

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

## Module 5 – Dispute Resolution

---

### TC-018: Vendor Raises a Dispute

| Field | Details |
|-------|---------|
| **Test ID** | TC-018 |
| **Module** | Disputes |
| **Priority** | High |
| **Type** | Functional |

**Objective**: Verify a Vendor can raise a dispute against a tender decision.

**Preconditions**: Vendor is logged in; Tender ID is known.

**Steps**:
1. Vendor sends `POST /api/disputes` with:
   ```json
   {
     "tenderId": "<tenderId>",
     "subject": "Unfair Award Decision",
     "description": "The awarded bid was higher than ours with similar qualifications."
   }
   ```
2. Capture `disputeId`.

**Expected Result**:
- HTTP Status: `201 Created`
- Dispute status: `OPEN`

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

### TC-019: Auditor Views and Resolves a Dispute

| Field | Details |
|-------|---------|
| **Test ID** | TC-019 |
| **Module** | Disputes |
| **Priority** | High |
| **Type** | Functional |

**Objective**: Verify an Auditor can view and resolve an open dispute.

**Preconditions**: TC-018 completed; Auditor `accessToken` available.

**Steps**:
1. Auditor sends `GET /api/disputes/:disputeId`.
2. Auditor sends `PUT /api/disputes/:disputeId` with:
   ```json
   {
     "status": "RESOLVED",
     "resolution": "After review, the original award is upheld."
   }
   ```

**Expected Result**:
- HTTP Status: `200 OK`
- Dispute status updated to `RESOLVED`
- Resolution reason persisted

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

### TC-020: Unauthorized Role Cannot Resolve Dispute

| Field | Details |
|-------|---------|
| **Test ID** | TC-020 |
| **Module** | Disputes |
| **Priority** | High |
| **Type** | Negative / RBAC |

**Objective**: Ensure a Vendor cannot resolve a dispute (role restriction).

**Preconditions**: TC-018 completed; Vendor `accessToken` available.

**Steps**:
1. Vendor sends `PUT /api/disputes/:disputeId` with status `RESOLVED`.

**Expected Result**:
- HTTP Status: `403 Forbidden`
- Error message: `"Insufficient permissions"`

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

## Module 6 – File Upload

---

### TC-021: Upload File to IPFS (Pinata)

| Field | Details |
|-------|---------|
| **Test ID** | TC-021 |
| **Module** | File Upload |
| **Priority** | High |
| **Type** | Functional |

**Objective**: Verify file upload to IPFS via Pinata integration.

**Preconditions**:
- `PINATA_API_KEY` and `PINATA_SECRET` configured in `.env`.
- Authenticated user token available.

**Steps**:
1. Send `POST /api/uploads/ipfs` as multipart/form-data with a PDF file.
2. Check response for `ipfsHash` (CID).
3. Verify file is accessible via `https://gateway.pinata.cloud/ipfs/<CID>`.

**Expected Result**:
- HTTP Status: `201 Created`
- Response contains a valid IPFS CID
- File is publicly accessible via gateway URL

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

### TC-022: Upload File to AWS S3

| Field | Details |
|-------|---------|
| **Test ID** | TC-022 |
| **Module** | File Upload |
| **Priority** | High |
| **Type** | Functional |

**Objective**: Verify file upload to AWS S3 integration.

**Preconditions**:
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET` configured in `.env`.

**Steps**:
1. Send `POST /api/uploads/s3` as multipart/form-data with an image file.
2. Verify response contains `fileUrl` (S3 URL).
3. Perform an HTTP GET on the `fileUrl` to confirm accessibility.

**Expected Result**:
- HTTP Status: `201 Created`
- Valid S3 URL returned
- File accessible via the URL

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

## Module 7 – Real-time Notifications

---

### TC-023: Real-time Notification on Tender Publish

| Field | Details |
|-------|---------|
| **Test ID** | TC-023 |
| **Module** | Notifications / Socket.io |
| **Priority** | High |
| **Type** | Functional |

**Objective**: Verify that Vendors receive real-time notifications when a new tender is published.

**Preconditions**:
- Vendor is logged in to the frontend (`http://localhost:3000`).
- Socket.io connection established.
- Officer is logged in a separate browser tab.

**Steps**:
1. Open browser tab A as Vendor; verify socket connected.
2. Open browser tab B as Officer.
3. Officer creates a new tender (TC-009 flow).
4. Observe tab A for incoming notification.

**Expected Result**:
- Notification banner appears in Vendor's UI within 2 seconds
- Notification references the correct tender title

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

### TC-024: Mark Notification as Read

| Field | Details |
|-------|---------|
| **Test ID** | TC-024 |
| **Module** | Notifications |
| **Priority** | Medium |
| **Type** | Functional |

**Objective**: Verify a user can mark a notification as read.

**Preconditions**:
- At least one unread notification exists (from TC-023).

**Steps**:
1. Send `GET /api/notifications` and capture a `notificationId`.
2. Send `PUT /api/notifications/:notificationId/read`.
3. Send `GET /api/notifications` again.

**Expected Result**:
- HTTP Status: `200 OK`
- Notification `read` field changes from `false` to `true`

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

## Module 8 – Role-Based Access Control (RBAC)

---

### TC-025: Protected Route Access Without Token

| Field | Details |
|-------|---------|
| **Test ID** | TC-025 |
| **Module** | Security / RBAC |
| **Priority** | Critical |
| **Type** | Security / Negative |

**Objective**: Verify that protected API routes reject unauthenticated requests.

**Preconditions**: None.

**Steps**:
1. Send `GET /api/tenders` **without** any `Authorization` header.
2. Send `POST /api/tenders` without a token.
3. Send `GET /api/users/profile` without a token.

**Expected Result**:
- All requests return HTTP Status: `401 Unauthorized`
- Response body: `"Authentication required"` or similar
- No data is exposed

**Actual Result**: ⏳ Pending  
**Status**: ⏳

---

## Test Execution Summary

| Test ID | Module | Type | Priority | Status |
|---------|--------|------|----------|--------|
| TC-001 | Authentication | Functional | Critical | ⏳ |
| TC-002 | Authentication | Functional | Critical | ⏳ |
| TC-003 | Authentication | Negative | High | ⏳ |
| TC-004 | Authentication | Functional | High | ⏳ |
| TC-005 | Authentication | Functional | Medium | ⏳ |
| TC-006 | KYC | Functional | High | ⏳ |
| TC-007 | KYC | Functional | High | ⏳ |
| TC-008 | KYC | Functional | Medium | ⏳ |
| TC-009 | Tenders | Functional | Critical | ⏳ |
| TC-010 | Tenders | Functional | High | ⏳ |
| TC-011 | Tenders | Functional | Medium | ⏳ |
| TC-012 | Tenders | Negative / RBAC | High | ⏳ |
| TC-013 | Tenders | Functional | Medium | ⏳ |
| TC-014 | Bidding | Functional | Critical | ⏳ |
| TC-015 | Bidding | Functional | High | ⏳ |
| TC-016 | Bidding | Functional | Critical | ⏳ |
| TC-017 | Bidding | Functional | Medium | ⏳ |
| TC-018 | Disputes | Functional | High | ⏳ |
| TC-019 | Disputes | Functional | High | ⏳ |
| TC-020 | Disputes | Negative / RBAC | High | ⏳ |
| TC-021 | File Upload | Functional | High | ⏳ |
| TC-022 | File Upload | Functional | High | ⏳ |
| TC-023 | Notifications | Functional | High | ⏳ |
| TC-024 | Notifications | Functional | Medium | ⏳ |
| TC-025 | Security / RBAC | Security | Critical | ⏳ |

**Total Test Cases**: 25  
**Critical**: 6 | **High**: 14 | **Medium**: 5

---

*Update the **Actual Result** and **Status** columns after each test execution cycle.*  
*Prepared for Dayitva – Decentralized TenderChain v1.0.0*
