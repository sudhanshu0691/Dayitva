"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { BlockchainTx, TxType } from "../types";
import { 
  Terminal, ShieldCheck, Activity, Cpu, Layers, 
  ExternalLink, Hash, Database, RefreshCw, Zap 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const BlockchainMonitor: React.FC = () => {
  const { blockchainTxs, language } = useApp();
  const [pulse, setPulse] = useState(true);
  const [latestBlock, setLatestBlock] = useState(18251203);
  const [networkSpeed, setNetworkSpeed] = useState(14.2); // blocks/sec or similar

  // Slowly increment blocks over time
  useEffect(() => {
    const blockInterval = setInterval(() => {
      setLatestBlock(prev => prev + 1);
      setPulse(p => !p);
    }, 8000);
    return () => clearInterval(blockInterval);
  }, []);

  const getTxColor = (type: TxType) => {
    switch (type) {
      case "TENDER_PUBLISHED": return "text-amber-400 border-amber-500/30 bg-amber-500/5";
      case "BID_SUBMITTED": return "text-teal-400 border-teal-500/30 bg-teal-500/5";
      case "SMART_CONTRACT_EXECUTED": return "text-indigo-400 border-indigo-500/30 bg-indigo-500/5";
      case "WINNER_DECLARED": return "text-emerald-400 border-emerald-500/30 bg-emerald-500/5";
      case "KYC_APPROVED": return "text-blue-400 border-blue-500/30 bg-blue-500/5";
      default: return "text-slate-400 border-slate-500/30 bg-slate-500/5";
    }
  };

  const getTxTypeLabel = (type: TxType) => {
    if (language === "hi") {
      switch (type) {
        case "TENDER_PUBLISHED": return "निविदा प्रकाशित";
        case "BID_SUBMITTED": return "बोली प्रस्तुत";
        case "SMART_CONTRACT_EXECUTED": return "स्मार्ट अनुबंध निष्पादित";
        case "WINNER_DECLARED": return "विजेता घोषित";
        case "WALLET_CONNECTED": return "वॉलेट कनेक्टेड";
        case "KYC_APPROVED": return "केवाईसी स्वीकृत";
        default: return type;
      }
    }
    return type.replace(/_/g, " ");
  };

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Terminal Title Bar */}
      <div className="w-full bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <Terminal className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold text-slate-300 font-mono tracking-wider uppercase">
            {language === "hi" ? "टेंडरचैन ब्लॉकचेन मॉनिटर" : "TenderChain Distributed Ledger Monitor"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider font-bold">LIVE SYNC</span>
        </div>
      </div>

      {/* Network Stats Ribbons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-900 divide-x divide-slate-900 bg-slate-900/50">
        <div className="p-3 text-center">
          <div className="text-[10px] text-slate-500 font-mono uppercase font-bold flex items-center justify-center gap-1">
            <Layers className="w-3 h-3 text-indigo-400" />
            LATEST BLOCK
          </div>
          <div className="text-sm font-black text-slate-100 font-mono mt-1 tracking-tight">
            #{latestBlock.toLocaleString()}
          </div>
        </div>
        <div className="p-3 text-center">
          <div className="text-[10px] text-slate-500 font-mono uppercase font-bold flex items-center justify-center gap-1">
            <RefreshCw className="w-3 h-3 text-teal-400 animate-spin-slow" />
            AVG BLOCK TIME
          </div>
          <div className="text-sm font-black text-slate-100 font-mono mt-1 tracking-tight">
            8.4s
          </div>
        </div>
        <div className="p-3 text-center">
          <div className="text-[10px] text-slate-500 font-mono uppercase font-bold flex items-center justify-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400" />
            GAS CONSTANT
          </div>
          <div className="text-sm font-black text-teal-400 font-mono mt-1 tracking-tight">
            0.008 MATIC
          </div>
        </div>
        <div className="p-3 text-center">
          <div className="text-[10px] text-slate-500 font-mono uppercase font-bold flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-amber-500" />
            VERIFIERS ACTIVE
          </div>
          <div className="text-sm font-black text-slate-100 font-mono mt-1 tracking-tight">
            1,842 Nodes
          </div>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="p-4 bg-slate-950/90 font-mono text-[11px] leading-relaxed select-all">
        {/* Terminal Header Info */}
        <div className="text-slate-500 mb-3 border-b border-slate-900 pb-2">
          <div>$ ssh tenderchain-mainnet-gateway.nic.in</div>
          <div>AUTHORIZED GOVERNMENT OF INDIA AUDIT GATEWAY SECURED</div>
          <div>ESTABLISHING DECENTRALIZED ZERO-KNOWLEDGE EVIDENCE CHANNEL...</div>
        </div>

        {/* Transaction Stream */}
        <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {blockchainTxs.map((tx) => (
              <motion.div
                key={tx.txHash}
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, x: -20 }}
                className={`p-3 border rounded-lg transition-all ${getTxColor(tx.type)}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  {/* Tx Type and Status */}
                  <div className="flex items-center space-x-2">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="font-extrabold tracking-wide uppercase">
                      {getTxTypeLabel(tx.type)}
                    </span>
                    <span className="bg-emerald-950 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded-full font-bold border border-emerald-500/20 flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      SECURED
                    </span>
                  </div>
                  {/* Block / Hash info */}
                  <div className="text-slate-500 flex items-center space-x-1.5 text-[10px]">
                    <Hash className="w-3 h-3 text-slate-600" />
                    <span>Block #{tx.blockNumber}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-900/60 text-slate-400 text-[10px]">
                  <div>
                    <span className="text-slate-600 font-bold uppercase">TX HASH:</span>{" "}
                    <span className="text-slate-300 font-mono hover:underline cursor-pointer select-all">
                      {tx.txHash.substring(0, 16)}...{tx.txHash.substring(48)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 font-bold uppercase">WAL WALLET:</span>{" "}
                    <span className="text-slate-300 font-mono">
                      {tx.walletAddress.substring(0, 8)}...{tx.walletAddress.substring(32)}
                    </span>
                  </div>
                </div>

                {/* Additional Event Metadata */}
                <div className="mt-2 text-[10px] bg-slate-950/40 p-2 rounded border border-slate-900/40 text-slate-400">
                  <div className="text-teal-500/80 font-bold uppercase tracking-wider text-[9px]">Event Ledger Info</div>
                  <div className="text-slate-300 mt-1 font-semibold">
                    {tx.metadata.tenderTitle || "Verification Signature Captured"}
                  </div>
                  {tx.metadata.vendorName && (
                    <div className="text-slate-400 mt-0.5 text-[9px]">
                      Entity: <span className="text-indigo-400 font-bold">{tx.metadata.vendorName}</span>
                    </div>
                  )}
                  {tx.metadata.bidAmount !== undefined && (
                    <div className="text-slate-400 mt-0.5 text-[9px]">
                      Bid Sealed Value: <span className="text-amber-400 font-bold">₹{(tx.metadata.bidAmount / 10000000).toFixed(2)} Cr</span> (ZKP Hash Lock)
                    </div>
                  )}
                  <div className="text-slate-600 text-[9px] mt-1.5 flex items-center justify-between">
                    <span>Gas: {tx.gasFee} MATIC</span>
                    <span>{new Date(tx.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
