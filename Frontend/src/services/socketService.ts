// ============================================================
// Socket.io Service
// Real-time communication for notifications and updates
// ============================================================

import io, { Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  connect(userId: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(SOCKET_URL, {
          auth: {
            token: localStorage.getItem("authToken") || "",
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        this.socket.on("connect", () => {
          console.log("Socket connected:", this.socket?.id);
          this.isConnected = true;

          // Join user-specific room
          this.socket?.emit("join-user", userId);
          resolve(this.socket as Socket);
        });

        this.socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
          reject(error);
        });

        this.socket.on("disconnect", () => {
          console.log("Socket disconnected");
          this.isConnected = false;
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  joinTender(tenderId: string): void {
    this.socket?.emit("join-tender", tenderId);
  }

  leaveTender(tenderId: string): void {
    this.socket?.emit("leave-tender", tenderId);
  }

  onNotification(callback: (notification: any) => void): void {
    this.socket?.on("notification", callback);
  }

  onTenderUpdate(callback: (tender: any) => void): void {
    this.socket?.on("tender-update", callback);
  }

  onBidUpdate(callback: (bid: any) => void): void {
    this.socket?.on("bid-update", callback);
  }

  onDisputeUpdate(callback: (dispute: any) => void): void {
    this.socket?.on("dispute-update", callback);
  }

  onBlockchainTx(callback: (tx: any) => void): void {
    this.socket?.on("blockchain-tx", callback);
  }

  emitNotification(data: any): void {
    this.socket?.emit("notification", data);
  }

  isConnectedToSocket(): boolean {
    return this.isConnected;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export default new SocketService();
