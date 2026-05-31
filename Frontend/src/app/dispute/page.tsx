"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { AlertTriangle, Send, CheckCircle2 } from "lucide-react";
import { BackButton } from "../../components/ui/BackButton";
import { Button } from "../../components/ui/button";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";
import disputeService from "@/services/disputeService";
import tenderService from "@/services/tenderService";

function DisputeContent() {
  const { language, currentUser } = useApp();

  const [tenders, setTenders] = useState<any[]>([]);
  const [selectedTender, setSelectedTender] = useState("");
  const [complaintText, setComplaintText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tenderService.listTenders().then(res => {
      setTenders(res.data || []);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTender || !complaintText) return;

    setSubmitting(true);
    setError(null);

    try {
      await disputeService.createDispute({
        tenderId: selectedTender,
        text: complaintText,
      });
      setSuccess(true);
      setComplaintText("");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to submit dispute");
    } finally {
      setSubmitting(false);
    }
  };

  const t = {
    en: {
      title: "Grievance & Dispute Registry",
      desc: "Escalate irregularities or prequalification biases for independent assessment.",
      selectLabel: "Select Tender",
      chooseLabel: "-- Choose tender --",
      textLabel: "Describe your complaint in detail",
      textPlaceholder: "Detail technical biases, restrictive eligibility clauses, or evaluation anomalies...",
      btnCTA: "Submit Dispute",
      loadingCTA: "Submitting dispute...",
      successMsg: "Dispute registered successfully",
      successDesc: "Your grievance has been recorded and will be reviewed by the regulatory committee.",
      logAnother: "Submit Another Dispute",
      backLabel: "Back to Dashboard",
    },
    hi: {
      title: "शिकायत एवं विवाद रजिस्ट्री",
      desc: "स्वतंत्र मूल्यांकन के लिए अनियमितताओं या पूर्वाग्रहों को दर्ज करें।",
      selectLabel: "निविदा चुनें",
      chooseLabel: "-- निविदा चुनें --",
      textLabel: "अपनी शिकायत विस्तार से लिखें",
      textPlaceholder: "तकनीकी पूर्वाग्रह, प्रतिबंधात्मक खंड, या मूल्यांकन विसंगतियों का विवरण दें...",
      btnCTA: "विवाद दर्ज करें",
      loadingCTA: "विवाद दर्ज किया जा रहा है...",
      successMsg: "विवाद सफलतापूर्वक दर्ज किया गया",
      successDesc: "आपकी शिकायत दर्ज कर ली गई है और नियामक समिति द्वारा इसकी समीक्षा की जाएगी।",
      logAnother: "दूसरा विवाद दर्ज करें",
      backLabel: "डैशबोर्ड पर वापस जाएं",
    }
  }[language];

  return (
    <main className="w-full max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6">
        <BackButton href="/dashboard" label={t.backLabel} variant="text" />
      </nav>

      <section className="bg-card border border-border/80 rounded-2xl p-4 sm:p-6 shadow-md space-y-6">
        <header className="text-center border-b border-border/60 pb-4">
          <div className="w-11 h-11 bg-rose-950/20 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-3 rounded-xl">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          </div>
          <h1 className="text-base sm:text-lg font-black text-foreground">{t.title}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">{t.desc}</p>
        </header>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-xs text-destructive rounded-lg">{error}</div>
        )}

        {success ? (
          <div className="p-4 sm:p-6 bg-emerald-950/20 border border-emerald-500/20 text-center rounded-xl space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h2 className="font-extrabold text-xs uppercase tracking-wider font-mono text-emerald-400">{t.successMsg}</h2>
            <p className="text-xs text-slate-400 leading-normal">{t.successDesc}</p>
            <Button variant="outline" size="sm" onClick={() => setSuccess(false)} className="mt-2 text-xs">{t.logAnother}</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="dispute-tender" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.selectLabel}</label>
              <select id="dispute-tender" value={selectedTender} onChange={(e) => setSelectedTender(e.target.value)}
                className="w-full bg-background border border-input rounded-lg p-2.5 text-sm font-medium text-foreground" required>
                <option value="">{t.chooseLabel}</option>
                {tenders.map(t => (
                  <option key={t.id} value={t.id}>{t.id} &bull; {t.title?.substring(0, 36)}...</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="dispute-text" className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block">{t.textLabel}</label>
              <textarea id="dispute-text" placeholder={t.textPlaceholder} value={complaintText} onChange={(e) => setComplaintText(e.target.value)}
                className="w-full bg-background border border-input rounded-lg p-2.5 text-sm font-medium text-foreground min-h-[8rem] resize-y" required />
            </div>

            <Button type="submit" variant="default" className="w-full gap-2 font-mono text-sm"
              disabled={!selectedTender || !complaintText || submitting} loading={submitting} loadingText={t.loadingCTA}>
              <Send className="w-4 h-4" /> {t.btnCTA}
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}

export default function DisputePage() {
  return (
    <ErrorBoundary>
      <DisputeContent />
    </ErrorBoundary>
  );
}