"use client";

import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { 
  Building, ShieldCheck, Wallet, FileText, CheckCircle2, 
  TrendingUp, Search, Calendar, ChevronRight, MessageSquare, 
  ArrowUpRight, Award, DollarSign, Clock, Layers 
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, BarChart, Bar, Cell 
} from "recharts";

const analyticsData = [
  { month: "Jan", bids: 4, won: 1 },
  { month: "Feb", bids: 6, won: 2 },
  { month: "Mar", bids: 5, won: 2 },
  { month: "Apr", bids: 8, won: 3 },
  { month: "May", bids: 10, won: 4 },
];

const winTrendData = [
  { name: "Tata Projects", ratio: 65 },
  { name: "L&T Construction", ratio: 58 },
  { name: "Your Company", ratio: 72 }, // based on won / lost
  { name: "Wipro Cloud", ratio: 50 },
];

export default function VendorDashboard() {
  const router = useRouter();
  const { tenders, currentUser, language } = useApp();
  const [activeTab, setActiveTab] = useState("overview");

  // Route through vendor auth flow when session is missing.
  const handleSimulateLogin = () => {
    router.push("/auth/vendor");
  };

  if (!currentUser || currentUser.role !== "vendor") {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-teal-400">
          <Building className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Vendor Secure Workspace Lock</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Accessing corporate dashboard, active bid tables, and secure payments escrow requires authenticated company credentials and approved KYC status.
        </p>
        <button 
          onClick={handleSimulateLogin} 
          className="mt-6 w-full flex items-center justify-center space-x-2 text-xs font-black font-mono px-4 py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white rounded-xl shadow-lg transition-all"
        >
          <Wallet className="w-4 h-4" />
          <span>Proceed To Vendor Sign In</span>
        </button>
      </div>
    );
  }

  // Get tenders where this vendor submitted a bid
  const myBids = tenders.filter(t => t.bids.some(b => b.vendorName === currentUser.companyName || b.vendorAddress === currentUser.gst));
  const activeBidsCount = myBids.filter(b => b.status === "Open" || b.status === "Under Evaluation").length;
  const wonBids = tenders.filter(t => t.winnerName === currentUser.companyName);
  const lostBids = tenders.filter(t => t.status === "Awarded" && t.winnerName !== currentUser.companyName);

  const formatIndianCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  // Translations
  const t = {
    en: {
      welcome: "Welcome Corporate Workspace",
      kycBadge: "KYC VERIFIED ON BLOCKCHAIN",
      statsTotal: "Total Bids Placed",
      statsActive: "Active Bids Sealed",
      statsWon: "Contracts Won",
      statsRate: "Success Bid Rate",
      overview: "Overview & Analytics",
      bidsHistory: "My Bids & History",
      payments: "On-Chain Payments tracking",
      paymentsDesc: "Transparent milestone releases locked in treasury smart contract escrow accounts.",
      recentPostings: "Browse Sponsoring Postings"
    },
    hi: {
      welcome: "कॉरपोरेट कार्यक्षेत्र में आपका स्वागत है",
      kycBadge: "ब्लॉकचेन पर सत्यापित केवाईसी",
      statsTotal: "कुल लगाई गई बोलियां",
      statsActive: "सक्रिय सीलबंद बोलियां",
      statsWon: "जीते गए अनुबंध",
      statsRate: "सफलता दर",
      overview: "अवलोकन और विश्लेषिकी",
      bidsHistory: "मेरी बोलियां और इतिहास",
      payments: "ऑन-चेन भुगतान ट्रैकिंग",
      paymentsDesc: "ट्रेजरी स्मार्ट कॉन्ट्रैक्ट एस्क्रो खातों में लॉक किए गए पारदर्शी मील का पत्थर रिलीज।",
      recentPostings: "प्रायोजक निविदाएं ब्राउज़ करें"
    }
  }[language];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-10">
      
      {/* 1. Welcome Header Ribbon */}
      <div className="p-6 bg-slate-900 border border-slate-800 text-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-teal-950 border border-teal-500/30 rounded-xl flex items-center justify-center text-teal-400">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider font-mono">{t.welcome}</span>
            <h1 className="text-lg font-black tracking-tight mt-0.5">{currentUser.companyName}</h1>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block">REG ID: {currentUser.regNumber}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-teal-950 border border-teal-500/30 px-3 py-1.5 rounded-xl font-mono text-[10px] text-teal-400">
          <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
          <span className="font-extrabold tracking-wider">{t.kycBadge}</span>
        </div>
      </div>

      {/* 2. Quick Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-white">
        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">{t.statsTotal}</span>
          <span className="block text-xl font-black font-mono mt-1">{myBids.length}</span>
        </div>
        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">{t.statsActive}</span>
          <span className="block text-xl font-black font-mono mt-1 text-teal-400">{activeBidsCount}</span>
        </div>
        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">{t.statsWon}</span>
          <span className="block text-xl font-black font-mono mt-1 text-emerald-400">{wonBids.length}</span>
        </div>
        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">{t.statsRate}</span>
          <span className="block text-xl font-black font-mono mt-1 text-indigo-400">75%</span>
        </div>
      </div>

      {/* Tab Navigation selectors */}
      <div className="flex border-b border-border/80 mb-6 font-mono text-xs font-bold uppercase tracking-wider gap-6 overflow-x-auto scrollbar-none">
        <button 
          onClick={() => setActiveTab("overview")}
          className={`pb-2.5 border-b-2 px-1 transition-all ${activeTab === "overview" ? "border-primary text-slate-900 dark:text-white" : "border-transparent text-slate-400"}`}
        >
          {t.overview}
        </button>
        <button 
          onClick={() => setActiveTab("bids")}
          className={`pb-2.5 border-b-2 px-1 transition-all ${activeTab === "bids" ? "border-primary text-slate-900 dark:text-white" : "border-transparent text-slate-400"}`}
        >
          {t.bidsHistory}
        </button>
        <button 
          onClick={() => setActiveTab("payments")}
          className={`pb-2.5 border-b-2 px-1 transition-all ${activeTab === "payments" ? "border-primary text-slate-900 dark:text-white" : "border-transparent text-slate-400"}`}
        >
          {t.payments}
        </button>
      </div>

      {/* 3. Tab Contents rendering */}
      <div>
        
        {/* TAB 1: Overview & Performance Charts */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Analytical Charts */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider font-mono text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-1.5 border-b border-border/85 pb-2">
                  <TrendingUp className="w-4.5 h-4.5 text-primary" />
                  Monthly Bidding Activity & Conversions
                </h3>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBids" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "10px", fontSize: "11px" }} />
                      <Area type="monotone" dataKey="bids" stroke="#14b8a6" fillOpacity={1} fill="url(#colorBids)" strokeWidth={2.5} name="Total Bids" />
                      <Area type="monotone" dataKey="won" stroke="#10b981" fillOpacity={0} strokeWidth={2} name="Won Contracts" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Benchmarking Comparison */}
              <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider font-mono text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-1.5 border-b border-border/85 pb-2">
                  <Layers className="w-4.5 h-4.5 text-indigo-400" />
                  Ledger Success Benchmarking (Win Ratios %)
                </h3>
                <div className="w-full h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={winTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "10px", fontSize: "11px" }} />
                      <Bar dataKey="ratio" radius={[6, 6, 0, 0]} barSize={36}>
                        {winTrendData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.name === "Your Company" ? "#14b8a6" : "#1e293b"} 
                            stroke={entry.name === "Your Company" ? "#2dd4bf" : "#334155"}
                            strokeWidth={1}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Sidebar quick browsers */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider font-mono text-slate-800 dark:text-slate-100 mb-4 pb-2 border-b border-border/85 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  {t.recentPostings}
                </h3>
                <div className="space-y-3">
                  {tenders.slice(0, 3).map(tender => (
                    <div 
                      key={tender.id}
                      onClick={() => router.push(`/tenders/${tender.id}`)}
                      className="p-3 border border-border/80 rounded-xl hover:border-teal-500/20 bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[9px] font-mono text-slate-400 font-bold block mb-1">{tender.id}</span>
                        <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 line-clamp-1 leading-snug">{tender.title}</h4>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30 text-[9px] font-mono">
                        <span className="font-bold text-teal-500">{formatIndianCurrency(tender.budget)}</span>
                        <span className="text-slate-400">Dead: {new Date(tender.deadline).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: My Bids & History table */}
        {activeTab === "bids" && (
          <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border/85 bg-slate-900/10 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider font-mono text-slate-800 dark:text-slate-200">
                Sealed Bids Activity Register
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {myBids.length} Bid entries discovered
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-semibold">
                <thead>
                  <tr className="border-b border-border bg-muted/40 font-mono text-[10px] text-slate-500 uppercase">
                    <th className="p-3">Tender ID</th>
                    <th className="p-3">Tender Title</th>
                    <th className="p-3">Decryption Status</th>
                    <th className="p-3">My Price Lock</th>
                    <th className="p-3">Consensus Result</th>
                    <th className="p-3">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-slate-700 dark:text-slate-300">
                  {myBids.map(tender => {
                    const myBidDetail = tender.bids.find(b => b.vendorName === currentUser.companyName || b.vendorAddress === currentUser.gst);
                    const isWinner = tender.winnerName === currentUser.companyName;
                    
                    return (
                      <tr key={tender.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono font-bold text-teal-500">{tender.id}</td>
                        <td className="p-3 font-bold truncate max-w-xs">{tender.title}</td>
                        <td className="p-3">
                          {tender.status === "Open" ? (
                            <span className="bg-slate-900 text-[#FF9933] border border-orange-500/20 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 w-max">
                              <Clock className="w-3 h-3" />
                              Sealed SHA-256
                            </span>
                          ) : (
                            <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/20 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3" />
                              Decrypted L1
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-extrabold text-slate-800 dark:text-slate-200">
                          {tender.status === "Open" ? (
                            <span className="text-slate-500">[LOCK SEALD]</span>
                          ) : (
                            formatIndianCurrency(myBidDetail?.price || 0)
                          )}
                        </td>
                        <td className="p-3">
                          {tender.status !== "Awarded" ? (
                            <span className="text-slate-500 font-mono text-[10px]">Under Eval</span>
                          ) : isWinner ? (
                            <span className="bg-emerald-950 text-emerald-400 text-[9px] px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 w-max">
                              <Award className="w-3.5 h-3.5 text-emerald-400" />
                              WON CONTRACT
                            </span>
                          ) : (
                            <span className="bg-rose-950 text-rose-400 text-[9px] px-2 py-0.5 rounded font-mono font-bold w-max block">
                              LOST (L2/L3)
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <button 
                            onClick={() => router.push(`/tenders/${tender.id}`)}
                            className="p-1.5 border border-border rounded hover:bg-slate-800 hover:text-teal-400 transition-colors"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: On-Chain Escrow payments */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            <div className="bg-slate-900/40 p-4 border border-slate-800 rounded-2xl max-w-3xl">
              <h3 className="text-xs font-black uppercase tracking-wider font-mono text-teal-400 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-5 h-5 text-teal-400" />
                {t.payments}
              </h3>
              <p className="text-[11px] text-slate-400 leading-normal font-medium">
                {t.paymentsDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              {wonBids.length > 0 ? (
                wonBids.map(tender => (
                  <div key={tender.id} className="p-5 border border-border/80 rounded-2xl bg-card shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                      <div>
                        <span className="text-[9px] font-mono text-slate-400 font-bold block">{tender.id}</span>
                        <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate max-w-[200px] leading-snug">{tender.title}</h4>
                      </div>
                      <span className="text-xs font-black text-teal-400 font-mono">{formatIndianCurrency(tender.winnerPrice || 0)}</span>
                    </div>

                    {/* Visual Milestone stepper progress */}
                    <div className="space-y-3 font-mono text-[10px] text-slate-400">
                      <div className="flex items-center justify-between">
                        <span>Invoice Milestone: Mobilization (10%)</span>
                        <span className="text-emerald-400 font-bold">RELEASED</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Invoice Milestone: Foundation Signoff (30%)</span>
                        <span className="text-amber-500 font-bold">UNDER AUDIT</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Invoice Milestone: Structural Seal (30%)</span>
                        <span className="text-slate-500">LOCKED</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
                      <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: "33%" }} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center border border-border/80 rounded-2xl bg-card sm:col-span-2">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3.5">
                    <DollarSign className="w-5 h-5 text-slate-500" />
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100">No Secured Smart Escrow Payments Active</h4>
                  <p className="text-[11px] text-muted-foreground mt-2 max-w-xs mx-auto">Once your corporate profile wins a bid posting, milestone contracts will render treasury release workflows here.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
