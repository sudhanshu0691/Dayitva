// ============================================================
// useAuth Hook
// Hook for authentication state and methods
// ============================================================

"use client";

import authService from "@/services/authService";

export function useAuth() {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getStoredUser();
  const userRole = authService.getUserRole();
  const token = authService.getStoredToken();

  return {
    isAuthenticated,
    user,
    userRole,
    token,
    login: authService.login,
    register: authService.register,
    logout: authService.logout,
    getCurrentUser: authService.getCurrentUser,
    metamaskLogin: authService.metamaskLogin,
    requestNonce: authService.requestNonce,
    forgotPassword: authService.forgotPassword,
    resetPassword: authService.resetPassword,
  };
}
