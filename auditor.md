# Decentralized TenderChain — Auditor Module Documentation

## Role Overview
The **Auditor** role is the independent verification authority on the platform. Auditors are the **only** entities authorized to approve or reject KYC submissions. They also monitor for fraud, manage blacklists, and view system activity logs.

## Permissions
- ✅ Review Officer KYC submissions
- ✅ Review Vendor KYC submissions
- ✅ Approve/Reject KYC requests
- ✅ Add remarks to KYC reviews
- ✅ Monitor fraud (duplicate PAN/GST, multiple rejections, suspicious patterns)
- ✅ Manage blacklist
- ✅ View activity logs
- ❌ Create tenders
- ❌ Submit bids
- ❌ Access officer or vendor dashboards

## Page Structure

| Route | Page | Description |
|-------|------|-------------|
| `/auditor/dashboard` | Auditor Dashboard | KYC stats, pending requests, fraud alerts |
| `/auditor/vendors` | Vendor KYC Management | Review vendor KYC submissions |
| `/auditor/officers` | Officer KYC Management | Review officer KYC submissions |
| `/auditor/blacklist` | Blacklist Management | View and manage blacklisted users |
| `/auditor/fraud` | Fraud Monitor | Fraud detection dashboard |
| `/auditor/logs` | Activity Logs | System-wide activity log viewer |

## UI Behavior

### Auditor Dashboard
- **Pending KYC Count**: Number of KYC requests awaiting review
- **Fraud Alerts**: Recent fraud detection notifications
- **Quick Actions**: Approve/reject buttons for pending KYC

### Vendor & Officer Pages
- Lists all users of that type with their KYC status
- Click to view KYC documents
- Approve/Reject buttons with remarks input
- Submission history timeline

### Fraud Monitor
- Fraud metrics: total, open, investigating, confirmed, dismissed
- Severity breakdown: critical, high counts
- List of fraud flags with user details
- Actions: investigate, dismiss, blacklist user

## User Flows

### 1. KYC Approval Flow
```
Dashboard → View Pending Requests → Review Documents → 
Approve/Reject with Remarks → User Notified → Status Updated
```

### 2. Fraud Investigation Flow
```
Fraud Monitor → View Flag Details → Investigate → 
Confirm/Dismiss Fraud → Blacklist User if Needed
```

### 3. Blacklist Management Flow
```
Blacklist Page → View Blacklisted Users → Add/Remove Entries →
Audit Log Updated
```

## Backend APIs

### KYC Management
- `GET /api/kyc/pending` - List pending KYC requests
- `GET /api/kyc/all` - List all KYC requests (with optional status filter)
- `POST /api/kyc/:requestId/approve` - Approve KYC with remarks
- `POST /api/kyc/:requestId/reject` - Reject KYC with remarks

### Fraud Detection
- `GET /api/auditor/fraud` - List fraud flags
- `GET /api/auditor/fraud/stats` - Fraud statistics
- `PUT /api/auditor/fraud/:id/resolve` - Resolve fraud flag

### Blacklist
- `GET /api/auditor/blacklist` - List blacklist entries
- `POST /api/auditor/blacklist` - Add to blacklist
- `DELETE /api/auditor/blacklist/:id` - Remove from blacklist

### Logs
- `GET /api/auditor/logs` - View activity logs

### Dashboard
- `GET /api/auditor/dashboard` - Auditor dashboard stats

## Database Tables

### kyc_requests
| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key |
| userId | String | User reference |
| userType | String | "vendor" or "officer" |
| documents | String | JSON array of document URLs |
| documentTypes | String | JSON array of document types |
| status | Enum | Pending/Approved/Rejected |
| remarks | String? | Auditor review remarks |
| reviewedById | String? | Auditor reference |
| reviewedAt | DateTime? | Review timestamp |
| submissionCount | Int | Number of submissions |

### fraud_flags
| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key |
| userId | String | Flagged user |
| flagType | String | DUPLICATE_PAN/GST/MULTIPLE_REJECTIONS/SUSPICIOUS_PATTERN |
| severity | Enum | Low/Medium/High/Critical |
| status | Enum | Open/Investigating/Confirmed/Dismissed |
| description | String | Fraud description |
| evidence | String? | JSON supporting evidence |

### blacklist_entries
| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key |
| userId | String | Blacklisted user |
| reason | String | Blacklist reason |
| isPermanent | Boolean | Permanent or temporary |

## Real-Time Behavior
- Auditor receives real-time notifications for new KYC submissions
- Socket.IO room `auditor:{auditorId}` for personalized updates
- Real-time fraud alerts

## Fraud Detection Rules
1. **Duplicate PAN**: Same PAN across multiple users → Critical severity
2. **Duplicate GST**: Same GST across multiple users → Critical severity
3. **Multiple Rejected KYC**: >3 rejections → High severity
4. **Suspicious Pattern**: Same IP for many registrations, missing data, invalid PAN format

## Validation Rules
- Remarks are required for KYC rejection
- Only active auditors can approve/reject KYC
- Cannot approve own KYC
- All auditor actions are logged immutably