"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock, Globe, AlertCircle, Mail, Eye, EyeOff,
  CheckCircle2, UserRound
} from "lucide-react";
import { motion } from "framer-motion";
import { BackButton } from "../../../components/ui/BackButton";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { ErrorBoundary } from "../../../components/ui/ErrorBoundary";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/Card";
import authService from "@/services/authService";
import { useApp } from "../../../context/AppContext";

function PublicLoginContent() {
  const router = useRouter();
  const { language } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  // Read verified flag from query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") === "1") {
      setVerifiedSuccess(true);
      const emailParam = params.get("email");
      if (emailParam) {
        setEmail(decodeURIComponent(emailParam));
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);
    setVerifiedSuccess(false);

    try {
      const result = await authService.login({ email, password });

      // Store auth data
      await authService.storeAuthData({
        token: result.token,
        refreshToken: result.refreshToken,
        user: result.user,
      });

      // Redirect based on role
      if (result.user.role === "public" || result.user.role === "citizen") {
        router.push("/public/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      const responseData = err?.response?.data;

      // Handle email not verified - redirect to OTP verification
      if (responseData?.needsVerification) {
        router.push(`/verify?email=${encodeURIComponent(responseData.email)}&type=VERIFY_EMAIL&role=public`);
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
      title: "Public Portal Access",
      desc: "Sign in to view tenders, track procurement activities, and access public records on the TenderChain network.",
      emailLabel: "Email Address",
      emailPlaceholder: "e.g. citizen@example.com",
      passLabel: "Password",
      passPlaceholder: "Enter your password",
      loginCTA: "Sign In to Public Portal",
      loginLoading: "Authenticating...",
      forgotPass: "Forgot Password?",
      noAccount: "Don't have an account?",
      registerLink: "Create account",
      backLabel: "Back to Home",
      rememberMe: "Remember me",
      verifiedMsg: "Email verified successfully! You can now log in.",
      registerPortal: "New to TenderChain?",
    },
    hi: {
      title: "सार्वजनिक पोर्टल प्रवेश",
      desc: "टेंडरचेन नेटवर्क पर निविदाएं देखने, खरीद गतिविधियों को ट्रैक करने और सार्वजनिक रिकॉर्ड तक पहुंचने के लिए साइन इन करें।",
      emailLabel: "ईमेल पता",
      emailPlaceholder: "उदा. citizen@example.com",
      passLabel: "पासवर्ड",
      passPlaceholder: "अपना पासवर्ड दर्ज करें",
      loginCTA: "सार्वजनिक पोर्टल में साइन इन करें",
      loginLoading: "प्रमाणीकरण हो रहा है...",
      forgotPass: "पासवर्ड भूल गए?",
      noAccount: "खाता नहीं है?",
      registerLink: "खाता बनाएं",
      backLabel: "होम पर वापस जाएं",
      rememberMe: "मुझे याद रखें",
      verifiedMsg: "ईमेल सफलतापूर्वक सत्यापित! अब आप लॉगिन कर सकते हैं।",
      registerPortal: "टेंडरचेन पर नए हैं?",
    }
  }[language];

  return (
    <main className="w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-4">
        <BackButton href="/" label={t.backLabel} variant="text" />
      </nav>

      <header className="text-center mb-6">
        <div className="w-14 h-14 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl flex items-center justify-center mx-auto mb-3.5 text-emerald-400 shadow-lg">
          <Globe className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight leading-none">
          {t.title}
        </h1>
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
          {/* Public access notice */}
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-950/20 border border-emerald-800/30 rounded-lg">
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-emerald-300 font-semibold font-mono">
              PUBLIC ACCESS — TRANSPARENT PROCUREMENT
            </span>
          </div>

          {/* Login Form */}
          <motion.form
            onSubmit={handleLogin}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="public-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  {t.emailLabel}
                </label>
                <Input
                  id="public-email"
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
                <label htmlFor="public-password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  {t.passLabel}
                </label>
                <Input
                  id="public-password"
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

              <div className="flex justify-end">
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
              className="w-full gap-2 font-mono bg-emerald-700 hover:bg-emerald-800"
              disabled={loading || !email || !password}
              loading={loading}
              loadingText={t.loginLoading}
            >
              <Lock className="w-4 h-4" aria-hidden="true" />
              {t.loginCTA}
            </Button>
          </motion.form>

          {/* Register link */}
          <div className="space-y-3 pt-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-mono font-bold">{t.registerPortal}</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 font-mono border-emerald-800/40 text-emerald-400 hover:bg-emerald-950/20 hover:text-emerald-300"
              onClick={() => router.push("/public/register")}
            >
              <UserRound className="w-4 h-4" />
              {t.registerLink}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default function PublicLoginPage() {
  return (
    <ErrorBoundary>
      <PublicLoginContent />
    </ErrorBoundary>
  );
}