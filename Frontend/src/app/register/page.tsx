"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building, Landmark, ShieldCheck, UploadCloud, CheckCircle2,
  Laptop, Clock, Globe, Lock, Mail, Eye, EyeOff, AlertCircle,
  UserRound, Phone, KeyRound
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../../components/ui/BackButton";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";
import { Card, CardContent } from "../../components/ui/Card";
import authService from "@/services/authService";
import { useApp } from "../../context/AppContext";

function RegisterContent() {
  const router = useRouter();
  const { language } = useApp();

  const [regType, setRegType] = useState<"vendor" | "officer">("vendor");
  
  // Redirect to auditor's dedicated register page if auditor tab is clicked
  const handleRegTypeChange = (type: "vendor" | "officer" | "auditor") => {
    if (type === "auditor") {
      router.push("/auditor/register");
      return;
    }
    setRegType(type);
  };

  // Auto-captured metadata
  const [metadata, setMetadata] = useState({
    timestamp: "",
    ipAddress: "157.45.192.12",
    device: ""
  });

  useEffect(() => {
    setMetadata({
      timestamp: new Date().toISOString(),
      ipAddress: "103." + Math.floor(Math.random()*255) + "." + Math.floor(Math.random()*255) + "." + Math.floor(Math.random()*255),
      device: navigator.userAgent.substring(0, 48) + "..."
    });
  }, []);

  // Vendor Registration states
  const [vendorData, setVendorData] = useState({
    name: "",
    companyName: "",
    regNumber: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    pan: "",
    gst: "",
    turnover: "",
    itrYears: ["2023", "2024"]
  });

  // Officer Registration states
  const [officerData, setOfficerData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    officerId: "",
    designation: "",
    ministryCode: "MORTH-IND",
    ministry: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (vendorData.password !== vendorData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (vendorData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        name: vendorData.name,
        email: vendorData.email,
        password: vendorData.password,
        role: "vendor",
        mobile: vendorData.mobile,
        companyName: vendorData.companyName,
        pan: vendorData.pan,
        gst: vendorData.gst,
        turnover: vendorData.turnover,
        regNumber: vendorData.regNumber,
      });

      router.push(`/verify?email=${encodeURIComponent(vendorData.email)}&type=VERIFY_EMAIL&role=vendor`);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOfficerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (officerData.password !== officerData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (officerData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        name: officerData.name,
        email: officerData.email,
        password: officerData.password,
        role: "officer",
        designation: officerData.designation,
        ministry: officerData.ministry,
        ministryCode: officerData.ministryCode,
      });

      router.push(`/verify?email=${encodeURIComponent(officerData.email)}&type=VERIFY_EMAIL&role=officer`);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const t = {
    en: {
      title: "Consortium Registration Hub",
      desc: "Enroll as a verified tender issuing officer or register your corporate entity on the blockchain KYC system.",
      vendorTab: "Corporate Vendor",
      officerTab: "Government Officer",
      metadataTitle: "Security Metadata",
      metadataDesc: "For compliance tracking and auditing:",
      name: "Full Name",
      emailLabel: "Email Address",
      emailPH: "e.g. vendor@company.com",
      passLabel: "Password",
      passPH: "Min 8 characters",
      confirmPass: "Confirm Password",
      compName: "Company Name",
      cin: "CIN Number",
      pan: "PAN Number",
      gst: "GSTIN",
      turnover: "Annual Turnover (in Crores)",
      mobile: "Mobile Number",
      uploadTitle: "KYC Documents Upload",
      uploadHint: "Choose Certificate (Solvency, ITR, PAN)",
      officerName: "Officer Full Name",
      officerEmail: "NIC / Gov Email",
      officerID: "Officer ID",
      desig: "Designation",
      ministry: "Ministry Name",
      regCTA: "Submit Registration",
      loadingVendor: "Creating vendor account...",
      loadingOfficer: "Creating officer account...",
      backLabel: "Back to Home",
      haveAccount: "Already have an account?",
      loginLink: "Sign in",
    },
    hi: {
      title: "कंसोर्टियम पंजीकरण हब",
      desc: "सत्यापित निविदा अधिकारी या कॉर्पोरेट इकाई के रूप में पंजीकरण करें।",
      vendorTab: "कॉर्पोरेट विक्रेता",
      officerTab: "सरकारी अधिकारी",
      metadataTitle: "सुरक्षा मेटाडेटा",
      metadataDesc: "अनुपालन ट्रैकिंग और ऑडिटिंग के लिए:",
      name: "पूरा नाम",
      emailLabel: "ईमेल पता",
      emailPH: "उदा. vendor@company.com",
      passLabel: "पासवर्ड",
      passPH: "न्यूनतम 8 वर्ण",
      confirmPass: "पासवर्ड की पुष्टि करें",
      compName: "कंपनी का नाम",
      cin: "सीआईएन नंबर",
      pan: "पैन नंबर",
      gst: "जीएसटी नंबर",
      turnover: "वार्षिक टर्नओवर (करोड़ में)",
      mobile: "मोबाइल नंबर",
      uploadTitle: "केवाईसी दस्तावेज़ अपलोड",
      uploadHint: "प्रमाणपत्र चुनें (सॉल्वेंसी, आईटीआर, पैन)",
      officerName: "अधिकारी का पूरा नाम",
      officerEmail: "सरकारी ईमेल",
      officerID: "अधिकारी आईडी",
      desig: "पदनाम",
      ministry: "मंत्रालय का नाम",
      regCTA: "पंजीकरण जमा करें",
      loadingVendor: "विक्रेता खाता बनाया जा रहा है...",
      loadingOfficer: "अधिकारी खाता बनाया जा रहा है...",
      backLabel: "होम पर वापस जाएं",
      haveAccount: "पहले से खाता है?",
      loginLink: "साइन इन करें",
    }
  }[language];

  return (
    <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 relative perspective">
      {/* 3D grid background */}
      <div className="absolute inset-0 pointer-events-none bg-grid-3d" />
      {/* Floating shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="floating-shape floating-shape-2" style={{ right: '-10%', top: '5%' }} />
        <div className="floating-shape floating-shape-3" style={{ left: '-8%', bottom: '10%' }} />
      </div>

      <nav aria-label="Breadcrumb" className="mb-4 relative z-10">
        <BackButton href="/" label={t.backLabel} variant="text" />
      </nav>

      {/* Title */}
      <header className="text-center mb-8 border-b border-border/80 pb-6 relative z-10">
        <h1 className="text-xl sm:text-2xl font-black text-foreground flex items-center justify-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" aria-hidden="true" />
          {t.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
          {t.desc}
        </p>
      </header>

      {/* Tabs Selectors */}
      <div className="flex border border-border bg-muted/40 p-1.5 rounded-2xl mb-6 font-mono text-xs font-bold uppercase tracking-tight" role="tablist" aria-label="Registration type">
        <button
          onClick={() => handleRegTypeChange("vendor")}
          role="tab"
          aria-selected={regType === "vendor"}
          className={`flex-1 py-2.5 rounded-xl text-center transition-all duration-200 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            regType === "vendor" ? "bg-background text-primary shadow-md border border-border" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building className="w-4 h-4" aria-hidden="true" />
          <span>{t.vendorTab}</span>
        </button>
        <button
          onClick={() => handleRegTypeChange("officer")}
          role="tab"
          aria-selected={regType === "officer"}
          className={`flex-1 py-2.5 rounded-xl text-center transition-all duration-200 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            regType === "officer" ? "bg-background text-saffron shadow-md border border-border" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Landmark className="w-4 h-4" aria-hidden="true" />
          <span>{t.officerTab}</span>
        </button>
        <button
          onClick={() => handleRegTypeChange("auditor")}
          role="tab"
          aria-selected={false}
          className="flex-1 py-2.5 rounded-xl text-center transition-all duration-200 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-muted-foreground hover:text-foreground"
        >
          <ShieldCheck className="w-4 h-4" aria-hidden="true" />
          <span>Auditor</span>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-xs text-destructive font-mono rounded-lg flex items-center gap-1.5" role="alert">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Security Metadata Ribbon */}
      <section className="p-4 bg-muted border border-border rounded-xl mb-6 text-xs leading-relaxed">
        <div className="flex items-center space-x-2 text-primary uppercase tracking-widest text-[10px] font-bold border-b border-border pb-2 mb-2">
          <Laptop className="w-4 h-4" aria-hidden="true" />
          <span>{t.metadataTitle}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-foreground font-bold">
          <div className="flex items-center space-x-1.5 bg-background p-1.5 rounded border border-border">
            <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{new Date(metadata.timestamp).toLocaleTimeString()} UTC</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-background p-1.5 rounded border border-border">
            <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">IP: {metadata.ipAddress}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-background p-1.5 rounded border border-border">
            <Laptop className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">ID: Client OS</span>
          </div>
        </div>
      </section>

      <Card variant="3d-tilt" className="space-y-6 shadow-depth relative z-10">
        <CardContent>
          <AnimatePresence mode="wait">

            {/* VENDOR REGISTRATION FORM */}
            {regType === "vendor" && (
              <motion.form
                key="vendor-form"
                onSubmit={handleVendorSubmit}
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                className="space-y-4"
                noValidate
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.name}</label>
                    <Input
                      type="text"
                      placeholder="e.g. Rajesh Kumar"
                      value={vendorData.name}
                      onChange={(e) => setVendorData({...vendorData, name: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.compName}</label>
                    <Input
                      type="text"
                      placeholder="e.g. Larsen & Toubro Limited"
                      value={vendorData.companyName}
                      onChange={(e) => setVendorData({...vendorData, companyName: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.emailLabel}</label>
                    <Input
                      type="email"
                      placeholder={t.emailPH}
                      value={vendorData.email}
                      onChange={(e) => setVendorData({...vendorData, email: e.target.value})}
                      leftIcon={<Mail className="w-4 h-4 text-muted-foreground" />}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.mobile}</label>
                    <Input
                      type="tel"
                      placeholder="+91 98765XXXXX"
                      value={vendorData.mobile}
                      onChange={(e) => setVendorData({...vendorData, mobile: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.passLabel}</label>
                    <Input
                      type="password"
                      placeholder={t.passPH}
                      value={vendorData.password}
                      onChange={(e) => setVendorData({...vendorData, password: e.target.value})}
                      leftIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                      required
                      minLength={8}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.confirmPass}</label>
                    <Input
                      type="password"
                      placeholder={t.passPH}
                      value={vendorData.confirmPassword}
                      onChange={(e) => setVendorData({...vendorData, confirmPassword: e.target.value})}
                      leftIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                      required
                      minLength={8}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.cin}</label>
                    <Input
                      type="text"
                      placeholder="e.g. L99999MH1946PLC004768"
                      value={vendorData.regNumber}
                      onChange={(e) => setVendorData({...vendorData, regNumber: e.target.value})}
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.pan}</label>
                    <Input
                      type="text"
                      maxLength={10}
                      placeholder="e.g. AAACL8394E"
                      value={vendorData.pan}
                      onChange={(e) => setVendorData({...vendorData, pan: e.target.value})}
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.gst}</label>
                    <Input
                      type="text"
                      maxLength={15}
                      placeholder="e.g. 27AAACL8394E1ZN"
                      value={vendorData.gst}
                      onChange={(e) => setVendorData({...vendorData, gst: e.target.value})}
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.turnover}</label>
                    <Input
                      type="number"
                      placeholder="Annual Turnover in Cr"
                      value={vendorData.turnover}
                      onChange={(e) => setVendorData({...vendorData, turnover: e.target.value})}
                      className="font-mono"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="default"
                  className="w-full gap-2 font-mono"
                  disabled={loading}
                  loading={loading}
                  loadingText={t.loadingVendor}
                >
                  <Lock className="w-4 h-4" />
                  {t.regCTA}
                </Button>
              </motion.form>
            )}

            {/* OFFICER REGISTRATION FORM */}
            {regType === "officer" && (
              <motion.form
                key="officer-form"
                onSubmit={handleOfficerSubmit}
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                className="space-y-4"
                noValidate
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.officerName}</label>
                    <Input
                      type="text"
                      placeholder="e.g. Shri Rajesh Kumar"
                      value={officerData.name}
                      onChange={(e) => setOfficerData({...officerData, name: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.officerEmail}</label>
                    <Input
                      type="email"
                      placeholder="e.g. rajesh.kumar77@nic.in"
                      value={officerData.email}
                      onChange={(e) => setOfficerData({...officerData, email: e.target.value})}
                      leftIcon={<Mail className="w-4 h-4 text-muted-foreground" />}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.officerID}</label>
                    <Input
                      type="text"
                      placeholder="e.g. OFFICER-7712"
                      value={officerData.officerId}
                      onChange={(e) => setOfficerData({...officerData, officerId: e.target.value})}
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.desig}</label>
                    <Input
                      type="text"
                      placeholder="e.g. Director (Procurement)"
                      value={officerData.designation}
                      onChange={(e) => setOfficerData({...officerData, designation: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.ministry}</label>
                    <Input
                      type="text"
                      placeholder="e.g. Ministry of Road Transport"
                      value={officerData.ministry}
                      onChange={(e) => setOfficerData({...officerData, ministry: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.passLabel}</label>
                    <Input
                      type="password"
                      placeholder={t.passPH}
                      value={officerData.password}
                      onChange={(e) => setOfficerData({...officerData, password: e.target.value})}
                      leftIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                      required
                      minLength={8}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.confirmPass}</label>
                    <Input
                      type="password"
                      placeholder={t.passPH}
                      value={officerData.confirmPassword}
                      onChange={(e) => setOfficerData({...officerData, confirmPassword: e.target.value})}
                      leftIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="default"
                  className="w-full gap-2 font-mono"
                  disabled={loading}
                  loading={loading}
                  loadingText={t.loadingOfficer}
                >
                  <Lock className="w-4 h-4" />
                  {t.regCTA}
                </Button>
              </motion.form>
            )}

          </AnimatePresence>

          {/* Login link */}
          <div className="mt-6 text-center text-xs text-muted-foreground border-t border-border/80 pt-4">
            {t.haveAccount}{" "}
            <a href="/login" className="text-primary underline hover:text-primary/80 font-semibold">
              {t.loginLink}
            </a>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <ErrorBoundary>
      <RegisterContent />
    </ErrorBoundary>
  );
}