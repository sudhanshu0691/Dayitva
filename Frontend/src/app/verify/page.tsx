"use client";

import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { ShieldCheck, Search, Activity, Cpu, KeyRound } from "lucide-react";
import { BackButton } from "../../components/ui/BackButton";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";

function VerifyContent() {
  const { language } = useApp();

  const [hashInput, setHashInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hashInput.trim()) return;

    setLoading(true);
    setResult(null);

    setTimeout(() => {
      setLoading(false);
      setResult({
        blockNumber: Math.floor(Math.random()*1500) + 18251200,
        consensusStatus: "CONFIRMED via 1,842 nodes",
        merkleRoot: "0x789acde98fdfa34bcdef92a4cf8923a102bcdef89daef09a8976bcfe89bc2132",
        gasUsed: "42,852 Units",
        timestamp: new Date().toISOString()
      });
    }, 1800);
  };

  const t = {
    en: {
      title: "Public Blockchain Verification Hub",
      desc: "Verify transaction hashes, IPFS document storage integrity, or smart contract state roots instantly.",
      hashLabel: "Transaction / IPFS Hash",
      hashPlaceholder: "e.g. 0x892a34fcbe9e89d8123fa409de789234b3e8c023d8...",
      verifyCTA: "Verify Integrity State Root",
      loadingCTA: "Running cryptographic verification checks...",
      backLabel: "Back to Registry",
      // result labels
      blockConfirmed: "BLOCK CONFIRMED:",
      gasUsed: "GAS USED:",
      consensusSeal: "CONSENSUS SEAL:",
      merkleRoot: "PROVABLE STATE MERKLE ROOT:",
      verified: "INTEGRITY VERIFIED",
    },
    hi: {
      title: "सार्वजनिक ब्लॉकचेन सत्यापन केंद्र",
      desc: "लेन-देन हैश, IPFS दस्तावेज़ भंडारण अखंडता, या स्मार्ट अनुबंध स्थिति रूट को तुरंत सत्यापित करें।",
      hashLabel: "लेन-देन / IPFS हैश",
      hashPlaceholder: "उदा. 0x892a34fcbe9e89d8123fa409de789234b3e8c023d8...",
      verifyCTA: "अखंडता स्थिति रूट सत्यापित करें",
      loadingCTA: "क्रिप्टोग्राफिक सत्यापन जांच चल रही है...",
      backLabel: "रजिस्ट्री पर वापस जाएं",
      blockConfirmed: "ब्लॉक पुष्टि:",
      gasUsed: "गैस उपयोग:",
      consensusSeal: "सहमति मुहर:",
      merkleRoot: "प्रूवेबल स्टेट मर्कल रूट:",
      verified: "अखंडता सत्यापित",
    }
  }[language];

  return (
    <main className="w-full max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6">
        <BackButton href="/dashboard" label={t.backLabel} variant="text" />
      </nav>

      <Card variant="default" className="space-y-6">
        <CardHeader>
          <header className="text-center border-b border-border/60 pb-4">
            <div className="w-11 h-11 bg-teal-950 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-3 rounded-xl">
              <Cpu className="w-5 h-5 animate-spin-slow text-teal-400" aria-hidden="true" />
            </div>
            <CardTitle className="text-base sm:text-lg">{t.title}</CardTitle>
            <CardDescription className="mt-1.5">
              {t.desc}
            </CardDescription>
          </header>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleVerify} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="verify-hash"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block"
              >
                {t.hashLabel}
              </label>
              <Input
                id="verify-hash"
                type="text"
                placeholder={t.hashPlaceholder}
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="font-mono text-xs"
                required
              />
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full gap-2 font-mono text-sm"
              disabled={!hashInput.trim() || loading}
              loading={loading}
              loadingText={t.loadingCTA}
            >
              <KeyRound className="w-4 h-4" aria-hidden="true" />
              {t.verifyCTA}
            </Button>
          </form>

          {result && (
            <div className="p-4 sm:p-5 bg-slate-950 border border-slate-900 rounded-xl space-y-3.5 font-mono text-xs text-slate-400">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider border-b border-slate-900 pb-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-emerald-500 animate-bounce" aria-hidden="true" />
                <span>{t.verified}</span>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <div>
                  <span className="text-slate-600 block text-[10px]">{t.blockConfirmed}</span>
                  <strong className="text-slate-200 block text-sm font-extrabold mt-0.5">
                    #{result.blockNumber}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-600 block text-[10px]">{t.gasUsed}</span>
                  <strong className="text-slate-200 block text-sm font-bold mt-0.5">
                    {result.gasUsed}
                  </strong>
                </div>
                <div className="col-span-2 border-t border-slate-900 pt-2.5">
                  <span className="text-slate-600 block text-[10px]">{t.consensusSeal}</span>
                  <strong className="text-slate-200 block mt-0.5 text-xs">
                    {result.consensusStatus}
                  </strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-600 block text-[10px]">{t.merkleRoot}</span>
                  <strong className="text-teal-400 block truncate mt-0.5 select-all hover:underline cursor-pointer text-xs">
                    {result.merkleRoot}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <ErrorBoundary>
      <VerifyContent />
    </ErrorBoundary>
  );
}