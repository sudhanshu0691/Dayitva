"use client";

import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { AlertTriangle, Send, ShieldAlert, Layers, CheckCircle2 } from "lucide-react";
import { BackButton } from "../../components/ui/BackButton";
import { Button } from "../../components/ui/button";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";

function DisputeContent() {
  const { tenders, disputeTender, language } = useApp();

  const [selectedTender, setSelectedTender] = useState("");
  const [complaintText, setComplaintText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTender || !complaintText) return;

    setSubmitting(true);
    setTimeout(() => {
      disputeTender(selectedTender, complaintText);
      setSubmitting(false);
      setSuccess(true);
      setComplaintText("");
    }, 1800);
  };

  const t = {
    en: {
      title: "Grievance & Dispute Registry",
      desc: "Escalate irregularities or prequalification biases directly onto the blockchain audit trail for independent verifier assessment.",
      selectLabel: "Target Procurement Posting",
      textLabel: "Elaborate Complaint Grounds & Evidence Details",
      btnCTA: "Deploy Dispute Escalation on Blockchain",
      loadingCTA: "Sealing grievance block parameters...",
      successMsg: "DISPUTE RECORD LOCKED IN RECENT BLOCK STATE",
      successDesc: "Your grievance has been signed with corporate keys and integrated into the ledger. Regulatory auditors have received multi-sig triggers.",
      logAnother: "Log Another Dispute",
      backLabel: "Back to Registry",
      chooseLabel: "-- Choose active ledger index --",
      textPlaceholder: "Detail technical biases, restrictive eligibility clauses, or evaluation anomalies...",
    },
    hi: {
      title: "शिकायत एवं विवाद रजिस्ट्री",
      desc: "स्वतंत्र सत्यापनकर्ता मूल्यांकन के लिए सीधे ब्लॉकचेन ऑडिट ट्रेल पर अनियमितताओं या पूर्व-योग्यता पूर्वाग्रहों को बढ़ाएं।",
      selectLabel: "लक्ष्य निविदा चुनें",
      textLabel: "शिकायत के आधार और साक्ष्य विवरण विस्तार से लिखें",
      btnCTA: "ब्लॉकचेन पर विवाद निवारण शुरू करें",
      loadingCTA: "विवाद ब्लॉक पैरामीटर सील किए जा रहे हैं...",
      successMsg: "विवाद रिकॉर्ड ब्लॉकचेन बहीखाते में सफलतापूर्वक दर्ज किया गया",
      successDesc: "आपकी शिकायत कॉर्पोरेट कुंजियों के साथ हस्ताक्षरित की गई है और बहीखाते में एकीकृत की गई है। नियामक लेखा परीक्षकों को मल्टी-सिग ट्रिगर प्राप्त हुए हैं।",
      logAnother: "दूसरा विवाद दर्ज करें",
      backLabel: "रजिस्ट्री पर वापस जाएं",
      chooseLabel: "-- सक्रिय लेजर इंडेक्स चुनें --",
      textPlaceholder: "तकनीकी पूर्वाग्रह, प्रतिबंधात्मक पात्रता खंड, या मूल्यांकन विसंगतियों का विवरण दें...",
    }
  }[language];

  return (
    <main className="w-full max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6">
        <BackButton href="/dashboard" label={t.backLabel} variant="text" />
      </nav>

      <section className="bg-card border border-border/80 rounded-2xl p-4 sm:p-6 shadow-md space-y-6">
        {/* Header */}
        <header className="text-center border-b border-border/60 pb-4">
          <div className="w-11 h-11 bg-rose-950/20 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-3 rounded-xl">
            <AlertTriangle className="w-5 h-5 animate-bounce" aria-hidden="true" />
          </div>
          <h1 className="text-base sm:text-lg font-black text-foreground">{t.title}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {t.desc}
          </p>
        </header>

        {success ? (
          <div className="p-4 sm:p-6 bg-emerald-950/20 border border-emerald-500/20 text-center rounded-xl space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" aria-hidden="true" />
            <h2 className="font-extrabold text-xs uppercase tracking-wider font-mono text-emerald-400">{t.successMsg}</h2>
            <p className="text-xs text-slate-400 leading-normal font-mono">
              {t.successDesc}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSuccess(false)}
              className="mt-2 text-xs"
            >
              {t.logAnother}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Sponsoring Tender Dropdown */}
            <div className="space-y-1.5">
              <label
                htmlFor="dispute-tender"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block"
              >
                {t.selectLabel}
              </label>
              <select
                id="dispute-tender"
                value={selectedTender}
                onChange={(e) => setSelectedTender(e.target.value)}
                className="w-full bg-background border border-input hover:border-foreground/30 rounded-lg p-2.5 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200"
                required
                aria-required="true"
              >
                <option value="">{t.chooseLabel}</option>
                {tenders.map(t => (
                  <option key={t.id} value={t.id}>{t.id} &bull; {t.title.substring(0, 36)}...</option>
                ))}
              </select>
            </div>

            {/* Complaint Textbox */}
            <div className="space-y-1.5">
              <label
                htmlFor="dispute-text"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono block"
              >
                {t.textLabel}
              </label>
              <textarea
                id="dispute-text"
                placeholder={t.textPlaceholder}
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                className="w-full bg-background border border-input hover:border-foreground/30 rounded-lg p-2.5 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200 min-h-[8rem] resize-y"
                required
                aria-required="true"
              />
            </div>

            {/* CTA Submit Button */}
            <Button
              type="submit"
              variant="default"
              className="w-full gap-2 font-mono text-sm"
              disabled={!selectedTender || !complaintText || submitting}
              loading={submitting}
              loadingText={t.loadingCTA}
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              {t.btnCTA}
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