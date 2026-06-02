import React from "react";
import AuditorSidebar from "./AuditorSidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auditor Portal | Decentralized TenderChain",
  description: "Government auditing and verification portal for procurement management",
};

export default function AuditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AuditorSidebar />
      <main className="flex-1 ml-[260px] p-0">
        {children}
      </main>
    </div>
  );
}