"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock, AlertCircle, KeyRound, CheckCircle2, Eye, EyeOff, ArrowLeft
} from "lucide-react";
import { BackButton } from "../../components/ui/BackButton";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/Card";
import authService from "@/services/authService";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const otp = searchParams.get("otp") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) return;
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.resetPassword(email, otp, newPassword);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      const message = errObj?.response?.data?.message || errObj?.message || "Failed to reset password";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!email || !otp) {
    return (
      <main className="w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-14">
        <Card variant="default" className="space-y-6">
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">Invalid Reset Link</h2>
            <p className="text-sm text-muted-foreground mb-4">Missing email or verification code. Please restart the password reset process.</p>
            <Button variant="default" onClick={() => router.push("/forgot-password")}>
              Start Over
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-4">
        <BackButton href="/login" label="Back to Login" variant="text" />
      </nav>

      <Card variant="default" className="space-y-6">
        <CardContent className="space-y-6">
          <header className="text-center border-b border-border/60 pb-4">
            <div className="w-12 h-12 bg-muted border border-border rounded-xl flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
              Set New Password
            </h1>
            <p className="text-sm text-muted-foreground mt-2 px-4">
              Enter your new password for <strong className="text-foreground">{email}</strong>
            </p>
          </header>

          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-950/30 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-base font-bold text-foreground mb-2">Password Reset Successfully!</h2>
              <p className="text-sm text-muted-foreground">
                Redirecting you to the login page...
              </p>
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">
                  New Password
                </label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                  rightIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  className="font-mono"
                  required
                  minLength={8}
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">
                  Confirm New Password
                </label>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                  rightIcon={
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-muted-foreground hover:text-foreground">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  className="font-mono"
                  required
                  minLength={8}
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-xs text-destructive font-mono rounded-lg flex items-center gap-1.5" role="alert">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="default"
                className="w-full gap-2 font-mono"
                disabled={loading || !newPassword || !confirmPassword}
                loading={loading}
                loadingText="Resetting password..."
              >
                <Lock className="w-4 h-4" />
                Reset Password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md mx-auto px-4 py-14 text-center text-sm text-muted-foreground">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}