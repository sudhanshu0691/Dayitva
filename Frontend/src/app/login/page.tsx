"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock, Wallet, ShieldCheck, Landmark, Building,
  KeyRound, AlertCircle, Mail, CheckCircle2, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../../components/ui/BackButton";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";
import { Card, CardContent } from "../../components/ui/Card";
import authService from "@/services/authService";
import { useApp } from "../../context/AppContext";

function LoginContent() {
  const router = useRouter();
  const { language, loginUser } = useApp();

  const [authMethod, setAuthMethod] = useState<"wallet" | "aadhaar" | "credentials">("credentials");
  const [selectedRole, setSelectedRole] = useState<"officer" | "vendor">("officer");
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get("role");
    if (roleParam === "officer" || roleParam === "vendor") {
      setSelectedRole(roleParam);
    }
    if (params.get("verified") === "1") {
      setVerifiedSuccess(true);
      const emailParam = params.get("email");
      if (emailParam) {
        setEmail(decodeURIComponent(emailParam));
      }
    }
  }, []);

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

      await authService.storeAuthData({
        token: result.token,
        refreshToken: result.refreshToken,
        user: result.user,
      });

      loginUser(result.user.role, result.user);

      if (result.user.role === "officer") {
        router.push("/officer/dashboard");
      } else if (result.user.role === "vendor") {
        router.push("/vendor/dashboard");
      }
    } catch (err: any) {
      const responseData = err?.response?.data;

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
      walletTab: "Web3 Wallet",
      aadhaarTab: "Aadhaar e-Sign",
      credsTab: "Credentials",
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
    <main className="w-full min-h-screen bg-gradient-to-b from-background via-background to-surface-container-low flex items-center justify-center px-4 py-12 relative overflow-hidden perspective">
      {/* 3D grid background */}
      <div className="absolute inset-0 pointer-events-none bg-grid-3d" />
      {/* Floating shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="floating-shape floating-shape-1" style={{ left: '-10%', top: '20%' }} />
        <div className="floating-shape floating-shape-3" style={{ right: '-5%', bottom: '30%' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <nav className="mb-6">
          <BackButton href="/" label={t.backLabel} variant="text" />
        </nav>

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-3d-sm card-3d-float">
            <KeyRound className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-headline-md font-bold text-foreground tracking-tight">{t.title}</h1>
          <p className="text-body-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            {t.desc}
          </p>
        </div>

        {verifiedSuccess && (
          <div className="mb-5 p-3.5 bg-success/10 border border-success/20 text-body-sm text-success rounded-xl flex items-center gap-2 animate-slide-down" role="alert">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{t.verifiedMsg}</span>
          </div>
        )}

        <Card variant="3d-tilt" className="space-y-6 shadow-depth">
          <CardContent className="space-y-6">
            <section className="space-y-2">
              <h2 className="sr-only">{t.roleLabel}</h2>
              <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label={t.roleLabel}>
                <button
                  onClick={() => setSelectedRole("officer")}
                  role="radio"
                  aria-checked={selectedRole === "officer"}
                  className={`py-3 rounded-xl border-2 text-center transition-all duration-200 flex flex-col items-center justify-center gap-1.5 focus-ring ${
                    selectedRole === "officer"
                      ? "bg-accent/5 border-accent/40 text-accent font-bold"
                      : "border-border hover:bg-surface-container-low text-muted-foreground"
                  }`}
                >
                  <Landmark className={`w-5 h-5 ${selectedRole === "officer" ? "text-accent" : "text-muted-foreground"}`} />
                  <span className="text-caption font-semibold">OFFICER</span>
                </button>

                <button
                  onClick={() => setSelectedRole("vendor")}
                  role="radio"
                  aria-checked={selectedRole === "vendor"}
                  className={`py-3 rounded-xl border-2 text-center transition-all duration-200 flex flex-col items-center justify-center gap-1.5 focus-ring ${
                    selectedRole === "vendor"
                      ? "bg-success/5 border-success/40 text-success font-bold"
                      : "border-border hover:bg-surface-container-low text-muted-foreground"
                  }`}
                >
                  <Building className={`w-5 h-5 ${selectedRole === "vendor" ? "text-success" : "text-muted-foreground"}`} />
                  <span className="text-caption font-semibold">VENDOR</span>
                </button>
              </div>
            </section>

            <div className="flex bg-surface-container-low border border-border p-1 rounded-xl text-caption font-semibold" role="tablist" aria-label="Authentication method">
              <button
                onClick={() => setAuthMethod("credentials")}
                role="tab"
                aria-selected={authMethod === "credentials"}
                className={`flex-1 py-2 rounded-lg text-center transition-all duration-200 focus-ring ${
                  authMethod === "credentials" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.credsTab}
              </button>
              <button
                onClick={() => setAuthMethod("wallet")}
                role="tab"
                aria-selected={authMethod === "wallet"}
                className={`flex-1 py-2 rounded-lg text-center transition-all duration-200 focus-ring ${
                  authMethod === "wallet" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.walletTab}
              </button>
              {selectedRole !== "vendor" && (
                <button
                  onClick={() => setAuthMethod("aadhaar")}
                  role="tab"
                  aria-selected={authMethod === "aadhaar"}
                  className={`flex-1 py-2 rounded-lg text-center transition-all duration-200 focus-ring ${
                    authMethod === "aadhaar" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.aadhaarTab}
                </button>
              )}
            </div>

            <div className="min-h-[220px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                {authMethod === "credentials" && (
                  <motion.form
                    key="credentials"
                    onSubmit={handleCredentialLogin}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="space-y-4"
                  >
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label htmlFor="login-email" className="text-caption font-semibold uppercase tracking-wider text-muted-foreground">
                          {t.emailLabel}
                        </label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder={t.emailPlaceholder}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          leftIcon={<Mail className="w-4 h-4 text-muted-foreground" />}
                          required
                          disabled={loading}
                          autoComplete="email"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="login-password" className="text-caption font-semibold uppercase tracking-wider text-muted-foreground">
                          {t.passLabel}
                        </label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder={t.passPlaceholder}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          leftIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                          required
                          disabled={loading}
                          autoComplete="current-password"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-caption text-muted-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="rounded border-border accent-accent"
                          />
                          {t.rememberMe}
                        </label>
                        <button
                          type="button"
                          onClick={() => router.push("/forgot-password")}
                          className="text-caption text-accent hover:text-accent/80 font-semibold"
                        >
                          {t.forgotPass}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 text-body-sm text-destructive rounded-xl flex items-center gap-2" role="alert">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="accent"
                      className="w-full"
                      disabled={loading || !email || !password}
                      loading={loading}
                      loadingText={t.loginLoading}
                    >
                      <Lock className="w-4 h-4" />
                      {t.loginCTA}
                    </Button>
                  </motion.form>
                )}

                {authMethod === "wallet" && (
                  <motion.div
                    key="wallet"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="space-y-5 text-center py-6"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
                      <Wallet className="w-7 h-7 text-accent animate-float" />
                    </div>
                    <p className="text-body-sm text-muted-foreground leading-relaxed px-4">
                      Connect your MetaMask wallet to authenticate using your on-chain identity.
                    </p>
                    <Button
                      variant="accent"
                      className="w-full"
                      onClick={handleWalletLogin}
                      disabled={loading}
                    >
                      <Wallet className="w-4 h-4" />
                      Connect Wallet
                    </Button>
                  </motion.div>
                )}

                {authMethod === "aadhaar" && (
                  <motion.form
                    key="aadhaar"
                    onSubmit={handleAadhaarSubmit}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="space-y-4 py-6 text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-7 h-7 text-warning" />
                    </div>
                    <p className="text-body-sm text-muted-foreground">
                      Aadhaar e-Sign integration coming soon. Please use <button type="button" onClick={() => setAuthMethod("credentials")} className="text-accent underline font-semibold">email/password login</button>.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            <div className="text-center text-caption text-muted-foreground pt-2 border-t border-border/60">
              {t.noAccount}{" "}
              <a href="/register" className="text-accent underline hover:text-accent/80 font-semibold">
                {t.registerLink}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
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
