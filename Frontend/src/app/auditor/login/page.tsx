"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock, Wallet, ShieldCheck, KeyRound, AlertCircle, Mail, Eye, EyeOff, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../../../components/ui/BackButton";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { ErrorBoundary } from "../../../components/ui/ErrorBoundary";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/Card";
import auditorService from "@/services/auditorService";
import { useApp } from "../../../context/AppContext";

function AuditorLoginContent() {
  const router = useRouter();
  const { language } = useApp();

  const [authMethod, setAuthMethod] = useState<"wallet" | "aadhaar" | "credentials">("credentials");
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

  // Credentials states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);
    setVerifiedSuccess(false);

    try {
      const result = await auditorService.login(email, password);
      localStorage.setItem("auditorToken", result.token);
      localStorage.setItem("auditorRefreshToken", result.refreshToken);
      localStorage.setItem("auditor", JSON.stringify(result.auditor));
      // Show OTP verification modal
      setShowOtpModal(true);
    } catch (err: any) {
      const responseData = err?.response?.data;
      if (responseData?.needsVerification) {
        router.push(`/verify?email=${encodeURIComponent(responseData.email)}&type=VERIFY_EMAIL&role=auditor`);
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

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`auditor-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setOtpError("Please enter complete OTP");
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    try {
      setShowOtpModal(false);
      router.push("/auditor/dashboard");
    } catch (err: any) {
      setOtpError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    setOtpError(null);
  };

  const t = {
    en: {
      title: "Auditor Portal Authentication",
      desc: "Sign in with your verification authority credentials to access the auditor dashboard.",
      walletTab: "Web3 Key Sign",
      aadhaarTab: "Aadhaar e-Sign",
      credsTab: "Org Credentials",
      emailLabel: "Official Email / Login ID",
      emailPlaceholder: "e.g. auditor@gov.in",
      passLabel: "Password",
      passPlaceholder: "Enter your password",
      loginCTA: "Sign In",
      loginLoading: "Authenticating...",
      forgotPass: "Forgot Password?",
      noAccount: "Don't have an auditor account?",
      registerLink: "Register here",
      backLabel: "Back to Home",
      rememberMe: "Remember me",
      verifiedMsg: "Email verified successfully! You can now log in with your credentials.",
      otpTitle: "Two-Factor Verification",
      otpDesc: "Enter the OTP sent to your registered email",
    },
    hi: {
      title: "ऑडिटर पोर्टल प्रमाणीकरण",
      desc: "सत्यापन प्राधिकरण क्रेडेंशियल्स के साथ साइन इन करें।",
      walletTab: "वेब३ वॉलेट",
      aadhaarTab: "आधार ई-हस्ताक्षर",
      credsTab: "क्रेडेंशियल्स",
      emailLabel: "आधिकारिक ईमेल",
      emailPlaceholder: "उदा. auditor@gov.in",
      passLabel: "पासवर्ड",
      passPlaceholder: "अपना पासवर्ड दर्ज करें",
      loginCTA: "साइन इन करें",
      loginLoading: "प्रमाणीकरण हो रहा है...",
      forgotPass: "पासवर्ड भूल गए?",
      noAccount: "ऑडिटर खाता नहीं है?",
      registerLink: "यहां पंजीकरण करें",
      backLabel: "होम पर वापस जाएं",
      rememberMe: "मुझे याद रखें",
      verifiedMsg: "ईमेल सफलतापूर्वक सत्यापित! अब आप लॉगिन कर सकते हैं।",
      otpTitle: "दो-चरणीय सत्यापन",
      otpDesc: "अपने पंजीकृत ईमेल पर भेजे गए ओटीपी में प्रवेश करें",
    }
  }[language];

  return (
    <main className="w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-4">
        <BackButton href="/" label={t.backLabel} variant="text" />
      </nav>

      {/* Page header */}
      <header className="text-center mb-6">
        <div className="w-12 h-12 bg-red-950/30 border border-red-800/40 rounded-xl flex items-center justify-center mx-auto mb-3.5 text-red-400 shadow-lg">
          <ShieldCheck className="w-5 h-5" aria-hidden="true" />
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
          {/* Authentication badge */}
          <div className="flex items-center gap-2 px-3 py-2 bg-red-950/20 border border-red-800/30 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-xs text-red-300 font-semibold font-mono">
              AUTHORIZED PERSONNEL ONLY
            </span>
          </div>

          {/* 1. Authentication Methods selector */}
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

          {/* 2. Render Login Tab Forms */}
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
                      <label htmlFor="auditor-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                        {t.emailLabel}
                      </label>
                      <Input
                        id="auditor-email"
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
                      <label htmlFor="auditor-password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                        {t.passLabel}
                      </label>
                      <Input
                        id="auditor-password"
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
                        onClick={() => router.push("/auditor/forgot-password")}
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
            <a href="/auditor/register" className="text-primary underline hover:text-primary/80 font-semibold">
              {t.registerLink}
            </a>
          </div>
        </CardContent>
      </Card>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Card variant="default" className="w-full max-w-sm mx-4">
            <CardContent className="space-y-4 py-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex items-center justify-center mx-auto mb-3 text-emerald-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">{t.otpTitle}</h3>
                <p className="text-xs text-muted-foreground mt-1">{t.otpDesc}</p>
              </div>

              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`auditor-otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className="w-10 h-12 text-center text-lg font-bold font-mono bg-background border border-border rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-xs text-destructive text-center">{otpError}</p>
              )}

              <Button
                variant="default"
                className="w-full"
                onClick={handleOtpVerify}
                loading={otpLoading}
                loadingText="Verifying..."
              >
                Verify OTP
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-xs text-primary underline hover:text-primary/80"
                >
                  Resend OTP
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}

export default function AuditorLoginPage() {
  return (
    <ErrorBoundary>
      <AuditorLoginContent />
    </ErrorBoundary>
  );
}