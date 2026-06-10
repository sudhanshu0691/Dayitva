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
  // Vendor-specific
  companyName?: string;
  regNumber?: string;
  pan?: string;
  gst?: string;
  turnover?: string;
  itrYears?: string[];
  // Officer-specific
  designation?: string;
  ministry?: string;
  ministryCode?: string;
  permissions?: string[];
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: any;
}

export interface OtpResponse {
  message: string;
  expiresIn: number;
  devOtp?: string;
}

export interface VerifyOtpResponse {
  message: string;
  verified?: boolean;
  emailVerified?: boolean;
}

export interface ResetPasswordResponse {
  message: string;
}

class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<any>("/auth/register", data);
    return response.data.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<any>("/auth/login", data);
    const { accessToken, refreshToken, user } = response.data.data;
    const token = accessToken;

    // Store tokens
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
    }

    return { token, refreshToken, user };
  }

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // Ignore errors on logout
    }
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

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const response = await api.post("/auth/refresh", { refreshToken });
    const { accessToken, token, refreshToken: newRefreshToken } = response.data.data;
    const refreshedToken = accessToken || token;

    if (typeof window !== "undefined" && refreshedToken) {
      localStorage.setItem("authToken", refreshedToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }
    }

    return {
      token: refreshedToken,
      refreshToken: newRefreshToken,
    };
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
    const { accessToken, refreshToken, user } = response.data.data;
    const token = accessToken;

    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
    }

    return { token, refreshToken, user };
  }

  // ============================================================
  // OTP & Email Verification Methods
  // ============================================================

  /**
   * Send OTP to email for verification or password reset
   */
  async sendOtp(email: string, type: "VERIFY_EMAIL" | "FORGOT_PASSWORD" = "VERIFY_EMAIL"): Promise<OtpResponse> {
    const response = await api.post<any>("/auth/send-otp", { email, type });
    return response.data.data;
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(email: string, otp: string, type: "VERIFY_EMAIL" | "FORGOT_PASSWORD" = "VERIFY_EMAIL"): Promise<VerifyOtpResponse> {
    const response = await api.post<any>("/auth/verify-otp", { email, otp, type });
    return response.data.data;
  }

  /**
   * Resend OTP with 30s cooldown
   */
  async resendOtp(email: string, type: "VERIFY_EMAIL" | "FORGOT_PASSWORD" = "VERIFY_EMAIL"): Promise<OtpResponse> {
    const response = await api.post<any>("/auth/resend-otp", { email, type });
    return response.data.data;
  }

  /**
   * Forgot password - sends OTP to email
   */
  async forgotPassword(email: string): Promise<OtpResponse> {
    const response = await api.post<any>("/auth/forgot-password", { email });
    return response.data.data;
  }

  /**
   * Reset password using OTP
   */
  async resetPassword(email: string, otp: string, newPassword: string): Promise<ResetPasswordResponse> {
    const response = await api.post<any>("/auth/reset-password", { email, otp, newPassword });
    return response.data.data;
  }

  // Helper methods
  async storeAuthData(data: { token: string; refreshToken: string; user: any }): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
  }

  clearAuthData(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  }

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