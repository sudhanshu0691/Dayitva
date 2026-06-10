// ============================================================
// Socket.IO Service
// Centralized real-time event broadcasting
// ============================================================

import { Server as SocketIOServer } from "socket.io";
import { logger } from "../utils/logger";

let io: SocketIOServer | null = null;

export function setIO(socketIO: SocketIOServer): void {
  io = socketIO;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function emitToUser(userId: string, event: string, data: any): void {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

export function emitToTender(tenderId: string, event: string, data: any): void {
  if (io) {
    io.to(`tender:${tenderId}`).emit(event, data);
  }
}

export function emitToAuditor(auditorId: string, event: string, data: any): void {
  if (io) {
    io.to(`auditor:${auditorId}`).emit(event, data);
  }
}

export function broadcastToAll(event: string, data: any): void {
  if (io) {
    io.emit(event, data);
  }
}

export function emitTenderUpdate(tender: any): void {
  if (io) {
    io.emit("tender:updated", tender);
    if (tender.id) {
      io.to(`tender:${tender.id}`).emit("tender:detail_updated", tender);
    }
  }
}

export function emitBidUpdate(tenderId: string, bid: any): void {
  if (io) {
    io.to(`tender:${tenderId}`).emit("bid:new", bid);
    // Also notify the officer who owns the tender
    io.emit("bid:notification", { tenderId, bid });
  }
}

export function emitKYCUpdate(userId: string, status: string, remarks?: string): void {
  if (io) {
    io.to(`user:${userId}`).emit("kyc:status_changed", { status, remarks });
  }
}