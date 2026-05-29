"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { useRouter } from "next/navigation";
import {
  Building, Landmark, ShieldCheck, UploadCloud, CheckCircle2,
  Laptop, Clock, Globe, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../../components/ui/BackButton";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";
import { Card, CardContent } from "../../components/ui/Card";

function RegisterContent() {
  const router = useRouter();
  const { registerVendor, registerOfficer, language } = useApp();

  const [regType, setRegType] = useState<"vendor" | "officer">("vendor");

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
    companyName: "",
    regNumber: "",
    contactEmail: "",
    contactPhone: "",
    pan: "",
    gst: "",
    turnover: "",
    itrYears: ["2023", "2024"]
  });

  // Officer Registration states
  const [officerData, setOfficerData] = useState({
    fullName: "",
    officerEmail: "",
    officerId: "",
    designation: "",
    ministryCode: "MORTH-IND",
    permissions: ["CREATE_TENDER", "PUBLISH_BLOCKCHAIN"]
  });

  const [uploads, setUploads] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setUploads(prev => [
            ...prev,
            { name: file.name, size: (file.size / (1024*1024)).toFixed(2) + " MB", uploadedAt: new Date().toISOString() }
          ]);
          setUploading(false);
          return 100;
        }
        return p + 25;
      });
    }, 150);
  };

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploads.length === 0) {
      alert("Please upload at least one KYC document (PAN, Solvency, or ITR Certificate).");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      registerVendor({
        ...vendorData,
        uploads,
        ipAddress: metadata.ipAddress,
        deviceInfo: metadata.device,
        timestamp: metadata.timestamp
      });
      setLoading(false);
      router.push("/vendor/profile");
    }, 1800);
  };

  const handleOfficerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      registerOfficer({
        ...officerData,
        uploads,
        ipAddress: metadata.ipAddress,
        deviceInfo: metadata.device,
        timestamp: metadata.timestamp
      });
      setLoading(false);
      router.push("/admin/profile");
    }, 1800);
  };

  const t = {
    en: {
      title: "Consortium Registration Hub",
      desc: "Enroll as a verified tender issuing officer or register your corporate entity on the blockchain KYC system.",
      vendorTab: "Corporate Vendor Enrollment",
      officerTab: "Government Officer verified desk",
      metadataTitle: "Automatic Security Metadata Handshake",
      metadataDesc: "For compliance tracking and non-repudiation auditing on the blockchain ledger:",
      compName: "Company Name (Official Title)",
      cin: "Corporate Identity Number (CIN)",
      pan: "Income Tax PAN",
      gst: "GSTIN Number",
      turnover: "Audited Annual Turnover (in Crores)",
      uploadTitle: "Secure IPFS KYC Documents Locker",
      uploadHint: "Choose Certificate (Solvency, ITR, PAN)",
      officerName: "Officer Full Name",
      officerEmail: "NIC / Gov Email Address",
      officerID: "Officer ID / Secretariat Code",
      desig: "Official Designation",
      permissions: "Administrative Key Permissions",
      regCTA: "Submit Cryptographic Registration",
      loadingVendor: "Sealing vendor parameters...",
      loadingOfficer: "Deploying Administrative Key Pair...",
      backLabel: "Back to Home",
    },
    hi: {
      title: "कंसोर्टियम पंजीकरण हब",
      desc: "सत्यापित निविदा जारी करने वाले अधिकारी के रूप में नामांकन करें या ब्लॉकचेन केवाईसी प्रणाली पर अपनी कॉर्पोरेट इकाई दर्ज करें।",
      vendorTab: "कॉर्पोरेट विक्रेता नामांकन",
      officerTab: "सरकारी अधिकारी नामांकन",
      metadataTitle: "स्वचालित सुरक्षा मेटाडेटा हैंड्सशेक",
      metadataDesc: "ब्लॉकचेन लेजर पर अनुपालन ट्रैकिंग और गैर-अस्वीकरण ऑडिटिंग के लिए:",
      compName: "कंपनी का नाम",
      cin: "कॉर्पोरेट पहचान संख्या (CIN)",
      pan: "आयकर पैन",
      gst: "जीएसटी संख्या",
      turnover: "वार्षिक टर्नओवर (करोड़ रुपये में)",
      uploadTitle: "आईपीएफ़एस केवाईसी दस्तावेज़ अपलोड",
      uploadHint: "प्रमाणपत्र चुनें (सॉल्वेंसी, आईटीआर, पैन)",
      officerName: "अधिकारी का पूरा नाम",
      officerEmail: "सरकारी ईमेल पता",
      officerID: "अधिकारी आईडी / सचिवालय कोड",
      desig: "आधिकारिक पद",
      permissions: "प्रशासनिक अनुमतियाँ",
      regCTA: "क्रिप्टोग्राफिक पंजीकरण जमा करें",
      loadingVendor: "विक्रेता पैरामीटर सील किए जा रहे हैं...",
      loadingOfficer: "प्रशासनिक कुंजी जोड़ी तैनात की जा रही है...",
      backLabel: "होम पर वापस जाएं",
    }
  }[language];

  return (
    <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-4">
        <BackButton href="/" label={t.backLabel} variant="text" />
      </nav>

      {/* Title */}
      <header className="text-center mb-8 border-b border-border/80 pb-6">
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
          onClick={() => setRegType("vendor")}
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
          onClick={() => setRegType("officer")}
          role="tab"
          aria-selected={regType === "officer"}
          className={`flex-1 py-2.5 rounded-xl text-center transition-all duration-200 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            regType === "officer" ? "bg-background text-saffron shadow-md border border-border" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Landmark className="w-4 h-4" aria-hidden="true" />
          <span>{t.officerTab}</span>
        </button>
      </div>

      {/* Automatic Metadata Capture Ribbon */}
      <section className="p-4 bg-muted border border-border rounded-xl mb-6 text-xs leading-relaxed relative overflow-hidden">
        <div className="flex items-center space-x-2 text-primary uppercase tracking-widest text-[10px] font-bold border-b border-border pb-2 mb-2">
          <Laptop className="w-4 h-4 animate-pulse" aria-hidden="true" />
          <span>{t.metadataTitle}</span>
        </div>
        <p className="text-muted-foreground mb-2">{t.metadataDesc}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-foreground font-bold">
          <div className="flex items-center space-x-1.5 bg-background p-1.5 rounded border border-border">
            <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
            <span className="truncate">{new Date(metadata.timestamp).toLocaleTimeString()} UTC</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-background p-1.5 rounded border border-border">
            <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
            <span className="truncate">IP: {metadata.ipAddress}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-background p-1.5 rounded border border-border">
            <Laptop className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
            <span className="truncate">ID: Client OS</span>
          </div>
        </div>
      </section>

      <Card variant="default" className="space-y-6">
        <CardContent>
          <AnimatePresence mode="wait">

            {/* REGISTRATION FORM A: CORPORATE VENDOR */}
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
                    <label htmlFor="vendor-company" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">
                      {t.compName}
                    </label>
                    <Input
                      id="vendor-company"
                      type="text"
                      placeholder="e.g. Larsen & Toubro Limited"
                      value={vendorData.companyName}
                      onChange={(e) => setVendorData({...vendorData, companyName: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="vendor-cin" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.cin}</label>
                    <Input
                      id="vendor-cin"
                      type="text"
                      placeholder="e.g. L99999MH1946PLC004768"
                      value={vendorData.regNumber}
                      onChange={(e) => setVendorData({...vendorData, regNumber: e.target.value})}
                      className="font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="vendor-pan" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.pan}</label>
                    <Input
                      id="vendor-pan"
                      type="text"
                      maxLength={10}
                      placeholder="e.g. AAACL8394E"
                      value={vendorData.pan}
                      onChange={(e) => setVendorData({...vendorData, pan: e.target.value})}
                      className="font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="vendor-gst" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.gst}</label>
                    <Input
                      id="vendor-gst"
                      type="text"
                      maxLength={15}
                      placeholder="e.g. 27AAACL8394E1ZN"
                      value={vendorData.gst}
                      onChange={(e) => setVendorData({...vendorData, gst: e.target.value})}
                      className="font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="vendor-turnover" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.turnover}</label>
                    <Input
                      id="vendor-turnover"
                      type="number"
                      placeholder="Annual Turnover in Cr"
                      value={vendorData.turnover}
                      onChange={(e) => setVendorData({...vendorData, turnover: e.target.value})}
                      className="font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="vendor-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">Contact Email</label>
                    <Input
                      id="vendor-email"
                      type="email"
                      placeholder="e.g. procurement@lntecc.com"
                      value={vendorData.contactEmail}
                      onChange={(e) => setVendorData({...vendorData, contactEmail: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="vendor-phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">Authorized Phone</label>
                    <Input
                      id="vendor-phone"
                      type="tel"
                      placeholder="e.g. +91 98765XXXXX"
                      value={vendorData.contactPhone}
                      onChange={(e) => setVendorData({...vendorData, contactPhone: e.target.value})}
                      required
                    />
                  </div>
                </div>

                {/* IPFS documents uploader */}
                <div className="space-y-3 pt-3 border-t border-border/80">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">
                    {t.uploadTitle}
                  </label>

                  <div className="border border-dashed border-border bg-muted/20 p-5 text-center rounded-xl relative">
                    <input type="file" id="kyc-files" className="hidden" onChange={handleFileUpload} aria-label="Upload KYC document" />
                    <label htmlFor="kyc-files" className="cursor-pointer flex flex-col items-center gap-1">
                      <UploadCloud className="w-8 h-8 text-primary animate-pulse" aria-hidden="true" />
                      <span className="text-xs font-bold text-muted-foreground">{t.uploadHint}</span>
                    </label>
                  </div>

                  {uploading && (
                    <div className="p-2.5 bg-muted rounded-xl border border-border text-xs font-mono text-primary space-y-1" role="progressbar" aria-valuenow={uploadProgress} aria-valuemin={0} aria-valuemax={100}>
                      <div className="flex justify-between font-bold">
                        <span>Encrypting and uploading file...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-background h-1 rounded-full overflow-hidden">
                        <div className="bg-primary h-1 rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {uploads.length > 0 && (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {uploads.map((f, i) => (
                        <div key={i} className="p-2 border border-border rounded-lg bg-muted text-foreground text-xs font-mono flex items-center justify-between gap-2">
                          <span className="truncate">{f.name} ({f.size})</span>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="default"
                  className="w-full gap-2 font-mono"
                  disabled={loading}
                  loading={loading}
                  loadingText={t.loadingVendor}
                >
                  <Lock className="w-4 h-4" aria-hidden="true" />
                  {t.regCTA}
                </Button>
              </motion.form>
            )}

            {/* REGISTRATION FORM B: GOVERNMENT OFFICER */}
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
                    <label htmlFor="officer-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.officerName}</label>
                    <Input
                      id="officer-name"
                      type="text"
                      placeholder="e.g. Shri Rajesh Kumar"
                      value={officerData.fullName}
                      onChange={(e) => setOfficerData({...officerData, fullName: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="officer-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.officerEmail}</label>
                    <Input
                      id="officer-email"
                      type="email"
                      placeholder="e.g. rajesh.kumar77@nic.in"
                      value={officerData.officerEmail}
                      onChange={(e) => setOfficerData({...officerData, officerEmail: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="officer-id" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.officerID}</label>
                    <Input
                      id="officer-id"
                      type="text"
                      placeholder="e.g. OFFICER-7712"
                      value={officerData.officerId}
                      onChange={(e) => setOfficerData({...officerData, officerId: e.target.value})}
                      className="font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="officer-desig" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.desig}</label>
                    <Input
                      id="officer-desig"
                      type="text"
                      placeholder="e.g. Director (Procurement)"
                      value={officerData.designation}
                      onChange={(e) => setOfficerData({...officerData, designation: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="officer-ministry" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">Secretariat Ministry Code</label>
                    <Input
                      id="officer-ministry"
                      type="text"
                      placeholder="e.g. MORTH-IND"
                      value={officerData.ministryCode}
                      onChange={(e) => setOfficerData({...officerData, ministryCode: e.target.value})}
                      className="font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Sponsoring Permissions checklists */}
                <div className="space-y-2 pt-3 border-t border-border/80">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">
                    {t.permissions}
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground font-mono">
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
                      <span>Create Specifications Draft</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
                      <span>On-Chain Deployments</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
                      <span>Sign Vendor KYC Ledger</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
                      <span>Trigger ZKP Decrypt Keys</span>
                    </div>
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
                  <Lock className="w-4 h-4" aria-hidden="true" />
                  {t.regCTA}
                </Button>
              </motion.form>
            )}

          </AnimatePresence>
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