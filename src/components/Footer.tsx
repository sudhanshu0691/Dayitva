"use client";

import React from "react";
import { useApp } from "../context/AppContext";
import { Landmark, ShieldCheck, Cpu, GitBranch, Heart } from "lucide-react";
import Link from "next/link";

export const Footer: React.FC = () => {
  const { language } = useApp();

  const t = {
    en: {
      aboutDesc: "TenderChain is India's next-generation decentralized procurement infrastructure, ensuring absolute transparency, tamper-proof bid sealing, and real-time public audit on-chain.",
      quickLinks: "Quick Navigation",
      resources: "Resources",
      contact: "Administrative Support",
      rights: "National Informatics Centre (NIC) & TenderChain Ledger Consortium. All rights reserved.",
      disclaimer: "This portal is a high-performance decentralized simulation demonstrating next-gen Web3 architecture for Indian Digital Governance.",
      address: "Shastri Bhawan, New Delhi, India"
    },
    hi: {
      aboutDesc: "टेंडरचैन भारत का अगली पीढ़ी का विकेंद्रीकृत प्रोक्योरमेंट बुनियादी ढांचा है, जो पूर्ण पारदर्शिता, छेड़छाड़-मुक्त बोली सीलिंग और ऑन-चेन वास्तविक समय सार्वजनिक लेखा परीक्षा सुनिश्चित करता है।",
      quickLinks: "त्वरित नेविगेशन",
      resources: "संसाधन",
      contact: "प्रशासनिक सहायता",
      rights: "राष्ट्रीय सूचना विज्ञान केंद्र (NIC) और टेंडरचैन लेजर कंसोर्टियम। सर्वाधिकार सुरक्षित।",
      disclaimer: "यह पोर्टल भारतीय डिजिटल गवर्नेंस के लिए अगली पीढ़ी के वेब3 आर्किटेक्चर का प्रदर्शन करने वाला एक उच्च प्रदर्शन विकेंद्रीकृत सिमुलेशन है।",
      address: "शास्त्री भवन, नई दिल्ली, भारत"
    }
  }[language];

  return (
    <footer className="w-full bg-slate-950 text-slate-300 relative border-t border-slate-800">
      
      {/* Subtle Indian Tricolor Accent Line */}
      <div className="w-full h-1.5 flex">
        <div className="w-1/3 h-full bg-[#FF9933]" title="Saffron (Courage & Sacrifice)" />
        <div className="w-1/3 h-full bg-[#FFFFFF]" title="White (Peace & Truth)" />
        <div className="w-1/3 h-full bg-[#138808]" title="Green (Faith & Chivalry)" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Logo & About Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/40 flex items-center justify-center">
                <Landmark className="w-4.5 h-4.5 text-teal-400" />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight font-mono">TenderChain</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.aboutDesc}
            </p>
            <div className="flex items-center space-x-3 text-slate-500 font-mono text-[10px]">
              <div className="flex items-center space-x-1 border border-teal-500/20 bg-teal-950/20 px-1.5 py-0.5 rounded text-teal-400">
                <ShieldCheck className="w-3 h-3" />
                <span>EVM Secured</span>
              </div>
              <div className="flex items-center space-x-1 border border-indigo-500/20 bg-indigo-950/20 px-1.5 py-0.5 rounded text-indigo-400">
                <Cpu className="w-3 h-3" />
                <span>ZKP Seal</span>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4 border-l-2 border-teal-400 pl-2">
              {t.quickLinks}
            </h3>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/about" className="hover:text-teal-400 transition-colors">About Blockchain Portal</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-teal-400 transition-colors">Browse Live Tenders</Link>
              </li>
              <li>
                <Link href="/dispute" className="hover:text-teal-400 transition-colors">Disputes & Appeals</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-teal-400 transition-colors">Help & FAQ</Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policy Column */}
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4 border-l-2 border-teal-400 pl-2">
              {t.resources}
            </h3>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/privacy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-teal-400 transition-colors">Terms & Conditions</Link>
              </li>
              <li>
                <a href="https://gem.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors flex items-center space-x-1">
                  <span>GeM Portal India</span>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded">Ext</span>
                </a>
              </li>
              <li>
                <a href="https://data.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors flex items-center space-x-1">
                  <span>Open Government Data</span>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded">Ext</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4 border-l-2 border-teal-400 pl-2">
              {t.contact}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              National Blockchain Infrastructure Cell<br />
              {t.address}
            </p>
            <p className="text-xs text-slate-400">
              <span className="font-bold">Email:</span> secure-procure@nic.in<br />
              <span className="font-bold">Helpdesk:</span> +91-11-2338XXXX
            </p>
          </div>

        </div>

        {/* Separator */}
        <hr className="my-8 border-slate-900" />

        {/* Footer Base */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <p>© {new Date().getFullYear()} {t.rights}</p>
            <p className="text-[10px] text-slate-600 mt-1 max-w-xl">{t.disclaimer}</p>
          </div>
          
          {/* Proclaim "Jai Hind" and Indian map chakra theme */}
          <div className="flex items-center space-x-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
            <span className="font-bold tracking-widest text-slate-200">JAI HIND</span>
            <span className="text-teal-400">🇮🇳</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
};
