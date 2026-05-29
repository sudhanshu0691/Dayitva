import React from "react";
// Suppress TypeScript error for side-effect CSS import when no type declarations are present
// @ts-ignore: CSS module declaration
import "./globals.css";
import { ClientProviders } from "../components/ClientProviders";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Decentralized TenderChain | Government of India",
  description: "EVM-secured, ZKP-encrypted Transparent E-Procurement & Tender Management System for Indian Digital Infrastructure.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground transition-colors duration-200 font-sans">
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:bg-primary focus:text-white focus:p-3 focus:rounded-md focus:top-2 focus:left-2 transition-all outline-none"
        >
          Skip to main content
        </a>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}