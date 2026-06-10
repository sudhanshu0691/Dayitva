"use strict";
// ============================================================
// Decentralized TenderChain - Express Application Entry Point
// Blockchain-Based Transparent E-Procurement & Tender Management
// ============================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const socket_service_1 = require("./services/socket.service");
const deadlineChecker_1 = require("./cron/deadlineChecker");
const index_1 = __importDefault(require("./routes/index"));
// Validate required environment variables
(0, env_1.validateEnv)();
// Create Express app
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
// --- Socket.io Setup for Real-time Updates ---
const io = new socket_io_1.Server(server, {
    cors: {
        origin: env_1.env.SOCKET_CORS_ORIGIN,
        methods: ["GET", "POST"],
        credentials: true,
    },
});
exports.io = io;
// Store io instance for use in services
app.set("io", io);
(0, socket_service_1.setIO)(io);
io.on("connection", (socket) => {
    logger_1.logger.info(`Socket connected: ${socket.id}`);
    // Join user-specific room for personalized notifications
    socket.on("join-user", (userId) => {
        socket.join(`user:${userId}`);
        logger_1.logger.debug(`Socket ${socket.id} joined user room: ${userId}`);
    });
    // Join tender room for real-time updates on specific tender
    socket.on("join-tender", (tenderId) => {
        socket.join(`tender:${tenderId}`);
        logger_1.logger.debug(`Socket ${socket.id} joined tender room: ${tenderId}`);
    });
    // Join auditor room
    socket.on("join-auditor", (auditorId) => {
        socket.join(`auditor:${auditorId}`);
        logger_1.logger.debug(`Socket ${socket.id} joined auditor room: ${auditorId}`);
    });
    socket.on("disconnect", () => {
        logger_1.logger.info(`Socket disconnected: ${socket.id}`);
    });
});
// --- Global Middleware ---
// Security headers
app.use((0, helmet_1.default)());
// CORS - allow frontend origin
app.use((0, cors_1.default)({
    origin: env_1.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Body parsing
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// Rate limiting
app.use(rateLimiter_1.generalLimiter);
// Request logging
app.use((req, _res, next) => {
    logger_1.logger.debug(`${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
    });
    next();
});
// --- API Routes ---
app.use("/api", index_1.default);
// --- Error Handling ---
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
// --- Periodic Deadline Checker (every 5 minutes) ---
async function startDeadlineChecker() {
    const DEADLINE_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
    // Run immediately on startup
    try {
        const result = await (0, deadlineChecker_1.checkAndUpdateDeadlines)();
        logger_1.logger.info(`⏰ Initial deadline check: ${result.updated} tenders updated`);
    }
    catch (error) {
        logger_1.logger.error("❌ Initial deadline check failed", { error });
    }
    // Then run periodically
    setInterval(async () => {
        try {
            const result = await (0, deadlineChecker_1.checkAndUpdateDeadlines)();
            if (result.updated > 0) {
                logger_1.logger.info(`⏰ Deadline check: ${result.updated} tenders auto-updated`);
            }
        }
        catch (error) {
            logger_1.logger.error("❌ Periodic deadline check failed", { error });
        }
    }, DEADLINE_CHECK_INTERVAL);
    logger_1.logger.info(`⏰ Deadline checker scheduled every 5 minutes`);
}
// --- Database Connection & Server Start ---
async function startServer() {
    try {
        // Test database connection
        await database_1.prisma.$connect();
        logger_1.logger.info("✅ Database connected successfully");
        // Start deadline checker
        startDeadlineChecker();
        // Start server
        server.listen(env_1.env.PORT, () => {
            logger_1.logger.info(`🚀 Decentralized TenderChain API Server`);
            logger_1.logger.info(`   Port: ${env_1.env.PORT}`);
            logger_1.logger.info(`   Environment: ${env_1.env.NODE_ENV}`);
            logger_1.logger.info(`   Frontend URL: ${env_1.env.FRONTEND_URL}`);
            logger_1.logger.info(`   Blockchain: 🔗 Ganache Local (Real Transactions via MetaMask)`);
            logger_1.logger.info(`   API: http://localhost:${env_1.env.PORT}/api`);
            logger_1.logger.info(`   Health: http://localhost:${env_1.env.PORT}/api/health`);
        });
    }
    catch (error) {
        logger_1.logger.error("❌ Failed to start server", { error });
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on("SIGINT", async () => {
    logger_1.logger.info("Shutting down gracefully...");
    await database_1.prisma.$disconnect();
    io.close();
    process.exit(0);
});
process.on("SIGTERM", async () => {
    logger_1.logger.info("SIGTERM received. Shutting down...");
    await database_1.prisma.$disconnect();
    io.close();
    process.exit(0);
});
startServer();
//# sourceMappingURL=app.js.map