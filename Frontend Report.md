# Frontend Project Report

## 1. Project Overview
The frontend of the Decentralized TenderChain system is a modern web application built with Next.js and React. It provides the user interface for officers, vendors, administrators, and public users to interact with the tender management platform. The frontend is designed to support secure authentication, role-based dashboards, tender browsing, bid submission, dispute handling, notifications, and blockchain-related activity views.

The main purpose of the frontend is to present all project functionality in a clean, responsive, and user-friendly way while communicating with the backend through API requests and real-time events.

## 2. Project Objective
The frontend has been developed to achieve the following objectives:
- Provide an intuitive interface for tender publication and tender participation.
- Support different user roles with separate access areas.
- Display tender records, bids, notifications, and dispute information.
- Connect users with backend APIs in a structured and maintainable way.
- Present blockchain-related actions and transaction updates clearly.
- Maintain a responsive interface that works on desktop and mobile devices.

## 3. Technology Stack
The frontend uses the following technologies:
- Next.js 15 for the application framework.
- React 19 for component-based UI development.
- TypeScript for static typing and better code reliability.
- Tailwind CSS for utility-based styling.
- Axios for API communication.
- Socket.io Client for real-time updates.
- React Hook Form and Zod for form handling and validation.
- Recharts for analytics and chart-based visualizations.
- React Hot Toast for user notifications.
- Framer Motion for UI animations.

## 4. Main Features
The frontend includes the following functional areas:

### Authentication and User Access
- User login and registration screens.
- Role-based access for officer, vendor, and admin users.
- Protected routes and unauthorized access handling.
- Session and token-based authentication flow.

### Tender Management
- View public tenders.
- Open detailed tender pages.
- Filter and search tender data.
- Display budget, deadline, status, and related documents.

### Bidding Interface
- Vendor bid submission forms.
- Bid history and bid status display.
- Tender participation workflows.

### Dashboard and Analytics
- Role-specific dashboards.
- Summary cards and activity panels.
- Charts and reporting sections for tender activity.

### KYC and Verification
- Vendor profile and verification pages.
- Status display for KYC approval or rejection.
- Document-related UI flows.

### Dispute Handling
- Dispute submission interface.
- Dispute tracking and status display.

### Notifications and Realtime Updates
- Notification count and notification lists.
- Live blockchain or system event updates.
- Socket-based real-time updates where required.

## 5. Application Structure
The frontend source code is organized in a modular way.

### App Router Pages
The `src/app/` directory contains the application pages and route-based screens. These include:
- Home page
- About page
- Login and register pages
- Admin portal pages
- Vendor portal pages
- Tender detail pages
- Dashboard pages
- FAQ, dispute, verify, and unauthorized pages

### Components
The `src/components/` directory contains reusable UI elements such as:
- Header
- Footer
- PortalSidebar
- BlockchainMonitor
- ProtectedRoute
- ClientProviders
- Shared UI primitives

### Context and State Management
The `src/context/` folder contains the application context. It manages shared data such as:
- User profile information
- Wallet connection state
- Tender lists
- Notifications
- News feed and transaction information
- UI preferences such as language and theme

### Hooks and Services
- `src/hooks/` contains custom hooks such as API and authentication hooks.
- `src/services/` contains service layers for API communication and business logic support.
- `src/lib/` contains helper utilities.

## 6. Frontend Workflow
The normal frontend workflow is as follows:
1. The user opens the web application.
2. The user selects a role or signs in through the login page.
3. The frontend validates input and sends requests to the backend.
4. The backend returns data such as user profile, tenders, bids, and notifications.
5. The frontend updates the UI and shows appropriate information based on the role.
6. Real-time updates are displayed when new activity is received.

## 7. Data Communication with Backend
The frontend is designed to consume backend APIs in a structured way. It expects data related to:
- Authentication and session management
- User profiles and registration
- Tender creation and tender listing
- Bid submission and evaluation
- KYC verification
- Notifications and disputes
- Blockchain transaction tracking

The frontend should remain consistent with the backend response structure so that all pages work without data mismatch issues.

## 8. UI and Design Approach
The interface is built to be clean, practical, and easy to navigate. The design approach focuses on:
- Simple navigation between public and private routes.
- Clear display of important tender details.
- Role-oriented screen layouts.
- Reusable UI components for maintainability.
- Responsive layouts for different screen sizes.

## 9. Security Considerations
The frontend supports secure usage through:
- Protected routes for authorized pages.
- Role-based route access.
- Token handling for login sessions.
- Validation before submitting forms.
- Separate pages for unauthorized access.

Although the frontend helps enforce access flow, actual security validation must also be handled by the backend.

## 10. Build and Run Instructions
To run the frontend locally:
1. Install dependencies inside the `Frontend/` folder.
2. Configure environment variables if required.
3. Start the development server using the project scripts.
4. Open the application in the browser.

For production use, the frontend can be built and deployed as a Next.js application.

## 11. Conclusion
The frontend of Decentralized TenderChain provides the complete user-facing experience for the tender management platform. It combines modern React architecture, role-based navigation, reusable components, and real-time integration to support the full project lifecycle. This frontend report can be used directly as part of the final project documentation.
