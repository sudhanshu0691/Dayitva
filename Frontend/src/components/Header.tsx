"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { 
  Search, Bell, HelpCircle, Wallet, Globe, Sun, Moon, 
  ChevronDown, BookOpen, MessageSquare, Phone, Check, 
  ExternalLink, User, Building, Landmark, LogOut, CheckCircle2, ShieldCheck
} from "lucide-react";
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) setShowSearchDropdown(false);
      if (notifRef.current && !notifRef.current.contains(target)) setShowNotifications(false);
      if (helpRef.current && !helpRef.current.contains(target)) setShowHelp(false);
      if (bidsRef.current && !bidsRef.current.contains(target)) setShowBids(false);
      if (authRef.current && !authRef.current.contains(target)) setShowAuth(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const t = {
    en: {
      brand: "Dayitva",
      subBrand: "Government e-Procurement Portal",
      searchPlaceholder: "Search tenders, departments, ministries...",
      needHelp: "Need help",
      faqs: "FAQs",
      support: "Support hub",
      contact: "Contact directory",
      bids: "Bids",
      allBids: "All public bids",
      deptBids: "Departmental bids",
      industryBids: "Industry bids",
      signupLogin: "Sign in",
      forOrg: "For government admin",
      forVendor: "For corporate vendor",
      forPublic: "For public view",
      walletConnect: "Connect wallet",
      walletConnected: "Wallet active",
      disconnect: "Disconnect session",
      notifications: "Notifications",
      markRead: "Mark all read",
      recent: "Recent searches",
      suggestions: "Live recommendations",
      noSuggestions: "No tenders match search query"
    },
    hi: {
      brand: "दायित्व",
      subBrand: "सरकारी ई-प्रोक्योरमेंट पोर्टल",
      searchPlaceholder: "टेंडर, विभाग, मंत्रालय खोजें...",
      needHelp: "सहायता चाहिए",
      faqs: "पूछे जाने वाले प्रश्न",
      support: "सहायता केंद्र",
      contact: "संपर्क निर्देशिका",
      bids: "बोलियां",
      allBids: "सभी सार्वजनिक बोलियां",
      deptBids: "विभागीय बोलियां",
      industryBids: "उद्योग बोलियां",
      signupLogin: "लॉगिन",
      forOrg: "सरकारी व्यवस्थापक के लिए",
      forVendor: "कॉरपोरेट विक्रेता के लिए",
      forPublic: "सार्वजनिक दृश्य",
      walletConnect: "वॉलेट कनेक्ट करें",
      walletConnected: "वॉलेट सक्रिय",
      disconnect: "सत्र डिस्कनेक्ट करें",
      notifications: "अधिसूचनाएं",
      markRead: "सभी पढ़े गए चिह्नित करें",
      recent: "हालिया खोजें",
      suggestions: "लाइव सुझाव",
      noSuggestions: "कोई टेंडर खोज से मेल नहीं खाता"
    }
  }[language];

  return (
    <header className="w-full z-50 sticky top-0 bg-white border-b border-border shadow-sm">
      {/* 1. TOP UTILITY BAR — Navy #002869 */}
      <div className="w-full bg-[#002869] text-white text-label-sm py-1.5 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Multilingual Selector */}
          <div className="flex items-center gap-1.5 border-r border-white/20 pr-4">
            <Globe className="w-3.5 h-3.5 opacity-70" />
            <button 
              onClick={() => setLanguage("en")} 
              className={`hover:underline transition-colors ${language === "en" ? "font-semibold" : "opacity-70"}`}
            >
              English
            </button>
            <span className="opacity-40">|</span>
            <button 
              onClick={() => setLanguage("hi")} 
              className={`hover:underline transition-colors ${language === "hi" ? "font-semibold" : "opacity-70"}`}
            >
              हिन्दी
            </button>
          </div>

          {/* Font Size controls */}
          <div className="hidden sm:flex items-center gap-2 border-r border-white/20 pr-4">
            <span className="opacity-70">Font:</span>
            <button onClick={decreaseFontScale} className="hover:underline px-1 text-xs">A-</button>
            <button onClick={resetFontScale} className="hover:underline px-1 font-semibold text-xs">A</button>
            <button onClick={increaseFontScale} className="hover:underline px-1 text-xs">A+</button>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            <span className="text-[11px] opacity-60">Blockchain network active</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Dark / Light Toggle */}
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
            className="flex items-center gap-1 hover:underline transition-colors p-1 text-label-sm"
          >
            {theme === "dark" ? (
              <><Sun className="w-3.5 h-3.5" /><span className="hidden sm:inline">Light mode</span></>
            ) : (
              <><Moon className="w-3.5 h-3.5" /><span className="hidden sm:inline">Dark mode</span></>
            )}
          </button>

          {walletConnected && currentUser && (currentUser.role === "officer" || currentUser.role === "vendor") && (
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-2.5 py-1 text-[11px] rounded">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              <span>{walletBalance}</span>
              <span className="px-1.5 py-0.5 bg-white/15 border border-white/20 rounded text-[10px]">Chain verified</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN HEADER — White surface */}
      <div className="w-full max-w-container mx-auto px-4 md:px-6 py-3 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left Section: Logo & Branding */}
        <div className="flex items-center justify-between w-full lg:w-auto">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 flex items-center justify-center bg-[#002869] text-white rounded-lg">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-heading-md text-[#002869] leading-none heading-font font-bold">
                {t.brand}
              </h1>
              <span className="text-[11px] text-[#002869] tracking-wider opacity-70">
                {t.subBrand}
              </span>
            </div>
          </Link>
        </div>

        {/* Center Section: Global Search Bar */}
        <div ref={searchRef} className="w-full lg:flex-1 max-w-xl relative">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full bg-surface-container-low border border-border text-foreground pl-9 pr-9 py-2.5 text-body-sm rounded-lg focus:outline-none focus:border-[#002869] focus:ring-2 focus:ring-[#002869]/15 transition-all min-h-[44px]"
            />
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground absolute right-3 top-3 text-label-sm">
                Clear
              </button>
            )}
          </form>

          {/* Search dropdown */}
          {showSearchDropdown && (
            <div className="absolute w-full mt-1.5 bg-white border border-border rounded-lg shadow-dropdown z-50 overflow-hidden">
              {searchQuery && (
                <div className="p-3 border-b border-border">
                  <p className="text-label-sm text-muted-foreground mb-2 uppercase tracking-wider font-semibold">{t.suggestions}</p>
                  {suggestions.length > 0 ? (
                    <div className="space-y-1">
                      {suggestions.map(tender => (
                        <button key={tender.id} onClick={() => handleSuggestionClick(tender.title, tender.id)}
                          className="w-full text-left flex items-start gap-2 p-2 hover:bg-surface-container-low rounded transition-colors">
                          <span className="bg-[#002869]/10 text-[#002869] text-[10px] font-semibold px-1.5 py-0.5 shrink-0 mt-0.5 rounded">{tender.id}</span>
                          <div>
                            <div className="text-body-sm text-foreground line-clamp-1">{tender.title}</div>
                            <div className="text-label-sm text-muted-foreground line-clamp-1">{tender.ministry}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-body-sm text-muted-foreground py-1">{t.noSuggestions}</div>
                  )}
                </div>
              )}

              <div className="p-3 bg-surface-container-low">
                <p className="text-label-sm text-muted-foreground mb-1.5 uppercase tracking-wider font-semibold">{t.recent}</p>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((search, idx) => (
                    <button key={idx} onClick={() => { setSearchQuery(search); addRecentSearch(search); setShowSearchDropdown(false); router.push(`/dashboard?search=${encodeURIComponent(search)}`); }}
                      className="text-label-sm px-2.5 py-1 bg-white border border-border hover:bg-surface-container-low text-muted-foreground hover:text-foreground rounded transition-colors">
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 w-full lg:w-auto">
          
          {/* Help Dropdown */}
          <div ref={helpRef} className="relative">
            <button onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-1.5 text-body-sm px-3 py-2.5 border border-border rounded-lg hover:bg-surface-container-low text-foreground transition-colors min-h-[44px]">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{t.needHelp}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            {showHelp && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-border rounded-lg shadow-dropdown z-50 py-1 overflow-hidden">
                <Link href="/faq" className="flex items-center gap-2 px-3 py-2.5 text-body-sm text-foreground hover:bg-surface-container-low transition-colors">
                  <BookOpen className="w-3.5 h-3.5 text-[#002869]" />
                  <span>{t.faqs}</span>
                </Link>
                <Link href="/dispute" className="flex items-center gap-2 px-3 py-2.5 text-body-sm text-foreground hover:bg-surface-container-low transition-colors">
                  <MessageSquare className="w-3.5 h-3.5 text-[#521a00]" />
                  <span>Submit dispute</span>
                </Link>
              </div>
            )}
          </div>

          {/* Bids Dropdown */}
          <div ref={bidsRef} className="relative">
            <button onClick={() => setShowBids(!showBids)}
              className="flex items-center gap-1.5 text-body-sm px-3 py-2.5 border border-border rounded-lg hover:bg-surface-container-low text-foreground transition-colors min-h-[44px]">
              <span>{t.bids}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            {showBids && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-border rounded-lg shadow-dropdown z-50 py-1 overflow-hidden">
                <Link href="/dashboard" className="flex items-center justify-between px-3 py-2.5 text-body-sm text-foreground hover:bg-surface-container-low transition-colors">
                  <span>{t.allBids}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>
                <Link href="/dashboard?filter=MORTH" className="flex items-center justify-between px-3 py-2.5 text-body-sm text-foreground hover:bg-surface-container-low transition-colors">
                  <span>{t.deptBids}</span>
                  <span className="bg-[#002869]/10 text-[#002869] text-[10px] font-semibold px-1.5 py-0.5 rounded">MoRTH</span>
                </Link>
                <Link href="/dashboard?msme=true" className="flex items-center justify-between px-3 py-2.5 text-body-sm text-foreground hover:bg-surface-container-low transition-colors">
                  <span>{t.industryBids}</span>
                  <span className="bg-[#521a00]/10 text-[#521a00] text-[10px] font-semibold px-1.5 py-0.5 rounded">MSME</span>
                </Link>
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
            {/* Wallet Connect */}
            {currentUser && (currentUser.role === "officer" || currentUser.role === "vendor") && (
              <button onClick={() => { if (walletConnected) disconnectWalletOnly(); else connectWalletOnly(); }}
                className={`flex items-center gap-2 text-label-sm px-3 py-2.5 border rounded-lg transition-colors min-h-[44px] ${
                  walletConnected
                    ? "bg-[#056e00]/10 border-[#056e00] text-[#056e00] hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                    : "bg-[#002869] text-white border-[#002869] hover:bg-[#0b3d91]"
                }`}>
                <Wallet className="w-3.5 h-3.5" />
                <span>{walletConnected ? `${walletAddress.substring(0,6)}...${walletAddress.substring(34)}` : "Connect wallet"}</span>
                {walletConnected && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Role Badge */}
            {currentUser && (
              <span className={`text-label-sm px-2.5 py-1 rounded-full font-semibold ${
                currentUser.role === "officer" ? "bg-[#002869]/10 text-[#002869]"
                : currentUser.role === "vendor" ? "bg-[#521a00]/10 text-[#521a00]"
                : "bg-surface-container-high text-muted-foreground"
              }`}>
                {currentUser.role === "officer" ? "Govt officer" : currentUser.role === "vendor" ? "Vendor" : "Citizen auditor"}
              </span>
            )}

            {/* Profile Avatar */}
            <div ref={authRef} className="relative shrink-0">
              <button onClick={() => setShowAuth(!showAuth)}
                className="flex items-center justify-center w-10 h-10 border border-border bg-white hover:bg-surface-container-low rounded-lg transition-colors">
                {currentUser ? (
                  <div className="text-body-sm font-semibold text-foreground">{currentUser.name.substring(0, 2)}</div>
                ) : (
                  <User className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              {showAuth && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white border border-border rounded-lg shadow-dropdown z-50 py-1 overflow-hidden">
                  {!currentUser ? (
                    <>
                      <button onClick={() => { setShowAuth(false); router.push("/auth/admin"); }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-body-sm hover:bg-surface-container-low text-foreground transition-colors">
                        <Landmark className="w-4 h-4 text-[#002869] shrink-0" />
                        <div><div className="font-semibold">{t.forOrg}</div></div>
                      </button>
                      <button onClick={() => { setShowAuth(false); router.push("/auth/vendor"); }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-body-sm hover:bg-surface-container-low text-foreground transition-colors">
                        <Building className="w-4 h-4 text-[#521a00] shrink-0" />
                        <div><div className="font-semibold">{t.forVendor}</div></div>
                      </button>
                      <button onClick={() => { setShowAuth(false); router.push("/auditor/login"); }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-body-sm hover:bg-surface-container-low text-foreground transition-colors">
                        <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div><div className="font-semibold">For auditor</div></div>
                      </button>
                      <button onClick={() => { setShowAuth(false); router.push("/public"); }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-body-sm hover:bg-surface-container-low text-foreground transition-colors">
                        <User className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div><div className="font-semibold">{t.forPublic}</div></div>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-2.5 bg-surface-container-low border-b border-border text-label-sm">
                        <span className="block text-[#002869] font-semibold">{currentUser.role}</span>
                        <span className="block truncate mt-0.5 text-muted-foreground">{currentUser.email}</span>
                      </div>
                      <Link href={currentUser.role === "officer" ? "/admin/profile" : currentUser.role === "vendor" ? "/vendor/profile" : "/dashboard"} 
                        className="flex items-center gap-2 px-3 py-2.5 text-body-sm text-foreground hover:bg-surface-container-low font-semibold transition-colors"
                        onClick={() => setShowAuth(false)}>
                        <User className="w-4 h-4 text-[#002869]" />
                        <span>My profile</span>
                      </Link>
                      <button onClick={() => { logoutUser(); setShowAuth(false); router.push("/"); }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-body-sm hover:bg-destructive/10 text-destructive border-t border-border font-semibold transition-colors">
                        <LogOut className="w-4 h-4" />
                        <span>Disconnect</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Register Button */}
            {!currentUser && (
              <button onClick={() => router.push("/register")}
                className="flex items-center gap-1.5 text-label-sm px-3 py-2.5 border-2 border-[#002869] rounded-lg text-[#002869] hover:bg-[#002869] hover:text-white transition-colors font-semibold min-h-[44px]">
                <span>Register</span>
              </button>
            )}

            {/* Notification Bell */}
            <div ref={notifRef} className="relative shrink-0">
              <button onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 border border-border rounded-lg hover:bg-surface-container-low transition-colors text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-1.5 w-72 bg-white border border-border rounded-lg shadow-dropdown z-50 overflow-hidden">
                  <div className="p-3 bg-surface-container-low border-b border-border flex items-center justify-between">
                    <span className="text-label-sm font-semibold text-foreground uppercase tracking-wider">{t.notifications}</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllNotificationsAsRead} className="text-label-sm text-[#002869] hover:underline font-semibold">{t.markRead}</button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-border">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div key={notif.id} onClick={() => { markNotificationAsRead(notif.id); if (notif.actionUrl) router.push(notif.actionUrl); setShowNotifications(false); }}
                          className={`p-3 text-left transition-colors hover:bg-surface-container-low cursor-pointer ${notif.read ? "opacity-60" : "bg-[#002869]/5"}`}>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-body-sm text-foreground line-clamp-1 font-semibold">{notif.title}</span>
                            {!notif.read && <span className="w-1.5 h-1.5 bg-[#002869] shrink-0 mt-1 rounded-full" />}
                          </div>
                          <p className="text-label-sm text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                          <div className="text-[11px] text-muted-foreground mt-1">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-body-sm text-muted-foreground">No notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </header>
  );
};