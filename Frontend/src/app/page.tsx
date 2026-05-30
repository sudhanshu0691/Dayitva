"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { BlockchainMonitor } from "../components/BlockchainMonitor";
import { Tender, LiveNewsItem } from "../types";
import { 
  ShieldAlert, Landmark, Building, Eye, ChevronRight, 
  Sparkles, ShieldCheck, Check, Calendar, TrendingUp, Cpu, Flame, Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const { tenders, language } = useApp();
  const [news, setNews] = useState<LiveNewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  // Fetch live news from API
  useEffect(() => {
    fetch("/api/live-news")
      .then((res) => res.json())
      .then((data) => {
        setNews(data);
        setLoadingNews(false);
      })
      .catch((err) => {
        console.error("Failed to fetch news", err);
        setLoadingNews(false);
      });
  }, []);

  // Format currency in Indian numbering system
  const formatIndianCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  const activeTenders = tenders.filter(t => t.status === "Open" || t.status === "Under Evaluation");

  // Translation values
  const t = {
    en: {
      tagline1: "Tamper-Proof Tenders",
      tagline2: "Full Transparency",
      tagline3: "Zero Manipulation",
      heroDesc: "India's next-generation e-procurement ledger. Securing government bids with cryptographically sealed smart contracts, zero-knowledge proofs, and decentralized IPFS auditing.",
      govCTA: "For Government Admin",
      govDesc: "Publish specs, verify KYC & award L1 contracts",
      vendorCTA: "For Registered Vendors",
      vendorDesc: "Connect wallet, view quotas & submit sealed bids",
      publicCTA: "Explore Public Auditor Portal",
      liveTenders: "Live Procurement Postings",
      liveTendersDesc: "Real-time, active tenders verified on the blockchain ledger",
      viewDetails: "Audit Tender Detail",
      msmeBadge: "MSME QUOTA",
      budget: "Estimated Budget",
      deadline: "Sealing Deadline",
      verifiedBadge: "VERIFIED ON-CHAIN",
      newsTitle: "Live Procurement Reforms & Announcements",
      newsDesc: "Real-time updates from NIC, ministries, and regulatory bodies"
    },
    hi: {
      tagline1: "छेड़छाड़-मुक्त निविदाएं",
      tagline2: "पूर्ण पारदर्शिता",
      tagline3: "शून्य हेरफेर",
      heroDesc: "भारत का अगली पीढ़ी का ई-प्रोक्योरमेंट लेजर। सुरक्षित सरकार क्रिप्टोग्राफिक रूप से सीलबंद स्मार्ट अनुबंधों, शून्य-ज्ञान प्रमाणों और विकेंद्रीकृत आईपीएफएस ऑडिटिंग के साथ बोली लगाती है।",
      govCTA: "सरकारी व्यवस्थापक",
      govDesc: "विशिष्टताएँ प्रकाशित करें, केवाईसी सत्यापित करें और अनुबंध दें",
      vendorCTA: "पंजीकृत विक्रेताओं के लिए",
      vendorDesc: "वॉलेट कनेक्ट करें, कोटा देखें और सीलबंद बोलियां जमा करें",
      publicCTA: "सार्वजनिक लेखा परीक्षक पोर्टल",
      liveTenders: "लाइव प्रोक्योरमेंट पोस्टिंग्स",
      liveTendersDesc: "ब्लॉकचेन लेजर पर सत्यापित वास्तविक समय और सक्रिय टेंडर",
      viewDetails: "टेंडर विवरण ऑडिट करें",
      msmeBadge: "एमएसएमई कोटा",
      budget: "अनुमानित बजट",
      deadline: "सीलिंग की समय सीमा",
      verifiedBadge: "ऑन-चेन सत्यापित",
      newsTitle: "लाइव प्रोक्योरमेंट सुधार और घोषणाएं",
      newsDesc: "एनआईसी, मंत्रालयों और नियामक निकायों से वास्तविक समय अपडेट"
    }
  }[language];

  return (
    <div className="w-full relative pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-20 pb-24 border-b border-slate-900">
        
        {/* Dynamic Blockchain Grid Background */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Glowing Blockchain Nodes Simulation */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          
          {/* Government of India Ribbon */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 bg-slate-900 border border-teal-500/30 px-3.5 py-1.5 rounded-full mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[10px] text-slate-300 font-extrabold tracking-widest uppercase font-mono">
              NATIONAL BLOCKCHAIN DIGITAL STACK • MEITY CERTIFIED
            </span>
          </motion.div>

          {/* Tagline */}
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl"
          >
            <span className="text-[#FF9933]">{t.tagline1}</span>
            <span className="text-slate-400"> | </span>
            <span className="text-slate-100">{t.tagline2}</span>
            <span className="text-slate-400"> | </span>
            <span className="text-[#138808]">{t.tagline3}</span>
          </motion.h2>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-sm sm:text-lg max-w-2xl mt-6 leading-relaxed"
          >
            {t.heroDesc}
          </motion.p>

          {/* Action CTAs Layout */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl mt-12"
          >
            
            {/* Government CTA Card */}
            <button
              onClick={() => {
                router.push("/auth/admin");
              }}
              className="group p-5 text-left rounded-2xl bg-slate-900 border border-slate-800 hover:border-[#FF9933]/50 hover:bg-slate-900/80 transition-all shadow-xl hover:shadow-[#FF9933]/5"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-950 border border-orange-800/40 text-[#FF9933] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-[#FF9933] transition-colors">
                {t.govCTA}
              </h3>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                {t.govDesc}
              </p>
              <div className="flex items-center space-x-1 text-slate-400 group-hover:text-white mt-4 text-[10px] font-bold font-mono">
                <span>Access Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Vendor CTA Card */}
            <button
              onClick={() => {
                router.push("/auth/vendor");
              }}
              className="group p-5 text-left rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-900/80 transition-all shadow-xl hover:shadow-teal-500/5"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-800/40 text-teal-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-teal-400 transition-colors">
                {t.vendorCTA}
              </h3>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                {t.vendorDesc}
              </p>
              <div className="flex items-center space-x-1 text-slate-400 group-hover:text-white mt-4 text-[10px] font-bold font-mono">
                <span>Open Bid Space</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Public Auditor CTA Card */}
            <button
              onClick={() => {
                router.push("/public");
              }}
              className="group p-5 text-left rounded-2xl bg-slate-900 border border-slate-800 hover:border-[#138808]/50 hover:bg-slate-900/80 transition-all shadow-xl hover:shadow-[#138808]/5 sm:col-span-2 lg:col-span-1"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/40 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-emerald-400 transition-colors">
                {t.publicCTA}
              </h3>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                Audit live smart contracts, verifications, and audit trials with read-only access.
              </p>
              <div className="flex items-center space-x-1 text-slate-400 group-hover:text-white mt-4 text-[10px] font-bold font-mono">
                <span>View Public Logs</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

          </motion.div>

        </div>
      </section>

      {/* 2. LIVE NETWORK STATISTICS BAR */}
      <section className="bg-slate-900 border-b border-slate-800 py-6 text-white px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3.5">
            <div className="p-2 rounded-lg bg-teal-950 border border-teal-500/20 text-teal-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">CUMULATIVE BID VOLUME</div>
              <div className="text-sm sm:text-base font-black font-mono mt-0.5">₹4,28,450 Cr</div>
            </div>
          </div>
          <div className="flex items-center space-x-3.5 border-l border-slate-800 pl-4">
            <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-500/20 text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">ACTIVE LEDGERS</div>
              <div className="text-sm sm:text-base font-black font-mono mt-0.5">4,892 Tenders</div>
            </div>
          </div>
          <div className="flex items-center space-x-3.5 border-l border-slate-800 pl-4">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">VERIFIED DISPUTE RATE</div>
              <div className="text-sm sm:text-base font-black font-mono mt-0.5">0.00% (Zero)</div>
            </div>
          </div>
          <div className="flex items-center space-x-3.5 border-l border-slate-800 pl-4">
            <div className="p-2 rounded-lg bg-orange-950 border border-orange-500/20 text-orange-400">
              <Flame className="w-5 h-5 text-saffron" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">ZKP SEALS VERIFIED</div>
              <div className="text-sm sm:text-base font-black font-mono mt-0.5">18,245 Claims</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LIVE TENDERS SECTION */}
      <section className="max-w-7xl mx-auto px-6 pt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              {t.liveTenders}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {t.liveTendersDesc}
            </p>
          </div>
          <button 
            onClick={() => router.push("/dashboard")}
            className="text-xs text-primary hover:text-teal-400 font-bold flex items-center gap-1.5 mt-2 md:mt-0 font-mono"
          >
            Explore Public Dashboard
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tenders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeTenders.map((tender) => (
            <div 
              key={tender.id}
              className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-md hover:shadow-lg hover:border-teal-500/30 transition-all flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                  <span className="bg-slate-900 border border-slate-800 text-teal-400 text-[10px] font-bold font-mono px-2 py-0.5 rounded">
                    {tender.id}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    {tender.msmeQuota && (
                      <span className="bg-orange-950 text-saffron text-[9px] font-bold font-mono px-2 py-0.5 rounded border border-orange-800/20">
                        {t.msmeBadge}
                      </span>
                    )}
                    {tender.isNew && (
                      <span className="bg-teal-500 text-slate-950 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full animate-pulse uppercase">
                        New
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                  {tender.title}
                </h3>
                <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold tracking-wider mt-1.5 font-mono uppercase">
                  {tender.ministry}
                </p>
                
                <p className="text-xs text-muted-foreground mt-3 line-clamp-3 leading-relaxed">
                  {tender.description}
                </p>
              </div>

              {/* Card Meta & Bottom */}
              <div className="px-5 py-4 border-t border-border/80 bg-muted/40 grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] text-slate-400 font-mono uppercase">{t.budget}</span>
                  <span className="block font-black text-xs text-slate-800 dark:text-slate-200 mt-0.5 font-mono">
                    {formatIndianCurrency(tender.budget)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-mono uppercase">{t.deadline}</span>
                  <span className="block font-bold text-xs text-slate-800 dark:text-slate-200 mt-0.5 font-mono">
                    {new Date(tender.deadline).toLocaleDateString([], { month: "short", day: "2-digit", year: "numeric" })}
                  </span>
                </div>
              </div>

              {/* Audit Badge & Action */}
              <div className="p-4 border-t border-border/80 flex items-center justify-between bg-card">
                <div className="flex items-center space-x-1.5 text-slate-400 font-mono text-[9px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold tracking-tight text-slate-500 hover:text-slate-300 transition-colors">
                    {tender.txHash.substring(0, 10)}...
                  </span>
                </div>
                
                <button
                  onClick={() => router.push(`/tenders/${tender.id}`)}
                  className="flex items-center space-x-1 text-xs font-bold text-slate-900 bg-secondary dark:bg-slate-900 border border-border hover:bg-muted dark:text-slate-100 px-3 py-1.5 rounded-lg transition-all"
                >
                  <Eye className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{t.viewDetails}</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* 4. SPLIT SCREEN: BLOCKCHAIN MONITOR & REFORMS FEED */}
      <section className="max-w-7xl mx-auto px-6 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Reforms & News Feed */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-saffron" />
                {t.newsTitle}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {t.newsDesc}
              </p>
            </div>

            <div className="space-y-4">
              {loadingNews ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="p-4 bg-muted border border-border animate-pulse rounded-xl h-24" />
                ))
              ) : (
                news.map((item) => (
                  <div 
                    key={item.id}
                    className="p-4 rounded-xl border border-border hover:border-teal-500/20 bg-card shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-slate-400 font-mono font-bold">
                        {item.source}
                      </span>
                      <span className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded font-mono ${
                        item.category === "Reform" ? "bg-amber-950 text-saffron" :
                        item.category === "Blockchain" ? "bg-teal-950 text-teal-400" :
                        "bg-indigo-950 text-indigo-400"
                      }`}>
                        {item.category}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 hover:text-primary transition-colors leading-snug">
                      {item.title}
                    </h4>

                    <div className="text-[9px] text-slate-500 mt-2.5 font-mono">
                      {new Date(item.timestamp).toLocaleDateString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Blockchain Terminal Monitor widget */}
          <div className="lg:col-span-7">
            <BlockchainMonitor />
          </div>

        </div>
      </section>

    </div>
  );
}
