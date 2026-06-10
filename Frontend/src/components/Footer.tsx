"use client";

import React from "react";
import { useApp } from "../context/AppContext";
import { Landmark, ShieldCheck, Mail, Phone, ExternalLink, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const Footer: React.FC = () => {
  const { language } = useApp();

  const t = {
    en: {
      aboutDesc: "Dayitva is India's government e-procurement infrastructure, ensuring transparency and security in public procurement through blockchain technology.",
      quickLinks: "Quick navigation",
      resources: "Resources",
      contact: "Administrative support",
      rights: "Ministry of Electronics & Information Technology. All rights reserved.",
      disclaimer: "This portal is a demonstration of digital governance infrastructure for Indian e-procurement.",
      address: "Electronics Niketan, New Delhi, India"
    },
    hi: {
      aboutDesc: "दायित्व भारत का सरकारी ई-प्रोक्योरमेंट बुनियादी ढांचा है, जो ब्लॉकचेन प्रौद्योगिकी के माध्यम से सार्वजनिक खरीद में पारदर्शिता और सुरक्षा सुनिश्चित करता है।",
      quickLinks: "त्वरित नेविगेशन",
      resources: "संसाधन",
      contact: "प्रशासनिक सहायता",
      rights: "इलेक्ट्रॉनिक्स और सूचना प्रौद्योगिकी मंत्रालय। सर्वाधिकार सुरक्षित।",
      disclaimer: "यह पोर्टल भारतीय ई-प्रोक्योरमेंट के लिए डिजिटल गवर्नेंस बुनियादी ढांचे का प्रदर्शन है।",
      address: "इलेक्ट्रॉनिक्स निकेतन, नई दिल्ली, भारत"
    }
  }[language];

  return (
    <footer className="w-full bg-primary text-primary-foreground">
      {/* Gradient accent line */}
      <div className="w-full h-1 bg-gradient-to-r from-accent via-accent/50 to-accent/20" />

      <div className="max-w-container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Logo & About - wider */}
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 flex items-center justify-center rounded-xl">
                <Landmark className="w-5 h-5 text-accent" />
              </div>
              <div>
                <span className="font-bold text-white text-headline-sm heading-font">Dayitva</span>
                <span className="block text-caption text-white/50">Blockchain e-Procurement</span>
              </div>
            </div>
            <p className="text-body-sm text-white/60 leading-relaxed">
              {t.aboutDesc}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 border border-white/10 bg-white/5 px-2.5 py-1.5 rounded-lg text-caption text-white/70">
                <ShieldCheck className="w-3.5 h-3.5 text-success" />
                <span>EVM secured</span>
              </div>
              <div className="flex items-center gap-1.5 border border-white/10 bg-white/5 px-2.5 py-1.5 rounded-lg text-caption text-white/70">
                <span className="w-1.5 h-1.5 bg-success rounded-full" />
                <span>Network live</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-caption text-white/40 uppercase tracking-wider font-semibold mb-5">{t.quickLinks}</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-body-sm text-white/60 hover:text-white transition-colors flex items-center gap-1.5 group"><ArrowUpRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />About blockchain portal</Link></li>
              <li><Link href="/dashboard" className="text-body-sm text-white/60 hover:text-white transition-colors flex items-center gap-1.5 group"><ArrowUpRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />Browse live tenders</Link></li>
              <li><Link href="/dispute" className="text-body-sm text-white/60 hover:text-white transition-colors flex items-center gap-1.5 group"><ArrowUpRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />Disputes and appeals</Link></li>
              <li><Link href="/faq" className="text-body-sm text-white/60 hover:text-white transition-colors flex items-center gap-1.5 group"><ArrowUpRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />Help and FAQ</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="lg:col-span-2">
            <h3 className="text-caption text-white/40 uppercase tracking-wider font-semibold mb-5">{t.resources}</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-body-sm text-white/60 hover:text-white transition-colors">Privacy policy</Link></li>
              <li><Link href="/terms" className="text-body-sm text-white/60 hover:text-white transition-colors">Terms and conditions</Link></li>
              <li><a href="https://gem.gov.in" target="_blank" rel="noopener noreferrer" className="text-body-sm text-white/60 hover:text-white transition-colors flex items-center gap-1">GeM portal India <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://data.gov.in" target="_blank" rel="noopener noreferrer" className="text-body-sm text-white/60 hover:text-white transition-colors flex items-center gap-1">Open government data <ExternalLink className="w-3 h-3" /></a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h3 className="text-caption text-white/40 uppercase tracking-wider font-semibold mb-5">{t.contact}</h3>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
              <p className="text-body-sm text-white/60 leading-relaxed">
                National e-Procurement Cell<br />{t.address}
              </p>
              <div className="space-y-2.5 text-body-sm text-white/60">
                <p className="flex items-center gap-2.5"><Mail className="w-4 h-4 text-accent" /> support@dayitva.gov.in</p>
                <p className="flex items-center gap-2.5"><Phone className="w-4 h-4 text-accent" /> +91-11-2338XXXX</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 my-10" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-body-sm text-white/40">
          <p>© {new Date().getFullYear()} {t.rights}</p>
          <p className="text-caption max-w-xl text-center md:text-right">{t.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
};
