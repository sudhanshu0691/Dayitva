import React from "react";
// @ts-ignore: CSS module declaration
import "./globals.css";
import { ClientProviders } from "../components/ClientProviders";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dayitva | Government e-Procurement Portal",
  description: "Transparent, secure e-procurement and tender management system.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground transition-colors duration-200">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:bg-primary focus:text-white focus:p-3 focus:top-2 focus:left-2 transition-all outline-none"
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