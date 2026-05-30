"use client";

import React, { useState } from "react";
import { useApp } from "../../../context/AppContext";
import { useRouter } from "next/navigation";
import { Input } from "../../../components/ui/input";
import { 
  ShieldCheck, Landmark, Lock, Mail, User, Phone, Briefcase, 
  Layers, Upload, KeyRound, AlertCircle, ArrowLeft, CheckCircle2,
  RefreshCw, Terminal, Eye, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminAuthPage() {
  const router = useRouter();
  const { loginUser } = useApp();

  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Sign In State
  const [signInForm, setSignInForm] = useState({
    email: "",
    password: "",
    ministryCode: "",
    officerId: "",
    rememberMe: false,
    mfaEnabled: true,
  });

  // Registration State
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    designation: "",
    ministryName: "Ministry of Road Transport and Highways",
    ministryCode: "MORTH-IND",
    email: "",
    officerId: "",
    phone: "",
    department: "",
    permissions: ["CREATE_TENDER", "PUBLISH_BLOCKCHAIN"],
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  type LoginHistoryItem = { time: string; status: "success" | "failed"; source: string };

  const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([
    { time: "Today, 10:32", status: "success", source: "NIC VPN" },
    { time: "Yesterday, 19:12", status: "success", source: "Gov Secure WAN" },
  ]);

  const passwordStrength = signInForm.password.length >= 10
    ? "Strong"
    : signInForm.password.length >= 6
    ? "Moderate"
    : signInForm.password.length > 0
    ? "Weak"
    : "";

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInForm.email || !signInForm.password || !signInForm.officerId) {
      setFailedAttempts(prev => prev + 1);
      const failedEntry: LoginHistoryItem = { time: "Just now", status: "failed", source: "Unknown" };
      setLoginHistory(prev => [failedEntry, ...prev].slice(0, 4));
      alert("Please fill out all security fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      loginUser("officer", {
        id: signInForm.officerId,
        name: "Shri Rajesh Kumar",
        email: signInForm.email,
        ministryCode: signInForm.ministryCode,
        permissions: ["CREATE_TENDER", "PUBLISH_BLOCKCHAIN", "REVIEW_TECHNICAL_BIDS", "APPROVE_KYC"]
      });
      const successEntry: LoginHistoryItem = { time: "Just now", status: "success", source: "NIC VPN" };
      setLoginHistory(prev => [successEntry, ...prev].slice(0, 4));
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin");
      }, 1500);
    }, 1800);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.email || !registerForm.fullName || !registerForm.officerId || !isUploaded) {
      alert("Please enter all details and upload your security credentials.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setVerificationPending(true);
    }, 1500);
  };

  const handleFileUpload = () => {
    if (uploadProgress > 0) return;
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploaded(true);
          return 100;
        }
        return prev + 30;
      });
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-mono">
      {/* Left Column: Split-screen futuristic branding */}
      <div className="lg:w-1/2 bg-slate-900/40 relative flex flex-col justify-between p-8 border-r border-border/40 overflow-hidden min-h-[300px] lg:min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(13,148,136,0.15),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.2)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <button 
          onClick={() => router.push("/")}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors z-10 font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>GO BACK TO PUBLIC TIMELINE</span>
        </button>

        <div className="space-y-6 max-w-lg my-auto z-10 mt-12 lg:mt-0">
          <div className="inline-flex items-center space-x-2 bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-emerald-400 text-xs font-black tracking-widest uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>NIC Ledger Node Verified</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-400">
            Govt Officer & Admin Authority Gate
          </h1>

          <p className="text-xs text-slate-400 leading-relaxed font-sans font-medium">
            Access secure e-procurement contracts and authorize state tenders. Authentication splits private keys across on-chain multisig escrows, preserving cryptographic immutability under India National Digital Stack.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Standard Spec</span>
              <span className="text-xs font-black text-slate-300 mt-1 block">ZKP Sealing</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Consensus Method</span>
              <span className="text-xs font-black text-slate-300 mt-1 block">Aadhaar HSM</span>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-600 mt-8 lg:mt-0">
          SECURED BY NIC CYBER SECURITY CELL © 2026. UNAUTHORIZED ATTEMPTS WILL BE LOGGED ON IPFS AUDIT TRAIL.
        </div>
      </div>

      {/* Right Column: Active authentication forms */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md bg-slate-900/60 border border-border/80 rounded-2xl p-6 lg:p-8 backdrop-blur-md shadow-2xl relative">
          
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-950/40 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-base font-black text-emerald-400">CREDENTIAL SIGNATURE VERIFIED</h3>
                <p className="text-xs text-slate-400">Routing session to Government Admin dashboard ledger...</p>
                <div className="flex justify-center pt-2">
                  <RefreshCw className="w-5 h-5 text-teal-400 animate-spin" />
                </div>
              </motion.div>
            ) : verificationPending ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 space-y-4"
              >
                <div className="w-16 h-16 bg-amber-950/40 border border-amber-500/40 rounded-full flex items-center justify-center mx-auto text-amber-400 animate-pulse">
                  <Landmark className="w-8 h-8" />
                </div>
                <h3 className="text-base font-black text-amber-400">REGISTRATION UNDER REVIEW</h3>
                <p className="text-xs text-slate-300 px-4 leading-relaxed">
                  Your government ID ({registerForm.officerId}) and Verification files were successfully submitted. 
                  NIC Admin Cell will approve your signature. Status will change to "Approved" on-chain within 12 hours.
                </p>
                <div className="flex items-center justify-center gap-2 text-[10px] font-mono">
                  <span className="px-2 py-1 rounded bg-slate-900 border border-amber-500/30 text-amber-300">Approval: Pending</span>
                  <span className="px-2 py-1 rounded bg-slate-900 border border-emerald-500/30 text-emerald-300">Ministry Verified</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-left text-[10px] space-y-1">
                  <p className="text-teal-400 font-bold">&gt; TRANSMISSION STATE: COMPLETED</p>
                  <p>&gt; IPFS HASH: QmGovID{Math.floor(Math.random() * 90000)}...</p>
                  <p>&gt; SYSTEM STATUS: PENDING_NIC_SIGNATURE</p>
                </div>
                <button
                  onClick={() => {
                    setVerificationPending(false);
                    setActiveTab("signin");
                  }}
                  className="mt-4 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-lg transition-all"
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
                        ? "bg-slate-800 text-teal-400 shadow-md" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    SIGN IN
                  </button>
                  <button
                    onClick={() => setActiveTab("register")}
                    className={`py-2 text-xs font-black rounded-lg transition-all ${
                      activeTab === "register" 
                        ? "bg-slate-800 text-teal-400 shadow-md" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    OFFICER ONBOARDING
                  </button>
                </div>

                {activeTab === "signin" ? (
                  <form onSubmit={handleSignInSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Official Government Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <Input
                          type="email"
                          required
                          value={signInForm.email}
                          onChange={e => setSignInForm({ ...signInForm, email: e.target.value })}
                          placeholder="officer.name@nic.in"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-teal-500 font-sans"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Officer ID (NIC/Govt Code)
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <Input
                          type="text"
                          required
                          value={signInForm.officerId}
                          onChange={e => setSignInForm({ ...signInForm, officerId: e.target.value })}
                          placeholder="GOV-MORTH-8849"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-teal-500 uppercase"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Ministry Code
                      </label>
                      <div className="relative">
                        <Landmark className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <Input
                          type="text"
                          required
                          value={signInForm.ministryCode}
                          onChange={e => setSignInForm({ ...signInForm, ministryCode: e.target.value })}
                          placeholder="MORTH-IND"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-teal-500 uppercase"
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
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs focus:outline-none focus:border-teal-500 font-sans"
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
                          className="rounded bg-slate-950 border-slate-800 text-teal-600 focus:ring-0"
                        />
                        <span>Remember device</span>
                      </label>
                      <button type="button" className="text-teal-400 hover:underline">
                        Forgot Password?
                      </button>
                    </div>

                    {/* MFA Toggle Simulation */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-bold text-slate-300">Aadhaar OTP MFA Verification</div>
                        <div className="text-[9px] text-slate-500">Enable automated OTP challenges via registered HSM</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSignInForm(prev => ({ ...prev, mfaEnabled: !prev.mfaEnabled }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                          signInForm.mfaEnabled ? "bg-teal-500" : "bg-slate-800"
                        }`}
                      >
                        <div className={`w-4 h-4 bg-slate-950 rounded-full transition-transform duration-200 ${
                          signInForm.mfaEnabled ? "translate-x-4" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-[10px] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 uppercase tracking-wider font-bold">Security Status</span>
                        <span className={`font-bold ${failedAttempts > 2 ? "text-rose-400" : "text-emerald-400"}`}>
                          Failed Attempts: {failedAttempts}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[9px]">
                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <div className="text-slate-500">Active Sessions</div>
                          <div className="text-teal-400 font-bold">2 Devices</div>
                        </div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <div className="text-slate-500">Login Activity</div>
                          <div className="text-slate-300 font-bold">Recent 24h</div>
                        </div>
                      </div>
                      <div className="space-y-1">
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
                      className="w-full py-3 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-teal-500/10 transition-all flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>SIGN TO LEDGER NODE</span>
                        </>
                      )}
                    </button>

                    <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-[10px] text-slate-500 flex items-start gap-1.5 leading-relaxed font-sans">
                      <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        Your login session is validated with ephemeral session splits. Multi-factor checks are integrated directly with Unique Identification Authority of India (UIDAI).
                      </span>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                        <Input
                          type="text"
                          required
                          value={registerForm.fullName}
                          onChange={e => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                          placeholder="Shri Rajesh Kumar"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-teal-500 font-sans"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Designation</label>
                        <Input
                          type="text"
                          required
                          value={registerForm.designation}
                          onChange={e => setRegisterForm({ ...registerForm, designation: e.target.value })}
                          placeholder="Director Procurement"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-teal-500 font-sans"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Government Email</label>
                        <Input
                          type="email"
                          required
                          value={registerForm.email}
                          onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                          placeholder="officer.name@nic.in"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-teal-500 font-sans"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Officer ID</label>
                        <Input
                          type="text"
                          required
                          value={registerForm.officerId}
                          onChange={e => setRegisterForm({ ...registerForm, officerId: e.target.value })}
                          placeholder="GOV-MORTH-8849"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-teal-500 uppercase"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ministry Name</label>
                        <Input
                          type="text"
                          required
                          value={registerForm.ministryName}
                          onChange={e => setRegisterForm({ ...registerForm, ministryName: e.target.value })}
                          placeholder="Ministry of Road Transport"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-teal-500 font-sans"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ministry Code</label>
                        <Input
                          type="text"
                          required
                          value={registerForm.ministryCode}
                          onChange={e => setRegisterForm({ ...registerForm, ministryCode: e.target.value })}
                          placeholder="MORTH-IND"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-teal-500 uppercase"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                        <Input
                          type="text"
                          required
                          value={registerForm.phone}
                          onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-teal-500 font-sans"
                        />
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Department / Division</label>
                      <Input
                        type="text"
                        required
                        value={registerForm.department}
                        onChange={e => setRegisterForm({ ...registerForm, department: e.target.value })}
                        placeholder="Greenfield Highways Section - Division II"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-teal-500 font-sans"
                      />
                    </div>

                    {/* Permissions Multi-selector UI */}
                    <div className="space-y-1 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Assigned Permissions</span>
                      <div className="flex flex-wrap gap-1.5">
                        {["CREATE_TENDER", "PUBLISH_BLOCKCHAIN", "REVIEW_TECHNICAL_BIDS", "APPROVE_KYC"].map(perm => {
                          const has = registerForm.permissions.includes(perm);
                          return (
                            <button
                              key={perm}
                              type="button"
                              onClick={() => {
                                if (has) {
                                  setRegisterForm(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== perm) }));
                                } else {
                                  setRegisterForm(prev => ({ ...prev, permissions: [...prev.permissions, perm] }));
                                }
                              }}
                              className={`text-[9px] font-bold px-2 py-1 rounded-md border transition-all ${
                                has 
                                  ? "bg-teal-950/40 text-teal-400 border-teal-500/40" 
                                  : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
                              }`}
                            >
                              {perm}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Document Upload section */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Identity & Verify Documents</span>
                      <div className="grid grid-cols-2 gap-2">
                        {["Government Verification Documents", "Identity Card Upload"].map((label) => (
                          <button
                            key={label}
                            type="button"
                            onClick={handleFileUpload}
                            className="bg-slate-950 hover:bg-slate-900 border-dashed border-2 border-slate-800 hover:border-slate-700 py-3 rounded-xl transition-all flex flex-col items-center justify-center space-y-1.5"
                          >
                            <Upload className="w-5 h-5 text-slate-500" />
                            <span className="text-[10px] text-slate-400 font-sans text-center px-1">
                              {isUploaded ? "Uploaded" : label}
                            </span>
                            {uploadProgress > 0 && (
                              <div className="w-2/3 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                                <div
                                  className="bg-teal-500 h-full transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black rounded-xl shadow-lg transition-all"
                    >
                      {loading ? "TRANSMITTING SIGNATURE..." : "SUBMIT REGISTRATION"}
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
