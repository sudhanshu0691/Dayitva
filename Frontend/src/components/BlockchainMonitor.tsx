"use client";

import React, { useState, useEffect } from "react";
import { 
  Terminal, ShieldCheck, Activity, Cpu, Layers, 
  Hash, RefreshCw, CircleCheck
} from "lucide-react";

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
  const [latestBlock, setLatestBlock] = useState(18251203);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTx = generateRandomTx();
      setTxs(prev => [newTx, ...prev.slice(0, 19)]);
      setLatestBlock(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const blockInterval = setInterval(() => { setLatestBlock(prev => prev + 1); }, 8000);
    return () => clearInterval(blockInterval);
  }, []);

  const getTxStyle = (type: string) => {
    switch (type) {
      case "TENDER_PUBLISHED": return "border-accent/20 bg-accent/5";
      case "BID_SUBMITTED": return "border-warning/20 bg-warning/5";
      case "SMART_CONTRACT_EXECUTED": return "border-muted-foreground/20 bg-muted/30";
      case "WINNER_DECLARED": return "border-accent/20 bg-accent/5";
      case "KYC_APPROVED": return "border-success/20 bg-success/5";
      default: return "border-border";
    }
  };

  const getTxBadge = (type: string) => {
    switch (type) {
      case "TENDER_PUBLISHED": return "bg-accent/10 text-accent border-accent/20";
      case "BID_SUBMITTED": return "bg-warning/10 text-warning border-warning/20";
      case "SMART_CONTRACT_EXECUTED": return "bg-muted text-muted-foreground border-border";
      case "WINNER_DECLARED": return "bg-accent/10 text-accent border-accent/20";
      case "KYC_APPROVED": return "bg-success/10 text-success border-success/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="w-full bg-card border border-border rounded-xl overflow-hidden shadow-soft">
      {/* Header */}
      <div className="bg-surface-container-low border-b border-border px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-accent" />
          <span className="text-caption font-semibold text-foreground uppercase tracking-wider">
            Distributed ledger monitor
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full bg-accent rounded-full opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 bg-accent rounded-full" />
          </span>
          <span className="text-caption text-accent font-semibold">LIVE SYNC</span>
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-border divide-x divide-border bg-muted/20">
        <div className="p-4 text-center">
          <div className="text-caption text-muted-foreground flex items-center justify-center gap-1.5 mb-1">
            <Layers className="w-3.5 h-3.5 text-accent" /> Latest block
          </div>
          <div className="text-body-sm text-foreground font-bold font-mono">#{latestBlock.toLocaleString()}</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-caption text-muted-foreground flex items-center justify-center gap-1.5 mb-1">
            <RefreshCw className="w-3.5 h-3.5 text-accent" /> Avg block time
          </div>
          <div className="text-body-sm text-foreground font-bold font-mono">8.4s</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-caption text-muted-foreground flex items-center justify-center gap-1.5 mb-1">
            <Activity className="w-3.5 h-3.5 text-accent" /> Gas constant
          </div>
          <div className="text-body-sm text-foreground font-bold font-mono">0.008 MATIC</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-caption text-muted-foreground flex items-center justify-center gap-1.5 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" /> Verifiers active
          </div>
          <div className="text-body-sm text-foreground font-bold font-mono">1,842 Nodes</div>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="p-5">
        <div className="text-caption text-muted-foreground mb-4 pb-3 border-b border-border font-mono space-y-0.5">
          <div>$ ssh tenderchain-gateway.nic.in</div>
          <div>Authorized government audit gateway</div>
          <div>Establishing decentralized channel...</div>
        </div>

        <div className="space-y-3 max-h-[30rem] overflow-y-auto pr-1 scrollbar-thin">
          {txs.map((tx) => (
            <div key={tx.txHash}
              className={`p-4 border rounded-xl transition-all ${getTxStyle(tx.type)}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-caption uppercase tracking-wider text-foreground">{tx.type.replace(/_/g, " ")}</span>
                  <span className={`text-caption px-1.5 py-0.5 border rounded flex items-center gap-1 ${getTxBadge(tx.type)}`}>
                    <CircleCheck className="w-2.5 h-2.5" /> Secured
                  </span>
                </div>
                <div className="text-caption text-muted-foreground flex items-center gap-1.5 font-mono">
                  <Hash className="w-3 h-3" />
                  <span>Block #{tx.blockNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/60 text-caption text-muted-foreground font-mono">
                <div><span className="text-foreground/60">Tx: </span>
                  <span className="text-foreground/80">{tx.txHash.substring(0, 16)}...{tx.txHash.substring(48)}</span></div>
                <div><span className="text-foreground/60">Wallet: </span>
                  <span className="text-foreground/80">{tx.walletAddress.substring(0, 8)}...{tx.walletAddress.substring(32)}</span></div>
              </div>

              <div className="mt-3 bg-card/50 border border-border/60 rounded-lg p-3 text-caption">
                <div className="text-caption text-accent font-semibold uppercase tracking-wider">Event info</div>
                <div className="text-body-sm text-foreground mt-1 font-medium">{tx.metadata.tenderTitle || "Blockchain event"}</div>
                {tx.metadata.vendorName && (
                  <div className="text-caption text-muted-foreground mt-0.5">Entity: <span className="text-warning font-medium">{tx.metadata.vendorName}</span></div>
                )}
                <div className="text-caption text-muted-foreground mt-2 flex items-center justify-between border-t border-border/40 pt-2">
                  <span>Gas: <span className="font-mono">{tx.gasFee} MATIC</span></span>
                  <span className="font-mono">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
