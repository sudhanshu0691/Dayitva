"use client";

import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { 
  Landmark, ShieldAlert, Badge, HelpCircle, User, Award, 
  Layers, Plus, ArrowUpRight, CheckCircle2, XCircle, 
  RefreshCw, ClipboardList, ShieldCheck, Mail, Cpu, AlertCircle, ChevronRight 
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface MockKYCRequest {
  id: string;
  companyName: string;
  regNumber: string;
  pan: string;
  gst: string;
  turnover: string;
  bankSolvency: string;
  status: "Pending" | "Approved" | "Rejected";
}

const initialKYCQueue: MockKYCRequest[] = [
  {
    id: "KYC-REQ-88",
    companyName: "Reliance Infrastructure Ltd",
    regNumber: "CIN-L40101MH1929PLC001530",
    pan: "AAACR1283M",
    gst: "27AAACR1283M1ZN",
    turnover: "₹18,500 Cr",
    bankSolvency: "₹4,500 Cr certified by SBI",
    status: "Pending"
  },
  {
    id: "KYC-REQ-94",
    companyName: "Shapoorji Pallonji Infra",
    regNumber: "CIN-L45200MH1970PLC014856",
    pan: "AAACS8812E",
    gst: "27AAACS8812E1ZN",
    turnover: "₹24,100 Cr",
    bankSolvency: "₹6,000 Cr certified by ICICI",
    status: "Pending"
  }
];

export default function OfficerDashboard() {
  const router = useRouter();
  const { tenders, currentUser, language, addTransaction, addNotification } = useApp();
  
  const [kycQueue, setKYCQueue] = useState<MockKYCRequest[]>(initialKYCQueue);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [kycAction, setKycAction] = useState<"approve" | "reject" | null>(null);
  const [activeTab, setActiveTab] = useState("tenders");

  // Route through officer auth flow when session is missing.
  const handleSimulateLogin = () => {
    router.push("/auth/admin");
  };

  if (!currentUser || currentUser.role !== "officer") {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#FF9933]">
          <Landmark className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-mono">Government Administrative Lock</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Accessing procurement management systems, private bid sealing nodes, and KYC approval registers requires authenticated National Informatics Centre (NIC) administrative credentials.
        </p>
        <button 
          onClick={handleSimulateLogin} 
          className="mt-6 w-full flex items-center justify-center space-x-2 text-xs font-black font-mono px-4 py-2.5 bg-gradient-to-r from-orange-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 text-white rounded-xl shadow-lg transition-all"
        >
          <User className="w-4 h-4" />
          <span>Proceed To Officer Sign In</span>
        </button>
      </div>
    );
  }

  // Filter tenders for this officer's ministry (MORTH or general)
  const myMinistryTenders = tenders.filter(t => t.ministry.toLowerCase().includes("road") || t.ministry.toLowerCase().includes("morth") || tenders.length > 2);
  const totalMyTenders = myMinistryTenders.length;
  const activeMyTenders = myMinistryTenders.filter(t => t.status === "Open" || t.status === "Under Evaluation").length;
  const bidsReceivedTodayCount = myMinistryTenders.reduce((acc, t) => acc + t.bidsCount, 0);

  const handleKYCVerify = (id: string, action: "approve" | "reject") => {
    setProcessingId(id);
    setKycAction(action);
    
    setTimeout(() => {
      const selectedReq = kycQueue.find(r => r.id === id);
      
      if (selectedReq) {
        // Write transaction to ledger
        const txHash = addTransaction("KYC_APPROVED", {
          tenderTitle: `KYC Registration set to ${action.toUpperCase()}`,
          vendorName: selectedReq.companyName
        });

        // Push real-time notification
        addNotification({
          title: `📝 Vendor KYC ${action === "approve" ? "Approved" : "Rejected"}`,
          message: `Administrative verification completed on-chain for ${selectedReq.companyName}. Gas lock root verified.`,
          category: "kyc"
        });

        setKYCQueue(prev => prev.filter(r => r.id !== id));
      }
      setProcessingId(null);
      setKycAction(null);
    }, 2000);
  };

  const formatIndianCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  // Translations
  const t = {
    en: {
      statsTotal: "Total Postings Created",
      statsActive: "Active Sealed Tenders",
      statsBids: "Total Sealed Bids Received",
      statsKyc: "Pending Corporate KYC",
      tabTenders: "My Created Postings",
      tabKyc: "Corporate KYC Verify Queue",
      quickActions: "Administrative Console",
      actionCreate: "Publish New Spec Posting",
      actionMulti: "Trigger ZKP Decryption Keys",
      recentTenders: "Departmental Ledger Registers"
    },
    hi: {
      statsTotal: "कुल सृजित निविदाएं",
      statsActive: "सक्रिय सीलबंद निविदाएं",
      statsBids: "कुल प्राप्त सीलबंद बोलियां",
      statsKyc: "लंबित कॉरपोरेट केवाईसी",
      tabTenders: "मेरे द्वारा बनाई गई पोस्टिंग्स",
      tabKyc: "कॉरपोरेट केवाईसी सत्यापन सूची",
      quickActions: "प्रशासनिक कंसोल",
      actionCreate: "नई विशिष्टता पोस्टिंग प्रकाशित करें",
      actionMulti: "ZKP डिक्रिप्शन कीज़ ट्रिगर करें",
      recentTenders: "विभागीय बहीखाता रजिस्टर"
    }
  }[language];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-10">
      
      {/* 1. Welcome Admin Header Ribbon */}
      <div className="p-6 bg-slate-900 border border-slate-800 text-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-orange-950/40 border border-orange-800/40 rounded-xl flex items-center justify-center text-[#FF9933]">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider font-mono">OFFICER DESK: {currentUser.ministryCode}</span>
            <h1 className="text-lg font-black tracking-tight mt-0.5">{currentUser.name}</h1>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              {currentUser.email} • {currentUser.designation}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-indigo-950 border border-indigo-500/30 px-3 py-1.5 rounded-xl font-mono text-[10px] text-indigo-400">
          <Cpu className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
          <span className="font-extrabold tracking-wider">Multi-Sig administrative clearance enabled</span>
        </div>
      </div>

      {/* 2. Admin Stats blocks Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-white">
        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">{t.statsTotal}</span>
          <span className="block text-xl font-black font-mono mt-1">{totalMyTenders}</span>
        </div>
        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">{t.statsActive}</span>
          <span className="block text-xl font-black font-mono mt-1 text-teal-400">{activeMyTenders}</span>
        </div>
        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">{t.statsBids}</span>
          <span className="block text-xl font-black font-mono mt-1 text-indigo-400">{bidsReceivedTodayCount}</span>
        </div>
        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">{t.statsKyc}</span>
          <span className="block text-xl font-black font-mono mt-1 text-saffron">{kycQueue.length}</span>
        </div>
      </div>

      {/* 3. Dashboard Quick Console Layout splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main interactive workflow tabs panels */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="flex border-b border-border/80 pb-3 font-mono text-xs font-bold uppercase tracking-wider gap-6 overflow-x-auto scrollbar-none">
            <button 
              onClick={() => setActiveTab("tenders")}
              className={`pb-1.5 border-b-2 px-1 transition-all ${activeTab === "tenders" ? "border-primary text-slate-900 dark:text-white" : "border-transparent text-slate-400"}`}
            >
              {t.tabTenders}
            </button>
            <button 
              onClick={() => setActiveTab("kyc")}
              className={`pb-1.5 border-b-2 px-1 transition-all ${activeTab === "kyc" ? "border-primary text-slate-900 dark:text-white font-extrabold" : "border-transparent text-slate-400"}`}
            >
              {t.tabKyc} ({kycQueue.length})
            </button>
          </div>

          {/* TAB 1: Created tenders postings */}
          {activeTab === "tenders" && (
            <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border/85 bg-slate-900/10 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider font-mono text-slate-800 dark:text-slate-200">
                  {t.recentTenders}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {myMinistryTenders.length} entries registered
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-semibold">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 font-mono text-[10px] text-slate-500 uppercase">
                      <th className="p-3">Tender ID</th>
                      <th className="p-3">Title Posting</th>
                      <th className="p-3">Budget Cap</th>
                      <th className="p-3">Sealed Bids</th>
                      <th className="p-3">Consensus State</th>
                      <th className="p-3">Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-slate-700 dark:text-slate-300">
                    {myMinistryTenders.map(tender => (
                      <tr key={tender.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono font-bold text-teal-400">{tender.id}</td>
                        <td className="p-3 font-bold truncate max-w-xs">{tender.title}</td>
                        <td className="p-3 font-mono text-slate-800 dark:text-slate-100">{formatIndianCurrency(tender.budget)}</td>
                        <td className="p-3 text-center">
                          <span className="bg-teal-500/10 text-teal-400 text-[10px] px-2 py-0.5 rounded-full font-bold font-mono">
                            {tender.bidsCount} Bidders
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                            tender.status === "Open" ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/20" :
                            tender.status === "Under Evaluation" ? "bg-amber-950/60 text-amber-400 border-amber-500/20 animate-pulse" :
                            tender.status === "Awarded" ? "bg-teal-950/60 text-teal-400 border-teal-500/20" :
                            "bg-slate-900 text-slate-400 border-slate-700"
                          }`}>
                            {tender.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <button 
                            onClick={() => router.push(`/tenders/${tender.id}`)}
                            className="p-1 border border-border rounded hover:bg-slate-800 hover:text-teal-400 transition-colors"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Corporate KYC verification Queue */}
          {activeTab === "kyc" && (
            <div className="space-y-4">
              {kycQueue.length > 0 ? (
                kycQueue.map((req) => {
                  const isProcessing = processingId === req.id;
                  return (
                    <div 
                      key={req.id}
                      className="p-5 border border-border/80 bg-card rounded-2xl shadow-sm space-y-4 relative overflow-hidden"
                    >
                      {/* Loading/Writing Spinner Overlay */}
                      {isProcessing && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-10 text-white font-mono text-[10px] space-x-2.5">
                          <RefreshCw className="w-4.5 h-4.5 text-teal-400 animate-spin" />
                          <span>Writing verification block signature on-chain...</span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border/60 pb-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 border border-border rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                            <ClipboardList className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div>
                            <span className="bg-slate-900 text-slate-400 border border-slate-800 text-[9px] font-bold font-mono px-2 py-0.2 rounded">
                              {req.id}
                            </span>
                            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 leading-snug mt-1">{req.companyName}</h4>
                            <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">CIN: {req.regNumber}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-mono text-slate-400 bg-muted/20 px-3 py-2 rounded-xl border border-border/60">
                          <div>
                            <span className="text-slate-500">PAN:</span> <strong className="text-slate-600 dark:text-slate-200">{req.pan}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500">GST:</span> <strong className="text-slate-600 dark:text-slate-200">{req.gst}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Required KYC document summaries */}
                      <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-slate-400">
                        <div>
                          <span className="block text-slate-500">AUDITED TURNOVER CAP:</span>
                          <strong className="block text-slate-700 dark:text-slate-200 mt-0.5">{req.turnover}</strong>
                        </div>
                        <div>
                          <span className="block text-slate-500">SOLVENCY CERTIFICATE:</span>
                          <strong className="block text-slate-700 dark:text-slate-200 mt-0.5 truncate">{req.bankSolvency}</strong>
                        </div>
                      </div>

                      {/* Administrative Action buttons */}
                      <div className="flex justify-end space-x-2.5 pt-2 border-t border-border/60">
                        <button
                          onClick={() => handleKYCVerify(req.id, "reject")}
                          className="flex items-center space-x-1 px-3 py-1.5 border border-rose-500/20 text-rose-500 hover:bg-rose-950/20 text-[10px] font-bold font-mono rounded-lg transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject KYC</span>
                        </button>
                        <button
                          onClick={() => handleKYCVerify(req.id, "approve")}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-primary/20 hover:bg-primary/35 text-teal-400 border border-teal-500/20 text-[10px] font-bold font-mono rounded-lg transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Verify & Sign on Blockchain</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center bg-card border border-border/80 rounded-2xl">
                  <div className="w-10 h-10 bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3.5 rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100">Verification Queue is Empty</h4>
                  <p className="text-[11px] text-muted-foreground mt-2 max-w-xs mx-auto">All corporate registration applications are fully processed and synced on-chain.</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Sidebar administrative Console control panel */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl border border-border/80 bg-slate-950 text-white shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-full blur-2xl" />
            <h3 className="text-xs font-black uppercase tracking-wider font-mono flex items-center gap-1.5 text-orange-400 border-b border-slate-900 pb-3 mb-4">
              <ClipboardList className="w-4 h-4 text-orange-400" />
              {t.quickActions}
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => router.push("/admin/create-tender")}
                className="w-full flex items-center justify-between p-3 border border-slate-900 rounded-xl bg-slate-900/50 hover:bg-slate-900 hover:border-orange-500/30 text-xs font-bold font-mono transition-all text-left text-slate-200 hover:text-white"
              >
                <div className="flex items-center space-x-2.5">
                  <Plus className="w-4.5 h-4.5 text-[#FF9933]" />
                  <span>{t.actionCreate}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  alert("Automated Multi-sig trigger: decryption triggers will launch automatically on block timestamp expiry!");
                }}
                className="w-full flex items-center justify-between p-3 border border-slate-900 rounded-xl bg-slate-900/50 hover:bg-slate-900 hover:border-teal-500/30 text-xs font-bold font-mono transition-all text-left text-slate-200 hover:text-white"
              >
                <div className="flex items-center space-x-2.5">
                  <Cpu className="w-4.5 h-4.5 text-teal-400 animate-pulse" />
                  <span>{t.actionMulti}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="p-3.5 bg-indigo-950/20 border border-indigo-500/20 text-[10px] text-slate-400 leading-normal rounded-xl font-mono mt-4 flex items-start gap-2">
              <AlertCircle className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
              <p>National administrative keys reside inside cold HSM HSM-VerV1 hardware devices, maintaining fully automated regulatory tracking compliance.</p>
            </div>
          </div>
        </aside>

      </div>

    </div>
  );
}
