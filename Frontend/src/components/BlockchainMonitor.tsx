"use client";

import React, { useState, useEffect } from "react";
import { 
  Terminal, ShieldCheck, Activity, Cpu, Layers, 
  ExternalLink, Hash, Database, RefreshCw, Zap 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TxEvent {
  txHash: string;
  blockNumber: number;
  type: string;
  gasFee: number;
  timestamp: string;
  walletAddress: string;
  status: string;
  metadata: {
    tenderTitle?: string;
    vendorName?: string;
    bidAmount?: number;
  };
}

const generateHash = () => "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join("");
const generateBlockNumber = () => Math.floor(Math.random() * 50000) + 18240000;

const TRANSACTION_TYPES = [
  "TENDER_PUBLISHED",
  "BID_SUBMITTED", 
  "SMART_CONTRACT_EXECUTED",
  "WINNER_DECLARED",
  "KYC_APPROVED",
  "WALLET_CONNECTED"
];

const MINISTRIES = ["MoRTH", "Min. of Railways", "Min. of Defence", "MeitY", "Min. of Jal Shakti"];
const VENDORS = ["L&T Construction", "Tata Projects", "Bharat Electronics", "Wipro Cloud", "Shapoorji Pallonji"];

function generateRandomTx(): TxEvent {
  const randomType = TRANSACTION_TYPES[Math.floor(Math.random() * TRANSACTION_TYPES.length)];
  const randomMinistry = MINISTRIES[Math.floor(Math.random() * MINISTRIES.length)];
  const randomVendor = VENDORS[Math.floor(Math.random() * VENDORS.length)];

  return {
    txHash: generateHash(),
    blockNumber: generateBlockNumber(),
    gasFee: parseFloat((Math.random() * 0.015 + 0.002).toFixed(5)),
    timestamp: new Date().toISOString(),
    walletAddress: "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(""),
    type: randomType,
    status: "success",
    metadata: {
      tenderTitle: `${randomType === "KYC_APPROVED" ? "KYC Verification" : "Procurement Contract"} - ${randomMinistry}`,
      vendorName: randomVendor,
      bidAmount: randomType === "BID_SUBMITTED" ? Math.floor(Math.random() * 5000 + 100) * 1000000 : undefined
    }
  };
}

const INITIAL_TXS: TxEvent[] = [
  {
    txHash: "0x892a34fcbe9e89d8123fa409de789234b3e8c023d8dfaef09a8976bcf67a213e",
    blockNumber: 18245903,
    gasFee: 0.0145,
    timestamp: new Date().toISOString(),
    walletAddress: "0x12a8bc43def9a7812bcde78bcdaef90123ae89bd",
    type: "TENDER_PUBLISHED",
    status: "success",
    metadata: { tenderTitle: "Highway Construction Project - MoRTH" }
  },
  {
    txHash: "0xec29e349fd84aefc2ef7849de781034b3e8c023d8dfaef09a8976bcf89bc9ef7",
    blockNumber: 18251203,
    gasFee: 0.0098,
    timestamp: new Date().toISOString(),
    walletAddress: "0x893d7c49ef87fdf8234bc09fa782b3d8ef45fc49",
    type: "BID_SUBMITTED",
    status: "success",
    metadata: { tenderTitle: "Solar Grid Project - Railways", vendorName: "L&T Construction", bidAmount: 432000000 }
  },
  {
    txHash: "0x789acde98fdfa34bcdef92a4cf8923a102bcdef89daef09a8976bcfe89bc2132",
    blockNumber: 18125910,
    gasFee: 0.0124,
    timestamp: new Date().toISOString(),
    walletAddress: "0x12a8bc43def9a7812bcde78bcdaef90123ae89bd",
    type: "WINNER_DECLARED",
    status: "success",
    metadata: { tenderTitle: "Data Governance Cloud - MeitY", vendorName: "Wipro Cloud", bidAmount: 1720000000 }
  }
];

export const BlockchainMonitor: React.FC = () => {
  const [txs, setTxs] = useState<TxEvent[]>(INITIAL_TXS);
  const [pulse, setPulse] = useState(true);
  const [latestBlock, setLatestBlock] = useState(18251203);

  // Add a new transaction every 25 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newTx = generateRandomTx();
      setTxs(prev => [newTx, ...prev.slice(0, 19)]);
      setLatestBlock(prev => prev + Math.floor(Math.random() * 3) + 1);
      setPulse(p => !p);
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  // Slowly increment blocks
  useEffect(() => {
    const blockInterval = setInterval(() => {
      setLatestBlock(prev => prev + 1);
      setPulse(p => !p);
    }, 8000);
    return () => clearInterval(blockInterval);
  }, []);

  const getTxColor = (type: string) => {
    switch (type) {
      case "TENDER_PUBLISHED": return "text-amber-400 border-amber-500/30 bg-amber-500/5";
      case "BID_SUBMITTED": return "text-teal-400 border-teal-500/30 bg-teal-500/5";
      case "SMART_CONTRACT_EXECUTED": return "text-indigo-400 border-indigo-500/30 bg-indigo-500/5";
      case "WINNER_DECLARED": return "text-emerald-400 border-emerald-500/30 bg-emerald-500/5";
      case "KYC_APPROVED": return "text-blue-400 border-blue-500/30 bg-blue-500/5";
      default: return "text-slate-400 border-slate-500/30 bg-slate-500/5";
    }
  };

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 left-1/4 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <Terminal className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold text-slate-300 font-mono tracking-wider uppercase">
            TenderChain Distributed Ledger Monitor
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

      {/* Network Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-900 divide-x divide-slate-900 bg-slate-900/50">
        <div className="p-3 text-center">
          <div className="text-[10px] text-slate-500 font-mono uppercase font-bold flex items-center justify-center gap-1">
            <Layers className="w-3 h-3 text-indigo-400" /> LATEST BLOCK
          </div>
          <div className="text-sm font-black text-slate-100 font-mono mt-1 tracking-tight">#{latestBlock.toLocaleString()}</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-[10px] text-slate-500 font-mono uppercase font-bold flex items-center justify-center gap-1">
            <RefreshCw className="w-3 h-3 text-teal-400" /> AVG BLOCK TIME
          </div>
          <div className="text-sm font-black text-slate-100 font-mono mt-1 tracking-tight">8.4s</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-[10px] text-slate-500 font-mono uppercase font-bold flex items-center justify-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400" /> GAS CONSTANT
          </div>
          <div className="text-sm font-black text-teal-400 font-mono mt-1 tracking-tight">0.008 MATIC</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-[10px] text-slate-500 font-mono uppercase font-bold flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-amber-500" /> VERIFIERS ACTIVE
          </div>
          <div className="text-sm font-black text-slate-100 font-mono mt-1 tracking-tight">1,842 Nodes</div>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="p-4 bg-slate-950/90 font-mono text-[11px] leading-relaxed select-all">
        <div className="text-slate-500 mb-3 border-b border-slate-900 pb-2">
          <div>$ ssh tenderchain-mainnet-gateway.nic.in</div>
          <div>AUTHORIZED GOVERNMENT OF INDIA AUDIT GATEWAY</div>
          <div>ESTABLISHING DECENTRALIZED CHANNEL...</div>
        </div>

        <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {txs.map((tx) => (
              <motion.div
                key={tx.txHash}
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, x: -20 }}
                className={`p-3 border rounded-lg transition-all ${getTxColor(tx.type)}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="font-extrabold tracking-wide uppercase">{tx.type.replace(/_/g, " ")}</span>
                    <span className="bg-emerald-950 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded-full font-bold border border-emerald-500/20 flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" /> SECURED
                    </span>
                  </div>
                  <div className="text-slate-500 flex items-center space-x-1.5 text-[10px]">
                    <Hash className="w-3 h-3 text-slate-600" />
                    <span>Block #{tx.blockNumber}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-900/60 text-slate-400 text-[10px]">
                  <div><span className="text-slate-600 font-bold uppercase">TX HASH: </span>
                    <span className="text-slate-300 font-mono">{tx.txHash.substring(0, 16)}...{tx.txHash.substring(48)}</span></div>
                  <div><span className="text-slate-600 font-bold uppercase">WALLET: </span>
                    <span className="text-slate-300 font-mono">{tx.walletAddress.substring(0, 8)}...{tx.walletAddress.substring(32)}</span></div>
                </div>

                <div className="mt-2 text-[10px] bg-slate-950/40 p-2 rounded border border-slate-900/40 text-slate-400">
                  <div className="text-teal-500/80 font-bold uppercase tracking-wider text-[9px]">Event Info</div>
                  <div className="text-slate-300 mt-1 font-semibold">{tx.metadata.tenderTitle || "Blockchain Event"}</div>
                  {tx.metadata.vendorName && (
                    <div className="text-slate-400 mt-0.5 text-[9px]">Entity: <span className="text-indigo-400 font-bold">{tx.metadata.vendorName}</span></div>
                  )}
                  <div className="text-slate-600 text-[9px] mt-1.5 flex items-center justify-between">
                    <span>Gas: {tx.gasFee} MATIC</span>
                    <span>{new Date(tx.timestamp).toLocaleTimeString()}</span>
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