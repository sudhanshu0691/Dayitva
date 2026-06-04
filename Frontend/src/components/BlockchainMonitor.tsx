"use client";

import React, { useState, useEffect } from "react";
import { 
  Terminal, ShieldCheck, Activity, Cpu, Layers, 
  ExternalLink, Hash, Database, RefreshCw
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

  const getTxColor = (type: string) => {
    switch (type) {
      case "TENDER_PUBLISHED": return "border-primary/50 text-primary bg-primary/5";
      case "BID_SUBMITTED": return "border-accent/50 text-accent bg-accent/5";
      case "SMART_CONTRACT_EXECUTED": return "border-muted-foreground text-muted-foreground bg-muted";
      case "WINNER_DECLARED": return "border-primary/50 text-primary bg-primary/5";
      case "KYC_APPROVED": return "border-primary/30 text-primary bg-primary/5";
      default: return "border-border text-muted-foreground";
    }
  };

  return (
    <div className="w-full bg-card border border-border">
      <div className="w-full bg-sidebar border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-[11px] section-label text-foreground">
            Distributed ledger monitor
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full bg-primary opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-[10px] text-primary font-medium">LIVE SYNC</span>
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-border divide-x divide-border bg-muted/40">
        <div className="p-3 text-center">
          <div className="section-label text-muted-foreground flex items-center justify-center gap-1">
            <Layers className="w-3 h-3 text-primary" /> Latest block
          </div>
          <div className="text-[13px] text-foreground font-medium mt-1">#{latestBlock.toLocaleString()}</div>
        </div>
        <div className="p-3 text-center">
          <div className="section-label text-muted-foreground flex items-center justify-center gap-1">
            <RefreshCw className="w-3 h-3 text-primary" /> Avg block time
          </div>
          <div className="text-[13px] text-foreground font-medium mt-1">8.4s</div>
        </div>
        <div className="p-3 text-center">
          <div className="section-label text-muted-foreground flex items-center justify-center gap-1">
            <Activity className="w-3 h-3 text-primary" /> Gas constant
          </div>
          <div className="text-[13px] text-foreground font-medium mt-1">0.008 MATIC</div>
        </div>
        <div className="p-3 text-center">
          <div className="section-label text-muted-foreground flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-primary" /> Verifiers active
          </div>
          <div className="text-[13px] text-foreground font-medium mt-1">1,842 Nodes</div>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="p-4 bg-card text-[11px] leading-relaxed">
        <div className="text-muted-foreground mb-3 border-b border-border pb-2">
          <div>$ ssh tenderchain-gateway.nic.in</div>
          <div>Authorized government audit gateway</div>
          <div>Establishing decentralized channel...</div>
        </div>

        <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
          {txs.map((tx) => (
            <div key={tx.txHash}
              className={`p-3 border transition-colors ${getTxColor(tx.type)}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center space-x-2">
                  <span className="font-medium uppercase text-[10px]">{tx.type.replace(/_/g, " ")}</span>
                  <span className="bg-primary/20 text-primary text-[9px] px-1.5 py-0.2 border border-primary/30 flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" /> Secured
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center space-x-1.5 text-[10px]">
                  <Hash className="w-3 h-3 text-muted-foreground" />
                  <span>Block #{tx.blockNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-border text-muted-foreground text-[10px]">
                <div><span className="text-muted-foreground font-medium">Tx hash: </span>
                  <span>{tx.txHash.substring(0, 16)}...{tx.txHash.substring(48)}</span></div>
                <div><span className="text-muted-foreground font-medium">Wallet: </span>
                  <span>{tx.walletAddress.substring(0, 8)}...{tx.walletAddress.substring(32)}</span></div>
              </div>

              <div className="mt-2 text-[10px] bg-muted/40 p-2 border border-border text-muted-foreground">
                <div className="text-primary font-medium uppercase tracking-wider text-[9px]">Event info</div>
                <div className="text-foreground mt-1 font-medium">{tx.metadata.tenderTitle || "Blockchain event"}</div>
                {tx.metadata.vendorName && (
                  <div className="text-muted-foreground mt-0.5 text-[9px]">Entity: <span className="text-accent font-medium">{tx.metadata.vendorName}</span></div>
                )}
                <div className="text-muted-foreground text-[9px] mt-1.5 flex items-center justify-between">
                  <span>Gas: {tx.gasFee} MATIC</span>
                  <span>{new Date(tx.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};