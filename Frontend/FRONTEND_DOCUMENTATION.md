# Frontend Documentation — Decentralized TenderChain

यह दस्तावेज़ प्रोजेक्ट के frontend का संक्षिप्त और व्यवस्थित वर्णन देता है ताकि आप backend आसानी से तैयार कर सकें। इसमें पेज/रूट्स, प्रमुख components, अप्लिकेशन स्टेट, टाइप्स और सुझावित backend API end-points शामिल हैं।

---

## 1. प्रोजेक्ट सार (Quick overview)
- Framework: Next.js (app-router)
- React 19, TypeScript
- Styling: Tailwind CSS
- Key folders:
  - `src/app/` — Pages (app-router)
  - `src/components/` — Shared UI & layout components
  - `src/context/` — `AppContext` (single source of truth)
  - `src/lib/` — Utilities (e.g., `cn`)
  - `src/types/` — TypeScript interfaces used across frontend

Files of interest: [package.json](package.json#L1) (scripts & deps), [src/context/AppContext.tsx](src/context/AppContext.tsx#L1), [src/components/ClientProviders.tsx](src/components/ClientProviders.tsx#L1), [src/app/layout.tsx](src/app/layout.tsx#L1), [src/app/api/live-news/route.ts](src/app/api/live-news/route.ts#L1)

---

## 2. How to run / build (frontend)
- Dev: `npm run dev` (starts Next.js dev server)
- Build: `npm run build` then `npm start` for production
- Important: `.next/` और `node_modules/` Git में commit न करें (already in `.gitignore`).

---

## 3. Pages & routes (app-router)
नीचे `src/app` के प्रमुख pages और उनका उद्देश्य है:

- `/` — Home (`src/app/page.tsx`) — सार्वजनिक लैंडिंग / खोज
- `/about` — About
- `/public` — Public audit / listings
- `/login` — Login (client-side flows)
- `/register` — Vendor / Officer registration
- `/auth/admin` — Admin auth page
- `/auth/vendor` — Vendor auth page
- `/admin` — Officer portal dashboard
- `/admin/create-tender` — Tender creation UI
- `/admin/profile` — Officer profile
- `/vendor` — Vendor portal dashboard
- `/vendor/profile` — Vendor profile & KYC
- `/tenders/[id]` — Tender detail page
- `/dashboard` — Analytics / charts
- `/dispute` — Dispute / appeal flow
- `/faq` — FAQ
- `/verify` — Verification page
- `/unauthorized` — Access denied page

API route used by frontend (local):
- `GET /api/live-news` — returns list of live news items (`src/app/api/live-news/route.ts`).

---

## 4. Key components
- `Header` — top navigation, wallet status, role switching links.
- `Footer` — public footer.
- `PortalSidebar` — admin/vendor sidebar navigation (portal routes).
- `ClientProviders` — wraps the app, provides `AppProvider` and in-app toasts, layout rules.
- `BlockchainMonitor` — UI helper that shows simulated blockchain tx feed.
- UI primitives in `src/components/ui/`: `Card`, `FormField`, `input`, `button`, `Modal`, `Spinner`, `ErrorBoundary`, `BackButton`.

इन components का व्यवहार और state ज्यादातर `AppContext` से आता है — इसलिए backend API अनुरूप होना चाहिए।

---

## 5. App state (single source — `AppContext`)
मुख्य responsibility: session, wallet, user profile, tenders, notifications, live news, transactions, UI preferences.

Principal values and methods (summary):
- State values: `hydrated`, `walletConnected`, `walletAddress`, `walletBalance`, `userRole`, `currentUser`, `tenders`, `blockchainTxs`, `notifications`, `newsFeed`, `language`, `theme`, `fontSize`, `fontScalePercent`, `recentSearches`, `unreadCount`.
- Important methods the UI calls:
  - `connectWallet(role, customUser?)`
  - `disconnectWallet()`
  - `loginUser(role, profile)`
  - `logoutUser()`
  - `publishTender(tenderData)`
  - `submitBid(tenderId, price, vendorName)`
  - `registerVendor(data)`
  - `registerOfficer(data)`
  - `updateKYCStatus(vendorId, status)`
  - `disputeTender(tenderId, disputeText)`

आजाना: वर्तमान कोड में ऊपर के सभी actions क्लाइंट-साइड मॉक/न्याय-उन्मुख हैं — पर production backend बनाते वक्त इनको server-side endpoints से replace कर दें।

---

## 6. Types / Data models (from `src/types/index.ts`)
मुख्य टाइप्स (summarized):
- `UserProfile` — officer/vendor/public fields (id, name, email, role, company fields, kycStatus, permissions)
- `Tender` — id, title, description, ministry, budget, deadline, status, ipfsHash, ipfsFiles[], txHash, blockNumber, bids[], auditTimeline[]
- `Bid` — id, tenderId, vendorName, vendorAddress, price, isEncrypted, submittedAt, txHash, blockNumber
- `BlockchainTx` — txHash, blockNumber, gasFee, timestamp, walletAddress, type, status, metadata
- `Notification`, `LiveNewsItem`, `VendorRegistrationData`, `OfficerRegistrationData`

Use these models as canonical request/response shapes for backend APIs.

---

## 7. Recommended backend API contract
नीचे frontend के मुताबिक suggested REST API endpoints दिए गए हैं। JSON request/response examples और HTTP methods दिए हुए हैं — आप इन्हें अपने backend पर implement कर सकते हैं।

Base URL: `/api` (आप चाहें तो अलग prefix रख सकते हैं)

1) Auth & Session
- POST `/api/auth/login`
  - Request: `{ "role": "vendor" | "officer", "credentials": { ... } }`
  - Response: `{ "token": "<jwt>", "user": UserProfile }`
- POST `/api/auth/logout` — invalidate session

2) Users / registration
- POST `/api/users/vendor/register`
  - Request: `VendorRegistrationData` (see `src/types/index.ts`)
  - Response: `{ success: true, vendor: UserProfile }`

- POST `/api/users/officer/register`
  - Request: `OfficerRegistrationData`
  - Response: `{ success: true, officer: UserProfile }`

3) Tenders
- GET `/api/tenders` — list tenders (support query params: `status`, `ministry`, `search`)
  - Response: `{ tenders: Tender[] }`

- GET `/api/tenders/:id` — single tender
  - Response: `{ tender: Tender }`

- POST `/api/tenders` — create/publish tender (officer only)
  - Request body (example):

```json
{
  "title": "...",
  "description": "...",
  "ministry": "Ministry of ...",
  "budget": 100000000,
  "deadline": "2026-06-15T17:00:00.000Z",
  "msmeQuota": true,
  "criteria": ["..."],
  "ipfsHash": "Qm...",
  "ipfsFiles": [{ "name":"a.pdf","size":"1MB","hash":"Qm...","uploadedAt":"..." }]
}
```

  - Response: `{ success: true, tender: Tender, txHash: "0x...", blockNumber: 123456 }`

4) Bids
- POST `/api/tenders/:id/bids` — submit bid (vendor)
  - Request: `{ vendorName, vendorAddress, price, encryptedPayload?: string }`
  - Response: `{ success: true, bid: Bid, txHash: "0x..." }`

5) Notifications & Activity
- GET `/api/notifications` — returns user notifications
- POST `/api/notifications/mark-read` — body: `{ id }` or `{ all: true }`

6) Blockchain / Transactions
- GET `/api/txs` — fetch recent blockchain transactions (filter by tenderId)

7) KYC / Vendor verification (Officer endpoints)
- POST `/api/kyc/:vendorId/status` — body `{ status: "Approved" | "Rejected" | ... }`
  - Response: `{ success: true, vendor: UserProfile }`

8) Disputes
- POST `/api/tenders/:id/dispute` — body `{ text: string, raisedBy: string }`
  - Response: `{ success: true, disputeId: "D-123", txHash?: "0x..." }`

9) Live news (example frontend route exists already)
- GET `/api/live-news` — returns `LiveNewsItem[]` (currently implemented in-app at `src/app/api/live-news/route.ts`)

10) File uploads (IPFS)
- POST `/api/uploads/ipfs` — multipart/form-data or base64
  - Response: `{ success: true, ipfsHash: "Qm...", files: [{ name, size, hash }] }`

Auth: protect officer/vendor endpoints with JWT or session. Frontend expects `user` object and token for subsequent calls.

---

## 8. Example request/response snippets

- Create tender (server-side):

Request to `POST /api/tenders`:

```json
{
  "title":"Construction of NH-150D",
  "ministry":"Ministry of Road Transport and Highways",
  "budget":12400000000,
  "deadline":"2026-06-15T17:00:00.000Z",
  "ipfsHash":"Qm...",
  "ipfsFiles":[]
}
```

Response:

```json
{
  "success": true,
  "tender": { /* Tender object (see types) */ },
  "txHash": "0xabc123...",
  "blockNumber": 18245903
}
```

---

## 9. Realtime / polling
- Frontend currently simulates a live transaction feed in `AppContext` and uses `GET /api/live-news`. For real-time updates implement either:
  - Server-Sent Events (SSE) or WebSocket endpoint: `/api/realtime` to push `BlockchainTx`, `Notification`, `Tender` events.
  - Or provide short-polling endpoints: `/api/txs?since=<timestamp>` and `/api/notifications?since=<timestamp>`.

---

## 10. Notes & Implementation tips for backend
- Respect the TypeScript interfaces in `src/types/index.ts` for payload shapes.
- Tender creation should: store record, compute `txHash`/`blockNumber` (if integrating with blockchain), persist IPFS hashes for attachments.
- Bids: decide whether to accept encrypted payloads (ZKP flow) or accept and store sealed/encrypted blobs.
- KYC flows: store uploaded documents securely; provide officer endpoints to approve/reject and emit notifications.
- Wallet interactions (connect/disconnect) are UI-side; backend should validate ownership for sensitive actions (e.g., sign challenge or require login + wallet verification).
- Rate-limit public endpoints and secure admin endpoints.

---

## 11. Next steps I can do for you
- Generate OpenAPI (Swagger) spec for the above endpoints.
- Implement a minimal Express / Next API backend scaffold with the above routes.
- Add server-side mocks so frontend can switch from local-mock to real API quickly.

---

If you want, I'll add an `openapi.yaml` and a minimal Node/Express starter implementing these endpoints with in-memory storage so you can start integrating the frontend immediately. बताइए क्या मैं वही करूं?
