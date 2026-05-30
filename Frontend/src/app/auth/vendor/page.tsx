"use client";

import React, { useState } from "react";
import { useApp } from "../../../context/AppContext";
import { useRouter } from "next/navigation";
import { Input } from "../../../components/ui/input";
import { 
  Building, Lock, Mail, User, Phone, CheckCircle2, ShieldCheck, 
  Upload, KeyRound, AlertCircle, ArrowLeft, RefreshCw, Layers,
  Sparkles, FileText, BadgePercent, MapPin, Landmark, Eye, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VendorAuthPage() {
  const router = useRouter();
  const { loginUser } = useApp();

  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  type LoginHistoryItem = { time: string; status: "success" | "failed"; source: string };

  const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([
    { time: "Today, 09:15", status: "success", source: "Corporate VPN" },
    { time: "Yesterday, 17:40", status: "success", source: "BidOps Console" },
  ]);

  // KYC Stepper Statuses
  const [kycStep, setKycStep] = useState<"Pending" | "Under Review" | "Approved">("Pending");

  // Sign In State
  const [signInForm, setSignInForm] = useState({
    email: "",
    password: "",
    gst: "",
    rememberMe: true,
    loginAlerts: true,
    allowSingleSession: true,
  });

  // Registration State
  const [registerForm, setRegisterForm] = useState({
    companyName: "",
    regNumber: "",
    gstNumber: "",
    panNumber: "",
    officialEmail: "",
    contactNumber: "",
    businessCategory: "Civil Construction",
    companyAddress: "",
    annualTurnover: "₹500 Cr+",
    msmeStatus: "Yes (Udyam registered)",
  });

  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: boolean }>({
    gstCert: false,
    panDoc: false,
    itrDoc: false,
    solvencyDoc: false,
    companyFiles: false,
  });

  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({
    gstCert: 0,
    panDoc: 0,
    itrDoc: 0,
    solvencyDoc: 0,
    companyFiles: 0,
  });

  const passwordStrength = signInForm.password.length >= 10
    ? "Strong"
    : signInForm.password.length >= 6
    ? "Moderate"
    : signInForm.password.length > 0
    ? "Weak"
    : "";

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInForm.email || !signInForm.password || !signInForm.gst) {
      setFailedAttempts(prev => prev + 1);
      const failedEntry: LoginHistoryItem = { time: "Just now", status: "failed", source: "Unknown" };
      setLoginHistory(prev => [failedEntry, ...prev].slice(0, 4));
      alert("Please fill out your business email, password, and corporate GSTIN.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      loginUser("vendor", {
        name: "L&T Infrastructure Services",
        email: signInForm.email,
        companyName: "Larsen & Toubro Ltd",
        regNumber: "CIN-L99999MH1946PLC004768",
        gst: signInForm.gst,
        kycStatus: "Approved"
      });
      const successEntry: LoginHistoryItem = { time: "Just now", status: "success", source: "Corporate VPN" };
      setLoginHistory(prev => [successEntry, ...prev].slice(0, 4));
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/vendor");
      }, 1500);
    }, 1800);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allUploaded = Object.values(uploadedFiles).every(v => v === true);
    if (!registerForm.companyName || !registerForm.officialEmail || !registerForm.gstNumber) {
      alert("Please complete the corporate profile fields.");
      return;
    }
    if (!allUploaded) {
      alert("Please upload all corporate financial certificates and tax records (GST, PAN, ITR, Solvency).");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setKycStep("Under Review");
    }, 1500);
  };

  const simulateUpload = (key: string) => {
    if (uploadedFiles[key]) return;
    setUploadProgress(prev => ({ ...prev, [key]: 10 }));
    let progress = 10;
    const interval = setInterval(() => {
      progress += 30;
      if (progress >= 100) {
        clearInterval(interval);
        setUploadedFiles(prev => ({ ...prev, [key]: true }));
        setUploadProgress(prev => ({ ...prev, [key]: 100 }));
      } else {
        setUploadProgress(prev => ({ ...prev, [key]: progress }));
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-mono">
      {/* Left Column: Corporate Branding Split */}
      <div className="lg:w-1/2 bg-slate-900/40 relative flex flex-col justify-between p-8 border-r border-border/40 overflow-hidden min-h-[300px] lg:min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.12),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.2)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <button 
          onClick={() => router.push("/")}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors z-10 font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO HOME NETWORK</span>
        </button>

        <div className="space-y-6 max-w-lg my-auto z-10 mt-12 lg:mt-0">
          <div className="inline-flex items-center space-x-2 bg-indigo-950/40 border border-indigo-500/30 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-black tracking-widest uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Corporate Bidding Portal</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-indigo-400 to-indigo-500">
            Vendor Workspace & Bidder Gateway
          </h1>

          <p className="text-xs text-slate-400 leading-relaxed font-sans font-medium">
            Lock secure MSME preferences, submit sealed cryptographically sealed commercial bids, and track automated payment receipts. Corporate identities are fully mapped to Udyam HSM keys for Zero Manipulation guarantees.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Standard Spec</span>
              <span className="text-xs font-black text-slate-300 mt-1 block">SHA-256 Sealing</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">MSME Preference</span>
              <span className="text-xs font-black text-slate-300 mt-1 block">L1 15% Preference</span>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-600 mt-8 lg:mt-0 font-mono">
          SECURED VIA TENDERCHAIN CORPORATE ENVELOPE PROTOCOL. ALL SECURE TRANSFERS LOGGED IN REAL TIME.
        </div>
      </div>

      {/* Right Column: Forms */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-lg bg-slate-900/60 border border-border/80 rounded-2xl p-6 lg:p-8 backdrop-blur-md shadow-2xl relative">
          
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-4"
              >
                <div className="w-16 h-16 bg-teal-950/40 border border-teal-500/50 rounded-full flex items-center justify-center mx-auto text-teal-400 animate-bounce">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-base font-black text-teal-400">CORPORATE PROFILE VERIFIED</h3>
                <p className="text-xs text-slate-400">Routing session to your secure Vendor Bidding cockpit...</p>
                <div className="flex justify-center pt-2">
                  <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
                </div>
              </motion.div>
            ) : kycStep === "Under Review" ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 space-y-5"
              >
                <div className="flex justify-center">
                  <div className="relative">
                    <Building className="w-14 h-14 text-indigo-400" />
                    <span className="absolute -bottom-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full px-1.5 py-0.5 animate-pulse">KYC REVIEW</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">KYC Validation Pipeline</h3>
                  <p className="text-xs text-slate-400">Onboarding submitted. Simulating smart contract validation steps:</p>
                </div>

                {/* KYC Status Stepper */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left text-xs space-y-4 font-mono">
                  <div className="flex items-center space-x-3 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold text-[11px]">STEP 1: CORPORATE IDENTITY PACK</p>
                      <p className="text-[9px] text-slate-500">GSTIN ({registerForm.gstNumber}) successfully resolved via API</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-amber-400">
                    <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
                    <div className="flex-1">
                      <p className="font-bold text-[11px]">STEP 2: NATIONAL SOLVENCY CHECKS</p>
                      <p className="text-[9px] text-slate-500">Scheduled bank letter check pending officer signing node</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-slate-600">
                    <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[8px] font-bold">3</div>
                    <div className="flex-1">
                      <p className="font-bold text-[11px] text-slate-500">STEP 3: LEDGER INTEGRITY</p>
                      <p className="text-[9px] text-slate-600">Minting immutable corporate keys to secure cold storage</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setKycStep("Pending");
                    setActiveTab("signin");
                  }}
                  className="mt-4 px-6 py-2.5 bg-indigo-950/40 text-indigo-400 border border-indigo-500/30 text-xs font-black rounded-lg hover:bg-indigo-900/20 transition-all"
                >
                  Return to Sign In Gateway
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Auth Mode Tabs */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setActiveTab("signin")}
                    className={`py-2 text-xs font-black rounded-lg transition-all ${
                      activeTab === "signin" 
                        ? "bg-slate-800 text-indigo-400 shadow-md" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    SIGN IN
                  </button>
                  <button
                    onClick={() => setActiveTab("register")}
                    className={`py-2 text-xs font-black rounded-lg transition-all ${
                      activeTab === "register" 
                        ? "bg-slate-800 text-indigo-400 shadow-md" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    CORPORATE KYC REGISTER
                  </button>
                </div>

                {activeTab === "signin" ? (
                  <form onSubmit={handleSignInSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Company Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <Input
                          type="email"
                          required
                          value={signInForm.email}
                          onChange={e => setSignInForm({ ...signInForm, email: e.target.value })}
                          placeholder="procurement@larsentoubro.com"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-indigo-500 font-sans"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Corporate GSTIN / Vendor ID
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <Input
                          type="text"
                          required
                          value={signInForm.gst}
                          onChange={e => setSignInForm({ ...signInForm, gst: e.target.value })}
                          placeholder="27AAACL8394E1ZN"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-indigo-500 uppercase"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          required
                          value={signInForm.password}
                          onChange={e => setSignInForm({ ...signInForm, password: e.target.value })}
                          placeholder="••••••••••••"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs focus:outline-none focus:border-indigo-500 font-sans"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordStrength && (
                        <div className="pt-1">
                          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full ${
                                passwordStrength === "Strong"
                                  ? "bg-emerald-500 w-full"
                                  : passwordStrength === "Moderate"
                                  ? "bg-amber-500 w-2/3"
                                  : "bg-rose-500 w-1/3"
                              }`}
                            />
                          </div>
                          <div className="text-[9px] text-slate-500 mt-1">Password strength: {passwordStrength}</div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className="flex items-center space-x-1.5 text-slate-400 cursor-pointer font-sans">
                        <Input
                          type="checkbox"
                          checked={signInForm.rememberMe}
                          onChange={e => setSignInForm({ ...signInForm, rememberMe: e.target.checked })}
                          className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                        />
                        <span>Remember company session</span>
                      </label>
                      <button type="button" className="text-indigo-400 hover:underline">
                        Forgot Password?
                      </button>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-300">Login Alerts</span>
                        <button
                          type="button"
                          onClick={() => setSignInForm(prev => ({ ...prev, loginAlerts: !prev.loginAlerts }))}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                            signInForm.loginAlerts ? "bg-indigo-500" : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-4 h-4 bg-slate-950 rounded-full transition-transform ${
                            signInForm.loginAlerts ? "translate-x-4" : "translate-x-0"
                          }`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-300">Single Active Session</span>
                        <button
                          type="button"
                          onClick={() => setSignInForm(prev => ({ ...prev, allowSingleSession: !prev.allowSingleSession }))}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                            signInForm.allowSingleSession ? "bg-indigo-500" : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-4 h-4 bg-slate-950 rounded-full transition-transform ${
                            signInForm.allowSingleSession ? "translate-x-4" : "translate-x-0"
                          }`} />
                        </button>
                      </div>
                      <div className="text-[9px] text-slate-500 border-t border-slate-800 pt-2">
                        Failed attempts in this session: <span className={failedAttempts > 2 ? "text-rose-400" : "text-slate-300"}>{failedAttempts}</span>
                      </div>
                      <div className="space-y-1 border-t border-slate-800 pt-2">
                        {loginHistory.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[9px] text-slate-500">
                            <span>{item.time} • {item.source}</span>
                            <span className={item.status === "success" ? "text-emerald-400" : "text-rose-400"}>{item.status.toUpperCase()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>SIGN TO BUSINESS WORKSPACE</span>
                        </>
                      )}
                    </button>

                    <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-[10px] text-slate-500 flex items-start gap-1.5 leading-relaxed font-sans">
                      <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>
                        Corporate logins submit secure session hashes. Secure bidding is only available to vendors with "Approved" KYC status on-chain.
                      </span>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Company Name</label>
                        <Input
                          type="text"
                          required
                          value={registerForm.companyName}
                          onChange={e => setRegisterForm({ ...registerForm, companyName: e.target.value })}
                          placeholder="Larsen & Toubro Ltd"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 font-sans"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registration No (CIN)</label>
                        <Input
                          type="text"
                          required
                          value={registerForm.regNumber}
                          onChange={e => setRegisterForm({ ...registerForm, regNumber: e.target.value })}
                          placeholder="CIN-L99999MH1946PLC004768"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 uppercase"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">GSTIN Number</label>
                        <Input
                          type="text"
                          required
                          value={registerForm.gstNumber}
                          onChange={e => setRegisterForm({ ...registerForm, gstNumber: e.target.value })}
                          placeholder="27AAACL8394E1ZN"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 uppercase"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PAN Number</label>
                        <Input
                          type="text"
                          required
                          value={registerForm.panNumber}
                          onChange={e => setRegisterForm({ ...registerForm, panNumber: e.target.value })}
                          placeholder="AAACL8394E"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 uppercase"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Company Address</label>
                        <input
                          type="text"
                          required
                          value={registerForm.companyAddress}
                          onChange={e => setRegisterForm({ ...registerForm, companyAddress: e.target.value })}
                          placeholder="L&T House, Ballard Estate, Mumbai"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 font-sans"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Turnover (FY25)</label>
                        <input
                          type="text"
                          required
                          value={registerForm.annualTurnover}
                          onChange={e => setRegisterForm({ ...registerForm, annualTurnover: e.target.value })}
                          placeholder="₹42,150 Crore"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 font-sans"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Official Email</label>
                        <input
                          type="email"
                          required
                          value={registerForm.officialEmail}
                          onChange={e => setRegisterForm({ ...registerForm, officialEmail: e.target.value })}
                          placeholder="bid-ops@lntecc.com"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 font-sans"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Phone</label>
                        <input
                          type="text"
                          required
                          value={registerForm.contactNumber}
                          onChange={e => setRegisterForm({ ...registerForm, contactNumber: e.target.value })}
                          placeholder="+91 22 6752 5656"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 font-sans"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Business Category</label>
                        <select
                          value={registerForm.businessCategory}
                          onChange={e => setRegisterForm({ ...registerForm, businessCategory: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-300 font-sans"
                        >
                          <option>Civil Construction</option>
                          <option>Defense Systems</option>
                          <option>Information Tech</option>
                          <option>Power & Renewable Energy</option>
                        </select>
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-sans flex items-center gap-1">
                          <BadgePercent className="w-3.5 h-3.5 text-orange-400" />
                          <span>MSME Status</span>
                        </label>
                        <select
                          value={registerForm.msmeStatus}
                          onChange={e => setRegisterForm({ ...registerForm, msmeStatus: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-300 font-sans"
                        >
                          <option>Yes (Udyam registered)</option>
                          <option>No Preference</option>
                        </select>
                      </div>
                    </div>

                    {/* Financial Uploads Checklist Grid with Previews */}
                    <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                        Upload Financial & Verification Dossier
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: "gstCert", label: "GST Registration Certificate" },
                          { key: "panDoc", label: "Corporate PAN Card" },
                          { key: "itrDoc", label: "ITR Filings (Last 3 Years)" },
                          { key: "solvencyDoc", label: "Bank Solvency Certificate" },
                          { key: "companyFiles", label: "Company Verification Files" },
                        ].map(item => {
                          const isDone = uploadedFiles[item.key];
                          const prog = uploadProgress[item.key];
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => simulateUpload(item.key)}
                              className="text-left p-2 rounded-lg bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="text-[9px] font-bold text-slate-300 leading-tight block pr-2">
                                  {item.label}
                                </span>
                                {isDone ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                ) : (
                                  <Upload className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                )}
                              </div>
                              {prog > 0 && prog < 100 && (
                                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1.5">
                                  <div 
                                    className="bg-indigo-500 h-full" 
                                    style={{ width: `${prog}%` }}
                                  />
                                </div>
                              )}
                              {isDone && (
                                <span className="text-[8px] text-slate-500 mt-1 font-mono uppercase">
                                  FILE_SIGNED_ZKP.pdf
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-2.5">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Document Preview Queue</div>
                        <div className="space-y-1 text-[9px] font-mono">
                          {Object.entries(uploadedFiles).map(([key, done]) => (
                            <div key={key} className="flex items-center justify-between text-slate-500">
                              <span>{key}.pdf</span>
                              <span className={done ? "text-emerald-400" : "text-amber-400"}>{done ? "Ready" : "Pending"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg transition-all"
                    >
                      {loading ? "TRANSMITTING SIGNATURE..." : "SUBMIT CORPORATE ONBOARDING"}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
