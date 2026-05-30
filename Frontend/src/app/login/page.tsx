"use client";

import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { useRouter } from "next/navigation";
import {
  Lock, Wallet, ShieldCheck, Landmark, Building,
  User, RefreshCw, KeyRound, AlertCircle,
  Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../../components/ui/BackButton";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";

function LoginContent() {
  const router = useRouter();
  const { connectWallet, language } = useApp();

  const [authMethod, setAuthMethod] = useState<"wallet" | "aadhaar" | "credentials">("wallet");
  const [selectedRole, setSelectedRole] = useState<"officer" | "vendor" | "public">("vendor");

  // Credentials states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Aadhaar states
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);

  const handleWalletLogin = () => {
    setLoading(true);
    setTimeout(() => {
      connectWallet(selectedRole);
      setLoading(false);
      if (selectedRole === "officer") router.push("/admin");
      else if (selectedRole === "vendor") router.push("/vendor");
      else router.push("/dashboard");
    }, 1800);
  };

  const handleAadhaarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      if (aadhaarNumber.length !== 12 || isNaN(Number(aadhaarNumber))) {
        alert("Please enter a valid 12-digit Aadhaar number.");
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setOtpSent(true);
        setLoading(false);
      }, 1200);
    } else {
      if (otp.length !== 6) {
        alert("Please enter the 6-digit OTP code sent to your registered mobile.");
        return;
      }
      setLoading(true);
      setTimeout(() => {
        connectWallet(selectedRole, {
          name: selectedRole === "officer" ? "Shri Rajesh Kumar" : "Authorized Citizen Auditor",
          email: selectedRole === "officer" ? "rajesh.kumar77@nic.in" : "auditor.verify@india.gov.in"
        });
        setLoading(false);
        if (selectedRole === "officer") router.push("/admin");
        else router.push("/dashboard");
      }, 1800);
    }
  };

  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setTimeout(() => {
      if (failedAttempts === 0 && email !== "admin@india.gov.in" && email !== "vendor@tata.com") {
        setFailedAttempts(1);
        setLoading(false);
        alert("Verification Failure: Credentials did not resolve. (First attempt logged on security ledger)");
        return;
      }

      connectWallet(selectedRole, {
        name: selectedRole === "officer" ? "Director Rajesh Kumar" : "Corporate Bid Manager",
        email: email
      });
      setLoading(false);
      if (selectedRole === "officer") router.push("/admin");
      else if (selectedRole === "vendor") router.push("/vendor");
      else router.push("/dashboard");
    }, 1500);
  };

  const t = {
    en: {
      title: "Secure Portal Authentication",
      desc: "Connect MetaMask wallet, authorize via Aadhaar e-sign, or use secure organizational credentials.",
      roleLabel: "Select Authorization Role Access",
      walletTab: "Web3 Key Sign",
      aadhaarTab: "Aadhaar e-Sign",
      credsTab: "Org Credentials",
      mfaLabel: "Activate Multi-Factor Shield (MFA)",
      mfaDesc: "Required for high-budget tender publishing or decrypt keys releases.",
      loginCTA: "Initiate Session Verification",
      walletDesc: "Establish a secure cryptographic handshake session. Your corporate cold wallet key serves as your on-chain verified signature.",
      securityTip: "Session timestamps, client IPs, and device identities are hashed and logged on the security ledger.",
      aadhaarLabel: "12-Digit UIDAI Aadhaar Number",
      aadhaarPlaceholder: "e.g. 549182394812",
      otpLabel: "Enter 6-Digit OTP Code",
      otpPlaceholder: "e.g. 182903",
      otpStatus: "One-Time Password (OTP) dispatched to registered phone ending in XXXX",
      otpCTA: "Verify Code & Sign",
      otpDispatch: "Dispatch Aadhaar OTP",
      loginLoading: "Signing challenge root...",
      aadhaarLoading: "UIDAI verification in progress...",
      credsEmailLabel: "Administrative Email Address",
      credsEmailPlaceholder: "e.g. rajesh.kumar77@nic.in",
      credsPassLabel: "Secured Entry Password",
      credsPassPlaceholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
      credsLoading: "Hashing password credentials...",
      failedMsg: "WARNING: 1 failed authentication attempt logged on security ledger.",
      backLabel: "Back to Home",
    },
    hi: {
      title: "सुरक्षित पोर्टल प्रमाणीकरण",
      desc: "मेटामास्क वॉलेट कनेक्ट करें, आधार ई-हस्ताक्षर द्वारा प्रमाणित करें, या संगठनात्मक क्रेडेंशियल्स का उपयोग करें।",
      roleLabel: "प्राधिकरण भूमिका का चयन करें",
      walletTab: "वेब३ वॉलेट",
      aadhaarTab: "आधार ई-हस्ताक्षर",
      credsTab: "क्रेडेंशियल्स",
      mfaLabel: "मल्टी-फैक्टर शील्ड सक्रिय करें (MFA)",
      mfaDesc: "उच्च बजट निविदा प्रकाशन या डिक्रिप्शन कीज़ रिलीज़ के लिए आवश्यक।",
      loginCTA: "सत्र सत्यापन प्रारंभ करें",
      walletDesc: "एक सुरक्षित क्रिप्टोग्राफिक हैंडशेक सत्र स्थापित करें। आपकी कॉर्पोरेट कोल्ड वॉलेट कुंजी आपके ऑन-चेन सत्यापित हस्ताक्षर के रूप में कार्य करती है।",
      securityTip: "सत्र टाइमस्टैम्प, क्लाइंट आईपी और डिवाइस पहचान को सुरक्षा बहीखाते में लॉग किया जाता है।",
      aadhaarLabel: "12 अंकों का आधार नंबर",
      aadhaarPlaceholder: "उदा. 549182394812",
      otpLabel: "6 अंकों का OTP कोड दर्ज करें",
      otpPlaceholder: "उदा. 182903",
      otpStatus: "पंजीकृत फोन पर OTP भेजा गया",
      otpCTA: "कोड सत्यापित करें और हस्ताक्षर करें",
      otpDispatch: "आधार OTP भेजें",
      loginLoading: "चुनौती रूट पर हस्ताक्षर किया जा रहा है...",
      aadhaarLoading: "UIDAI सत्यापन प्रगति पर है...",
      credsEmailLabel: "प्रशासनिक ईमेल पता",
      credsEmailPlaceholder: "उदा. rajesh.kumar77@nic.in",
      credsPassLabel: "सुरक्षित पासवर्ड",
      credsPassPlaceholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
      credsLoading: "पासवर्ड क्रेडेंशियल्स हैश किए जा रहे हैं...",
      failedMsg: "चेतावनी: सुरक्षा बहीखाते में 1 असफल प्रमाणीकरण प्रयास लॉग किया गया।",
      backLabel: "होम पर वापस जाएं",
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

      <Card variant="default" className="space-y-6">
        <CardContent className="space-y-6">
          {/* 1. Role Selection buttons */}
          <section className="space-y-2">
            <h2 className="sr-only">{t.roleLabel}</h2>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t.roleLabel}>
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

              <button
                onClick={() => setSelectedRole("public")}
                role="radio"
                aria-checked={selectedRole === "public"}
                className={`py-2 rounded-lg border text-center transition-all duration-200 flex flex-col items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  selectedRole === "public"
                    ? "bg-indigo-950/20 border-indigo-500/40 text-indigo-400 font-black scale-[1.02]"
                    : "border-border hover:bg-muted text-muted-foreground text-xs font-semibold"
                }`}
              >
                <User className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="text-[9px] font-mono leading-none">AUDITOR</span>
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
          <div className="min-h-[160px] flex flex-col justify-between">
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
                    {t.walletDesc}
                  </p>
                  <Button
                    variant="default"
                    className="w-full gap-2 font-mono"
                    onClick={handleWalletLogin}
                    disabled={loading}
                    loading={loading}
                    loadingText={t.loginLoading}
                  >
                    <Wallet className="w-4 h-4" aria-hidden="true" />
                    {t.loginCTA}
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
                  className="space-y-4"
                >
                  {!otpSent ? (
                    <div className="space-y-1.5">
                      <label htmlFor="aadhaar-number" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                        {t.aadhaarLabel}
                      </label>
                      <Input
                        id="aadhaar-number"
                        type="text"
                        maxLength={12}
                        placeholder={t.aadhaarPlaceholder}
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value)}
                        rightIcon={<Smartphone className="w-4 h-4 text-muted-foreground" />}
                        className="font-mono"
                        required
                        disabled={loading}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-orange-950/20 border border-orange-500/20 p-3 rounded-lg text-xs text-saffron font-mono flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>{t.otpStatus}</span>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="aadhaar-otp" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">
                          {t.otpLabel}
                        </label>
                        <Input
                          id="aadhaar-otp"
                          type="text"
                          maxLength={6}
                          placeholder={t.otpPlaceholder}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="font-mono"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="default"
                    className="w-full gap-2 font-mono"
                    disabled={loading}
                    loading={loading}
                    loadingText={t.aadhaarLoading}
                  >
                    <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                    {otpSent ? t.otpCTA : t.otpDispatch}
                  </Button>
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
                        {t.credsEmailLabel}
                      </label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder={t.credsEmailPlaceholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="font-mono"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                        {t.credsPassLabel}
                      </label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder={t.credsPassPlaceholder}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="font-mono"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* MFA Switch */}
                  <div className="p-3 border border-border/80 rounded-xl bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground font-mono uppercase">{t.mfaLabel}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mfaEnabled}
                          onChange={(e) => setMfaEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-muted-foreground/30 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-muted after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground leading-normal">{t.mfaDesc}</p>
                  </div>

                  <Button
                    type="submit"
                    variant="default"
                    className="w-full gap-2 font-mono"
                    disabled={loading}
                    loading={loading}
                    loadingText={t.credsLoading}
                  >
                    <Lock className="w-4 h-4" aria-hidden="true" />
                    {t.loginCTA}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {failedAttempts > 0 && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-xs text-destructive font-mono rounded-lg flex items-center gap-1.5 justify-center" role="alert">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{t.failedMsg}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 bg-muted/40 p-3.5 rounded-xl border border-border text-center">
        <p className="text-xs text-muted-foreground font-mono leading-relaxed">
          {t.securityTip}
        </p>
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