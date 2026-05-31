"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck, Mail, KeyRound, CheckCircle2, AlertCircle,
  RefreshCw, ArrowRight, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { BackButton } from "../../components/ui/BackButton";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import authService from "@/services/authService";
import { useApp } from "../../context/AppContext";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useApp();

  const email = searchParams.get("email") || "";
  const type = (searchParams.get("type") as "VERIFY_EMAIL" | "FORGOT_PASSWORD") || "VERIFY_EMAIL";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // Send initial OTP on mount
  useEffect(() => {
    if (email) {
      handleSendOtp();
    }
  }, [email]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown(c => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);

    try {
      const result = await authService.sendOtp(email, type);
      setOtpSent(true);
      setCountdown(30);
      setMessage(result.message);
      if (result.devOtp) {
        setDevOtp(result.devOtp);
        // Auto-fill OTP in development mode
        if (result.devOtp.length === 6) {
          setOtp(result.devOtp.split(""));
        }
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to send OTP";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    setError(null);

    try {
      const result = await authService.resendOtp(email, type);
      setCountdown(30);
      setMessage(result.message);
      if (result.devOtp) {
        setDevOtp(result.devOtp);
        if (result.devOtp.length === 6) {
          setOtp(result.devOtp.split(""));
        }
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to resend OTP";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, "").slice(0, 6);
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] || "";
      }
      setOtp(newOtp);
      // Focus next empty or last input
      const nextEmpty = newOtp.findIndex(d => !d);
      const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
      document.getElementById(`otp-${focusIndex}`)?.focus();
      return;
    }

    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits of the OTP");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await authService.verifyOtp(email, otpString, type);
      setSuccess(true);
      setMessage(result.message);

      // If email verified successfully, redirect to login page (user must explicitly login)
      if (type === "VERIFY_EMAIL") {
        const role = searchParams.get("role") || "";
        const loginPath = role === "vendor" ? "/login/vendor" : role === "officer" ? "/login/organizer" : "/login";
        setTimeout(() => {
          router.push(`${loginPath}?verified=1&email=${encodeURIComponent(email)}`);
        }, 1500);
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Invalid OTP. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const t = {
    en: {
      title: "Email Verification",
      desc: type === "VERIFY_EMAIL" 
        ? "We've sent a 6-digit OTP to your email. Enter it below to verify your account."
        : "We've sent a password reset OTP to your email. Enter it below to proceed.",
      otpLabel: "One-Time Password (OTP)",
      otpPlaceholder: "Enter 6-digit OTP",
      verifyCTA: "Verify & Continue",
      verifyLoading: "Verifying OTP...",
      resend: "Resend OTP",
      resendCooldown: "Resend in {seconds}s",
      sendOtp: "Send OTP",
      verified: "Email Verified Successfully!",
      verifiedDesc: "Redirecting you to your dashboard...",
      backLabel: "Back to Login",
      noEmail: "No email provided",
      noEmailDesc: "Please go back and register or login first.",
      goToLogin: "Go to Login",
      devOtpHint: "Development Mode: OTP is shown below for testing",
    },
    hi: {
      title: "ईमेल सत्यापन",
      desc: type === "VERIFY_EMAIL"
        ? "हमने आपके ईमेल पर एक 6 अंकों का OTP भेजा है। अपना खाता सत्यापित करने के लिए इसे नीचे दर्ज करें।"
        : "हमने आपके ईमेल पर एक पासवर्ड रीसेट OTP भेजा है। आगे बढ़ने के लिए इसे दर्ज करें।",
      otpLabel: "वन-टाइम पासवर्ड (OTP)",
      otpPlaceholder: "6 अंकों का OTP दर्ज करें",
      verifyCTA: "सत्यापित करें और जारी रखें",
      verifyLoading: "OTP सत्यापित किया जा रहा है...",
      resend: "पुनः भेजें",
      resendCooldown: "{seconds} सेकंड में पुनः भेजें",
      sendOtp: "OTP भेजें",
      verified: "ईमेल सफलतापूर्वक सत्यापित!",
      verifiedDesc: "आपको आपके डैशबोर्ड पर रीडायरेक्ट किया जा रहा है...",
      backLabel: "लॉगिन पर वापस जाएं",
      noEmail: "कोई ईमेल प्रदान नहीं किया गया",
      noEmailDesc: "कृपया वापस जाएं और पहले पंजीकरण या लॉगिन करें।",
      goToLogin: "लॉगिन पर जाएं",
      devOtpHint: "डेवलपमेंट मोड: परीक्षण के लिए OTP नीचे दिखाया गया है",
    }
  }[language];

  if (!email) {
    return (
      <main className="w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-14">
        <Card variant="default" className="space-y-6">
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">{t.noEmail}</h2>
            <p className="text-sm text-muted-foreground mb-4">{t.noEmailDesc}</p>
            <Button variant="default" onClick={() => router.push("/login")}>
              {t.goToLogin}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-4">
        <BackButton href="/login" label={t.backLabel} variant="text" />
      </nav>

      <Card variant="default" className="space-y-6">
        <CardHeader>
          <header className="text-center border-b border-border/60 pb-4">
            <div className={`w-12 h-12 ${success ? 'bg-emerald-950 border-emerald-500/20 text-emerald-400' : 'bg-muted border-border'} rounded-xl flex items-center justify-center mx-auto mb-3`}>
              {success ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : (
                <Mail className="w-5 h-5 text-primary" />
              )}
            </div>
            <CardTitle className="text-base sm:text-lg">
              {success ? t.verified : t.title}
            </CardTitle>
            <CardDescription className="mt-1.5">
              {success ? t.verifiedDesc : t.desc}
            </CardDescription>
            {devOtp && !success && (
              <div className="mt-3 p-2 bg-yellow-950/20 border border-yellow-500/20 rounded-lg text-xs text-yellow-400 font-mono">
                <p className="font-bold mb-1">🔧 {t.devOtpHint}</p>
                <p className="text-lg tracking-widest font-black">{devOtp}</p>
              </div>
            )}
          </header>
        </CardHeader>

        <CardContent className="space-y-4">
          {!success ? (
            <>
              {/* OTP sent message */}
              {otpSent && message && (
                <div className="p-2.5 bg-primary/5 border border-primary/20 rounded-lg text-xs text-primary font-mono flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                {/* OTP Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">
                    {t.otpLabel}
                  </label>
                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg font-black font-mono bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        required
                        disabled={loading}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>

                {/* Error message */}
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
                  disabled={loading || otp.join("").length !== 6}
                  loading={loading}
                  loadingText={t.verifyLoading}
                >
                  <KeyRound className="w-4 h-4" />
                  {t.verifyCTA}
                </Button>
              </form>

              {/* Resend OTP */}
              <div className="text-center">
                {countdown > 0 ? (
                  <button
                    type="button"
                    disabled
                    className="text-xs text-muted-foreground flex items-center gap-1 justify-center mx-auto"
                  >
                    <Clock className="w-3 h-3" />
                    {t.resendCooldown.replace("{seconds}", countdown.toString())}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-xs text-primary underline hover:text-primary/80 flex items-center gap-1 justify-center mx-auto disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    {t.resend}
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-950/30 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-sm text-muted-foreground">{t.verifiedDesc}</p>
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <ErrorBoundary>
      <VerifyContent />
    </ErrorBoundary>
  );
}