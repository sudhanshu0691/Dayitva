"use client";

import React, { useState } from "react";
import { useApp } from "../../../context/AppContext";
import { useRouter } from "next/navigation";
import { 
  Plus, Trash, ShieldCheck, Cpu, ChevronRight, ChevronLeft, 
  UploadCloud, FileText, CheckCircle2, Lock, Landmark, 
  Activity, AlertCircle, RefreshCw 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const { publishTender, currentUser, walletConnected } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ministry: ministries[0],
    budget: "",
    deadline: "",
    msmeQuota: false,
    solvencyRequired: "",
    criteria: ["Minimum annual turnover of ₹50 Cr in last 3 financial years"]
  });

  const [criteriaInput, setCriteriaInput] = useState("");
  
  // File Upload State Simulation
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Blockchain Publishing Modal
  const [publishing, setPublishing] = useState(false);
  const [publishLogs, setPublishLogs] = useState<string[]>([]);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const handleNext = () => {
    // Basic validation per step
    if (currentStep === 1 && (!formData.title || !formData.description)) {
      alert("Please fill in basic tender information.");
      return;
    }
    if (currentStep === 2 && uploadedFiles.length === 0) {
      alert("Please upload at least one technical specification document.");
      return;
    }
    if (currentStep === 3 && !formData.budget) {
      alert("Please specify the estimated budget.");
      return;
    }
    if (currentStep === 4 && !formData.deadline) {
      alert("Please set a valid sealing deadline.");
      return;
    }
    if (currentStep === 6 && formData.criteria.length === 0) {
      alert("Please add at least one evaluation criteria.");
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 7));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Simulate IPFS upload progress
  const handleFileUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          const mockIpfsHash = "Qm" + Array.from({length: 44}, () => Math.floor(Math.random()*16).toString(16)).join("");
          setUploadedFiles(prevFiles => [
            ...prevFiles, 
            {
              name: file.name,
              size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
              hash: mockIpfsHash,
              uploadedAt: new Date().toISOString()
            }
          ]);
          setUploading(false);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  const handleRemoveFile = (idx: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddCriteria = () => {
    if (criteriaInput.trim()) {
      setFormData(prev => ({
        ...prev,
        criteria: [...prev.criteria, criteriaInput.trim()]
      }));
      setCriteriaInput("");
    }
  };

  const handleRemoveCriteria = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      criteria: prev.criteria.filter((_, i) => i !== idx)
    }));
  };

  // Play advanced Blockchain publishing logs
  const handlePublishOnBlockchain = () => {
    setPublishing(true);
    setPublishSuccess(false);
    setPublishLogs([]);

    const logMessages = [
      "Establishing cryptographically secure connection to TenderChain Node #NIC-DEL-18...",
      "Hashing technical specification files via SHA-256 state locks...",
      "Uploading contract specification roots to IPFS distributed network...",
      "IPFS storage confirmation: Root Hash QmYwAPzwh3pC7v7c9N5pab557XWvA8sSS9V5H8S...",
      "Formatting EVM smart contract variables: budget, timelines, and prequal criteria...",
      "Deploying secure smart contract 'DecentralizedTenderV2.sol' on mainnet ledger...",
      "Broadcasting deployment block transaction. Locking verifier gas constant...",
      "Consensus confirmed across 1,842 validating nodes...",
      "CONTRACT SEALED SUCCESSFULLY ON TENDERCHAIN BLOCKCHAIN!"
    ];

    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < logMessages.length) {
        setPublishLogs(prev => [...prev, logMessages[logIndex]]);
        logIndex++;
      } else {
        clearInterval(logInterval);
        
        // Save to global context
        publishTender({
          title: formData.title,
          description: formData.description,
          ministry: formData.ministry,
          budget: parseFloat(formData.budget) * 10000000, // Cr to absolute
          deadline: new Date(formData.deadline).toISOString(),
          status: "Open",
          msmeQuota: formData.msmeQuota,
          criteria: formData.criteria,
          ipfsHash: uploadedFiles[0]?.hash || "QmYwAPzwh3pC7v7c9...",
          ipfsFiles: uploadedFiles
        });

        setPublishSuccess(true);
        setTimeout(() => {
          setPublishing(false);
          router.push("/admin");
        }, 2200);
      }
    }, 600);
  };

  const stepsList = [
    "Basic Info",
    "Technical Specs",
    "Financial Budget",
    "Deadlines",
    "MSME Quota",
    "Eligibility",
    "Review & Publish"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-10">
      
      {/* Page Title */}
      <div className="border-b border-border/80 pb-5 mb-8">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Landmark className="w-6 h-6 text-teal-400" />
          On-Chain Tender Creation Wizard
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Draft specifications, establish budget caps, set MSME reservations, and seal procurement details irreversibly on the blockchain ledger.
        </p>
      </div>

      {/* Stepper Bar Component */}
      <div className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-8 overflow-x-auto scrollbar-none">
        <div className="flex items-center justify-between min-w-[500px]">
          {stepsList.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;

            return (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono font-extrabold text-xs transition-all ${
                    isCompleted ? "bg-teal-500 border-teal-500 text-slate-950" :
                    isActive ? "border-teal-400 text-teal-400 font-black shadow-lg shadow-teal-500/10 scale-105" :
                    "border-slate-800 text-slate-500 bg-slate-950"
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 font-black" /> : stepNum}
                  </div>
                  <span className={`text-[10px] font-bold mt-1.5 whitespace-nowrap font-mono tracking-tight uppercase ${
                    isActive ? "text-teal-400 font-extrabold" : "text-slate-500"
                  }`}>
                    {step}
                  </span>
                </div>
                {idx < stepsList.length - 1 && (
                  <div className={`h-[1px] flex-1 min-w-[20px] transition-colors ${
                    isCompleted ? "bg-teal-500/80" : "bg-slate-800"
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Wizard Step form fields */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm min-h-[350px] flex flex-col justify-between">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* STEP 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider font-mono text-teal-400 border-b border-border/60 pb-2">
                  Step 1: Core Tender Information
                </h3>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Tender Official Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Procurement of High-Throughput Tactical Software Defined Radios"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Sponsoring Ministry / Department</label>
                  <select
                    value={formData.ministry}
                    onChange={(e) => setFormData({...formData, ministry: e.target.value})}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg p-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary text-slate-700 dark:text-slate-300"
                  >
                    {ministries.map((m, idx) => (
                      <option key={idx} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Detailed Scope of Work</label>
                  <textarea
                    placeholder="Provide a comprehensive technical summary, operational expectations, and work limits..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-100 h-36"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Technical Specifications IPFS Upload */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider font-mono text-teal-400 border-b border-border/60 pb-2">
                  Step 2: Technical Specifications & IPFS Upload
                </h3>
                
                <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center bg-slate-950/40 relative">
                  <input
                    type="file"
                    id="ipfs-file"
                    onChange={handleFileUploadSim}
                    className="hidden"
                    disabled={uploading}
                  />
                  <label 
                    htmlFor="ipfs-file"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-3"
                  >
                    <UploadCloud className="w-10 h-10 text-teal-400 animate-pulse" />
                    <div>
                      <span className="block text-xs font-extrabold text-slate-200">Simulate IPFS Decentralized Upload</span>
                      <span className="block text-[10px] text-slate-500 font-mono mt-1">Accepts PDF, XLSX up to 50MB. Files are signed with security hashes.</span>
                    </div>
                  </label>
                </div>

                {uploading && (
                  <div className="space-y-1.5 p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="flex justify-between text-[10px] font-mono font-bold text-teal-400">
                      <span>Uploading to IPFS Network Nodes...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-teal-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">UPLOADED SPECIFICATION REGISTRY</label>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="p-3 border border-slate-800 rounded-xl bg-slate-950/50 flex items-center justify-between gap-3 text-white">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <FileText className="w-8 h-8 text-teal-500 shrink-0" />
                            <div className="min-w-0 font-mono">
                              <span className="block text-xs font-bold truncate text-slate-200">{file.name}</span>
                              <span className="block text-[9px] text-slate-500 truncate mt-0.5">IPFS: {file.hash}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRemoveFile(idx)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Financial Cap & Budget */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider font-mono text-teal-400 border-b border-border/60 pb-2">
                  Step 3: Financial Caps & Solvency Thresholds
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Estimated Budget Cap (in Crore INR)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 450.00"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg pl-8 pr-12 py-2.5 text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-100"
                    />
                    <span className="absolute left-3 top-3 text-xs text-slate-500 font-bold">₹</span>
                    <span className="absolute right-3 top-3 text-[10px] text-slate-500 font-bold font-mono">Cr</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Bank Solvency CAP Requirement (in Crore INR)</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="e.g., 100.00"
                      value={formData.solvencyRequired}
                      onChange={(e) => setFormData({...formData, solvencyRequired: e.target.value})}
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg pl-8 pr-12 py-2.5 text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-100"
                    />
                    <span className="absolute left-3 top-3 text-xs text-slate-500 font-bold">₹</span>
                    <span className="absolute right-3 top-3 text-[10px] text-slate-500 font-bold font-mono">Cr</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Submission Sealing Deadlines */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider font-mono text-teal-400 border-b border-border/60 pb-2">
                  Step 4: Submission Deadlines & Block Expiry
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Bidding Window Expiry Deadline</label>
                  <input
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg p-2.5 text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-100"
                  />
                  <div className="p-3 bg-amber-950/20 border border-amber-500/20 text-[10px] text-slate-400 leading-normal rounded-xl font-mono flex items-start gap-2 mt-2">
                    <AlertCircle className="w-5 h-5 text-saffron shrink-0 mt-0.5" />
                    <p>After this block timestamp passes, the smart contract automatically prevents further bid submissions and initiates multi-sig decryption triggers for sealed prices.</p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: MSME Quota Toggles */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider font-mono text-teal-400 border-b border-border/60 pb-2">
                  Step 5: Micro, Small & Medium Enterprises (MSME) Quotas
                </h3>

                <div className="p-5 border border-slate-800 rounded-2xl bg-slate-950/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-extrabold text-slate-200">Mandate MSME Reserved Quota</span>
                      <span className="block text-[10px] text-slate-500 font-mono mt-1">If enabled, at least 25% procurement cap is allocated to certified MSME bidders.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.msmeQuota}
                        onChange={(e) => setFormData({...formData, msmeQuota: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Eligibility Criteria Builders */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider font-mono text-teal-400 border-b border-border/60 pb-2">
                  Step 6: Prequalification Eligibility Checklist
                </h3>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Add Eligibility Criteria Checklist</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., ISO-9001 and DRDO certifications mandatory"
                      value={criteriaInput}
                      onChange={(e) => setCriteriaInput(e.target.value)}
                      className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={handleAddCriteria}
                      className="p-2.5 bg-primary text-slate-950 font-bold text-xs font-mono rounded-lg hover:bg-teal-500 transition-all flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">ACTIVE PREQUAL CRITERIA COVENANTS</label>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {formData.criteria.map((c, idx) => (
                      <div key={idx} className="p-3 border border-border/80 rounded-xl bg-muted/20 flex items-start justify-between gap-3 text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span>{c}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveCriteria(idx)}
                          className="text-slate-500 hover:text-rose-400 shrink-0"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: Review & Seal Blockchain */}
            {currentStep === 7 && (
              <div className="space-y-4 font-mono text-xs">
                <h3 className="text-xs font-black uppercase tracking-wider font-mono text-teal-400 border-b border-slate-800 pb-2">
                  Step 7: Final Procurement Specifications Review
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 border border-slate-900 p-4 rounded-xl text-slate-400">
                  <div className="sm:col-span-2">
                    <span className="text-slate-600 block text-[10px] font-bold">OFFICIAL TENDER TITLE:</span>
                    <strong className="text-slate-200 block text-xs font-sans font-bold mt-0.5">{formData.title}</strong>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[10px] font-bold">SPONSORING DEPARTMENT:</span>
                    <strong className="text-slate-200 block text-xs font-sans font-bold mt-0.5">{formData.ministry}</strong>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[10px] font-bold">EST BUDGET CAP:</span>
                    <strong className="text-teal-400 block text-xs font-bold mt-0.5">₹{formData.budget} Crore</strong>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[10px] font-bold">SEALING EXPIRY deadline:</span>
                    <strong className="text-slate-200 block text-xs font-bold mt-0.5">
                      {formData.deadline ? new Date(formData.deadline).toLocaleString() : ""}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[10px] font-bold">MSME QUOTA RESERVATION:</span>
                    <strong className="text-slate-200 block text-xs font-bold mt-0.5">{formData.msmeQuota ? "ENABLED" : "DISABLED"}</strong>
                  </div>
                  <div className="sm:col-span-2 border-t border-slate-900 pt-2.5">
                    <span className="text-slate-600 block text-[10px] font-bold">IPFS TECHNICAL SPEC SEALS:</span>
                    <ul className="list-disc pl-4 mt-1.5 space-y-1">
                      {uploadedFiles.map((f, i) => (
                        <li key={i} className="text-slate-300 font-bold truncate">
                          {f.name} ({f.size}) • hash: {f.hash.substring(0, 14)}...
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Wizard Footer controls */}
        <div className="flex items-center justify-between border-t border-border/80 pt-4 mt-6">
          <button
            type="button"
            onClick={handleBack}
            className={`flex items-center space-x-1 text-xs font-bold font-mono px-4 py-2 border border-border hover:bg-muted rounded-xl transition-all ${
              currentStep === 1 ? "opacity-30 cursor-not-allowed pointer-events-none" : ""
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {currentStep < 7 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center space-x-1 text-xs font-bold font-mono px-4 py-2 bg-secondary dark:bg-slate-900 border border-border hover:bg-muted text-slate-800 dark:text-slate-200 rounded-xl transition-all"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublishOnBlockchain}
              className="flex items-center space-x-2 text-xs font-black font-mono px-5 py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white rounded-xl transition-all shadow-lg"
            >
              <Cpu className="w-4.5 h-4.5 animate-pulse" />
              <span>Publish on Blockchain Ledger</span>
            </button>
          )}
        </div>

      </div>

      {/* BLOCKCHAIN PUBLISHING STREAMING TERMINAL MODAL */}
      <AnimatePresence>
        {publishing && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative"
            >
              {/* Header */}
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-black text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4.5 h-4.5 text-teal-400 animate-pulse" />
                  Consensus Deployment Gateway
                </span>
                {!publishSuccess && (
                  <RefreshCw className="w-4 h-4 text-teal-400 animate-spin" />
                )}
              </div>

              {/* Terminal Logs Output */}
              <div className="p-5 font-mono text-[10px] leading-relaxed select-none h-80 overflow-y-auto space-y-2 bg-slate-950/95 text-slate-400">
                {publishLogs.map((log, idx) => {
                  const isLast = idx === publishLogs.length - 1;
                  return (
                    <div 
                      key={idx} 
                      className={`transition-all ${
                        isLast && idx === 8 ? "text-emerald-400 font-extrabold text-xs" : 
                        isLast ? "text-teal-300 font-bold" : "text-slate-500"
                      }`}
                    >
                      <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                      <span>{log}</span>
                    </div>
                  );
                })}
              </div>

              {/* Confirm Success Message banner */}
              {publishSuccess && (
                <div className="p-4 bg-emerald-950/30 border-t border-emerald-500/20 text-center text-slate-100 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">
                    TRANSACTION INJECTED SUCCESS IN BLOCK #{Math.floor(Math.random()*20) + 18251210}
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
