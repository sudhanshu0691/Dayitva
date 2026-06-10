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
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent } from "../../../components/ui/Card";

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
      } catch {
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
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-headline-sm font-semibold text-foreground">Access Denied</h2>
        <p className="text-body-sm text-muted-foreground mt-2">Government Officer credentials required.</p>
        <Button onClick={() => router.push("/login")} className="mt-6">Go to Login</Button>
      </div>
    );
  }

  if (checkingKyc) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!kycApproved) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <Lock className="w-12 h-12 text-warning mx-auto mb-4" />
        <h2 className="text-headline-sm font-semibold text-foreground">KYC Verification Required</h2>
        <p className="text-body-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Your KYC must be approved by an Auditor before you can create tenders. 
          Please complete your KYC verification first.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button variant="outline" onClick={() => router.push("/admin/profile")}>
            Go to KYC Profile
          </Button>
          <Button variant="accent" onClick={() => router.push("/admin")}>
            Back to Dashboard
          </Button>
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
    } catch {
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
    <div className="w-full max-w-4xl mx-auto px-6 py-10 relative perspective">
      <div className="absolute inset-0 pointer-events-none bg-grid-3d" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="floating-shape floating-shape-3" style={{ right: '-3%', top: '5%' }} />
      </div>
      <div className="border-b border-border pb-5 mb-8 relative z-10">
        <h1 className="text-headline-sm font-semibold text-foreground flex items-center gap-2">
          <Landmark className="w-6 h-6 text-accent" />
          Create New Tender
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-body-sm text-destructive rounded-lg flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}

      <Card variant="elevated" className="min-h-[350px] flex flex-col justify-between">
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">

              {/* STEP 1 */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-caption font-semibold uppercase tracking-wider text-accent border-b border-border pb-2">Step 1: Basic Information</h3>
                  <div className="space-y-1.5">
                    <label className="text-caption text-muted-foreground font-semibold block">Title</label>
                    <Input type="text" placeholder="e.g., Procurement of Tactical Software Defined Radios"
                      value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-caption text-muted-foreground font-semibold block">Ministry</label>
                    <select value={formData.ministry} onChange={(e) => setFormData({...formData, ministry: e.target.value})}
                      className="w-full h-11 bg-card border-2 border-input text-foreground px-3.5 text-body-sm rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all">
                      {ministries.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-caption text-muted-foreground font-semibold block">Description</label>
                    <textarea placeholder="Detailed scope of work..."
                      value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-card border-2 border-input text-foreground px-3.5 py-2.5 text-body-sm rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all h-36" />
                  </div>
                </div>
              )}

              {/* STEP 2: Files */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-caption font-semibold uppercase tracking-wider text-accent border-b border-border pb-2">Step 2: Upload Technical Documents</h3>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/30">
                    <input type="file" id="file-upload" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                      <UploadCloud className="w-10 h-10 text-accent" />
                      <span className="text-body-sm text-muted-foreground">Click to upload documents</span>
                    </label>
                  </div>
                  {uploadedFiles.map((f, idx) => (
                    <div key={idx} className="p-3 border border-border rounded-xl flex items-center justify-between bg-card">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-accent" />
                        <div>
                          <span className="text-body-sm text-foreground font-medium">{f.name}</span>
                          <span className="text-caption text-muted-foreground block">{f.size}</span>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveFile(idx)} className="text-destructive hover:text-destructive/80"><Trash className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 3: Budget */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-caption font-semibold uppercase tracking-wider text-accent border-b border-border pb-2">Step 3: Budget</h3>
                  <div className="space-y-1.5">
                    <label className="text-caption text-muted-foreground font-semibold block">Estimated Budget (in Crore INR)</label>
                    <Input type="number" step="0.01" placeholder="e.g., 450.00"
                      value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} />
                  </div>
                </div>
              )}

              {/* STEP 4: Deadline */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-caption font-semibold uppercase tracking-wider text-accent border-b border-border pb-2">Step 4: Deadline</h3>
                  <div className="space-y-1.5">
                    <label className="text-caption text-muted-foreground font-semibold block">Bidding Deadline</label>
                    <Input type="datetime-local" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
                  </div>
                </div>
              )}

              {/* STEP 5: MSME */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-caption font-semibold uppercase tracking-wider text-accent border-b border-border pb-2">Step 5: MSME Quota</h3>
                  <label className="flex items-center gap-3 cursor-pointer p-4 border border-border rounded-xl hover:bg-muted/30 transition-all">
                    <input type="checkbox" checked={formData.msmeQuota} onChange={(e) => setFormData({...formData, msmeQuota: e.target.checked})}
                      className="w-5 h-5 rounded border-border accent-accent" />
                    <div>
                      <span className="text-body-sm font-semibold text-foreground">Enable MSME Reservation</span>
                      <span className="text-caption text-muted-foreground block">At least 25% reserved for MSME bidders</span>
                    </div>
                  </label>
                </div>
              )}

              {/* STEP 6: Criteria */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <h3 className="text-caption font-semibold uppercase tracking-wider text-accent border-b border-border pb-2">Step 6: Eligibility Criteria</h3>
                  <div className="flex gap-2">
                    <Input type="text" placeholder="Add criteria..." value={criteriaInput} onChange={(e) => setCriteriaInput(e.target.value)} />
                    <Button variant="accent" onClick={handleAddCriteria}><Plus className="w-4 h-4" /></Button>
                  </div>
                  {formData.criteria.map((c, idx) => (
                    <div key={idx} className="p-3 border border-border rounded-xl flex items-start justify-between gap-3 text-body-sm bg-card">
                      <span className="text-foreground">{c}</span>
                      <button onClick={() => handleRemoveCriteria(idx)} className="text-muted-foreground hover:text-destructive">
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 7: Review */}
              {currentStep === 7 && (
                <div className="space-y-4">
                  <h3 className="text-caption font-semibold uppercase tracking-wider text-accent border-b border-border pb-2">Step 7: Review & Submit</h3>
                  <div className="bg-muted border border-border rounded-xl p-4 space-y-2 text-body-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Title: </span><strong className="text-foreground text-right">{formData.title}</strong></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Ministry: </span><strong className="text-foreground text-right">{formData.ministry}</strong></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Budget: </span><strong className="text-foreground text-right">₹{formData.budget} Cr</strong></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Deadline: </span><strong className="text-foreground text-right">{formData.deadline}</strong></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">MSME: </span><strong className="text-foreground text-right">{formData.msmeQuota ? "Yes" : "No"}</strong></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Files: </span><strong className="text-foreground text-right">{uploadedFiles.length}</strong></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Criteria: </span><strong className="text-foreground text-right">{formData.criteria.length} items</strong></div>
                  </div>
                  <Button variant="accent" className="w-full" onClick={handleSubmit} disabled={submitting} loading={submitting} loadingText="Creating...">
                    Create Tender
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {currentStep < 7 && (
            <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
                <ChevronLeft className="w-4 h-4 mr-1" />Back
              </Button>
              <Button variant="accent" onClick={handleNext}>
                Next<ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
