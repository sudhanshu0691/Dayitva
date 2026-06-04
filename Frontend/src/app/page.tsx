"use client";

import React, { useEffect, useState } from "react";
import { BlockchainMonitor } from "../components/BlockchainMonitor";
import { LiveNewsItem } from "../types";
import { 
  Landmark, Building, Eye, ChevronRight, 
  ShieldCheck, Calendar, TrendingUp, Cpu, User
} from "lucide-react";
import { useRouter } from "next/navigation";
import tenderService from "@/services/tenderService";

export default function LandingPage() {
  const router = useRouter();
  const [tenders, setTenders] = useState<any[]>([]);
  const [news, setNews] = useState<LiveNewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [language, setLanguage] = useState<"en" | "hi">("en");

  useEffect(() => {
    tenderService.listTenders({ status: "Open" }).then(res => {
      setTenders(res.data || []);
    }).catch(() => {});

    fetch("/api/live-news")
      .then((res) => res.json())
      .then((data) => { setNews(data); setLoadingNews(false); })
      .catch(() => setLoadingNews(false));
  }, []);

  const formatIndianCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  const activeTenders = tenders;

  const t = {
    en: {
      tagline1: "Tamper-proof tenders",
      tagline2: "Full transparency",
      tagline3: "Zero manipulation",
      heroDesc: "India's government e-procurement platform. Securing public procurement with transparent, auditable processes.",
      govCTA: "For government admin",
      govDesc: "Publish specs, verify KYC and award contracts",
      vendorCTA: "For registered vendors",
      vendorDesc: "Connect wallet, view quotas and submit bids",
      publicCTA: "Public view",
      liveTenders: "Live procurement postings",
      liveTendersDesc: "Active tenders verified on the blockchain ledger",
      viewDetails: "Audit tender detail",
      msmeBadge: "MSME QUOTA",
      budget: "Estimated budget",
      deadline: "Sealing deadline",
      verifiedBadge: "Verified on-chain",
      newsTitle: "Live procurement reforms and announcements",
      newsDesc: "Updates from ministries and regulatory bodies"
    },
    hi: {
      tagline1: "छेड़छाड़-मुक्त निविदाएं",
      tagline2: "पूर्ण पारदर्शिता",
      tagline3: "शून्य हेरफेर",
      heroDesc: "भारत का सरकारी ई-प्रोक्योरमेंट प्लेटफॉर्म। पारदर्शी और ऑडिट योग्य प्रक्रियाओं के साथ सुरक्षित सार्वजनिक खरीद।",
      govCTA: "सरकारी व्यवस्थापक",
      govDesc: "विशिष्टताएँ प्रकाशित करें, केवाईसी सत्यापित करें और अनुबंध दें",
      vendorCTA: "पंजीकृत विक्रेताओं के लिए",
      vendorDesc: "वॉलेट कनेक्ट करें, कोटा देखें और बोलियां जमा करें",
      publicCTA: "सार्वजनिक दृश्य",
      liveTenders: "लाइव प्रोक्योरमेंट पोस्टिंग्स",
      liveTendersDesc: "ब्लॉकचेन लेजर पर सत्यापित सक्रिय टेंडर",
      viewDetails: "टेंडर विवरण देखें",
      msmeBadge: "एमएसएमई कोटा",
      budget: "अनुमानित बजट",
      deadline: "सीलिंग की समय सीमा",
      verifiedBadge: "ऑन-चेन सत्यापित",
      newsTitle: "लाइव प्रोक्योरमेंट सुधार और घोषणाएं",
      newsDesc: "मंत्रालयों और नियामक निकायों से अपडेट"
    }
  }[language];

  return (
    <div className="w-full relative pb-16">
      {/* HERO SECTION */}
      <section className="relative bg-background text-foreground pt-16 pb-20 border-b border-border">
        <div className="max-w-container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 bg-[#002869]/10 border border-[#002869]/30 px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-[#002869] rounded-full" />
            <span className="text-label-sm text-[#002869] font-semibold uppercase tracking-wider">
              National e-procurement digital stack
            </span>
          </div>

          <h1 className="text-headline-lg-mobile sm:text-headline-lg lg:text-display-lg font-bold tracking-tight leading-tight max-w-4xl text-foreground heading-font">
            <span className="text-[#521a00]">{t.tagline1}</span>
            <span className="text-muted-foreground"> | </span>
            <span className="text-foreground">{t.tagline2}</span>
            <span className="text-muted-foreground"> | </span>
            <span className="text-[#002869]">{t.tagline3}</span>
          </h1>

          <p className="text-muted-foreground text-body-md max-w-2xl mt-6 leading-relaxed">{t.heroDesc}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl mt-10">
            <button onClick={() => router.push("/login?role=officer")}
              className="group p-6 text-left border border-border bg-white rounded-lg hover:border-[#002869]/50 hover:shadow-hover transition-all">
              <div className="w-10 h-10 bg-[#521a00]/10 border border-[#521a00]/30 text-[#521a00] flex items-center justify-center rounded-lg mb-4">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-body-md text-foreground">{t.govCTA}</h3>
              <p className="text-body-sm text-muted-foreground mt-2 leading-relaxed">{t.govDesc}</p>
            </button>
            <button onClick={() => router.push("/login?role=vendor")}
              className="group p-6 text-left border border-border bg-white rounded-lg hover:border-[#002869]/50 hover:shadow-hover transition-all">
              <div className="w-10 h-10 bg-[#002869]/10 border border-[#002869]/30 text-[#002869] flex items-center justify-center rounded-lg mb-4">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-body-md text-foreground">{t.vendorCTA}</h3>
              <p className="text-body-sm text-muted-foreground mt-2 leading-relaxed">{t.vendorDesc}</p>
            </button>
            <button onClick={() => router.push("/public")}
              className="group p-6 text-left border border-border bg-white rounded-lg hover:border-[#002869]/50 hover:shadow-hover transition-all">
              <div className="w-10 h-10 bg-[#002869]/10 border border-[#002869]/30 text-[#002869] flex items-center justify-center rounded-lg mb-4">
                <User className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-body-md text-foreground">{t.publicCTA}</h3>
              <p className="text-body-sm text-muted-foreground mt-2 leading-relaxed">Browse live tenders and procurement records publicly.</p>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-border py-6 px-6">
        <div className="max-w-container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#002869]/10 border border-[#002869]/30 text-[#002869] rounded-lg"><TrendingUp className="w-5 h-5" /></div>
            <div><div className="text-label-sm text-muted-foreground uppercase tracking-wider font-semibold">Active tenders</div>
            <div className="text-body-md text-foreground font-bold mt-0.5">{activeTenders.length}</div></div>
          </div>
          <div className="flex items-center gap-3 border-l border-border pl-4">
            <div className="p-2.5 bg-[#002869]/10 border border-[#002869]/30 text-[#002869] rounded-lg"><Cpu className="w-5 h-5" /></div>
            <div><div className="text-label-sm text-muted-foreground uppercase tracking-wider font-semibold">Verified nodes</div>
            <div className="text-body-md text-foreground font-bold mt-0.5">1,842</div></div>
          </div>
          <div className="flex items-center gap-3 border-l border-border pl-4">
            <div className="p-2.5 bg-[#002869]/10 border border-[#002869]/30 text-[#002869] rounded-lg"><ShieldCheck className="w-5 h-5" /></div>
            <div><div className="text-label-sm text-muted-foreground uppercase tracking-wider font-semibold">Dispute rate</div>
            <div className="text-body-md text-foreground font-bold mt-0.5">0.00%</div></div>
          </div>
          <div className="flex items-center gap-3 border-l border-border pl-4">
            <div className="p-2.5 bg-[#521a00]/10 border border-[#521a00]/30 text-[#521a00] rounded-lg"><ShieldCheck className="w-5 h-5" /></div>
            <div><div className="text-label-sm text-muted-foreground uppercase tracking-wider font-semibold">Seals verified</div>
            <div className="text-body-md text-foreground font-bold mt-0.5">18,245</div></div>
          </div>
        </div>
      </section>

      {/* Live Tenders */}
      <section className="max-w-container mx-auto px-6 pt-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h2 className="text-headline-md text-foreground heading-font font-bold">{t.liveTenders}</h2>
            <p className="text-body-sm text-muted-foreground mt-1">{t.liveTendersDesc}</p>
          </div>
          <button onClick={() => router.push("/dashboard")}
            className="text-body-sm text-[#002869] hover:underline flex items-center gap-1.5 mt-2 md:mt-0 font-semibold">
            Explore public dashboard <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeTenders.slice(0, 4).map((tender: any) => (
            <div key={tender.id} className="bg-white border border-border rounded-lg flex flex-col justify-between hover:shadow-hover transition-shadow">
              <div className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="bg-surface-container-low border border-border text-[#002869] text-label-sm px-2 py-0.5 rounded font-semibold">{tender.id}</span>
                  <div className="flex items-center gap-2">
                    {tender.msmeQuota && (
                      <span className="bg-[#521a00]/10 text-[#521a00] text-[11px] font-semibold px-2 py-0.5 border border-[#521a00]/30 rounded-full">{t.msmeBadge}</span>
                    )}
                    <span className="status-open">{tender.status === "Open" ? "Open" : tender.status}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-body-md text-foreground line-clamp-2">{tender.title}</h3>
                <p className="text-label-sm text-[#002869] tracking-wider mt-1.5 font-semibold uppercase">{tender.ministry}</p>
                <p className="text-body-sm text-muted-foreground mt-3 line-clamp-3">{tender.description}</p>
              </div>
              <div className="px-5 py-4 border-t border-border bg-surface-container-low grid grid-cols-2 gap-4">
                <div><span className="block text-label-sm text-muted-foreground uppercase tracking-wider font-semibold">{t.budget}</span>
                  <span className="block font-bold text-body-sm text-foreground mt-0.5">{formatIndianCurrency(tender.budget)}</span></div>
                <div><span className="block text-label-sm text-muted-foreground uppercase tracking-wider font-semibold">{t.deadline}</span>
                  <span className="block font-bold text-body-sm text-foreground mt-0.5">{new Date(tender.deadline).toLocaleDateString()}</span></div>
              </div>
              <div className="p-4 border-t border-border flex items-center justify-between bg-white rounded-b-lg">
                <div className="flex items-center gap-1.5 text-muted-foreground text-label-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#056e00]" />
                  <span className="text-[#056e00] font-semibold">Verified on-chain</span>
                </div>
                <button onClick={() => router.push(`/tenders/${tender.id}`)}
                  className="flex items-center gap-1.5 text-body-sm px-3 py-1.5 border border-border rounded-lg hover:bg-surface-container-low transition-colors font-semibold min-h-[44px]">
                  <Eye className="w-4 h-4 text-[#002869]" />
                  <span>{t.viewDetails}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* News & Blockchain Monitor */}
      <section className="max-w-container mx-auto px-6 pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h2 className="text-headline-md text-foreground heading-font font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#521a00]" /> {t.newsTitle}
              </h2>
              <p className="text-body-sm text-muted-foreground mt-1">{t.newsDesc}</p>
            </div>
            <div className="space-y-3">
              {news.map((item) => (
                <div key={item.id} className="p-4 border border-border hover:border-[#002869]/30 bg-white rounded-lg transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-label-sm text-muted-foreground">{item.source}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-[#002869]/10 text-[#002869] rounded-full">{item.category}</span>
                  </div>
                  <h4 className="font-semibold text-body-sm text-foreground leading-snug">{item.title}</h4>
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