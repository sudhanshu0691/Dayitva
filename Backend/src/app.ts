// ============================================================
// Decentralized TenderChain - Express Application Entry Point
// Blockchain-Based Transparent E-Procurement & Tender Management
// ============================================================

import express from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { env, validateEnv } from "./config/env";
import { prisma } from "./config/database";
import { logger } from "./utils/logger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { generalLimiter } from "./middleware/rateLimiter";
import { setIO } from "./services/socket.service";
import { checkAndUpdateDeadlines } from "./cron/deadlineChecker";
import routes from "./routes/index";

// Validate required environment variables
validateEnv();

// Create Express app
const app = express();
const server = http.createServer(app);

// --- Socket.io Setup for Real-time Updates ---
const io = new SocketIOServer(server, {
  cors: {
    origin: env.SOCKET_CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store io instance for use in services
app.set("io", io);
setIO(io);

io.on("connection", (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // Join user-specific room for personalized notifications
  socket.on("join-user", (userId: string) => {
    socket.join(`user:${userId}`);
    logger.debug(`Socket ${socket.id} joined user room: ${userId}`);
  });

  // Join tender room for real-time updates on specific tender
  socket.on("join-tender", (tenderId: string) => {
    socket.join(`tender:${tenderId}`);
    logger.debug(`Socket ${socket.id} joined tender room: ${tenderId}`);
  });

  // Join auditor room
  socket.on("join-auditor", (auditorId: string) => {
    socket.join(`auditor:${auditorId}`);
    logger.debug(`Socket ${socket.id} joined auditor room: ${auditorId}`);
  });

  socket.on("disconnect", () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// --- Global Middleware ---

// Security headers
app.use(helmet());

// CORS - allow frontend origin
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
app.use(generalLimiter);

// Request logging
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });
  next();
});

// --- API Routes ---
app.use("/api", routes);

// --- Error Handling ---
app.use(notFoundHandler);
app.use(errorHandler);

// --- Periodic Deadline Checker (every 5 minutes) ---
async function startDeadlineChecker() {
  const DEADLINE_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  // Run immediately on startup
  try {
    const result = await checkAndUpdateDeadlines();
    logger.info(`⏰ Initial deadline check: ${result.updated} tenders updated`);
  } catch (error) {
    logger.error("❌ Initial deadline check failed", { error });
  }

  // Then run periodically
  setInterval(async () => {
    try {
      const result = await checkAndUpdateDeadlines();
      if (result.updated > 0) {
        logger.info(`⏰ Deadline check: ${result.updated} tenders auto-updated`);
      }
    } catch (error) {
      logger.error("❌ Periodic deadline check failed", { error });
    }
  }, DEADLINE_CHECK_INTERVAL);

  logger.info(`⏰ Deadline checker scheduled every 5 minutes`);
}

// --- Database Connection & Server Start ---
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info("✅ Database connected successfully");

    // Start deadline checker
    startDeadlineChecker();

    // Start server
    server.listen(env.PORT, () => {
      logger.info(`🚀 Decentralized TenderChain API Server`);
      logger.info(`   Port: ${env.PORT}`);
      logger.info(`   Environment: ${env.NODE_ENV}`);
      logger.info(`   Frontend URL: ${env.FRONTEND_URL}`);
      logger.info(`   Blockchain: 🔗 Ganache Local (Real Transactions via MetaMask)`);
      logger.info(`   API: http://localhost:${env.PORT}/api`);
      logger.info(`   Health: http://localhost:${env.PORT}/api/health`);
    });
  } catch (error) {
    logger.error("❌ Failed to start server", { error });
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Shutting down gracefully...");
  await prisma.$disconnect();
  io.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received. Shutting down...");
  await prisma.$disconnect();
  io.close();
  process.exit(0);
});

startServer();

export { app, server, io };