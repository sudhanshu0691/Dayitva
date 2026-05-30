"use client";

import React, { useState } from "react";
import { useApp } from "../../../context/AppContext";
import { useParams, useRouter } from "next/navigation";
import { 
  FileText, Download, Calendar, ShieldCheck, HelpCircle, 
  Lock, Unlock, ArrowLeft, Building, User, Clock, Info, 
  Cpu, Award, ExternalLink, RefreshCw, Send, AlertTriangle, Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TenderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { tenders, submitBid, currentUser, walletConnected, language, addNotification, addTransaction } = useApp();

  const tenderId = params.id as string;
  const tender = tenders.find(t => t.id === tenderId);

  const [bidAmount, setBidAmount] = useState("");
  const [submittingBid, setSubmittingBid] = useState(false);
  const [evaluatingWinner, setEvaluatingWinner] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  if (!tender) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4 text-rose-500">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Procurement Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">The requested contract hash does not resolve to an active tender on-chain.</p>
        <button onClick={() => router.push("/dashboard")} className="mt-6 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold font-mono">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isDeadlinePassed = new Date(tender.deadline).getTime() < Date.now();

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidAmount || isNaN(parseFloat(bidAmount))) return;
    
    setSubmittingBid(true);
    setTimeout(() => {
      const bidVal = parseFloat(bidAmount) * 10000000; // Cr multiplier
      submitBid(tender.id, bidVal, currentUser?.companyName || "Anonymous Corp");
      setBidAmount("");
      setSubmittingBid(false);
    }, 2000);
  };

  // Simulate on-chain automated contract award (L1 evaluation)
  const handleDeclareWinner = () => {
    setEvaluatingWinner(true);
    setTimeout(() => {
      // Find lowest bidder
      const lowestBid = [...tender.bids].sort((a, b) => a.price - b.price)[0];
      if (lowestBid) {
        tender.status = "Awarded";
        tender.winnerName = lowestBid.vendorName;
        tender.winnerPrice = lowestBid.price;
        tender.winnerAddress = lowestBid.vendorAddress;
        
        const txHash = addTransaction("WINNER_DECLARED", {
          tenderId: tender.id,
          tenderTitle: tender.title,
          vendorName: lowestBid.vendorName,
          bidAmount: lowestBid.price
        });

        tender.auditTimeline.push({
          id: "AUD-WIN-" + Date.now(),
          title: "Winner Declared (L1 Awarded)",
          description: `Contract successfully awarded to lowest bidder ${lowestBid.vendorName} (0x${lowestBid.vendorAddress.substring(2, 8)}...) via decentralized sort consensus.`,
          timestamp: new Date().toISOString(),
          txHash,
          iconType: "completed"
        });

        addNotification({
          title: "🏆 CONTRACT AWARDED: " + tender.title,
          message: `${lowestBid.vendorName} won the tender with bid ₹${(lowestBid.price / 10000000).toFixed(2)} Cr. Selection fully audited on-chain.`,
          category: "tender",
          actionUrl: `/tenders/${tender.id}`
        });
      }
      setEvaluatingWinner(false);
    }, 25000 / 10); // 2.5 seconds
  };

  const getTimelineIcon = (type: any) => {
    switch (type) {
      case "created": return <FileText className="w-4 h-4 text-blue-400" />;
      case "published": return <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />;
      case "bid_submitted": return <Lock className="w-4 h-4 text-amber-500" />;
      case "evaluation": return <Clock className="w-4 h-4 text-indigo-400" />;
      case "completed": return <Award className="w-4 h-4 text-emerald-400" />;
      default: return <Info className="w-4 h-4 text-slate-400" />;
    }
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
      budget: "Project Estimated Budget",
      deadline: "Bidding Sealing Deadline",
      msme: "MSME Reservation Quota",
      eligibility: "Prequalification Eligibility Criteria",
      docs: "IPFS Decrypted Spec Files",
      sealedTitle: "Cryptographic Sealing Box",
      connectedAs: "Authorized bidding connected as:",
      unconnectedDesc: "Connect MetaMask wallet or Aadhaar e-sign credentials to participate in this procurement cycle.",
      inputLabel: "Your Technical/Commercial Bid (in Crores INR)",
      submitButton: "Submit Sealed Bid to Blockchain",
      submitting: "Deploying bid to on-chain vault...",
      bidEncrypted: "Bid payload is sealed using SHA-256 state locks. Prices are fully hidden until deadline pass.",
      bidsRegistry: "Sealed Bid Registry (IPFS References)",
      auditTimeline: "Immutable Contract Audit Timeline",
      specDoc: "Download Specification",
      evaluateCTA: "Initiate On-Chain Contract Award"
    },
    hi: {
      budget: "परियोजना अनुमानित बजट",
      deadline: "बोली लगाने की अंतिम तिथि",
      msme: "एमएसएमई आरक्षण कोटा",
      eligibility: "पूर्व योग्यता पात्रता मानदंड",
      docs: "आईपीएफएस डिक्रिप्टेड विशिष्टता फाइलें",
      sealedTitle: "क्रिप्टोग्राफिक सीलिंग बॉक्स",
      connectedAs: "प्राधिकृत बोली लगाने वाला:",
      unconnectedDesc: "निविदा चक्र में भाग लेने के लिए मेटामास्क या आधार ई-हस्ताक्षर क्रेडेंशियल कनेक्ट करें।",
      inputLabel: "आपकी तकनीकी/वाणिज्यिक बोली (करोड़ रुपये में)",
      submitButton: "ब्लॉकचेन में सीलबंद बोली जमा करें",
      submitting: "ब्लॉकचेन तिजोरी में बोली जमा की जा रही है...",
      bidEncrypted: "बोली मूल्य को SHA-256 स्टेट लॉक का उपयोग करके सील किया गया है। समय सीमा बीतने तक कीमतें छिपी रहेंगी।",
      bidsRegistry: "सीलबंद बोली रजिस्ट्री (आईपीएफ़एस सन्दर्भ)",
      auditTimeline: "अपरिवर्तनीय अनुबंध ऑडिट टाइमलाइन",
      specDoc: "विनिर्देश डाउनलोड करें",
      evaluateCTA: "ऑन-चेन अनुबंध पुरस्कार शुरू करें"
    }
  }[language];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-10">
      
      {/* Back button */}
      <button 
        onClick={() => router.push("/dashboard")}
        className="flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-teal-400 mb-6 font-mono"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Procurement Registry</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Section: Tender Details */}
        <section className="lg:col-span-8 space-y-6">
          
          {/* Header Card */}
          <div className="p-6 bg-card border border-border/80 rounded-2xl shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span className="bg-slate-900 border border-slate-800 text-teal-400 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded">
                Tender ID: {tender.id}
              </span>
              <span className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                tender.status === "Open" ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/20" :
                tender.status === "Under Evaluation" ? "bg-amber-950/80 text-amber-400 border-amber-500/20 animate-pulse" :
                tender.status === "Awarded" ? "bg-teal-950/80 text-teal-400 border-teal-500/20" :
                "bg-slate-900 text-slate-400 border-slate-700"
              }`}>
                {tender.status.replace(/_/g, " ")}
              </span>
            </div>

            <h1 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 leading-snug">
              {tender.title}
            </h1>
            <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold tracking-wider mt-2 font-mono uppercase">
              {tender.ministry}
            </p>

            <p className="text-xs text-muted-foreground mt-4 leading-relaxed whitespace-pre-line">
              {tender.description}
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 border border-border/80 rounded-xl text-center">
              <span className="block text-[10px] text-slate-400 font-mono uppercase">{t.budget}</span>
              <span className="block font-black text-sm text-slate-800 dark:text-slate-100 mt-1 font-mono">
                {formatIndianCurrency(tender.budget)}
              </span>
            </div>
            <div className="p-4 bg-muted/30 border border-border/80 rounded-xl text-center">
              <span className="block text-[10px] text-slate-400 font-mono uppercase">{t.deadline}</span>
              <span className="block font-black text-sm text-slate-800 dark:text-slate-100 mt-1 font-mono">
                {new Date(tender.deadline).toLocaleDateString([], { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="p-4 bg-muted/30 border border-border/80 rounded-xl text-center">
              <span className="block text-[10px] text-slate-400 font-mono uppercase">{t.msme}</span>
              <span className={`block font-black text-xs mt-1.5 font-mono ${tender.msmeQuota ? "text-orange-400" : "text-slate-500"}`}>
                {tender.msmeQuota ? "YES (RESERVED)" : "NO SPECIAL QUOTA"}
              </span>
            </div>
          </div>

          {/* Eligibility Specs */}
          <div className="p-6 bg-card border border-border/80 rounded-2xl shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider font-mono flex items-center gap-1.5 text-slate-800 dark:text-slate-200 border-b border-border/80 pb-3 mb-4">
              <ShieldCheck className="w-4.5 h-4.5 text-teal-400" />
              {t.eligibility}
            </h3>
            <ul className="space-y-3">
              {tender.criteria.map((c, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-xs text-muted-foreground leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* IPFS Documents Card */}
          <div className="p-6 bg-card border border-border/80 rounded-2xl shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider font-mono flex items-center gap-1.5 text-slate-800 dark:text-slate-200 border-b border-border/80 pb-3 mb-4">
              <FileText className="w-4.5 h-4.5 text-indigo-400" />
              {t.docs}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tender.ipfsFiles.map((file, idx) => (
                <div key={idx} className="p-3 border border-border/80 rounded-xl hover:border-teal-500/20 bg-muted/20 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <FileText className="w-8 h-8 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{file.name}</span>
                      <span className="block text-[10px] text-slate-400 font-mono mt-0.5 uppercase">{file.size} • IPFS Hash</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleCopyHash(file.hash)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-teal-400 border border-transparent hover:border-slate-700/80 transition-all shrink-0"
                    title={t.specDoc}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Section: Bidding Box & Smart Contract Timelines */}
        <section className="lg:col-span-4 space-y-6">
          
          {/* 1. Cryptographic Bidding Sealing Box */}
          <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/5 rounded-full blur-2xl" />
            <h3 className="text-xs font-black uppercase tracking-wider font-mono flex items-center gap-1.5 text-teal-400 border-b border-border/80 pb-3 mb-4">
              <Lock className="w-4 h-4 text-teal-400" />
              {t.sealedTitle}
            </h3>

            {!isDeadlinePassed ? (
              currentUser?.role === "vendor" ? (
                <form onSubmit={handleBidSubmit} className="space-y-4">
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-[10px] text-teal-400 font-mono flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <div>
                      <span className="block text-slate-400">{t.connectedAs}</span>
                      <span className="font-extrabold">{currentUser.companyName}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                      {t.inputLabel}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 1210.50"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-100 pl-8 pr-12 py-2 rounded-lg text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                        disabled={submittingBid}
                      />
                      <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">₹</span>
                      <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-bold font-mono">Cr</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center space-x-2 text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 py-2.5 rounded-xl transition-all shadow-md"
                    disabled={submittingBid}
                  >
                    {submittingBid ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{t.submitting}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{t.submitButton}</span>
                      </>
                    )}
                  </button>

                  <div className="p-3 bg-teal-950/20 border border-teal-500/20 text-[10px] text-slate-400 leading-normal rounded-lg font-mono flex items-start gap-2">
                    <Info className="w-4.5 h-4.5 text-teal-400 shrink-0 mt-0.5" />
                    <p>{t.bidEncrypted}</p>
                  </div>
                </form>
              ) : (
                <div className="text-center py-6">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 border border-border flex items-center justify-center mx-auto mb-3.5">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed px-4">
                    {t.unconnectedDesc}
                  </p>
                  <button 
                    onClick={() => router.push("/")}
                    className="mt-4 px-3.5 py-1.5 border border-border dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-muted text-xs font-bold font-mono rounded-lg transition-all"
                  >
                    Quick-Connect Wallet
                  </button>
                </div>
              )
            ) : (
              <div className="text-center py-5 space-y-4">
                <div className="bg-rose-950/20 border border-rose-500/20 text-[10px] text-rose-400 font-mono p-2.5 rounded-lg flex items-center gap-1.5 justify-center">
                  <Lock className="w-3.5 h-3.5" />
                  <span>BIDDING CONCLUDED FOR PROCUREMENT CYCLE</span>
                </div>

                {/* If deadline passed and Under Evaluation, Admin Officer can award L1 */}
                {tender.status === "Under Evaluation" && currentUser?.role === "officer" && (
                  <button
                    onClick={handleDeclareWinner}
                    className="w-full flex items-center justify-center space-x-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 py-2.5 rounded-xl transition-all shadow-md font-mono"
                    disabled={evaluatingWinner}
                  >
                    {evaluatingWinner ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Evaluating L1 Bid Price Roots...</span>
                      </>
                    ) : (
                      <>
                        <Cpu className="w-4 h-4" />
                        <span>{t.evaluateCTA}</span>
                      </>
                    )}
                  </button>
                )}

                {/* If Winner is Declared / Awarded */}
                {tender.status === "Awarded" && (
                  <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 text-slate-100 rounded-xl text-left">
                    <div className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-widest flex items-center gap-1.5">
                      <Award className="w-4.5 h-4.5" />
                      L1 WINNER DECLARED
                    </div>
                    <div className="text-sm font-extrabold text-slate-100 mt-2 tracking-tight">
                      {tender.winnerName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate mt-1">
                      Wallet: {tender.winnerAddress}
                    </div>
                    <div className="text-xs font-black text-teal-400 font-mono mt-2.5 flex items-center justify-between border-t border-slate-900 pt-2">
                      <span>Award Price:</span>
                      <span>{formatIndianCurrency(tender.winnerPrice || 0)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Public Bid Registry (SHA Seals) */}
          <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider font-mono flex items-center gap-1.5 text-slate-800 dark:text-slate-200 border-b border-border/80 pb-3 mb-4">
              <Database className="w-4 h-4 text-indigo-400" />
              {t.bidsRegistry}
            </h3>

            <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
              {tender.bids.length > 0 ? (
                tender.bids.map((bid, idx) => (
                  <div key={bid.id} className="text-[10px] leading-relaxed border-b border-border/60 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">{bid.vendorName}</span>
                      <span className="text-slate-400">{bid.id}</span>
                    </div>
                    <div className="text-slate-500 mt-0.5 truncate font-mono">Tx: {bid.txHash}</div>
                    
                    {/* Price visibility rules */}
                    <div className="mt-1.5 flex items-center justify-between">
                      {bid.isEncrypted && !isDeadlinePassed ? (
                        <span className="bg-slate-900 border border-slate-800 text-[#FF9933] font-bold text-[9px] px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                          <Lock className="w-3 h-3" />
                          SHA256 SECURED ROOT
                        </span>
                      ) : (
                        <span className="text-xs font-extrabold text-teal-400 font-mono">
                          {formatIndianCurrency(bid.price)}
                        </span>
                      )}
                      <span className="text-slate-500 text-[9px] font-mono">
                        {new Date(bid.submittedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground font-mono">
                  No bids currently submitted
                </div>
              )}
            </div>
          </div>

          {/* 3. Immutable Timeline Panel */}
          <div className="p-5 rounded-2xl border border-border/80 bg-slate-900/40 relative">
            <h3 className="text-xs font-black uppercase tracking-wider font-mono flex items-center gap-1.5 text-slate-800 dark:text-slate-200 border-b border-border/80 pb-3 mb-4">
              <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin-slow" />
              {t.auditTimeline}
            </h3>

            <div className="relative border-l border-slate-700/80 pl-4 ml-2.5 space-y-5">
              {tender.auditTimeline.map((step) => (
                <div key={step.id} className="relative">
                  {/* Timeline Dot Icon */}
                  <span className="absolute -left-[27px] top-0.5 w-6 h-6 rounded-full bg-slate-950 border border-slate-700 text-slate-200 flex items-center justify-center shrink-0 shadow-md">
                    {getTimelineIcon(step.iconType)}
                  </span>
                  
                  <div>
                    <h4 className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 leading-tight">
                      {step.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">
                      {step.description}
                    </p>
                    {step.txHash && (
                      <button 
                        onClick={() => handleCopyHash(step.txHash!)}
                        className="text-[9px] text-teal-500 hover:text-teal-400 font-mono mt-1 flex items-center gap-1 tracking-tight"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span className="hover:underline">Tx: {step.txHash.substring(0, 12)}...</span>
                        {copiedHash === step.txHash && <span className="text-emerald-400 font-bold ml-1">Copied!</span>}
                      </button>
                    )}
                    <span className="block text-[8px] text-slate-500 font-mono mt-1">
                      {new Date(step.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
