# Backend Project Report

## 1. Project Overview
The backend of the Decentralized TenderChain system is a secure, scalable, and production-ready server application built with Node.js, Express, TypeScript, Prisma, and PostgreSQL. It is responsible for handling authentication, tender management, bidding logic, user management, dispute handling, notifications, file uploads, blockchain interaction, and smart contract integration.

The backend serves as the core processing layer of the project and provides all business logic required by the frontend application.

## 2. Project Objective
The backend was created to:
- Manage all server-side application logic.
- Store and retrieve data from the database.
- Securely authenticate users and protect routes.
- Support role-based access control for officers, vendors, and admins.
- Handle tender lifecycle operations from creation to award.
- Support bid submission, evaluation, and related workflows.
- Integrate blockchain and smart contract features.
- Process uploads, notifications, and dispute records.

## 3. Technology Stack
The backend uses the following technologies:
- Node.js as the runtime environment.
- Express.js as the web server framework.
- TypeScript for strict typing and code maintainability.
- Prisma as the ORM for database access.
- PostgreSQL as the main database.
- JWT for authentication and authorization.
- bcrypt for password hashing.
- Socket.io for real-time communication.
- Zod for request validation.
- Winston for structured logging.
- Multer for file upload handling.
- Ethers.js and Hardhat for blockchain and contract integration.
- AWS S3 and Pinata IPFS for file storage support.

## 4. Main Features
The backend provides the following features:

### Authentication and Authorization
- User registration and login.
- JWT access and refresh token handling.
- Role-based route protection.
- Password hashing and secure session flow.
- MetaMask-based authentication support.

### Tender Management
- Create and update tenders.
- List all tenders.
- Retrieve tender details by ID.
- Update tender status.
- Delete or manage tender records.

### Bid Management
- Submit bids for open tenders.
- Reveal or evaluate bids when allowed.
- Track bid history and bid-related actions.

### User and KYC Management
- Store user profile data.
- Manage vendor and officer registration.
- Process KYC verification status.
- Support user profile updates.

### Dispute Management
- Create dispute records.
- Update dispute status.
- Support dispute resolution workflows.

### Notifications and Realtime Support
- Store and serve notifications.
- Send live updates to connected clients.
- Support Socket.io-based event communication.

### File Uploads
- Upload supporting documents.
- Store file references in external storage systems.
- Support IPFS and AWS S3 integration.

### Blockchain and Smart Contract Integration
- Compile and deploy smart contracts.
- Support blockchain-related tender and bid activity.
- Track transaction hashes and block numbers.
- Connect backend workflows to the decentralized contract layer.

## 5. Backend Architecture
The backend follows a layered structure to keep the code organized and maintainable.

### Application Entry Point
The server starts from the main application file, where middleware, routes, and error handlers are registered.

### Config Layer
The config files manage:
- Environment variables
- Database connection
- External service configuration
- Application runtime settings

### Routes Layer
The routes folder contains endpoint definitions for:
- Authentication
- Users
- Tenders
- Bids
- Disputes
- Uploads
- Notifications
- Dashboard data

### Controllers Layer
Controllers handle incoming HTTP requests and prepare responses for the client.

### Services Layer
Services contain the main business logic. This includes:
- Validation of workflows
- Database operations
- Authentication operations
- Tender and bid processing
- Dispute and notification logic
- Blockchain communication

### Middleware Layer
Middleware is used for:
- Authentication checks
- Role verification
- Rate limiting
- Request validation
- Error handling

### Validators Layer
Zod schemas are used to validate request payloads before they are processed.

## 6. Database Design
The backend uses Prisma with PostgreSQL for structured data storage. The schema includes entities for:
- Users
- Tenders
- Bids
- Disputes
- Notifications
- KYC records
- File metadata
- Supporting blockchain information

This database structure allows the project to store both standard application data and blockchain-related references.

## 7. API Behavior
The backend exposes RESTful endpoints that support the frontend application. These APIs are used for:
- User authentication and profile loading
- Tender listing and tender creation
- Bid submission and bid retrieval
- Notification fetching
- Profile and verification management
- File upload operations
- Dashboard and analytics data

The APIs are designed to return JSON responses that the frontend can consume directly.

## 8. Security Features
Security is a major part of the backend design. The backend includes:
- JWT-based access control
- Password hashing with bcrypt
- CORS configuration
- Helmet security headers
- Rate limiting on sensitive routes
- Input validation using Zod
- Role-based authorization checks
- Secure blockchain interaction flow
- Reentrancy protection in smart contract logic

These measures help protect the application from common security risks.

## 9. Smart Contract Integration
The backend contains blockchain support through Hardhat and Solidity smart contracts. This layer supports:
- Contract compilation
- Local deployment to Ganache
- Tender and bid transaction tracking
- Smart contract function integration
- Connection between blockchain state and application records

The blockchain layer adds transparency and immutability to the tender process.

## 10. Real-Time Communication
The backend uses Socket.io for real-time data exchange. This can be used to send:
- Notification updates
- Tender updates
- Bid activity updates
- Blockchain transaction events

This improves user experience by reducing the need for manual refreshes.

## 11. Deployment and Runtime
The backend can be run in development and production modes. It supports:
- Local development server execution
- Prisma schema generation and database push
- Smart contract compilation and deployment
- Production build compilation through TypeScript

The project is designed so that the backend can be hosted independently from the frontend.

## 12. Conclusion
The backend of Decentralized TenderChain is the main logic engine of the entire system. It combines database management, secure authentication, role-based access, file handling, blockchain integration, and real-time communication into one structured server application. This backend report is suitable for direct use in the final project documentation.
