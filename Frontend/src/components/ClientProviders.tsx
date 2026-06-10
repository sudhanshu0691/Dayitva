"use client";

import React, { useEffect, useState } from "react";
import { AppProvider, useApp } from "../context/AppContext";
import { BlockchainProvider } from "../context/BlockchainContext";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PortalSidebar } from "./PortalSidebar";
import { Bell, Wifi, CheckCircle2, AlertCircle, X, ShieldAlert, ExternalLink } from "lucide-react";
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
        console.warn('Detected ChunkLoadError, reloading to recover chunks.');
        try { window.location.reload(); } catch (e) { /* ignore */ }
      }
    };
    window.addEventListener('error', handler as any);
    window.addEventListener('unhandledrejection', handler as any);
    return () => {
      window.removeEventListener('error', handler as any);
      window.removeEventListener('unhandledrejection', handler as any);
    };
  }, []);

  const isPortalRoute = pathname.startsWith("/officer") || pathname.startsWith("/vendor");
  const isAuthRoute = pathname.startsWith("/auth") || pathname === "/login" || pathname === "/register";
  const isAuditorRoute = pathname.startsWith("/auditor");
  const hideHeader = isAuditorRoute && !pathname.includes("/login") && !pathname.includes("/register") && !pathname.includes("/forgot-password");

  useEffect(() => {
    if (!hydrated) return;
    if (currentUser && (pathname === "/" || isAuthRoute)) {
      if (currentUser.role === "officer") {
        router.replace("/officer");
      } else if (currentUser.role === "vendor") {
        router.replace("/vendor");
      }
    }
  }, [hydrated, currentUser, isAuthRoute, pathname, router]);

  // Watch for new notifications to trigger toasts
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      const isRecent = (Date.now() - new Date(latest.timestamp).getTime()) < 3000;
      if (isRecent) {
        setActiveToasts(prev => {
          if (prev.some(t => t.id === latest.id)) return prev;
          return [latest, ...prev].slice(0, 3);
        });
      }
    }
  }, [notifications]);

  const removeToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="border border-border bg-card px-5 py-4 text-[13px]">
          Loading secure portal...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      
      {!hideHeader && <Header />}

      <div className={isPortalRoute ? "flex flex-1 w-full" : "flex-1 w-full"}>
        {isPortalRoute && <PortalSidebar />}
        <main id="main-content" className={`relative outline-none flex-1 ${isPortalRoute ? "min-w-0" : ""}`}>
          {children}
        </main>
      </div>

      {!isPortalRoute && <Footer />}

      {/* Toast Notification System */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        {activeToasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-card border border-border text-foreground p-3 flex items-start space-x-3"
          >
            <div className="bg-primary/10 p-1.5 border border-primary/20 text-primary shrink-0 mt-0.5">
              {toast.category === "tender" ? (
                <Wifi className="w-4 h-4" />
              ) : toast.category === "bid" ? (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              ) : toast.category === "kyc" ? (
                <ShieldAlert className="w-4 h-4 text-accent" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-medium text-foreground line-clamp-1">{toast.title}</h4>
              <p className="text-[11px] text-muted-foreground mt-1 leading-normal">{toast.message}</p>
              {toast.txHash && (
                <a href={`https://sepolia.etherscan.io/tx/${toast.txHash}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-1">
                  <ExternalLink className="w-3 h-3" />
                  View on Etherscan
                </a>
              )}
            </div>
            <button onClick={() => removeToast(toast.id)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export const ClientProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BlockchainProvider>
      <AppProvider>
        <InnerProviderWrapper>
          {children}
        </InnerProviderWrapper>
      </AppProvider>
    </BlockchainProvider>
  );
};