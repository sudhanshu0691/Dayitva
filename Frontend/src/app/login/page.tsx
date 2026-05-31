"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock, Wallet, ShieldCheck, Landmark, Building,
  KeyRound, AlertCircle, Mail, Eye, EyeOff, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../../components/ui/BackButton";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import authService from "@/services/authService";
import { useApp } from "../../context/AppContext";

function LoginContent() {
  const router = useRouter();
  const { language, loginUser } = useApp();

  const [authMethod, setAuthMethod] = useState<"wallet" | "aadhaar" | "credentials">("credentials");
  const [selectedRole, setSelectedRole] = useState<"officer" | "vendor">("officer");
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  // Read role and verified flag from query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get("role");
    if (roleParam === "officer" || roleParam === "vendor") {
      setSelectedRole(roleParam);
    }

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

      // Store auth data (already stored inside authService.login, but also store via storeAuthData for consistency)
      await authService.storeAuthData({
        token: result.token,
        refreshToken: result.refreshToken,
        user: result.user,
      });

      // Immediately set user in context so redirects work
      loginUser(result.user.role, result.user);

      // Redirect based on role
      if (result.user.role === "officer") {
        router.push("/admin");
      } else if (result.user.role === "vendor") {
        router.push("/vendor");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      const responseData = err?.response?.data;

      // Handle email not verified - redirect to OTP verification
      if (responseData?.needsVerification) {
        router.push(`/verify?email=${encodeURIComponent(responseData.email)}&type=VERIFY_EMAIL`);
        return;
      }

      const message = responseData?.message || err?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletLogin = () => {
    // MetaMask wallet login - redirect to MetaMask flow
    setError("MetaMask wallet login will be available after connecting MetaMask. Use credentials login for now.");
  };

  const handleAadhaarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("Aadhaar e-Sign integration coming soon. Please use email/password login.");
  };

  const t = {
    en: {
      title: "Secure Portal Authentication",
      desc: "Sign in with your organizational credentials to access the TenderChain portal.",
      roleLabel: "Select Authorization Role",
      walletTab: "Web3 Key Sign",
      aadhaarTab: "Aadhaar e-Sign",
      credsTab: "Org Credentials",
      emailLabel: "Email Address",
      emailPlaceholder: "e.g. rajesh.kumar77@nic.in",
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
    },
    hi: {
      title: "सुरक्षित पोर्टल प्रमाणीकरण",
      desc: "टेंडरचेन पोर्टल तक पहुंचने के लिए अपने संगठनात्मक क्रेडेंशियल्स से साइन इन करें।",
      roleLabel: "प्राधिकरण भूमिका चुनें",
      walletTab: "वेब३ वॉलेट",
      aadhaarTab: "आधार ई-हस्ताक्षर",
      credsTab: "क्रेडेंशियल्स",
      emailLabel: "ईमेल पता",
      emailPlaceholder: "उदा. rajesh.kumar77@nic.in",
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
    }
  }[language];

  return (
    <main className="w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-4">
        <BackButton href="/" label={t.backLabel} variant="text" />
      </nav>

      {/* Page header */}
      <header className="text-center mb-6">
        <div className="w-12 h-12 bg-muted border border-border rounded-xl flex items-center justify-center mx-auto mb-3.5 text-primary shadow-lg">
          <KeyRound className="w-5 h-5" aria-hidden="true" />
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
          {/* 1. Role Selection buttons */}
          <section className="space-y-2">
            <h2 className="sr-only">{t.roleLabel}</h2>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t.roleLabel}>
              <button
                onClick={() => setSelectedRole("officer")}
                role="radio"
                aria-checked={selectedRole === "officer"}
                className={`py-2 rounded-lg border text-center transition-all duration-200 flex flex-col items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  selectedRole === "officer"
                    ? "bg-orange-950/20 border-orange-500/40 text-saffron font-black scale-[1.02]"
                    : "border-border hover:bg-muted text-muted-foreground text-xs font-semibold"
                }`}
              >
                <Landmark className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="text-[9px] font-mono leading-none">OFFICER</span>
              </button>

              <button
                onClick={() => setSelectedRole("vendor")}
                role="radio"
                aria-checked={selectedRole === "vendor"}
                className={`py-2 rounded-lg border text-center transition-all duration-200 flex flex-col items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  selectedRole === "vendor"
                    ? "bg-teal-950/20 border-teal-500/40 text-teal-400 font-black scale-[1.02]"
                    : "border-border hover:bg-muted text-muted-foreground text-xs font-semibold"
                }`}
              >
                <Building className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="text-[9px] font-mono leading-none">VENDOR</span>
              </button>

            </div>
          </section>

          {/* 2. Authentication Methods selector */}
          <div className="flex bg-muted border border-border p-1 rounded-xl text-xs font-mono font-bold tracking-tight" role="tablist" aria-label="Authentication method">
            <button
              onClick={() => setAuthMethod("wallet")}
              role="tab"
              aria-selected={authMethod === "wallet"}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                authMethod === "wallet" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.walletTab}
            </button>
            {selectedRole !== "vendor" && (
              <button
                onClick={() => setAuthMethod("aadhaar")}
                role="tab"
                aria-selected={authMethod === "aadhaar"}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  authMethod === "aadhaar" ? "bg-background text-saffron shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.aadhaarTab}
              </button>
            )}
            <button
              onClick={() => setAuthMethod("credentials")}
              role="tab"
              aria-selected={authMethod === "credentials"}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                authMethod === "credentials" ? "bg-background text-indigo-400 shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.credsTab}
            </button>
          </div>

          {/* 3. Render Login Tab Forms */}
          <div className="min-h-[200px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {authMethod === "wallet" && (
                <motion.div
                  key="wallet"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="space-y-4 text-center py-4"
                >
                  <div className="w-12 h-12 rounded-full bg-teal-950 border border-teal-800/40 flex items-center justify-center mx-auto mb-2 text-teal-400">
                    <Wallet className="w-5 h-5 animate-pulse" aria-hidden="true" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed px-4">
                    Connect your MetaMask wallet to authenticate using your on-chain identity.
                  </p>
                  <Button
                    variant="default"
                    className="w-full gap-2 font-mono"
                    onClick={handleWalletLogin}
                    disabled={loading}
                  >
                    <Wallet className="w-4 h-4" aria-hidden="true" />
                    Connect Wallet
                  </Button>
                </motion.div>
              )}

              {authMethod === "aadhaar" && (
                <motion.form
                  key="aadhaar"
                  onSubmit={handleAadhaarSubmit}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="space-y-4 py-4"
                >
                  <div className="text-sm text-muted-foreground text-center">
                    Aadhaar e-Sign integration coming soon. Please use <button type="button" onClick={() => setAuthMethod("credentials")} className="text-primary underline">email/password login</button>.
                  </div>
                </motion.form>
              )}

              {authMethod === "credentials" && (
                <motion.form
                  key="credentials"
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
              )}
            </AnimatePresence>
          </div>

          {/* Register link */}
          <div className="text-center text-xs text-muted-foreground">
            {t.noAccount}{" "}
            <a href="/register" className="text-primary underline hover:text-primary/80 font-semibold">
              {t.registerLink}
            </a>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <ErrorBoundary>
      <LoginContent />
    </ErrorBoundary>
  );
}
