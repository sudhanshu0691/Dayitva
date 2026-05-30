"use client";

import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { BackButton } from "../../components/ui/BackButton";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";

function FAQContent() {
  const { language } = useApp();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs = [
    {
      q: "How does the cryptographic bid sealing process work?",
      a: "When you submit a bid, your price is combined with a random salt value and hashed using SHA-256 on the client side. This hash is written to the blockchain. Until the tender closing block timestamp passes, the private key splits are held in decentralized escrows, making it mathematically impossible for any administrator or competitor to view your price."
    },
    {
      q: "What is the benefit of using IPFS for tender drawings and documents?",
      a: "Traditional databases can be modified or altered silently. By storing all technical specification drawings on IPFS, we lock the document under its immutable content identifier (hash). The smart contract stores this hash, guaranteeing that specifications cannot be modified post-publishing."
    },
    {
      q: "How are MSME reservations verified?",
      a: "During corporate registration, vendors upload their official Udyam Aadhaar certificate. Upon verification, this is signed on-chain by verification officers, which unlocks the 25% quota preferences automatically inside the bidding smart contract."
    },
    {
      q: "What is L1 automated selection?",
      a: "L1 selection refers to awarding the contract to the lowest-priced technically qualified bidder. In TenderChain, the smart contract sorts revealed bid prices automatically once the decryption trigger is executed, eliminating manual committee biases."
    }
  ];

  return (
    <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      <nav aria-label="Breadcrumb">
        <BackButton href="/dashboard" label="Back to Dashboard" variant="text" />
      </nav>

      <section className="bg-card border border-border/80 rounded-2xl p-4 sm:p-6 shadow-md space-y-6">
        <header className="text-center border-b border-border/60 pb-4">
          <HelpCircle className="w-10 h-10 text-teal-400 mx-auto mb-2" aria-hidden="true" />
          <h1 className="text-lg sm:text-xl font-black text-foreground">Help & FAQs Directory</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Understanding decentralized procurement and security covenants.</p>
        </header>

        <div className="space-y-4" role="list">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="border-b border-border/60 pb-3" role="listitem">
                <h2>
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${idx}`}
                    className="w-full flex items-center justify-between text-sm font-bold text-foreground py-2 hover:text-primary text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 shrink-0 ml-2" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-4 h-4 shrink-0 ml-2" aria-hidden="true" />
                    )}
                  </button>
                </h2>
                {isOpen && (
                  <div
                    id={`faq-answer-${idx}`}
                    role="region"
                    className="text-sm text-muted-foreground leading-relaxed mt-2 bg-muted/20 p-3 sm:p-4 rounded-lg border border-border/40"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default function FAQPage() {
  return (
    <ErrorBoundary>
      <FAQContent />
    </ErrorBoundary>
  );
}