"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  BellRing,
  BookOpenCheck,
  CalendarClock,
  ChevronRight,
  Eye,
  FileSearch,
  Globe,
  Layers,
  LineChart,
  Lock,
  ShieldCheck,
  UserPlus
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { BackButton } from "../../components/ui/BackButton";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";
import { useApp } from "../../context/AppContext";

function PublicContent() {
  const router = useRouter();
  const { tenders, blockchainTxs, loginUser } = useApp();

  const [showSignup, setShowSignup] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
  });

  const liveTenders = useMemo(
    () => tenders.filter((t) => t.status === "Open" || t.status === "Under Evaluation").slice(0, 3),
    [tenders]
  );

  const latestTx = blockchainTxs.slice(0, 4);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.mobile) {
      alert("Please enter email and mobile number for OTP verification.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.length < 4) {
      alert("Enter the OTP sent to your mobile/email.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      loginUser("public", {
        name: form.name || "Citizen Auditor",
        email: form.email,
      });
      setLoading(false);
      setOtpVerified(true);
      setTimeout(() => router.push("/dashboard"), 1000);
    }, 900);
  };

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(45,212,191,0.16),transparent_45%)] pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(34,197,94,0.14),transparent_40%)] pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.35)_1px,transparent_1px)] bg-[size:26px_26px] pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-6">
          <BackButton href="/" label="Back to Home" variant="text" />
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md p-5 sm:p-7"
          >
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-black px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
              <Globe className="w-3.5 h-3.5" aria-hidden="true" />
              Public Transparency Access
            </div>

            <h1 className="mt-5 text-2xl sm:text-3xl lg:text-4xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300">
              Citizen And Public Auditor Portal
            </h1>

            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
              Explore live tenders, audit timelines, blockchain verification logs, and public analytics without wallet setup or mandatory registration.
              This experience is built for open governance, civic trust, and transparent procurement.
            </p>

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-left rounded-2xl border border-border bg-card hover:border-teal-500/50 p-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="flex items-center gap-2 text-teal-300 text-xs font-black uppercase tracking-wider">
                  <Layers className="w-4 h-4" aria-hidden="true" />
                  Public Dashboard
                </div>
                <p className="text-sm text-muted-foreground mt-2">View live tenders, transparency reports, and procurement analytics.</p>
              </button>

              <button
                onClick={() => router.push("/dashboard")}
                className="text-left rounded-2xl border border-border bg-card hover:border-emerald-500/50 p-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-black uppercase tracking-wider">
                  <BookOpenCheck className="w-4 h-4" aria-hidden="true" />
                  Audit Trail Explorer
                </div>
                <p className="text-sm text-muted-foreground mt-2">Inspect timelines, transaction hashes, and immutable event history.</p>
              </button>

              <button
                onClick={() => router.push("/verify")}
                className="text-left rounded-2xl border border-border bg-card hover:border-cyan-500/50 p-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="flex items-center gap-2 text-cyan-300 text-xs font-black uppercase tracking-wider">
                  <FileSearch className="w-4 h-4" aria-hidden="true" />
                  Verify Records
                </div>
                <p className="text-sm text-muted-foreground mt-2">Verify blockchain entries and procurement integrity proof points.</p>
              </button>

              <button
                onClick={() => setShowSignup(true)}
                className="text-left rounded-2xl border border-border bg-card hover:border-indigo-500/50 p-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-black uppercase tracking-wider">
                  <BellRing className="w-4 h-4" aria-hidden="true" />
                  Optional Alerts Signup
                </div>
                <p className="text-sm text-muted-foreground mt-2">Get bookmarks, saved searches, and alerts with lightweight OTP signup.</p>
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-muted p-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-foreground">
                <Lock className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                Citizen-Friendly Security Model
              </div>
              <ul className="mt-2 text-sm text-muted-foreground space-y-1.5">
                <li>No mandatory wallet connection for public users</li>
                <li>Guest browsing enabled for transparency content</li>
                <li>Optional OTP signup for personalization only</li>
              </ul>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="lg:col-span-5 space-y-5"
          >
            <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md p-5">
              <h2 className="text-xs font-black uppercase tracking-[0.18em] text-foreground flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-teal-300" aria-hidden="true" />
                Live Tenders Snapshot
              </h2>
              <div className="mt-3 space-y-3">
                {liveTenders.map((tender) => (
                  <button
                    key={tender.id}
                    onClick={() => router.push(`/tenders/${tender.id}`)}
                    className="w-full text-left rounded-xl border border-border bg-card p-3 hover:border-teal-500/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <div className="text-xs font-mono text-teal-300">{tender.id}</div>
                    <div className="text-sm font-bold text-foreground mt-1 line-clamp-1">{tender.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{tender.ministry}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md p-5">
              <h2 className="text-xs font-black uppercase tracking-[0.18em] text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-300" aria-hidden="true" />
                Blockchain Activity Feed
              </h2>
              <div className="mt-3 space-y-2.5">
                {latestTx.map((tx) => (
                  <div key={tx.txHash} className="rounded-xl border border-border bg-card p-3">
                    <div className="flex items-center justify-between gap-2 text-xs font-mono text-muted-foreground">
                      <span>{tx.type}</span>
                      <span>Block {tx.blockNumber}</span>
                    </div>
                    <div className="text-xs mt-1 text-emerald-300">{tx.txHash.slice(0, 12)}...</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>
      </div>

      {/* Signup Modal */}
      <AnimatePresence>
        {showSignup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm p-4 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-border bg-card p-5 sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-label="Public signup"
            >
              {otpVerified ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 rounded-full mx-auto border border-emerald-400/40 bg-emerald-950/40 flex items-center justify-center">
                    <ShieldCheck className="w-7 h-7 text-emerald-300" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-black text-emerald-300">Public Profile Activated</h3>
                  <p className="text-sm text-muted-foreground">Redirecting to your public dashboard preferences...</p>
                </div>
              ) : !otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
                  <div>
                    <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Optional Public Signup</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Signup is optional. Use this only for alerts, bookmarks, and saved searches.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="pub-name" className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Name (optional)</label>
                    <input
                      id="pub-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-xl bg-background border border-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Citizen Auditor"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="pub-email" className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Email</label>
                    <input
                      id="pub-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full rounded-xl bg-background border border-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="pub-mobile" className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Mobile Number</label>
                    <input
                      id="pub-mobile"
                      type="tel"
                      required
                      value={form.mobile}
                      onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))}
                      className="w-full rounded-xl bg-background border border-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="+91 98XXXXXX10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowSignup(false)}
                      className="rounded-xl border border-input py-2 text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
                    >
                      Continue As Guest
                    </button>
                    <Button
                      type="submit"
                      variant="default"
                      className="w-full text-sm"
                      disabled={loading}
                      loading={loading}
                      loadingText="Sending OTP..."
                    >
                      Send OTP
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
                  <div className="text-center">
                    <UserPlus className="w-8 h-8 text-teal-300 mx-auto" aria-hidden="true" />
                    <h3 className="mt-2 text-sm font-black text-foreground uppercase tracking-wider">Verify OTP</h3>
                    <p className="text-sm text-muted-foreground mt-1">Enter OTP sent to your email and mobile number.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="pub-otp" className="text-xs text-muted-foreground uppercase tracking-widest font-bold">OTP</label>
                    <input
                      id="pub-otp"
                      type="text"
                      required
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="w-full rounded-xl bg-background border border-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Enter 6-digit OTP"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="rounded-xl border border-input py-2 text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
                    >
                      Edit Details
                    </button>
                    <Button
                      type="submit"
                      variant="default"
                      className="w-full text-sm"
                      disabled={loading}
                      loading={loading}
                      loadingText="Verifying..."
                    >
                      Verify And Continue
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="rounded-2xl border border-border bg-card p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LineChart className="w-4 h-4 text-teal-300" aria-hidden="true" />
            Access live tenders, audit trails, timelines, transparency reports, and public analytics without login barriers.
          </div>
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            size="sm"
            className="text-xs font-black uppercase tracking-wider rounded-xl"
          >
            Open Public Dashboard
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </main>
  );
}

export default function PublicAccessPage() {
  return (
    <ErrorBoundary>
      <PublicContent />
    </ErrorBoundary>
  );
}