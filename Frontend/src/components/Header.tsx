"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { 
  Search, Bell, HelpCircle, Wallet, Globe, Sun, Moon, 
  ChevronDown, BookOpen, MessageSquare, Phone, Check, 
  ExternalLink, User, Building, Landmark, LogOut, CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const Header: React.FC = () => {
  const router = useRouter();
  const {
    walletConnected,
    walletAddress,
    walletBalance,
    userRole,
    currentUser,
    connectWallet,
    disconnectWallet,
    loginUser,
    logoutUser,
    connectWalletOnly,
    disconnectWalletOnly,
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    language,
    setLanguage,
    theme,
    setTheme,
    fontSize,
    setFontSize,
    fontScalePercent,
    increaseFontScale,
    decreaseFontScale,
    resetFontScale,
    recentSearches,
    addRecentSearch,
    tenders
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showBids, setShowBids] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const bidsRef = useRef<HTMLDivElement>(null);
  const authRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (helpRef.current && !helpRef.current.contains(target)) {
        setShowHelp(false);
      }
      if (bidsRef.current && !bidsRef.current.contains(target)) {
        setShowBids(false);
      }
      if (authRef.current && !authRef.current.contains(target)) {
        setShowAuth(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter tenders for live search suggestions
  const suggestions = searchQuery
    ? tenders.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.ministry.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
      setShowSearchDropdown(false);
      router.push(`/dashboard?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (title: string, id: string) => {
    setSearchQuery(title);
    addRecentSearch(title);
    setShowSearchDropdown(false);
    router.push(`/tenders/${id}`);
  };

  // Translations
  const t = {
    en: {
      brand: "Decentralized TenderChain",
      subBrand: "Blockchain e-Procurement Portal",
      skip: "Skip to main content",
      searchPlaceholder: "Search tenders, departments, ministries, vendors, keywords...",
      needHelp: "Need Help",
      faqs: "FAQs",
      support: "Support Hub",
      contact: "Contact Directory",
      bids: "Bids",
      allBids: "All Public Bids",
      deptBids: "Departmental Bids",
      industryBids: "Industry Bids",
      signupLogin: "Sign In / Register",
      forOrg: "For Government Admin",
      forVendor: "For Corporate Vendor",
      forPublic: "For Citizen / Auditor",
      walletConnect: "Connect Wallet",
      walletConnected: "Wallet Active",
      disconnect: "Disconnect Session",
      notifications: "Notification Hub",
      markRead: "Mark all read",
      recent: "Recent Searches",
      suggestions: "Live Recommendations",
      noSuggestions: "No tenders match search query"
    },
    hi: {
      brand: "विकेंद्रीकृत टेंडरचैन",
      subBrand: "ब्लॉकचेन ई-प्रोक्योरमेंट पोर्टल",
      skip: "मुख्य विषय पर जाएं",
      searchPlaceholder: "टेंडर, विभाग, मंत्रालय, विक्रेता, कीवर्ड खोजें...",
      needHelp: "सहायता चाहिए",
      faqs: "पूछे जाने वाले प्रश्न",
      support: "सहायता केंद्र",
      contact: "संपर्क निर्देशिका",
      bids: "बोलियां",
      allBids: "सभी सार्वजनिक बोलियां",
      deptBids: "विभागीय बोलियां",
      industryBids: "उद्योग बोलियां",
      signupLogin: "लॉगिन / पंजीकरण",
      forOrg: "सरकारी व्यवस्थापक के लिए",
      forVendor: "कॉरपोरेट विक्रेता के लिए",
      forPublic: "नागरिक / लेखा परीक्षक",
      walletConnect: "वॉलेट कनेक्ट करें",
      walletConnected: "वॉलेट सक्रिय",
      disconnect: "सत्र डिस्कनेक्ट करें",
      notifications: "अधिसूचना हब",
      markRead: "सभी पढ़े गए चिह्नित करें",
      recent: "हालिया खोजें",
      suggestions: "लाइव सुझाव",
      noSuggestions: "कोई टेंडर खोज से मेल नहीं खाता"
    }
  }[language];

  return (
    <header className="w-full z-50 sticky top-0 bg-background border-b border-border/80 shadow-md">
      {/* 1. TOP UTILITY BAR */}
      <div className="w-full bg-slate-900 text-slate-100 text-xs py-1.5 px-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-primary focus:text-white focus:p-2 focus:rounded-md transition-all outline-none"
          >
            {t.skip}
          </a>
          
          {/* Multilingual Selector */}
          <div className="flex items-center space-x-1 border-r border-slate-700 pr-4">
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <button 
              onClick={() => setLanguage("en")} 
              className={`hover:text-teal-400 font-semibold transition-colors ${language === "en" ? "text-teal-400" : ""}`}
              aria-label="Change language to English"
            >
              English
            </button>
            <span className="text-slate-500">|</span>
            <button 
              onClick={() => setLanguage("hi")} 
              className={`hover:text-teal-400 font-semibold transition-colors ${language === "hi" ? "text-teal-400" : ""}`}
              aria-label="भाषा हिंदी में बदलें"
            >
              हिन्दी
            </button>
          </div>

          {/* Font Size controls */}
          <div className="flex items-center space-x-2 border-r border-slate-700 pr-4">
            <span className="text-slate-400">Font:</span>
            <button 
              onClick={() => decreaseFontScale()} 
              className={`hover:text-teal-400 font-mono font-bold px-1 rounded ${fontScalePercent < 100 ? "bg-slate-700 text-teal-400" : ""}`}
              title="Decrease Font Size by 2%"
            >
              A-
            </button>
            <button 
              onClick={() => resetFontScale()} 
              className={`hover:text-teal-400 font-mono font-bold px-1 rounded ${fontScalePercent === 100 ? "bg-slate-700 text-teal-400" : ""}`}
              title="Reset Font Size to Normal"
            >
              A
            </button>
            <button 
              onClick={() => increaseFontScale()} 
              className={`hover:text-teal-400 font-mono font-bold px-1 rounded ${fontScalePercent > 100 ? "bg-slate-700 text-teal-400" : ""}`}
              title="Increase Font Size by 2%"
            >
              A+
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <span className="inline-block w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[10px] text-slate-400 tracking-wider uppercase font-mono">TenderChain Network Active: 100% Tamper-Proof</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Dark / Light Toggle */}
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
            className="flex items-center space-x-1 hover:text-teal-400 transition-colors p-1 rounded hover:bg-slate-800"
            aria-label="Toggle theme mode"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>

          {walletConnected && currentUser && (currentUser.role === "officer" || currentUser.role === "vendor") && (
            <div className="flex items-center space-x-2 bg-teal-950/60 border border-teal-500/30 px-2 py-0.5 rounded text-teal-400 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>{walletBalance}</span>
              <span className="px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Chain Verified</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <div className="w-full max-w-7xl mx-auto px-4 py-3 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left Section: Logo & Branding */}
        <div className="flex items-center justify-between w-full lg:w-auto">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-tr from-teal-600 to-indigo-800 shadow-lg text-white font-bold text-xl group-hover:scale-105 transition-transform duration-200">
              {/* Ashoka Chakra node SVG visual */}
              <svg viewBox="0 0 100 100" className="w-8 h-8 text-slate-100 absolute animate-spin-slow opacity-20">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="2" />
                <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="2" />
              </svg>
              <Landmark className="w-5.5 h-5.5 text-teal-100 relative z-10" />
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">
                {t.brand}
              </h1>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 tracking-wider uppercase font-bold font-mono">
                {t.subBrand}
              </span>
            </div>
          </Link>

          {/* Mobile Actions Hamburger/Utility toggle can go here */}
        </div>

        {/* Center Section: Global Search Bar */}
        <div ref={searchRef} className="w-full lg:flex-1 max-w-xl relative">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-100 pl-10 pr-10 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/80 transition-all font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery("")} 
                className="text-slate-400 hover:text-slate-100 absolute right-3 top-2.5 text-xs font-bold font-mono px-1 rounded hover:bg-slate-800"
              >
                Clear
              </button>
            )}
          </form>

          {/* Live Search suggestions & recent searches dropdown */}
          <AnimatePresence>
            {showSearchDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute w-full mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
              >
                {/* Suggestions List */}
                {searchQuery && (
                  <div className="p-3 border-b border-border">
                    <h3 className="text-[10px] font-bold text-teal-500 uppercase tracking-widest mb-2 font-mono">
                      {t.suggestions}
                    </h3>
                    {suggestions.length > 0 ? (
                      <div className="space-y-1.5">
                        {suggestions.map(tender => (
                          <button
                            key={tender.id}
                            onClick={() => handleSuggestionClick(tender.title, tender.id)}
                            className="w-full text-left flex items-start space-x-2.5 p-2 rounded-lg hover:bg-muted transition-all"
                          >
                            <span className="bg-primary/20 text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 mt-0.5">
                              {tender.id}
                            </span>
                            <div>
                              <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
                                {tender.title}
                              </div>
                              <div className="text-[10px] text-muted-foreground line-clamp-1">
                                {tender.ministry}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground py-1 px-2 font-mono">
                        {t.noSuggestions}
                      </div>
                    )}
                  </div>
                )}

                {/* Recent Searches */}
                <div className="p-3 bg-muted/40">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                    {t.recent}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchQuery(search);
                          addRecentSearch(search);
                          setShowSearchDropdown(false);
                          router.push(`/dashboard?search=${encodeURIComponent(search)}`);
                        }}
                        className="text-[11px] font-medium px-2 py-1 bg-muted dark:bg-slate-800 hover:bg-slate-700 hover:text-white rounded-md text-slate-600 dark:text-slate-300 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Section: Multi-tiered Utility Dropdowns & Connect Wallet */}
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
          
          {/* 1. Need Help Dropdown */}
          <div ref={helpRef} className="relative">
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border dark:border-slate-800 hover:bg-muted text-slate-700 dark:text-slate-300 transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
              <span>{t.needHelp}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            <AnimatePresence>
              {showHelp && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 py-1.5"
                >
                  <Link href="/faq" className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-muted">
                    <BookOpen className="w-3.5 h-3.5 text-teal-500" />
                    <span>{t.faqs}</span>
                  </Link>
                  <Link href="/dispute" className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-muted">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                    <span>Submit Dispute</span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Bids Dropdown */}
          <div ref={bidsRef} className="relative">
            <button 
              onClick={() => setShowBids(!showBids)}
              className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border dark:border-slate-800 hover:bg-muted text-slate-700 dark:text-slate-300 transition-all"
            >
              <span>{t.bids}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            <AnimatePresence>
              {showBids && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 py-1.5"
                >
                  <Link href="/dashboard" className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-muted">
                    <span>{t.allBids}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </Link>
                  <Link href="/dashboard?filter=MORTH" className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-muted">
                    <span>{t.deptBids}</span>
                    <span className="bg-primary/20 text-teal-400 text-[9px] px-1 rounded">MoRTH</span>
                  </Link>
                  <Link href="/dashboard?msme=true" className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-muted">
                    <span>{t.industryBids}</span>
                    <span className="bg-orange-950 text-orange-400 text-[9px] px-1 rounded">MSME</span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT CONTAINER: 4. Wallet Connect -> 3. Role Badge -> 2. Profile Avatar -> 1. Bell Notification Icon */}
          <div className="flex items-center space-x-3 ml-2 pl-2 border-l border-border/60">
            {/* 4. Wallet Connect Button (only after login for Admin/Vendor) */}
            {currentUser && (currentUser.role === "officer" || currentUser.role === "vendor") && (
              <button
                onClick={() => {
                  if (walletConnected) {
                    disconnectWalletOnly();
                  } else {
                    connectWalletOnly();
                  }
                }}
                className={`flex items-center space-x-2 text-xs font-bold font-mono px-3.5 py-1.5 rounded-lg border shadow-md transition-all shrink-0 ${
                  walletConnected
                    ? "bg-teal-950/40 border-teal-500/80 text-teal-300 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-500"
                    : "bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white border-transparent"
                }`}
              >
                <Wallet className="w-3.5 h-3.5 shrink-0" />
                <span className="tracking-tight shrink-0">
                  {walletConnected ? (
                    <span>
                      {walletAddress.substring(0, 6)}...{walletAddress.substring(34)}
                    </span>
                  ) : (
                    <span>Connect Wallet</span>
                  )}
                </span>
                {walletConnected && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
              </button>
            )}

            {/* 3. Role Badge (only if logged in) */}
            {currentUser && (
              <span className={`text-[10px] font-black uppercase tracking-wider font-mono px-2 py-1 rounded-md shrink-0 border ${
                currentUser.role === "officer"
                  ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/30"
                  : currentUser.role === "vendor"
                  ? "bg-indigo-950/30 text-indigo-400 border-indigo-500/30"
                  : "bg-amber-950/30 text-amber-400 border-amber-500/30"
              }`}>
                {currentUser.role === "officer" ? "Govt Officer" : currentUser.role === "vendor" ? "Vendor" : "Citizen Auditor"}
              </span>
            )}

            {/* 2. Profile Avatar / Login Dropdown */}
            <div ref={authRef} className="relative shrink-0">
              <button 
                onClick={() => setShowAuth(!showAuth)}
                className="flex items-center justify-center w-8 h-8 rounded-full border border-border dark:border-slate-800 bg-secondary dark:bg-slate-900 hover:bg-muted transition-all"
                aria-label="Toggle user authentication options"
              >
                {currentUser ? (
                  <div className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase">
                    {currentUser.name.substring(0, 2)}
                  </div>
                ) : (
                  <User className="w-4 h-4 text-slate-500" />
                )}
              </button>
              <AnimatePresence>
                {showAuth && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 py-1.5 overflow-hidden"
                  >
                    {!currentUser ? (
                      <>
                        <button 
                          onClick={() => { setShowAuth(false); router.push("/auth/admin"); }}
                          className="w-full text-left flex items-center space-x-2.5 px-3 py-2.5 text-xs hover:bg-muted text-slate-800 dark:text-slate-200"
                        >
                          <Landmark className="w-4 h-4 text-emerald-500 shrink-0" />
                          <div>
                            <div className="font-bold">For Organization</div>
                            <div className="text-[10px] text-muted-foreground">Officer Portal Credentials</div>
                          </div>
                        </button>
                        <button 
                          onClick={() => { setShowAuth(false); router.push("/auth/vendor"); }}
                          className="w-full text-left flex items-center space-x-2.5 px-3 py-2.5 text-xs hover:bg-muted text-slate-800 dark:text-slate-200"
                        >
                          <Building className="w-4 h-4 text-indigo-500 shrink-0" />
                          <div>
                            <div className="font-bold">For Vendor</div>
                            <div className="text-[10px] text-muted-foreground">Udyam KYC Bidding Zone</div>
                          </div>
                        </button>
                        <button 
                          onClick={() => { setShowAuth(false); router.push("/public"); }}
                          className="w-full text-left flex items-center space-x-2.5 px-3 py-2.5 text-xs hover:bg-muted text-slate-800 dark:text-slate-200"
                        >
                          <User className="w-4 h-4 text-slate-400 shrink-0" />
                          <div>
                            <div className="font-bold">For Public</div>
                            <div className="text-[10px] text-muted-foreground">Read-only Public Transparency</div>
                          </div>
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-3 py-2 bg-slate-900 border-b border-border text-slate-200 text-[10px] font-mono">
                          <span className="block font-bold text-teal-400 uppercase tracking-widest">{currentUser.role} profile</span>
                          <span className="block truncate mt-0.5">{currentUser.email}</span>
                        </div>
                        <Link 
                          href={currentUser.role === "officer" ? "/admin/profile" : currentUser.role === "vendor" ? "/vendor/profile" : "/dashboard"} 
                          className="flex items-center space-x-2 px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 hover:bg-muted font-bold"
                          onClick={() => setShowAuth(false)}
                        >
                          <User className="w-4 h-4 text-primary" />
                          <span>My Profile Dashboard</span>
                        </Link>
                        <button 
                          onClick={() => { logoutUser(); setShowAuth(false); router.push("/"); }}
                          className="w-full text-left flex items-center space-x-2 px-3 py-2.5 text-xs hover:bg-rose-950/20 text-rose-500 font-bold border-t border-border"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          <span>Disconnect</span>
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 1. Bell Notification Icon (completely to extreme top-right corner) */}
            <div ref={notifRef} className="relative shrink-0">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-muted border border-border dark:border-slate-800 transition-all text-slate-700 dark:text-slate-300"
                aria-label="Toggle notifications dropdown"
              >
                <Bell className="w-4.5 h-4.5 text-slate-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white rounded-full text-sm flex items-center justify-center font-bold animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-teal-400" />
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllNotificationsAsRead}
                          className="text-[10px] text-teal-400 hover:underline font-semibold font-mono"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-border">
                      {notifications.length > 0 ? (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={() => {
                              markNotificationAsRead(notif.id);
                              if (notif.actionUrl) router.push(notif.actionUrl);
                              setShowNotifications(false);
                            }}
                            className={`p-3 text-left transition-colors hover:bg-muted/60 cursor-pointer ${notif.read ? "opacity-60" : "bg-teal-500/5"}`}
                          >
                            <div className="flex items-start justify-between space-x-2">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                                {notif.title}
                              </span>
                              {!notif.read && (
                                <span className="w-2 h-2 bg-teal-400 rounded-full shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                              {notif.message}
                            </p>
                            <div className="text-[9px] text-slate-500 mt-1.5 font-mono">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-xs text-muted-foreground font-mono">
                          No notifications received
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
        </div>
      </div>
    </header>
  );
};
