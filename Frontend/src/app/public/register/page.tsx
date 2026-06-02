"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Globe, Mail, Lock, Eye, EyeOff, AlertCircle,
  UserRound, Phone, CheckCircle2, ArrowRight,
  KeyRound, ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { BackButton } from "../../../components/ui/BackButton";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { ErrorBoundary } from "../../../components/ui/ErrorBoundary";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/Card";
import authService from "@/services/authService";

function PublicRegisterContent() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email address is required");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const result = await authService.register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: "public",
        mobile: formData.phoneNumber || undefined,
      });

      setSuccess(true);

      // Redirect to email verification after 2 seconds
      setTimeout(() => {
        router.push(`/verify?email=${encodeURIComponent(formData.email)}&type=VERIFY_EMAIL&role=public`);
      }, 2000);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-14">
        <nav aria-label="Breadcrumb" className="mb-4">
          <BackButton href="/" label="Back to Home" variant="text" />
        </nav>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card variant="default" className="text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Registration Successful!</CardTitle>
              <CardDescription className="text-sm mt-2">
                Your public account has been created. Please verify your email address to activate your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 p-2.5 bg-muted rounded-lg border border-border w-full">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-mono">{formData.email}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Redirecting to email verification...
                </p>
                <Button
                  variant="default"
                  className="w-full gap-2 font-mono bg-emerald-700 hover:bg-emerald-800"
                  onClick={() => router.push(`/verify?email=${encodeURIComponent(formData.email)}&type=VERIFY_EMAIL&role=public`)}
                >
                  <ArrowRight className="w-4 h-4" />
                  Verify Email Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-4">
        <BackButton href="/" label="Back to Home" variant="text" />
      </nav>

      <header className="text-center mb-6">
        <div className="w-14 h-14 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl flex items-center justify-center mx-auto mb-3.5 text-emerald-400 shadow-lg">
          <Globe className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight leading-none">
          Public Registration
        </h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed px-4">
          Create a public account to browse tenders, track procurement transparency, and stay informed about government contracting.
        </p>
      </header>

      <Card variant="default" className="space-y-6">
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-950/20 border border-emerald-800/30 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-emerald-300 font-semibold font-mono">
              OPEN ACCESS — TRANSPARENCY FOR ALL CITIZENS
            </span>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-3">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="public-fullName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Full Name
                </label>
                <Input
                  id="public-fullName"
                  type="text"
                  placeholder="e.g. Arun Sharma"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  leftIcon={<UserRound className="w-4 h-4 text-muted-foreground" />}
                  required
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="public-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Email Address
                </label>
                <Input
                  id="public-email"
                  type="email"
                  placeholder="e.g. citizen@example.com"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-muted-foreground" />}
                  className="font-mono"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              {/* Phone Number (optional) */}
              <div className="space-y-1.5">
                <label htmlFor="public-phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Phone Number <span className="text-muted-foreground/60 normal-case">(optional)</span>
                </label>
                <Input
                  id="public-phone"
                  type="tel"
                  placeholder="e.g. +91 98765XXXXX"
                  value={formData.phoneNumber}
                  onChange={(e) => updateField("phoneNumber", e.target.value)}
                  leftIcon={<Phone className="w-4 h-4 text-muted-foreground" />}
                  disabled={loading}
                />
              </div>

              {/* Divider before password */}
              <div className="border-t border-border/60 pt-3">
                <div className="flex items-center gap-2 mb-3">
                  <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                    Set Password
                  </span>
                </div>

                {/* Password */}
                <div className="space-y-1.5 mb-3">
                  <label htmlFor="public-password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                    Password
                  </label>
                  <Input
                    id="public-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    leftIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    className="font-mono"
                    required
                    minLength={8}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label htmlFor="public-confirmPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                    Confirm Password
                  </label>
                  <Input
                    id="public-confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    leftIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    className="font-mono"
                    required
                    minLength={8}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-xs text-destructive font-mono rounded-lg flex items-center gap-1.5" role="alert">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="default"
              className="w-full gap-2 font-mono bg-emerald-700 hover:bg-emerald-800"
              disabled={loading}
              loading={loading}
              loadingText="Creating public account..."
            >
              <Globe className="w-4 h-4" aria-hidden="true" />
              Register as Public User
            </Button>
          </motion.form>

          {/* Login link */}
          <div className="text-center text-xs text-muted-foreground border-t border-border/80 pt-4">
            Already have a public account?{" "}
            <a href="/public/login" className="text-primary underline hover:text-primary/80 font-semibold">
              Sign in
            </a>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default function PublicRegisterPage() {
  return (
    <ErrorBoundary>
      <PublicRegisterContent />
    </ErrorBoundary>
  );
}