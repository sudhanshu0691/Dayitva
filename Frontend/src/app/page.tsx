"use client";

import React, { useEffect, useState } from "react";
import { BlockchainMonitor } from "../components/BlockchainMonitor";
import { LiveNewsItem } from "../types";
import { 
  Landmark, Building, Eye, ChevronRight, 
  Sparkles, ShieldCheck, Calendar, TrendingUp, Cpu, Flame, User
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import tenderService from "@/services/tenderService";

export default function LandingPage() {
  const router = useRouter();
  const [tenders, setTenders] = useState<any[]>([]);
  const [news, setNews] = useState<LiveNewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [language, setLanguage] = useState<"en" | "hi">("en");

  useEffect(() => {
    // Fetch tenders from API
    tenderService.listTenders({ status: "Open" }).then(res => {
      setTenders(res.data || []);
    }).catch(() => {});

    // Fetch live news
    fetch("/api/live-news")
      .then((res) => res.json())
      .then((data) => {
        setNews(data);
        setLoadingNews(false);
      })
      .catch(() => setLoadingNews(false));
  }, []);

  const formatIndianCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  const activeTenders = tenders;

  const t = {
    en: {
      tagline1: "Tamper-Proof Tenders",
      tagline2: "Full Transparency",
      tagline3: "Zero Manipulation",
      heroDesc: "India's next-generation e-procurement ledger. Securing government bids with cryptographically sealed smart contracts and decentralized IPFS auditing.",
      govCTA: "For Government Admin",
      govDesc: "Publish specs, verify KYC & award L1 contracts",
      vendorCTA: "For Registered Vendors",
      vendorDesc: "Connect wallet, view quotas & submit sealed bids",
      publicCTA: "Public View",
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
      heroDesc: "भारत का अगली पीढ़ी का ई-प्रोक्योरमेंट लेजर। क्रिप्टोग्राफिक रूप से सीलबंद स्मार्ट अनुबंधों और विकेंद्रीकृत आईपीएफएस ऑडिटिंग के साथ सुरक्षित सरकारी बोलियां।",
      govCTA: "सरकारी व्यवस्थापक",
      govDesc: "विशिष्टताएँ प्रकाशित करें, केवाईसी सत्यापित करें और अनुबंध दें",
      vendorCTA: "पंजीकृत विक्रेताओं के लिए",
      vendorDesc: "वॉलेट कनेक्ट करें, कोटा देखें और सीलबंद बोलियां जमा करें",
      publicCTA: "सार्वजनिक दृश्य",
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
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-20 pb-24 border-b border-slate-900">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 bg-slate-900 border border-teal-500/30 px-3.5 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[10px] text-slate-300 font-extrabold tracking-widest uppercase font-mono">
              NATIONAL BLOCKCHAIN DIGITAL STACK • MEITY CERTIFIED
            </span>
          </motion.div>

          <motion.h2 initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl">
            <span className="text-[#FF9933]">{t.tagline1}</span>
            <span className="text-slate-400"> | </span>
            <span className="text-slate-100">{t.tagline2}</span>
            <span className="text-slate-400"> | </span>
            <span className="text-[#138808]">{t.tagline3}</span>
          </motion.h2>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-slate-400 text-sm sm:text-lg max-w-2xl mt-6 leading-relaxed">{t.heroDesc}</motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl mt-12">
            <button onClick={() => router.push("/login?role=officer")}
              className="group p-5 text-left rounded-2xl bg-slate-900 border border-slate-800 hover:border-[#FF9933]/50 transition-all shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-orange-950 border border-orange-800/40 text-[#FF9933] flex items-center justify-center mb-4">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-[#FF9933] transition-colors">{t.govCTA}</h3>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{t.govDesc}</p>
            </button>
            <button onClick={() => router.push("/login?role=vendor")}
              className="group p-5 text-left rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 transition-all shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-800/40 text-teal-400 flex items-center justify-center mb-4">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-teal-400 transition-colors">{t.vendorCTA}</h3>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{t.vendorDesc}</p>
            </button>
            <button onClick={() => router.push("/public")}
              className="group p-5 text-left rounded-2xl bg-slate-900 border border-slate-800 hover:border-[#138808]/50 transition-all shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/40 text-emerald-400 flex items-center justify-center mb-4">
                <User className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-emerald-400 transition-colors">{t.publicCTA}</h3>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">Browse live tenders and procurement records publicly.</p>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-slate-900 border-b border-slate-800 py-6 text-white px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3.5">
            <div className="p-2 rounded-lg bg-teal-950 border border-teal-500/20 text-teal-400"><TrendingUp className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">ACTIVE TENDERS</div>
            <div className="text-sm font-black font-mono mt-0.5">{activeTenders.length}</div></div>
          </div>
          <div className="flex items-center space-x-3.5 border-l border-slate-800 pl-4">
            <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-500/20 text-indigo-400"><Cpu className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">VERIFIED NODES</div>
            <div className="text-sm font-black font-mono mt-0.5">1,842</div></div>
          </div>
          <div className="flex items-center space-x-3.5 border-l border-slate-800 pl-4">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-500/20 text-emerald-400"><ShieldCheck className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">DISPUTE RATE</div>
            <div className="text-sm font-black font-mono mt-0.5">0.00%</div></div>
          </div>
          <div className="flex items-center space-x-3.5 border-l border-slate-800 pl-4">
            <div className="p-2 rounded-lg bg-orange-950 border border-orange-500/20 text-orange-400"><Flame className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">SEALS VERIFIED</div>
            <div className="text-sm font-black font-mono mt-0.5">18,245</div></div>
          </div>
        </div>
      </section>

      {/* Live Tenders */}
      <section className="max-w-7xl mx-auto px-6 pt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              {t.liveTenders}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">{t.liveTendersDesc}</p>
          </div>
          <button onClick={() => router.push("/dashboard")}
            className="text-xs text-primary hover:text-teal-400 font-bold flex items-center gap-1.5 mt-2 md:mt-0 font-mono">
            Explore Public Dashboard <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeTenders.slice(0, 4).map((tender: any) => (
            <div key={tender.id} className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-md hover:shadow-lg hover:border-teal-500/30 transition-all flex flex-col justify-between">
              <div className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                  <span className="bg-slate-900 border border-slate-800 text-teal-400 text-[10px] font-bold font-mono px-2 py-0.5 rounded">{tender.id}</span>
                  <div className="flex items-center space-x-2">
                    {tender.msmeQuota && (
                      <span className="bg-orange-950 text-saffron text-[9px] font-bold font-mono px-2 py-0.5 rounded border border-orange-800/20">{t.msmeBadge}</span>
                    )}
                  </div>
                </div>
                <h3 className="font-extrabold text-sm text-foreground line-clamp-2">{tender.title}</h3>
                <p className="text-[10px] text-teal-400 font-bold tracking-wider mt-1.5 font-mono uppercase">{tender.ministry}</p>
                <p className="text-xs text-muted-foreground mt-3 line-clamp-3">{tender.description}</p>
              </div>
              <div className="px-5 py-4 border-t border-border/80 bg-muted/40 grid grid-cols-2 gap-4">
                <div><span className="block text-[10px] text-muted-foreground font-mono uppercase">{t.budget}</span>
                  <span className="block font-black text-xs text-foreground mt-0.5 font-mono">{formatIndianCurrency(tender.budget)}</span></div>
                <div><span className="block text-[10px] text-muted-foreground font-mono uppercase">{t.deadline}</span>
                  <span className="block font-bold text-xs text-foreground mt-0.5 font-mono">{new Date(tender.deadline).toLocaleDateString()}</span></div>
              </div>
              <div className="p-4 border-t border-border/80 flex items-center justify-between bg-card">
                <div className="flex items-center space-x-1.5 text-muted-foreground font-mono text-[9px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified On-chain</span>
                </div>
                <button onClick={() => router.push(`/tenders/${tender.id}`)}
                  className="flex items-center space-x-1 text-xs font-bold px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-all">
                  <Eye className="w-3.5 h-3.5 text-teal-400" />
                  <span>{t.viewDetails}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* News & Blockchain Monitor */}
      <section className="max-w-7xl mx-auto px-6 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-saffron" /> {t.newsTitle}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">{t.newsDesc}</p>
            </div>
            <div className="space-y-4">
              {news.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-border hover:border-teal-500/20 bg-card shadow-sm transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-muted-foreground font-mono font-bold">{item.source}</span>
                    <span className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded font-mono bg-teal-950 text-teal-400">{item.category}</span>
                  </div>
                  <h4 className="font-extrabold text-xs text-foreground leading-snug">{item.title}</h4>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-7">
            <BlockchainMonitor />
          </div>
        </div>
      </section>
    </div>
  );
}