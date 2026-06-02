"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, Trash, ShieldCheck, Landmark, AlertCircle, 
  ChevronRight, ChevronLeft, UploadCloud, FileText, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../../../context/AppContext";
import tenderService from "@/services/tenderService";
import uploadService from "@/services/uploadService";
import api from "@/services/api";

const ministries = [
  "Ministry of Road Transport and Highways (MoRTH)",
  "Ministry of Railways",
  "Ministry of Defence",
  "Ministry of Electronics and Information Technology (MeitY)",
  "Ministry of New and Renewable Energy",
  "Ministry of Jal Shakti"
];

export default function CreateTenderPage() {
  const router = useRouter();
  const { currentUser } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ministry: ministries[0],
    budget: "",
    deadline: "",
    msmeQuota: false,
    criteria: ["Minimum annual turnover of ₹50 Cr in last 3 financial years"]
  });

  const [criteriaInput, setCriteriaInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingKyc, setCheckingKyc] = useState(true);
  const [kycApproved, setKycApproved] = useState(false);

  // Check KYC status on mount
  useEffect(() => {
    const checkKYC = async () => {
      try {
        const response = await api.get("/users/kyc/status");
        const status = response.data.data?.kycStatus;
        if (status === "Approved") {
          setKycApproved(true);
        } else {
          setKycApproved(false);
          setError("KYC not approved. Please complete KYC verification first.");
        }
      } catch (err) {
        setKycApproved(false);
        setError("Unable to verify KYC status. Please complete KYC first.");
      } finally {
        setCheckingKyc(false);
      }
    };
    checkKYC();
  }, []);

  const validateBasicInfo = () => {
    const trimmedTitle = formData.title.trim();
    const trimmedDescription = formData.description.trim();
    if (trimmedTitle.length < 5) { setError("Title must be at least 5 characters."); return false; }
    if (trimmedDescription.length < 20) { setError("Description must be at least 20 characters."); return false; }
    return true;
  };

  const validateBeforeSubmit = () => {
    if (!validateBasicInfo()) return false;
    if (!formData.budget || Number.isNaN(Number(formData.budget))) { setError("Please specify a valid budget."); return false; }
    if (!formData.deadline) { setError("Please set a valid deadline."); return false; }
    if (formData.criteria.length === 0) { setError("At least one eligibility criterion is required."); return false; }
    return true;
  };

  if (!currentUser || currentUser.role !== "officer") {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-xs text-muted-foreground mt-2">Government Officer credentials required.</p>
        <button onClick={() => router.push("/login")} className="mt-6 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold">Go to Login</button>
      </div>
    );
  }

  if (checkingKyc) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!kycApproved) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <Lock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground">KYC Verification Required</h2>
        <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
          Your KYC must be approved by an Auditor before you can create tenders. 
          Please complete your KYC verification first.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={() => router.push("/admin/profile")} 
            className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-bold">
            Go to KYC Profile
          </button>
          <button onClick={() => router.push("/admin")} 
            className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    setUploadProgress(0);
    try {
      const result = await uploadService.uploadToS3([file]);
      setUploadedFiles(prev => [...prev, {
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        hash: result?.hash || "uploaded",
        uploadedAt: new Date().toISOString()
      }]);
    } catch (err) {
      setError("Failed to upload file");
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  };

  const handleRemoveFile = (idx: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddCriteria = () => {
    if (criteriaInput.trim()) {
      setFormData(prev => ({ ...prev, criteria: [...prev.criteria, criteriaInput.trim()] }));
      setCriteriaInput("");
    }
  };

  const handleRemoveCriteria = (idx: number) => {
    setFormData(prev => ({ ...prev, criteria: prev.criteria.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async () => {
    if (!validateBeforeSubmit()) return;
    setSubmitting(true);
    setError(null);
    try {
      await tenderService.createTender({
        title: formData.title,
        description: formData.description,
        ministry: formData.ministry,
        budget: parseFloat(formData.budget) * 10000000,
        deadline: new Date(formData.deadline).toISOString(),
        msmeQuota: formData.msmeQuota,
        criteria: formData.criteria,
      });
      router.push("/admin");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to create tender");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateBasicInfo()) return;
    if (currentStep === 3 && !formData.budget) { setError("Please specify the estimated budget."); return; }
    if (currentStep === 4 && !formData.deadline) { setError("Please set a valid deadline."); return; }
    setError(null);
    setCurrentStep(prev => Math.min(prev + 1, 7));
  };

  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-10">
      <div className="border-b border-border/80 pb-5 mb-8">
        <h1 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
          <Landmark className="w-6 h-6 text-teal-400" />
          Create New Tender
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-xs text-destructive rounded-lg flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm min-h-[350px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">

            {/* STEP 1 */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider font-mono text-teal-400 border-b border-border/60 pb-2">Step 1: Basic Information</h3>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Title</label>
                  <input type="text" placeholder="e.g., Procurement of Tactical Software Defined Radios"
                    value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-background border border-input rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Ministry</label>
                  <select value={formData.ministry} onChange={(e) => setFormData({...formData, ministry: e.target.value})}
                    className="w-full bg-background border border-input rounded-lg p-2.5 text-xs font-bold">
                    {ministries.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Description</label>
                  <textarea placeholder="Detailed scope of work..."
                    value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-background border border-input rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary h-36" />
                </div>
              </div>
            )}

            {/* STEP 2: Files */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider font-mono text-teal-400 border-b border-border/60 pb-2">Step 2: Upload Technical Documents</h3>
                <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center">
                  <input type="file" id="file-upload" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                    <UploadCloud className="w-10 h-10 text-primary" />
                    <span className="text-xs font-bold text-muted-foreground">Click to upload documents</span>
                  </label>
                </div>
                {uploadedFiles.map((f, idx) => (
                  <div key={idx} className="p-3 border border-border rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <span className="text-xs font-bold">{f.name}</span>
                        <span className="text-[10px] text-muted-foreground block">{f.size}</span>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveFile(idx)} className="text-destructive hover:text-red-400"><Trash className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 3: Budget */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider font-mono text-teal-400 border-b border-border/60 pb-2">Step 3: Budget</h3>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Estimated Budget (in Crore INR)</label>
                  <input type="number" step="0.01" placeholder="e.g., 450.00"
                    value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    className="w-full bg-background border border-input rounded-lg p-2.5 text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
            )}

            {/* STEP 4: Deadline */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider font-mono text-teal-400 border-b border-border/60 pb-2">Step 4: Deadline</h3>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Bidding Deadline</label>
                  <input type="datetime-local" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    className="w-full bg-background border border-input rounded-lg p-2.5 text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
            )}

            {/* STEP 5: MSME */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider font-mono text-teal-400 border-b border-border/60 pb-2">Step 5: MSME Quota</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={formData.msmeQuota} onChange={(e) => setFormData({...formData, msmeQuota: e.target.checked})}
                    className="w-5 h-5 rounded border-border" />
                  <div>
                    <span className="text-xs font-bold">Enable MSME Reservation</span>
                    <span className="text-[10px] text-muted-foreground block">At least 25% reserved for MSME bidders</span>
                  </div>
                </label>
              </div>
            )}

            {/* STEP 6: Criteria */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider font-mono text-teal-400 border-b border-border/60 pb-2">Step 6: Eligibility Criteria</h3>
                <div className="flex gap-2">
                  <input type="text" placeholder="Add criteria..." value={criteriaInput} onChange={(e) => setCriteriaInput(e.target.value)}
                    className="flex-1 bg-background border border-input rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
                  <button type="button" onClick={handleAddCriteria} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.criteria.map((c, idx) => (
                  <div key={idx} className="p-3 border border-border rounded-xl flex items-start justify-between gap-3 text-xs">
                    <span>{c}</span>
                    <button type="button" onClick={() => handleRemoveCriteria(idx)} className="text-muted-foreground hover:text-destructive">
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 7: Review */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider font-mono text-teal-400 border-b border-border/60 pb-2">Step 7: Review & Submit</h3>
                <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-2 text-xs">
                  <div><span className="text-muted-foreground">Title: </span><strong>{formData.title}</strong></div>
                  <div><span className="text-muted-foreground">Ministry: </span><strong>{formData.ministry}</strong></div>
                  <div><span className="text-muted-foreground">Budget: </span><strong>₹{formData.budget} Cr</strong></div>
                  <div><span className="text-muted-foreground">Deadline: </span><strong>{formData.deadline}</strong></div>
                  <div><span className="text-muted-foreground">MSME: </span><strong>{formData.msmeQuota ? "Yes" : "No"}</strong></div>
                  <div><span className="text-muted-foreground">Files: </span><strong>{uploadedFiles.length}</strong></div>
                  <div><span className="text-muted-foreground">Criteria: </span><strong>{formData.criteria.length} items</strong></div>
                </div>
                <button onClick={handleSubmit} disabled={submitting}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-xs font-bold font-mono">
                  {submitting ? "Creating..." : "Create Tender"}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {currentStep < 7 && (
          <div className="flex items-center justify-between border-t border-border/80 pt-4 mt-6">
            <button onClick={handleBack} disabled={currentStep === 1}
              className="flex items-center space-x-1 text-xs font-bold px-4 py-2 border border-border rounded-xl hover:bg-muted disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" /><span>Back</span>
            </button>
            <button onClick={handleNext}
              className="flex items-center space-x-1 text-xs font-bold px-4 py-2 border border-border rounded-xl hover:bg-muted">
              <span>Next</span><ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}