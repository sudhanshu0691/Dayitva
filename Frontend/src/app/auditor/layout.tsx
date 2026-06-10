"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AuditorSidebar from "./AuditorSidebar";

export default function AuditorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auditorToken");
    setAuthenticated(!!token);
    setMounted(true);
  }, []);

  // Never show sidebar on login or register pages
  const isAuthPage = pathname === "/auditor/login" || pathname === "/auditor/register" || pathname === "/auditor/forgot-password";

  // On auth pages or not authenticated: no sidebar, full-width content
  if (!mounted || !authenticated || isAuthPage) {
    return (
      <div className="min-h-screen bg-background relative perspective">
        <div className="absolute inset-0 pointer-events-none bg-grid-3d" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="floating-shape floating-shape-3" style={{ right: '-3%', top: '10%' }} />
          <div className="floating-shape floating-shape-1" style={{ left: '-5%', bottom: '10%' }} />
        </div>
        <main className="w-full relative z-10">
          {children}
        </main>
      </div>
    );
  }

  // Authenticated: show sidebar with appropriate margin
  return (
    <div className="flex min-h-screen bg-background relative perspective">
      <div className="absolute inset-0 pointer-events-none bg-grid-3d" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="floating-shape floating-shape-3" style={{ right: '-3%', top: '10%' }} />
        <div className="floating-shape floating-shape-1" style={{ left: '-5%', bottom: '10%' }} />
      </div>
      <AuditorSidebar />
      <main className="flex-1 ml-[220px] p-0 relative z-10">
        {children}
      </main>
    </div>
  );
}
