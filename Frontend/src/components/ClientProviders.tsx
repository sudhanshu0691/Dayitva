"use client";

import React, { useEffect, useState } from "react";
import { AppProvider, useApp } from "../context/AppContext";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PortalSidebar } from "./PortalSidebar";
import { Bell, Wifi, CheckCircle2, AlertCircle, X, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

const InnerProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { fontSize, notifications, hydrated, currentUser } = useApp();
  const [activeToasts, setActiveToasts] = useState<any[]>([]);

  // Recover from transient chunk load failures (dev server) by reloading once
  useEffect(() => {
    const handler = (ev: any) => {
      const err = ev?.error || ev;
      const msg = err?.message || '';
      if (msg.includes('Loading chunk') || err?.name === 'ChunkLoadError') {
        // Try a single reload to recover the missing chunk
        console.warn('Detected ChunkLoadError, reloading to recover chunks.');
        try {
          window.location.reload();
        } catch (e) {
          // ignore
        }
      }
    };
    window.addEventListener('error', handler as any);
    window.addEventListener('unhandledrejection', handler as any);
    return () => {
      window.removeEventListener('error', handler as any);
      window.removeEventListener('unhandledrejection', handler as any);
    };
  }, []);

  const isPortalRoute = pathname.startsWith("/admin") || pathname.startsWith("/vendor");
  const isAuthRoute = pathname.startsWith("/auth") || pathname === "/login" || pathname === "/register";

  useEffect(() => {
    if (!hydrated) return;

    if (currentUser && (pathname === "/" || isAuthRoute)) {
      router.replace(currentUser.role === "officer" ? "/admin" : currentUser.role === "vendor" ? "/vendor" : "/public");
    }
  }, [hydrated, currentUser, isAuthRoute, pathname, router]);

  // Watch for new notifications to trigger premium screen toasts
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      // Only toast if it's very recent (created in last 3 seconds)
      const isRecent = (Date.now() - new Date(latest.timestamp).getTime()) < 3000;
      if (isRecent) {
        setActiveToasts(prev => {
          // Check if already in toasts
          if (prev.some(t => t.id === latest.id)) return prev;
          return [latest, ...prev].slice(0, 3); // limit to 3 simultaneous toasts
        });
      }
    }
  }, [notifications]);

  const removeToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4 text-sm font-semibold text-slate-300 shadow-2xl">
          Restoring secure portal session...
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans text-sz-${fontSize}`}>
      
      {/* Skip to Main Content target */}
      <Header />

      <div className={isPortalRoute ? "flex flex-1 w-full" : "flex-1 w-full"}>
        {isPortalRoute && <PortalSidebar />}
        <main id="main-content" className={`relative outline-none flex-1 ${isPortalRoute ? "min-w-0" : ""}`}>
          {children}
        </main>
      </div>

      {!isPortalRoute && <Footer />}

      {/* Premium Simulated Real-time Toast System */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {activeToasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto bg-slate-900 border border-teal-500/40 text-slate-100 p-4 rounded-xl shadow-2xl flex items-start space-x-3 backdrop-blur-md bg-opacity-95"
            >
              <div className="bg-teal-950 p-2 rounded-lg border border-teal-500/20 text-teal-400 shrink-0 mt-0.5">
                {toast.category === "tender" ? (
                  <Wifi className="w-4 h-4 animate-pulse text-saffron" />
                ) : toast.category === "bid" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : toast.category === "kyc" ? (
                  <ShieldAlert className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Bell className="w-4 h-4 text-teal-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-teal-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  Simulated Network Event
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <h4 className="text-xs font-bold mt-1 text-slate-100 line-clamp-1">{toast.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">{toast.message}</p>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                aria-label="Dismiss alert"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};

export const ClientProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppProvider>
      <InnerProviderWrapper>
        {children}
      </InnerProviderWrapper>
    </AppProvider>
  );
};
