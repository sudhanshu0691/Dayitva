"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { 
  Search, Bell, HelpCircle, Wallet, Globe, Sun, Moon, 
  ChevronDown, BookOpen, MessageSquare, 
  ExternalLink, User, Building, Landmark, LogOut, CheckCircle2, ShieldCheck, Menu, X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const Header: React.FC = () => {
  const router = useRouter();
  const {
    walletConnected,
    walletAddress,
    walletBalance,
    currentUser,
    connectWalletOnly,
    disconnectWalletOnly,
    logoutUser,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      forOrg: "For government officer",
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
      forOrg: "सरकारी अधिकारी के लिए",
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
    <header className="w-full z-50 sticky top-0 bg-white/80 backdrop-blur-md border-b border-border/60">
      {/* Top Utility Bar */}
      <div className="w-full bg-primary text-primary-foreground text-caption py-1.5 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 border-r border-white/15 pr-3">
            <Globe className="w-3 h-3 opacity-60" />
            <button 
              onClick={() => setLanguage("en")} 
              className={`hover:text-white/90 transition-colors ${language === "en" ? "font-semibold" : "opacity-60 hover:opacity-80"}`}
            >
              English
            </button>
            <span className="opacity-30">|</span>
            <button 
              onClick={() => setLanguage("hi")} 
              className={`hover:text-white/90 transition-colors ${language === "hi" ? "font-semibold" : "opacity-60 hover:opacity-80"}`}
            >
              हिन्दी
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 border-r border-white/15 pr-3">
            <span className="opacity-60">Font:</span>
            <button onClick={decreaseFontScale} className="hover:text-white/90 px-1 opacity-60 hover:opacity-100 text-xs">A-</button>
            <button onClick={resetFontScale} className="hover:text-white/90 px-1 font-semibold text-xs">A</button>
            <button onClick={increaseFontScale} className="hover:text-white/90 px-1 opacity-60 hover:opacity-100 text-xs">A+</button>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 bg-success rounded-full animate-pulse-soft" />
            <span className="text-caption opacity-60">Blockchain network active</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
            className="flex items-center gap-1 hover:text-white/90 transition-colors opacity-60 hover:opacity-100"
          >
            {theme === "dark" ? (
              <><Sun className="w-3 h-3" /><span className="hidden sm:inline text-caption">Light</span></>
            ) : (
              <><Moon className="w-3 h-3" /><span className="hidden sm:inline text-caption">Dark</span></>
            )}
          </button>

          {walletConnected && currentUser && (currentUser.role === "officer" || currentUser.role === "vendor") && (
            <div className="flex items-center gap-2 bg-white/10 border border-white/10 px-2.5 py-1 text-caption rounded-lg">
              <span className="w-1.5 h-1.5 bg-success rounded-full" />
              <span className="font-mono text-xs">{walletBalance}</span>
              <span className="px-1.5 py-0.5 bg-white/10 border border-white/10 rounded text-[10px]">Chain</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Header */}
      <div className="w-full max-w-container mx-auto px-4 md:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 flex items-center justify-center bg-accent text-white rounded-lg shadow-soft transition-transform group-hover:scale-105">
            <Landmark className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-title-md text-primary leading-none heading-font">
              {t.brand}
            </h1>
            <span className="text-caption text-muted-foreground tracking-wide">
              {t.subBrand}
            </span>
          </div>
        </Link>

        {/* Search */}
        <div ref={searchRef} className="flex-1 max-w-lg relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full bg-surface-container-low border border-border text-foreground pl-9 pr-3 py-2 text-body-sm rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all min-h-[40px]"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-caption">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {showSearchDropdown && (
            <div className="absolute w-full mt-1.5 bg-card border border-border rounded-xl shadow-dropdown z-50 overflow-hidden animate-slide-down">
              {searchQuery && (
                <div className="p-3 border-b border-border">
                  <p className="text-caption text-muted-foreground mb-2 uppercase tracking-wider font-semibold">{t.suggestions}</p>
                  {suggestions.length > 0 ? (
                    <div className="space-y-1">
                      {suggestions.map(tender => (
                        <button key={tender.id} onClick={() => handleSuggestionClick(tender.title, tender.id)}
                          className="w-full text-left flex items-start gap-2 p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                          <span className="bg-surface-container-high text-muted-foreground text-[10px] font-semibold px-1.5 py-0.5 shrink-0 mt-0.5 rounded">{tender.id}</span>
                          <div>
                            <div className="text-body-sm text-foreground line-clamp-1">{tender.title}</div>
                            <div className="text-caption text-muted-foreground line-clamp-1">{tender.ministry}</div>
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
                <p className="text-caption text-muted-foreground mb-1.5 uppercase tracking-wider font-semibold">{t.recent}</p>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((search, idx) => (
                    <button key={idx} onClick={() => { setSearchQuery(search); addRecentSearch(search); setShowSearchDropdown(false); router.push(`/dashboard?search=${encodeURIComponent(search)}`); }}
                      className="text-caption px-2.5 py-1 bg-card border border-border hover:bg-surface-container-low text-muted-foreground hover:text-foreground rounded-lg transition-colors">
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-1.5">
          <div ref={helpRef} className="relative">
            <button onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-1.5 text-body-sm px-3 py-2 border border-border rounded-xl hover:bg-surface-container-low text-muted-foreground hover:text-foreground transition-all min-h-[40px]">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden xl:inline">{t.needHelp}</span>
            </button>
            {showHelp && (
              <div className="absolute right-0 mt-1.5 w-44 bg-card border border-border rounded-xl shadow-dropdown z-50 py-1 overflow-hidden animate-slide-down">
                <Link href="/faq" className="flex items-center gap-2 px-3 py-2.5 text-body-sm text-foreground hover:bg-surface-container-low transition-colors">
                  <BookOpen className="w-3.5 h-3.5 text-accent" />
                  <span>{t.faqs}</span>
                </Link>
                <Link href="/dispute" className="flex items-center gap-2 px-3 py-2.5 text-body-sm text-foreground hover:bg-surface-container-low transition-colors">
                  <MessageSquare className="w-3.5 h-3.5 text-warning" />
                  <span>Submit dispute</span>
                </Link>
              </div>
            )}
          </div>

          <div ref={bidsRef} className="relative">
            <button onClick={() => setShowBids(!showBids)}
              className="flex items-center gap-1.5 text-body-sm px-3 py-2 border border-border rounded-xl hover:bg-surface-container-low text-muted-foreground hover:text-foreground transition-all min-h-[40px]">
              <span>{t.bids}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
            {showBids && (
              <div className="absolute right-0 mt-1.5 w-48 bg-card border border-border rounded-xl shadow-dropdown z-50 py-1 overflow-hidden animate-slide-down">
                <Link href="/dashboard" className="flex items-center justify-between px-3 py-2.5 text-body-sm text-foreground hover:bg-surface-container-low transition-colors">
                  <span>{t.allBids}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>
                <Link href="/dashboard?filter=MORTH" className="flex items-center justify-between px-3 py-2.5 text-body-sm text-foreground hover:bg-surface-container-low transition-colors">
                  <span>{t.deptBids}</span>
                  <span className="bg-accent/10 text-accent text-[10px] font-semibold px-1.5 py-0.5 rounded">MoRTH</span>
                </Link>
                <Link href="/dashboard?msme=true" className="flex items-center justify-between px-3 py-2.5 text-body-sm text-foreground hover:bg-surface-container-low transition-colors">
                  <span>{t.industryBids}</span>
                  <span className="bg-warning/10 text-warning text-[10px] font-semibold px-1.5 py-0.5 rounded">MSME</span>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 ml-1.5 pl-1.5 border-l border-border">
            {currentUser && (currentUser.role === "officer" || currentUser.role === "vendor") && (
              <button onClick={() => { if (walletConnected) disconnectWalletOnly(); else connectWalletOnly(); }}
                className={`flex items-center gap-2 text-caption px-3 py-2 border rounded-xl transition-all min-h-[40px] ${
                  walletConnected
                    ? "bg-success/10 border-success/30 text-success hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                    : "bg-accent text-accent-foreground border-accent hover:bg-accent/90 shadow-soft"
                }`}>
                <Wallet className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{walletConnected ? `${walletAddress.substring(0,6)}...${walletAddress.substring(34)}` : "Connect"}</span>
                {walletConnected && <CheckCircle2 className="w-3 h-3" />}
              </button>
            )}

            {currentUser && (
              <span className={`text-caption px-2.5 py-1 rounded-full font-semibold hidden xl:inline ${
                currentUser.role === "officer" ? "bg-accent/10 text-accent"
                : currentUser.role === "vendor" ? "bg-warning/10 text-warning"
                : "bg-surface-container-high text-muted-foreground"
              }`}>
                {currentUser.role === "officer" ? "Govt Officer" : currentUser.role === "vendor" ? "Vendor" : "Auditor"}
              </span>
            )}

            <div ref={authRef} className="relative shrink-0">
              <button onClick={() => setShowAuth(!showAuth)}
                className="flex items-center justify-center w-10 h-10 border border-border bg-card hover:bg-surface-container-low rounded-xl transition-all">
                {currentUser ? (
                  <div className="text-body-sm font-semibold text-foreground">{currentUser.name.substring(0, 2)}</div>
                ) : (
                  <User className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              {showAuth && (
                <div className="absolute right-0 mt-1.5 w-52 bg-card border border-border rounded-xl shadow-dropdown z-50 py-1 overflow-hidden animate-slide-down">
                  {!currentUser ? (
                    <>
                      <button onClick={() => { setShowAuth(false); router.push("/auth/officer"); }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-body-sm hover:bg-surface-container-low text-foreground transition-colors">
                        <Landmark className="w-4 h-4 text-accent shrink-0" />
                        <div><div className="font-semibold">{t.forOrg}</div></div>
                      </button>
                      <button onClick={() => { setShowAuth(false); router.push("/auth/vendor"); }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-body-sm hover:bg-surface-container-low text-foreground transition-colors">
                        <Building className="w-4 h-4 text-warning shrink-0" />
                        <div><div className="font-semibold">{t.forVendor}</div></div>
                      </button>
                      <button onClick={() => { setShowAuth(false); router.push("/auditor/login"); }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-body-sm hover:bg-surface-container-low text-foreground transition-colors">
                        <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div><div className="font-semibold">For auditor</div></div>
                      </button>
                      <button onClick={() => { setShowAuth(false); router.push("/dashboard"); }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-body-sm hover:bg-surface-container-low text-foreground transition-colors">
                        <User className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div><div className="font-semibold">{t.forPublic}</div></div>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-2.5 bg-surface-container-low border-b border-border">
                        <span className="block text-accent text-caption font-semibold capitalize">{currentUser.role}</span>
                        <span className="block truncate mt-0.5 text-caption text-muted-foreground">{currentUser.email}</span>
                      </div>
                      <Link href={currentUser.role === "officer" ? "/officer/profile" : currentUser.role === "vendor" ? "/vendor/profile" : "/dashboard"} 
                        className="flex items-center gap-2 px-3 py-2.5 text-body-sm text-foreground hover:bg-surface-container-low font-semibold transition-colors"
                        onClick={() => setShowAuth(false)}>
                        <User className="w-4 h-4 text-accent" />
                        <span>My profile</span>
                      </Link>
                      <button onClick={() => { setShowAuth(false); logoutUser(); router.push("/"); }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-body-sm hover:bg-destructive/10 text-destructive border-t border-border font-semibold transition-colors">
                        <LogOut className="w-4 h-4" />
                        <span>Disconnect</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {!currentUser && (
              <button onClick={() => router.push("/register")}
                className="flex items-center gap-1.5 text-caption px-3 py-2 bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 transition-all font-semibold shadow-soft min-h-[40px]">
                <span>Register</span>
              </button>
            )}

            <div ref={notifRef} className="relative shrink-0">
              <button onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 border border-border rounded-xl hover:bg-surface-container-low transition-all text-muted-foreground hover:text-foreground min-h-[40px] min-w-[40px] flex items-center justify-center">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center rounded-full shadow-soft">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-1.5 w-72 bg-card border border-border rounded-xl shadow-dropdown z-50 overflow-hidden animate-slide-down">
                  <div className="p-3 bg-surface-container-low border-b border-border flex items-center justify-between">
                    <span className="text-caption font-semibold text-foreground uppercase tracking-wider">{t.notifications}</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllNotificationsAsRead} className="text-caption text-accent hover:underline font-semibold">{t.markRead}</button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-border">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div key={notif.id} onClick={() => { markNotificationAsRead(notif.id); if (notif.actionUrl) router.push(notif.actionUrl); setShowNotifications(false); }}
                          className={`p-3 text-left transition-colors hover:bg-surface-container-low cursor-pointer ${notif.read ? "opacity-60" : "bg-accent/5"}`}>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-body-sm text-foreground line-clamp-1 font-semibold">{notif.title}</span>
                            {!notif.read && <span className="w-1.5 h-1.5 bg-accent shrink-0 mt-1 rounded-full" />}
                          </div>
                          <p className="text-caption text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                          <div className="text-caption text-muted-foreground mt-1">
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

        {/* Mobile Menu Button */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 border border-border rounded-xl hover:bg-surface-container-low transition-colors">
          {mobileMenuOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card animate-slide-down">
          <div className="p-4 space-y-3">
            {currentUser && (currentUser.role === "officer" || currentUser.role === "vendor") && (
              <button onClick={() => { if (walletConnected) disconnectWalletOnly(); else connectWalletOnly(); setMobileMenuOpen(false); }}
                className={`flex items-center gap-2 w-full text-body-sm px-3 py-2.5 border rounded-xl transition-all ${
                  walletConnected
                    ? "bg-success/10 border-success/30 text-success"
                    : "bg-accent text-accent-foreground border-accent"
                }`}>
                <Wallet className="w-4 h-4" />
                <span>{walletConnected ? `${walletAddress.substring(0,6)}...${walletAddress.substring(34)}` : "Connect wallet"}</span>
                {walletConnected && <CheckCircle2 className="w-3.5 h-3.5 ml-auto" />}
              </button>
            )}
            {!currentUser && (
              <button onClick={() => { router.push("/register"); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 w-full text-body-sm px-3 py-2.5 bg-accent text-accent-foreground rounded-xl font-semibold">
                Register
              </button>
            )}
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}
              className="block text-body-sm text-foreground px-3 py-2.5 hover:bg-surface-container-low rounded-xl transition-colors">
              Browse tenders
            </Link>
            <Link href="/faq" onClick={() => setMobileMenuOpen(false)}
              className="block text-body-sm text-foreground px-3 py-2.5 hover:bg-surface-container-low rounded-xl transition-colors">
              Help & FAQ
            </Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)}
              className="block text-body-sm text-foreground px-3 py-2.5 hover:bg-surface-container-low rounded-xl transition-colors">
              About
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
