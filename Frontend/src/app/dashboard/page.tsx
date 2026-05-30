"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useApp } from "../../context/AppContext";
import { Tender, UserRole } from "../../types";
import { 
  Search, SlidersHorizontal, CheckCircle2, ChevronRight, 
  Eye, HelpCircle, Layers, ShieldCheck, Tag, Info, AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

// Subcomponent to wrap using search params so we can wrap it in Suspense
const DashboardContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { tenders, blockchainTxs, language } = useApp();

  // Load initial search queries from URL
  const searchUrl = searchParams.get("search") || "";
  const filterUrl = searchParams.get("filter") || "";
  const msmeUrl = searchParams.get("msme") === "true";

  const [searchQuery, setSearchQuery] = useState(searchUrl);
  const [selectedMinistry, setSelectedMinistry] = useState<string>(filterUrl);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [msmeOnly, setMsmeOnly] = useState<boolean>(msmeUrl);
  const [sortBy, setSortBy] = useState<string>("default");

  // Sync inputs with URL
  useEffect(() => {
    setSearchQuery(searchUrl);
    if (filterUrl) {
      if (filterUrl.includes("MORTH")) setSelectedMinistry("Ministry of Road Transport and Highways (MoRTH)");
    }
    setMsmeOnly(msmeUrl);
  }, [searchUrl, filterUrl, msmeUrl]);

  // Unique Ministries list for filter dropdown
  const ministriesList = Array.from(new Set(tenders.map(t => t.ministry)));

  // Filter & Sort Logic
  const filteredTenders = tenders.filter(tender => {
    const matchesSearch = 
      tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMinistry = 
      selectedMinistry === "All" || 
      selectedMinistry === "" || 
      tender.ministry === selectedMinistry;

    const matchesStatus = 
      selectedStatus === "All" || 
      tender.status === selectedStatus;

    const matchesMsme = 
      !msmeOnly || 
      tender.msmeQuota === true;

    return matchesSearch && matchesMinistry && matchesStatus && matchesMsme;
  });

  const sortedTenders = [...filteredTenders].sort((a, b) => {
    if (sortBy === "budget-desc") return b.budget - a.budget;
    if (sortBy === "budget-asc") return a.budget - b.budget;
    if (sortBy === "deadline") return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0; // default order
  });

  const getStatusBadge = (status: Tender["status"]) => {
    switch (status) {
      case "Open":
        return "bg-emerald-950/80 text-emerald-400 border-emerald-500/30";
      case "Under Evaluation":
        return "bg-amber-950/80 text-amber-400 border-amber-500/30 animate-pulse";
      case "Closed":
        return "bg-slate-900 text-slate-400 border-slate-700";
      case "Awarded":
        return "bg-teal-950/80 text-teal-400 border-teal-500/30";
      default:
        return "bg-slate-900 text-slate-400 border-slate-700";
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
      title: "Public E-Procurement Dashboard",
      desc: "Freely audit active tenders, sealed bidding progress, and cryptographic consensus milestones without credentials.",
      searchPlaceholder: "Search ID, keyword, or specs...",
      filtersTitle: "Advanced Audit Filters",
      ministry: "Department / Ministry",
      allMin: "All Ministries",
      status: "Tender Status",
      allStatus: "All Statuses",
      msmeToggle: "MSME Reservation Only",
      sortLabel: "Sort Ledger By",
      sortDefault: "Default Blockchain Order",
      sortBudgetDesc: "Budget: Highest First",
      sortBudgetAsc: "Budget: Lowest First",
      sortDeadline: "Closing Date: Nearest First",
      sortNewest: "Created Date: Newest First",
      noResults: "No Procurement Records Match Criteria",
      noResultsDesc: "Review search query or clear advanced filters to browse the on-chain registry.",
      blockchainTracker: "Ledger Confirmation Ticker",
      verificationTip: "All records are sealed with SHA-256 state roots and synchronized across 1,842 validating nodes.",
      viewTender: "Audit Tender & Timeline"
    },
    hi: {
      title: "सार्वजनिक ई-प्रोक्योरमेंट डैशबोर्ड",
      desc: "बिना किसी क्रेडेंशियल के ऑन-चेन सक्रिय निविदाओं, सीलबंद बोलियों की प्रगति और संविदा मील के पत्थरों का स्वतंत्र रूप से ऑडिट करें।",
      searchPlaceholder: "आईडी, कीवर्ड या विनिर्देश खोजें...",
      filtersTitle: "उन्नत ऑडिट फ़िल्टर",
      ministry: "विभाग / मंत्रालय",
      allMin: "सभी मंत्रालय",
      status: "टेंडर की स्थिति",
      allStatus: "सभी स्थितियाँ",
      msmeToggle: "केवल एमएसएमई आरक्षण",
      sortLabel: "क्रमबद्ध करें",
      sortDefault: "डिफ़ॉल्ट ब्लॉकचेन क्रम",
      sortBudgetDesc: "बजट: सबसे अधिक पहले",
      sortBudgetAsc: "बजट: सबसे कम पहले",
      sortDeadline: "अंतिम तिथि: निकटतम पहले",
      sortNewest: "सृजन तिथि: नवीनतम पहले",
      noResults: "कोई रिकॉर्ड मानदंडों से मेल नहीं खाता",
      noResultsDesc: "ऑन-चेन रजिस्ट्री ब्राउज़ करने के लिए खोज बदलें या फ़िल्टर साफ़ करें।",
      blockchainTracker: "ब्लॉक पुष्टिकरण टिकर",
      verificationTip: "सभी रिकॉर्ड SHA-256 राज्य रूटों के साथ सील किए गए हैं और 1,842 नोड्स में सिंक्रनाइज़ हैं।",
      viewTender: "टेंडर और टाइमलाइन का ऑडिट"
    }
  }[language];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-10">
      
      {/* 1. Header Banner */}
      <div className="border-b border-border/80 pb-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            {t.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            {t.desc}
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center space-x-3 text-white text-xs max-w-sm">
          <Info className="w-5 h-5 text-teal-400 shrink-0" />
          <p className="text-[10px] text-slate-300 font-mono leading-relaxed">
            {t.verificationTip}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 2. Sidebar Filters Panel */}
        <aside className="lg:col-span-3 bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              {t.filtersTitle}
            </span>
            <button 
              onClick={() => {
                setSearchQuery("");
                setSelectedMinistry("All");
                setSelectedStatus("All");
                setMsmeOnly(false);
                setSortBy("default");
              }}
              className="text-[10px] text-teal-500 font-bold hover:underline font-mono"
            >
              Reset All
            </button>
          </div>

          {/* Keyword Search inside filters */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Keyword Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 pl-8 pr-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-100 font-semibold"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Ministry Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">{t.ministry}</label>
            <select
              value={selectedMinistry}
              onChange={(e) => setSelectedMinistry(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-bold text-slate-700 dark:text-slate-300"
            >
              <option value="All">{t.allMin}</option>
              {ministriesList.map((m, idx) => (
                <option key={idx} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">{t.status}</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-bold text-slate-700 dark:text-slate-300"
            >
              <option value="All">{t.allStatus}</option>
              <option value="Open">Open (Live bidding)</option>
              <option value="Under Evaluation">Under Evaluation</option>
              <option value="Closed">Closed</option>
              <option value="Awarded">Awarded (Contract finalized)</option>
            </select>
          </div>

          {/* MSME quota toggle */}
          <div className="pt-2">
            <label className="relative flex items-center space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={msmeOnly}
                onChange={(e) => setMsmeOnly(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.msmeToggle}
              </span>
            </label>
          </div>

          <hr className="border-border/85" />

          {/* Sorting panel */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">{t.sortLabel}</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-bold text-slate-700 dark:text-slate-300"
            >
              <option value="default">{t.sortDefault}</option>
              <option value="budget-desc">{t.sortBudgetDesc}</option>
              <option value="budget-asc">{t.sortBudgetAsc}</option>
              <option value="deadline">{t.sortDeadline}</option>
              <option value="newest">{t.sortNewest}</option>
            </select>
          </div>
        </aside>

        {/* 3. Main Dashboard grid */}
        <section className="lg:col-span-6 space-y-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono bg-muted/40 p-3 rounded-lg border border-border/80">
            <span>SHOWING: <strong className="text-slate-800 dark:text-white">{sortedTenders.length}</strong> PROCUREMENT ENTRIES</span>
            <span>SYNC: BLOCK #{blockchainTxs[0]?.blockNumber || "18245903"}</span>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {sortedTenders.length > 0 ? (
                sortedTenders.map((tender) => (
                  <motion.div
                    layout
                    key={tender.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="p-5 rounded-2xl border border-border/80 bg-card hover:border-teal-500/30 transition-all shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      {/* Department + ID */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-mono font-bold text-teal-500">
                          {tender.id}
                        </span>
                        
                        <div className="flex items-center space-x-1.5">
                          {tender.msmeQuota && (
                            <span className="bg-orange-950 text-saffron text-[9px] font-bold font-mono px-2 py-0.5 rounded border border-orange-800/10">
                              MSME
                            </span>
                          )}
                          <span className={`text-[9px] font-bold font-mono px-2.5 py-0.5 rounded-full border ${getStatusBadge(tender.status)}`}>
                            {tender.status}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                        {tender.title}
                      </h3>
                      <p className="text-[10px] font-extrabold text-slate-400 tracking-wider font-mono mt-1 uppercase">
                        {tender.ministry}
                      </p>

                      <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
                        {tender.description}
                      </p>
                    </div>

                    {/* Metadata summary */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/60 my-4 text-[10px] font-mono bg-muted/20 px-3 rounded-lg">
                      <div>
                        <span className="block text-slate-400">EST BUDGET</span>
                        <strong className="block text-slate-800 dark:text-slate-200 mt-0.5">{formatIndianCurrency(tender.budget)}</strong>
                      </div>
                      <div>
                        <span className="block text-slate-400">DEADLINE</span>
                        <strong className="block text-slate-800 dark:text-slate-200 mt-0.5">
                          {new Date(tender.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </strong>
                      </div>
                      <div>
                        <span className="block text-slate-400">SEALED BIDS</span>
                        <strong className="block text-teal-400 mt-0.5">{tender.bidsCount} Bidders</strong>
                      </div>
                    </div>

                    {/* Verification ribbon & Action */}
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center space-x-1.5 text-slate-500 font-mono">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="hidden sm:inline">Smart Contract Verified •</span>
                        <span className="underline select-all hover:text-teal-400 cursor-pointer">{tender.txHash.substring(0, 10)}...</span>
                      </div>
                      
                      <button
                        onClick={() => router.push(`/tenders/${tender.id}`)}
                        className="flex items-center space-x-1 text-xs font-bold text-slate-900 bg-secondary dark:bg-slate-900 border border-border hover:bg-muted dark:text-slate-200 px-3.5 py-1.5 rounded-xl transition-all"
                      >
                        <Eye className="w-4 h-4 text-teal-400" />
                        <span>{t.viewTender}</span>
                      </button>
                    </div>

                  </motion.div>
                ))
              ) : (
                <div className="p-12 text-center bg-card border border-border/80 rounded-2xl">
                  <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{t.noResults}</h4>
                  <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">{t.noResultsDesc}</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* 4. Right side Block Activity ticker */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl" />
            <h3 className="text-xs font-black uppercase tracking-wider font-mono flex items-center gap-1.5 text-teal-400 border-b border-slate-900 pb-2 mb-3">
              <Layers className="w-4 h-4 text-teal-400 animate-pulse" />
              {t.blockchainTracker}
            </h3>
            
            <div className="space-y-3.5 max-h-[22rem] overflow-y-auto pr-1">
              {blockchainTxs.slice(0, 5).map((tx, idx) => (
                <div key={idx} className="text-[10px] leading-relaxed border-b border-slate-900/60 pb-3 last:border-b-0">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-extrabold text-slate-200">{tx.type.replace(/_/g, " ")}</span>
                    <span className="text-teal-400 font-bold">Block #{tx.blockNumber}</span>
                  </div>
                  <div className="text-slate-500 mt-1 truncate">Hash: {tx.txHash}</div>
                  <div className="text-[9px] text-slate-400 mt-1 line-clamp-1">{tx.metadata.tenderTitle || "ZKP Claim Registered"}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-7xl mx-auto px-6 py-20 text-center font-mono text-xs">
        <p className="animate-pulse">DECRYPTING ON-CHAIN REGISTRY STATE roots...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
