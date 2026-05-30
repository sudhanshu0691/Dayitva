// ============================================================
// Protected Route Component
// Wrapper for authenticated and role-based routes
// ============================================================

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import authService from "@/services/authService";
import { Spinner } from "@/components/ui/Spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = authService.isAuthenticated();

        if (!isAuth) {
          router.push("/login");
          return;
        }

        const userRole = authService.getUserRole();

        if (requiredRoles.length > 0 && !requiredRoles.includes(userRole || "")) {
          router.push("/unauthorized");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredRoles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}
