"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock, KeyRound, AlertCircle, Mail, Eye, EyeOff, CheckCircle2, Landmark
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../../../components/ui/BackButton";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { ErrorBoundary } from "../../../components/ui/ErrorBoundary";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/Card";
import authService from "@/services/authService";
import { useApp } from "../../../context/AppContext";

function OfficerLoginContent() {
  const router = useRouter();
  const { language, loginUser, hydrated } = useApp();

  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  // Read verified flag from query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Show success message if redirected from email verification
    if (params.get("verified") === "1") {
      setVerifiedSuccess(true);
      // Pre-fill email if provided
      const emailParam = params.get("email");
      if (emailParam) {
        setEmail(decodeURIComponent(emailParam));
      }
    }
  }, []);

  // Credentials states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);
    setVerifiedSuccess(false);

    try {
      const result = await authService.login({ email, password });

      // Store auth data in localStorage
      await authService.storeAuthData({
        token: result.token,
        refreshToken: result.refreshToken,
        user: result.user,
      });

      // Validate role
      if (result.user.role !== "officer") {
        setError("This account is not authorized as an Officer. Please use the vendor login.");
        authService.clearAuthData();
        return;
      }

      // Update context with user data
      loginUser(result.user.role, result.user);

      // Redirect to officer dashboard
      router.push("/officer");
    } catch (err: any) {
      const responseData = err?.response?.data;

      // Handle email not verified - redirect to OTP verification
      if (responseData?.needsVerification) {
        router.push(`/verify?email=${encodeURIComponent(responseData.email)}&type=VERIFY_EMAIL&role=officer`);
        return;
      }

      const message = responseData?.message || err?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const t = {
    en: {
      title: "Government Officer Portal",
      desc: "Sign in with your government officer credentials to access the TenderChain portal.",
      emailLabel: "Email Address",
      emailPlaceholder: "e.g. officer@nic.in",
      passLabel: "Password",
      passPlaceholder: "Enter your password",
      loginCTA: "Sign In",
      loginLoading: "Authenticating...",
      forgotPass: "Forgot Password?",
      noAccount: "Don't have an account?",
      registerLink: "Register here",
      backLabel: "Back to Home",
      rememberMe: "Remember me",
      verifiedMsg: "Email verified successfully! You can now log in with your credentials.",
      vendorLink: "Looking for Vendor Login?",
    },
    hi: {
      title: "सरकारी अधिकारी पोर्टल",
      desc: "टेंडरचेन पोर्टल तक पहुंचने के लिए अपने सरकारी अधिकारी क्रेडेंशियल्स से साइन इन करें।",
      emailLabel: "ईमेल पता",
      emailPlaceholder: "उदा. officer@nic.in",
      passLabel: "पासवर्ड",
      passPlaceholder: "अपना पासवर्ड दर्ज करें",
      loginCTA: "साइन इन करें",
      loginLoading: "प्रमाणीकरण हो रहा है...",
      forgotPass: "पासवर्ड भूल गए?",
      noAccount: "खाता नहीं है?",
      registerLink: "यहां पंजीकरण करें",
      backLabel: "होम पर वापस जाएं",
      rememberMe: "मुझे याद रखें",
      verifiedMsg: "ईमेल सफलतापूर्वक सत्यापित! अब आप अपने क्रेडेंशियल्स से लॉगिन कर सकते हैं।",
      vendorLink: "विक्रेता लॉगिन ढूंढ रहे हैं?",
    }
  }[language];

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <main className="w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-4">
        <BackButton href="/" label={t.backLabel} variant="text" />
      </nav>

      {/* Page header */}
      <header className="text-center mb-6">
        <div className="w-12 h-12 bg-orange-950/20 border border-orange-500/40 rounded-xl flex items-center justify-center mx-auto mb-3.5 text-saffron shadow-lg">
          <Landmark className="w-5 h-5" aria-hidden="true" />
        </div>
        <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight leading-none">{t.title}</h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed px-4">
          {t.desc}
        </p>
      </header>

      {/* Email verification success banner */}
      {verifiedSuccess && (
        <div className="mb-4 p-3 bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-400 font-mono rounded-lg flex items-center gap-1.5" role="alert">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{t.verifiedMsg}</span>
        </div>
      )}

      <Card variant="default" className="space-y-6">
        <CardContent className="space-y-6">
          {/* Credentials Form */}
          <motion.form
            onSubmit={handleCredentialLogin}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="space-y-4"
          >
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  {t.emailLabel}
                </label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-muted-foreground" />}
                  className="font-mono"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  {t.passLabel}
                </label>
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t.passPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border"
                  />
                  {t.rememberMe}
                </label>
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-xs text-primary underline hover:text-primary/80"
                >
                  {t.forgotPass}
                </button>
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
              className="w-full gap-2 font-mono"
              disabled={loading || !email || !password}
              loading={loading}
              loadingText={t.loginLoading}
            >
              <Lock className="w-4 h-4" aria-hidden="true" />
              {t.loginCTA}
            </Button>
          </motion.form>

          {/* Register link */}
          <div className="text-center text-xs text-muted-foreground">
            {t.noAccount}{" "}
            <a href="/register?role=officer" className="text-primary underline hover:text-primary/80 font-semibold">
              {t.registerLink}
            </a>
          </div>

          {/* Link to vendor login */}
          <div className="pt-4 border-t border-border/50 text-center text-xs">
            <a href="/login/vendor" className="text-teal-400 underline hover:text-teal-300 font-semibold">
              {t.vendorLink}
            </a>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default function OfficerLoginPage() {
  return (
    <ErrorBoundary>
      <OfficerLoginContent />
    </ErrorBoundary>
  );
}
