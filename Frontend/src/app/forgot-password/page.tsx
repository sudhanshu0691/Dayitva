"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock, Mail, AlertCircle, KeyRound, CheckCircle2, ArrowLeft
} from "lucide-react";
import { BackButton } from "../../components/ui/BackButton";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/Card";
import authService from "@/services/authService";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
      setTimeout(() => {
        router.push(`/verify?email=${encodeURIComponent(email)}&type=FORGOT_PASSWORD`);
      }, 1500);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      const message = errObj?.response?.data?.message || errObj?.message || "Failed to send reset OTP";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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
              Reset Your Password
            </h1>
            <p className="text-sm text-muted-foreground mt-2 px-4">
              Enter your registered email address and we will send you a one-time password (OTP) to reset your password.
            </p>
          </header>

          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-950/30 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-base font-bold text-foreground mb-2">OTP Sent Successfully!</h2>
              <p className="text-sm text-muted-foreground">
                Redirecting you to the OTP verification page...
              </p>
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="reset-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">
                  Email Address
                </label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="e.g. rajesh.kumar77@nic.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-muted-foreground" />}
                  className="font-mono"
                  required
                  disabled={loading}
                  autoComplete="email"
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
                disabled={loading || !email}
                loading={loading}
                loadingText="Sending OTP..."
              >
                <Lock className="w-4 h-4" />
                Send Reset OTP
              </Button>
            </form>
          )}

          <div className="text-center text-xs text-muted-foreground border-t border-border/80 pt-4">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-primary underline hover:text-primary/80 font-semibold inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Login
            </button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}