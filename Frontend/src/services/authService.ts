// ============================================================
// Auth Service
// Handles authentication APIs
// ============================================================

import api from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: "vendor" | "officer";
  mobile?: string;
  companyName?: string;
  designation?: string;
  ministry?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: any;
}

class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<any>("/auth/register", data);
    return response.data.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<any>("/auth/login", data);
    const { token, refreshToken, user } = response.data.data;

    // Store tokens
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
    }

    return response.data.data;
  }

  async logout(): Promise<void> {
    await api.post("/auth/logout");
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  }

  async getCurrentUser(): Promise<any> {
    const response = await api.get("/auth/me");
    return response.data.data;
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    const response = await api.post("/auth/refresh", { refreshToken });
    return response.data.data;
  }

  async requestNonce(walletAddress: string): Promise<string> {
    const response = await api.post("/auth/nonce", { walletAddress });
    return response.data.data.nonce;
  }

  async metamaskLogin(walletAddress: string, signature: string): Promise<AuthResponse> {
    const response = await api.post<any>("/auth/metamask", {
      walletAddress,
      signature,
    });
    const { token, refreshToken, user } = response.data.data;

    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
    }

    return response.data.data;
  }

  async forgotPassword(email: string): Promise<void> {
    await api.post("/auth/forgot-password", { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post("/auth/reset-password", { token, newPassword });
  }

  // Helper methods
  getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("authToken");
  }

  getStoredUser(): any {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  getUserRole(): string | null {
    const user = this.getStoredUser();
    return user?.role || null;
  }
}

export default new AuthService();
