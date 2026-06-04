"use client";

import React from "react";
import { useApp } from "../context/AppContext";
import { Landmark, ShieldCheck, Mail, Phone, ExternalLink } from "lucide-react";
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
    <footer className="w-full bg-[#002869] text-white border-t border-white/10">
      {/* Tricolor accent line */}
      <div className="w-full h-1 flex">
        <div className="w-1/3 h-full bg-[#521a00]" />
        <div className="w-1/3 h-full bg-[#E5E7EB]" />
        <div className="w-1/3 h-full bg-[#056e00]" />
      </div>

      <div className="max-w-container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Logo & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/10 flex items-center justify-center rounded-lg">
                <Landmark className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-title-lg heading-font">Dayitva</span>
            </div>
            <p className="text-body-sm text-white/70 leading-relaxed">
              {t.aboutDesc}
            </p>
            <div className="flex items-center gap-3 text-label-sm text-white/70">
              <div className="flex items-center gap-1.5 border border-white/20 bg-white/10 px-2 py-1 rounded text-white/80">
                <ShieldCheck className="w-3 h-3" />
                <span>EVM secured</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-label-sm text-white/50 uppercase tracking-wider font-semibold mb-4">{t.quickLinks}</h3>
            <ul className="space-y-2.5 text-body-sm">
              <li><Link href="/about" className="text-white/70 hover:text-white transition-colors flex items-center gap-1.5"><ExternalLink className="w-3 h-3" />About blockchain portal</Link></li>
              <li><Link href="/dashboard" className="text-white/70 hover:text-white transition-colors flex items-center gap-1.5"><ExternalLink className="w-3 h-3" />Browse live tenders</Link></li>
              <li><Link href="/dispute" className="text-white/70 hover:text-white transition-colors flex items-center gap-1.5"><ExternalLink className="w-3 h-3" />Disputes and appeals</Link></li>
              <li><Link href="/faq" className="text-white/70 hover:text-white transition-colors flex items-center gap-1.5"><ExternalLink className="w-3 h-3" />Help and FAQ</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-label-sm text-white/50 uppercase tracking-wider font-semibold mb-4">{t.resources}</h3>
            <ul className="space-y-2.5 text-body-sm">
              <li><Link href="/privacy" className="text-white/70 hover:text-white transition-colors">Privacy policy</Link></li>
              <li><Link href="/terms" className="text-white/70 hover:text-white transition-colors">Terms and conditions</Link></li>
              <li><a href="https://gem.gov.in" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">GeM portal India</a></li>
              <li><a href="https://data.gov.in" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">Open government data</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-label-sm text-white/50 uppercase tracking-wider font-semibold mb-4">{t.contact}</h3>
            <p className="text-body-sm text-white/70 leading-relaxed mb-3">
              National e-Procurement Cell<br />{t.address}
            </p>
            <div className="space-y-2 text-body-sm text-white/70">
              <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-white/50" /> support@dayitva.gov.in</p>
              <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-white/50" /> +91-11-2338XXXX</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 my-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-body-sm text-white/50">
          <p>© {new Date().getFullYear()} {t.rights}</p>
          <p className="text-label-sm max-w-xl text-center md:text-right">{t.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
};