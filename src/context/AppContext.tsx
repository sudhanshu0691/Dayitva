"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  UserRole, UserProfile, Tender, BlockchainTx, Notification, LiveNewsItem, Bid, AuditStep, TxType 
} from "../types";

interface AppContextProps {
  hydrated: boolean;
  walletConnected: boolean;
  walletAddress: string;
  walletBalance: string;
  userRole: UserRole;
  currentUser: UserProfile | null;
  tenders: Tender[];
  blockchainTxs: BlockchainTx[];
  notifications: Notification[];
  newsFeed: LiveNewsItem[];
  language: "en" | "hi";
  theme: "light" | "dark";
  fontSize: "sm" | "base" | "lg";
  fontScalePercent: number;
  increaseFontScale: () => void;
  decreaseFontScale: () => void;
  resetFontScale: () => void;
  unreadCount: number;
  recentSearches: string[];
  addRecentSearch: (term: string) => void;
  connectWallet: (role: UserRole, customUser?: Partial<UserProfile>) => void;
  disconnectWallet: () => void;
  loginUser: (role: UserRole, profile: Partial<UserProfile>) => void;
  logoutUser: () => void;
  connectWalletOnly: () => void;
  disconnectWalletOnly: () => void;
  publishTender: (tenderData: Omit<Tender, "id" | "txHash" | "blockNumber" | "createdAt" | "bidsCount" | "bids" | "auditTimeline">) => void;
  submitBid: (tenderId: string, price: number, vendorName: string) => void;
  addNotification: (notification: Omit<Notification, "id" | "read" | "timestamp">) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  setLanguage: (lang: "en" | "hi") => void;
  setTheme: (theme: "light" | "dark") => void;
  setFontSize: (size: "sm" | "base" | "lg") => void;
  addTransaction: (type: TxType, metadata: any, wallet?: string) => string;
  registerVendor: (data: any) => void;
  registerOfficer: (data: any) => void;
  updateKYCStatus: (vendorId: string, status: "Pending" | "Under Review" | "Approved" | "Rejected") => void;
  disputeTender: (tenderId: string, disputeText: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);
const SESSION_STORAGE_KEY = "tenderchain.portal.session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24;

interface PersistedPortalState {
  sessionToken: string | null;
  sessionExpiresAt: number | null;
  walletConnected: boolean;
  walletAddress: string;
  walletBalance: string;
  userRole: UserRole;
  currentUser: UserProfile | null;
  notifications: Notification[];
  language: "en" | "hi";
  theme: "light" | "dark";
  fontSize: "sm" | "base" | "lg";
  fontScalePercent?: number;
  recentSearches: string[];
}

// Generate random Tx Hash
const generateHash = () => "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join("");
const generateBlockNumber = () => Math.floor(Math.random() * 50000) + 18240000;
const generateSessionToken = () => "sess_" + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

const initialTenders: Tender[] = [
  {
    id: "TC-MORTH-2026-042",
    title: "Construction of 6-Lane Access Controlled Greenfield Highway (NH-150D)",
    description: "Engineering, Procurement and Construction (EPC) contract for construction of 6-lane access controlled Greenfield highway from km 42.000 to km 76.000 in the State of Maharashtra under Bharatmala Pariyojana.",
    ministry: "Ministry of Road Transport and Highways (MoRTH)",
    budget: 12400000000, // 1240 Crore
    deadline: "2026-06-15T17:00:00.000Z",
    status: "Open",
    msmeQuota: true,
    criteria: [
      "Minimum annual turnover of ₹300 Cr in last 3 financial years",
      "Successful completion of 2 similar highway projects of minimum ₹400 Cr each",
      "Solvency certificate of minimum ₹150 Cr from a scheduled nationalized bank"
    ],
    ipfsHash: "QmYwAPzwh3pC7v7c9N5pab557XWvA8sSS9V5H8S7k1f6pA",
    ipfsFiles: [
      { name: "NH150D_Detailed_Project_Report.pdf", size: "18.4 MB", hash: "QmYwAPzw...", uploadedAt: "2026-05-10T11:20:00Z" },
      { name: "Technical_Specifications_Highway_AnnexureA.pdf", size: "6.2 MB", hash: "QmT9XvN...", uploadedAt: "2026-05-10T11:22:00Z" },
      { name: "Commercial_Bid_Format_EPC_v2.xlsx", size: "1.1 MB", hash: "QmS7XfW...", uploadedAt: "2026-05-10T11:25:00Z" }
    ],
    txHash: "0x892a34fcbe9e89d8123fa409de789234b3e8c023d8dfaef09a8976bcf67a213e",
    blockNumber: 18245903,
    createdAt: "2026-05-10T11:30:00.000Z",
    bidsCount: 2,
    bids: [
      {
        id: "BID-TATA-01",
        tenderId: "TC-MORTH-2026-042",
        vendorName: "Tata Projects Limited",
        vendorAddress: "0x7a3be34fdf89a941f123bc2ef983d98ef756a12c",
        price: 12100000000,
        isEncrypted: true,
        submittedAt: "2026-05-18T10:15:00.000Z",
        txHash: "0x342ae7fcde42b89d81cf8749de781034b3e8c023d8dfaef09a8976bcf42a842b",
        blockNumber: 18247920
      },
      {
        id: "BID-LNT-02",
        tenderId: "TC-MORTH-2026-042",
        vendorName: "Larsen & Toubro Infra",
        vendorAddress: "0x893d7c49ef87fdf8234bc09fa782b3d8ef45fc49",
        price: 12350000000,
        isEncrypted: true,
        submittedAt: "2026-05-22T14:40:00.000Z",
        txHash: "0xec29e349fd84aefc2ef7849de781034b3e8c023d8dfaef09a8976bcf89bc9ef7",
        blockNumber: 18251203
      }
    ],
    auditTimeline: [
      { id: "AUD-1", title: "Tender Created", description: "Drafted by Highway Division Section Officer", timestamp: "2026-05-10T09:15:00.000Z", iconType: "created" },
      { id: "AUD-2", title: "Tender Published", description: "Smart contract deployed and broadcast on TenderChain", timestamp: "2026-05-10T11:30:00.000Z", txHash: "0x892a34fcbe9e89d8123fa409de789234b3e8c023d8dfaef09a8976bcf67a213e", iconType: "published" },
      { id: "AUD-3", title: "Bid Submitted (Tata Projects)", description: "Encrypted payload stored with IPFS reference", timestamp: "2026-05-18T10:15:00.000Z", txHash: "0x342ae7fcde42b89d81cf8749de781034b3e8c023d8dfaef09a8976bcf42a842b", iconType: "bid_submitted" },
      { id: "AUD-4", title: "Bid Submitted (Larsen & Toubro)", description: "Encrypted payload stored with IPFS reference", timestamp: "2026-05-22T14:40:00.000Z", txHash: "0xec29e349fd84aefc2ef7849de781034b3e8c023d8dfaef09a8976bcf89bc9ef7", iconType: "bid_submitted" }
    ],
    isNew: true
  },
  {
    id: "TC-RAIL-2026-015",
    title: "Smart Solar Power Grids & Modernization of 25 Central Railway Stations",
    description: "Design, supply, installation, testing and commissioning of smart roof-top solar power grids (aggregate capacity 50 MWp) under net-metering scheme for 25 high-density central railway stations.",
    ministry: "Ministry of Railways",
    budget: 4500000000, // 450 Crore
    deadline: "2026-06-02T12:00:00.000Z",
    status: "Under Evaluation",
    msmeQuota: true,
    criteria: [
      "Registered solar energy service company (RESCO) with SECI rating",
      "Cumulative installation of 30 MWp rooftop grids in government or PSU buildings",
      "Audited net worth of ₹50 Cr in current financial year"
    ],
    ipfsHash: "QmRE73pX98S7k1f6pAQmYwAPzwh3pC7v7c9N5pab557XWvA",
    ipfsFiles: [
      { name: "Solar_Grid_Feasibility_Report.pdf", size: "12.1 MB", hash: "QmRE73p...", uploadedAt: "2026-04-12T14:10:00Z" },
      { name: "Station_Roof_Shed_Structural_Drawings.pdf", size: "24.5 MB", hash: "QmP88Xf...", uploadedAt: "2026-04-12T14:15:00Z" }
    ],
    txHash: "0xfa1239cdef892a4bc03df7a1cf82a89de34f023be8dfaef09a8976bcf672ba21",
    blockNumber: 18210341,
    createdAt: "2026-04-12T15:00:00.000Z",
    bidsCount: 3,
    bids: [
      {
        id: "BID-RENEW-01",
        tenderId: "TC-RAIL-2026-015",
        vendorName: "ReNew Power Green",
        vendorAddress: "0x892bcde73fa89d8123fa409de789234b3e8c023d",
        price: 432000000,
        isEncrypted: false, // Auto decrypted as evaluation started
        submittedAt: "2026-05-01T09:10:00.000Z",
        txHash: "0x892a10c9bf8ef346caef198bd82ef756ae1dcfbcdaef09a8976bcf8912efbc34",
        blockNumber: 18221432
      },
      {
        id: "BID-ADANI-02",
        tenderId: "TC-RAIL-2026-015",
        vendorName: "Adani Green Energy Ltd",
        vendorAddress: "0x9812bc67da789efc34dfcf45be23da89debc4561",
        price: 445000000,
        isEncrypted: false,
        submittedAt: "2026-05-03T11:45:00.000Z",
        txHash: "0xce9182abcdf89aeff129038ba98df123be8dfaef09a8976bcf5618cdbce9842a",
        blockNumber: 18224590
      },
      {
        id: "BID-STERL-03",
        tenderId: "TC-RAIL-2026-015",
        vendorName: "Sterling & Wilson Solar",
        vendorAddress: "0x6713bc49efa89d8ef92cf34dcfde023ba98de789",
        price: 418000000,
        isEncrypted: false,
        submittedAt: "2026-05-05T16:20:00.000Z",
        txHash: "0x12a8bcd49efaef097cf8bc29defa93dbce2a8cd023dfaef09a8976bcf671239c",
        blockNumber: 18228122
      }
    ],
    auditTimeline: [
      { id: "AUD-15-1", title: "Tender Created", description: "Drafted by Railway Electrification Section", timestamp: "2026-04-12T10:10:00.000Z", iconType: "created" },
      { id: "AUD-15-2", title: "Tender Published", description: "Tender contract deployed on-chain", timestamp: "2026-04-12T15:00:00.000Z", txHash: "0xfa1239cdef892a4bc03df7a1cf82a89de34f023be8dfaef09a8976bcf672ba21", iconType: "published" },
      { id: "AUD-15-3", title: "Bidding Cycle Concluded", description: "Bidding window automatically closed based on block timestamp", timestamp: "2026-05-10T12:00:00.000Z", iconType: "evaluation" },
      { id: "AUD-15-4", title: "Automated Decryption Key Released", description: "Smart contract zero-knowledge reveal executed; key split aggregated", timestamp: "2026-05-10T12:01:00.000Z", txHash: "0x98124efcbde9e81cdf93ef76823caef781a9bd123dafe09a8976bcfaebc12cf3", iconType: "evaluation" },
      { id: "AUD-15-5", title: "Technical Evaluation Started", description: "Ministry Selection Committee verifying uploaded technical specs", timestamp: "2026-05-12T09:00:00.000Z", iconType: "evaluation" }
    ]
  },
  {
    id: "TC-MINDEF-2026-009",
    title: "Procurement of Tactical Software Defined Radios (SDR-T) for Defence Forces",
    description: "Design, development, and supply of 1,200 units of secure, high-throughput, jam-resistant Software Defined Radios (Tactical) for multi-band wireless secure military communication.",
    ministry: "Ministry of Defence",
    budget: 8900000000, // 890 Crore
    deadline: "2026-05-20T17:00:00.000Z",
    status: "Closed",
    msmeQuota: false,
    criteria: [
      "Indigenous Indian enterprise complying with 'Make in India' Class-1 local supplier rules",
      "Possession of valid Industrial License for defence communication manufacturing",
      "DRDO or military certified prototype for military-grade environmental compliance"
    ],
    ipfsHash: "QmSDR11T73pX98S7k1f6pAQmYwAPzwh3pC7v7c9N5pab5",
    ipfsFiles: [
      { name: "SDR-T_Technical_Qualitative_Requirements.pdf", size: "8.4 MB", hash: "QmSDR1...", uploadedAt: "2026-03-25T11:05:00Z" },
      { name: "Security_Protocols_SDR_Annexure_SECRET.pdf", size: "3.2 MB", hash: "QmSec99...", uploadedAt: "2026-03-25T11:08:00Z" }
    ],
    txHash: "0xcd291a38fcbde28cd37faef1cf0a84ef34fe023be8dfaef09a8976bcfe89bc21",
    blockNumber: 18195123,
    createdAt: "2026-03-25T11:15:00.000Z",
    bidsCount: 1,
    bids: [
      {
        id: "BID-BEL-01",
        tenderId: "TC-MINDEF-2026-009",
        vendorName: "Bharat Electronics Limited (BEL)",
        vendorAddress: "0x123bc891a27e3f89a9fde02cfdf32a89de456891",
        price: 885000000,
        isEncrypted: false,
        submittedAt: "2026-05-15T15:30:00.000Z",
        txHash: "0x7812bc4efde89a3fcdecf879de7812bc89faed2389cf789bcde2489e8cfbdaef",
        blockNumber: 18239023
      }
    ],
    auditTimeline: [
      { id: "AUD-9-1", title: "Tender Created", description: "Created by Defence Procurement Board", timestamp: "2026-03-25T08:30:00.000Z", iconType: "created" },
      { id: "AUD-9-2", title: "Tender Published on Chain", description: "Published on-chain under contract DefenceTenderV1", timestamp: "2026-03-25T11:15:00.000Z", txHash: "0xcd291a38fcbde28cd37faef1cf0a84ef34fe023be8dfaef09a8976bcfe89bc21", iconType: "published" },
      { id: "AUD-9-3", title: "Bid Submitted (BEL)", description: "Indian PSU Bharat Electronics Limited submitted sealed bid", timestamp: "2026-05-15T15:30:00.000Z", txHash: "0x7812bc4efde89a3fcdecf879de7812bc89faed2389cf789bcde2489e8cfbdaef", iconType: "bid_submitted" },
      { id: "AUD-9-4", title: "Bidding Concluded", description: "Closed; waiting for committee setup and evaluation parameters", timestamp: "2026-05-20T17:00:00.000Z", iconType: "evaluation" }
    ]
  },
  {
    id: "TC-MEITY-2026-003",
    title: "AI-Powered National Data Governance Cloud & Hosting Infrastructure",
    description: "Design and implementation of cloud-based server hosting infrastructure with containerized deployment pipeline, multi-region failover, and built-in AI governance tools to ensure metadata privacy across government datasets.",
    ministry: "Ministry of Electronics and Information Technology (MeitY)",
    budget: 1800000000, // 180 Crore
    deadline: "2026-04-10T17:00:00.000Z",
    status: "Awarded",
    msmeQuota: true,
    criteria: [
      "MeitY empanelled Cloud Service Provider (CSP) status with Tier-IV data center in India",
      "Experience of hosting at least 3 state-level or national portals of size > 50 TB each",
      "ISO 27001, 27017, and 27018 certifications for cloud privacy and information security"
    ],
    ipfsHash: "QmCloudHosting73pX98S7k1f6pAQmYwAPzwh3pC7v7c9N5pa",
    ipfsFiles: [
      { name: "Cloud_Hosting_Specifications_Data_Center_TIV.pdf", size: "5.4 MB", hash: "QmCloud...", uploadedAt: "2026-02-15T10:00:00Z" },
      { name: "AI_Privacy_Governance_Compliance_SLA.pdf", size: "4.1 MB", hash: "QmAIPriv...", uploadedAt: "2026-02-15T10:05:00Z" }
    ],
    txHash: "0xdaef139cdef2bcde89aeff138ba78fde34f023be8dfaef09a8976bcf6712bcde",
    blockNumber: 18121094,
    createdAt: "2026-02-15T10:15:00.000Z",
    bidsCount: 2,
    bids: [
      {
        id: "BID-NICSI-01",
        tenderId: "TC-MEITY-2026-003",
        vendorName: "NICSI (National Informatics Centre Services Inc.)",
        vendorAddress: "0x00NICSI892bcde73fa89d8123fa409de789234b3e",
        price: 1780000000,
        isEncrypted: false,
        submittedAt: "2026-03-25T11:10:00.000Z",
        txHash: "0xab892a7fcde489aefcf198de78ef756aedcfbcae02eef09a8976bcf129038baec",
        blockNumber: 18145920
      },
      {
        id: "BID-WIPRO-02",
        tenderId: "TC-MEITY-2026-003",
        vendorName: "Wipro Technologies Ltd",
        vendorAddress: "0x98bcde72fdfa49bcdef784aef09fa82ef89bc456",
        price: 1720000000,
        isEncrypted: false,
        submittedAt: "2026-03-28T16:45:00.000Z",
        txHash: "0x892a7fcbe8efaef0129bcde9a8cf713bc49efa89d8ef92cf34dcfde023ba98de",
        blockNumber: 18151240
      }
    ],
    winnerAddress: "0x98bcde72fdfa49bcdef784aef09fa82ef89bc456",
    winnerPrice: 1720000000,
    winnerName: "Wipro Technologies Ltd",
    auditTimeline: [
      { id: "AUD-3-1", title: "Tender Created", description: "Created by National e-Governance Division (NeGD)", timestamp: "2026-02-15T09:00:00.000Z", iconType: "created" },
      { id: "AUD-3-2", title: "Tender Published", description: "Smart contract deployed", timestamp: "2026-02-15T10:15:00.000Z", txHash: "0xdaef139cdef2bcde89aeff138ba78fde34f023be8dfaef09a8976bcf6712bcde", iconType: "published" },
      { id: "AUD-3-3", title: "Bid Submitted (NICSI)", description: "NICSI submitted a sealed bid", timestamp: "2026-03-25T11:10:00.000Z", txHash: "0xab892a7fcde489aefcf198de78ef756aedcfbcae02eef09a8976bcf129038baec", iconType: "bid_submitted" },
      { id: "AUD-3-4", title: "Bid Submitted (Wipro)", description: "Wipro Technologies submitted a sealed bid", timestamp: "2026-03-28T16:45:00.000Z", txHash: "0x892a7fcbe8efaef0129bcde9a8cf713bc49efa89d8ef92cf34dcfde023ba98de", iconType: "bid_submitted" },
      { id: "AUD-3-5", title: "Smart Contract Decryption", description: "Revealed and sorted bidding bids on-chain automatically", timestamp: "2026-04-10T17:05:00.000Z", iconType: "evaluation" },
      { id: "AUD-3-6", title: "Smart Contract Execution: Winner Declared", description: "Wipro Technologies Ltd (0x98bcde...) declared winner automatically as lowest-price technical complying bidder (L1)", timestamp: "2026-04-15T11:30:00.000Z", txHash: "0x789acde98fdfa34bcdef92a4cf8923a102bcdef89daef09a8976bcfe89bc2132", iconType: "completed" }
    ]
  }
];

const initialTransactions: BlockchainTx[] = [
  {
    txHash: "0x789acde98fdfa34bcdef92a4cf8923a102bcdef89daef09a8976bcfe89bc2132",
    blockNumber: 18125910,
    gasFee: 0.0124,
    timestamp: "2026-04-15T11:30:00.000Z",
    walletAddress: "0x12a8bc43def9a7812bcde78bcdaef90123ae89bd",
    type: "WINNER_DECLARED",
    status: "success",
    metadata: {
      tenderId: "TC-MEITY-2026-003",
      tenderTitle: "AI-Powered National Data Governance Cloud",
      vendorName: "Wipro Technologies Ltd",
      bidAmount: 1720000000
    }
  },
  {
    txHash: "0xec29e349fd84aefc2ef7849de781034b3e8c023d8dfaef09a8976bcf89bc9ef7",
    blockNumber: 18251203,
    gasFee: 0.0098,
    timestamp: "2026-05-22T14:40:00.000Z",
    walletAddress: "0x893d7c49ef87fdf8234bc09fa782b3d8ef45fc49",
    type: "BID_SUBMITTED",
    status: "success",
    metadata: {
      tenderId: "TC-MORTH-2026-042",
      tenderTitle: "Construction of 6-Lane Access Controlled Greenfield Highway",
      vendorName: "Larsen & Toubro Infra"
    }
  },
  {
    txHash: "0x342ae7fcde42b89d81cf8749de781034b3e8c023d8dfaef09a8976bcf42a842b",
    blockNumber: 18247920,
    gasFee: 0.0102,
    timestamp: "2026-05-18T10:15:00.000Z",
    walletAddress: "0x7a3be34fdf89a941f123bc2ef983d98ef756a12c",
    type: "BID_SUBMITTED",
    status: "success",
    metadata: {
      tenderId: "TC-MORTH-2026-042",
      tenderTitle: "Construction of 6-Lane Access Controlled Greenfield Highway",
      vendorName: "Tata Projects Limited"
    }
  },
  {
    txHash: "0x892a34fcbe9e89d8123fa409de789234b3e8c023d8dfaef09a8976bcf67a213e",
    blockNumber: 18245903,
    gasFee: 0.0145,
    timestamp: "2026-05-10T11:30:00.000Z",
    walletAddress: "0x12a8bc43def9a7812bcde78bcdaef90123ae89bd",
    type: "TENDER_PUBLISHED",
    status: "success",
    metadata: {
      tenderId: "TC-MORTH-2026-042",
      tenderTitle: "Construction of 6-Lane Access Controlled Greenfield Highway"
    }
  }
];

const initialNotifications: Notification[] = [
  {
    id: "N-01",
    title: "New Tender Published",
    message: "Ministry of Road Transport (MoRTH) published a new highway project under Bharatmala program.",
    category: "tender",
    read: false,
    timestamp: "2026-05-28T00:10:00.000Z",
    actionUrl: "/tenders/TC-MORTH-2026-042"
  },
  {
    id: "N-02",
    title: "Smart Contract Decryption Key Scheduled",
    message: "Decryption for Solar Modernization tender (TC-RAIL-2026-015) is scheduled in 5 days.",
    category: "system",
    read: false,
    timestamp: "2026-05-27T18:30:00.000Z",
    actionUrl: "/tenders/TC-RAIL-2026-015"
  },
  {
    id: "N-03",
    title: "KYC Approved",
    message: "Your Vendor KYC registration documents have been verified and approved on the blockchain.",
    category: "kyc",
    read: true,
    timestamp: "2026-05-25T11:00:00.000Z",
    actionUrl: "/vendor/profile"
  }
];

const initialRecentSearches = ["Greenfield Highway", "Solar Grid", "Ministry of Railways"];

const initialNews: LiveNewsItem[] = [
  {
    id: "NEWS-1",
    title: "Finance Ministry Mandates Blockchain Security Audits for Procurement Portals Above ₹100 Crore",
    source: "Press Information Bureau (PIB)",
    timestamp: "2026-05-27T08:00:00.000Z",
    category: "Reform",
    url: "#"
  },
  {
    id: "NEWS-2",
    title: "Decentralized IPFS Storage for Technical Specifications Integrates with GeM & TenderChain",
    source: "MeitY News",
    timestamp: "2026-05-26T14:30:00.000Z",
    category: "Blockchain",
    url: "#"
  },
  {
    id: "NEWS-3",
    title: "Indian Railways Announces ₹5,000 Crore Station Modernization Plan under Net-Zero Solar Initiative",
    source: "Ministry of Railways",
    timestamp: "2026-05-25T11:15:00.000Z",
    category: "Ministry",
    url: "#"
  },
  {
    id: "NEWS-4",
    title: "TenderChain Surpasses 2.4 Million Tamper-Proof Procurement Contracts Deployed On-chain",
    source: "TechGov India",
    timestamp: "2026-05-24T09:45:00.000Z",
    category: "Announcement",
    url: "#"
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<string>("0.00 MATIC");
  const [userRole, setUserRole] = useState<UserRole>("public");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  const [tenders, setTenders] = useState<Tender[]>(initialTenders);
  const [blockchainTxs, setBlockchainTxs] = useState<BlockchainTx[]>(initialTransactions);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [newsFeed, setNewsFeed] = useState<LiveNewsItem[]>(initialNews);
  
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [fontScalePercent, setFontScalePercent] = useState<number>(100);
  const [recentSearches, setRecentSearches] = useState<string[]>(initialRecentSearches);

  const unreadCount = notifications.filter(n => !n.read).length;

  const issueSession = () => {
    const token = generateSessionToken();
    const expiry = Date.now() + SESSION_TTL_MS;
    setSessionToken(token);
    setSessionExpiresAt(expiry);
    return { token, expiry };
  };

  const clearSession = () => {
    setSessionToken(null);
    setSessionExpiresAt(null);
  };

  const snapshotState = (): PersistedPortalState => ({
    sessionToken,
    sessionExpiresAt,
    walletConnected,
    walletAddress,
    walletBalance,
    userRole,
    currentUser,
    notifications,
    language,
    theme,
    fontSize,
    fontScalePercent,
    recentSearches,
  });

  const restoreFromSnapshot = (snapshot: PersistedPortalState) => {
    setSessionToken(snapshot.sessionToken);
    setSessionExpiresAt(snapshot.sessionExpiresAt);
    setWalletConnected(snapshot.walletConnected);
    setWalletAddress(snapshot.walletAddress);
    setWalletBalance(snapshot.walletBalance);
    setUserRole(snapshot.userRole);
    setCurrentUser(snapshot.currentUser);
    setNotifications(snapshot.notifications?.length ? snapshot.notifications : initialNotifications);
    setLanguage(snapshot.language || "en");
    setTheme(snapshot.theme || "dark");
    setFontSize(snapshot.fontSize || "base");
    setFontScalePercent(snapshot.fontScalePercent || 100);
    setRecentSearches(snapshot.recentSearches?.length ? snapshot.recentSearches : initialRecentSearches);
  };

  // Sync dark mode class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    // ensure font scale CSS variable is present
    root.style.setProperty("--app-font-scale", String(fontScalePercent));
  }, [theme]);

  // sync font scale CSS variable whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.document.documentElement.style.setProperty("--app-font-scale", String(fontScalePercent));
  }, [fontScalePercent]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const persistedRaw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (persistedRaw) {
      try {
        const persisted = JSON.parse(persistedRaw) as PersistedPortalState;
        if (persisted.sessionExpiresAt && persisted.sessionExpiresAt > Date.now()) {
          restoreFromSnapshot(persisted);
        } else {
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;

    const payload = snapshotState();
    if (!payload.sessionToken || !payload.sessionExpiresAt || payload.sessionExpiresAt <= Date.now()) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        ...payload,
        sessionToken: null,
        sessionExpiresAt: null,
      }));
      return;
    }

    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  }, [hydrated, sessionToken, sessionExpiresAt, walletConnected, walletAddress, walletBalance, userRole, currentUser, notifications, language, theme, fontSize, recentSearches]);

  useEffect(() => {
    if (!hydrated || !sessionToken || !sessionExpiresAt) return;
    if (sessionExpiresAt > Date.now()) return;

    setWalletConnected(false);
    setWalletAddress("");
    setWalletBalance("0.00 MATIC");
    setUserRole("public");
    setCurrentUser(null);
    setNotifications(initialNotifications);
    clearSession();
  }, [hydrated, sessionToken, sessionExpiresAt]);

  // Periodic mock transaction feed simulation to show "live block updates"
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate other random network activity
      const transactionTypes: TxType[] = ["SMART_CONTRACT_EXECUTED", "BID_SUBMITTED", "KYC_APPROVED"];
      const ministries = ["Min. of Defense", "Min. of Railways", "MoRTH", "MeitY", "Min. of Jal Shakti"];
      const randomMinistry = ministries[Math.floor(Math.random() * ministries.length)];
      const randomType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const vendors = ["L&T Construction", "Shapoorji Pallonji", "Tata Projects", "Bharat Electronics", "Wipro Cloud"];
      const randomVendor = vendors[Math.floor(Math.random() * vendors.length)];
      
      const newTx: BlockchainTx = {
        txHash: generateHash(),
        blockNumber: generateBlockNumber(),
        gasFee: parseFloat((Math.random() * 0.015 + 0.002).toFixed(5)),
        timestamp: new Date().toISOString(),
        walletAddress: "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(""),
        type: randomType,
        status: "success",
        metadata: {
          tenderTitle: `${randomType === "KYC_APPROVED" ? "KYC Verification Approved" : "Procurement Security Contract Update"} - ${randomMinistry}`,
          vendorName: randomType !== "TENDER_PUBLISHED" ? randomVendor : undefined,
          bidAmount: randomType === "BID_SUBMITTED" ? Math.floor(Math.random() * 5000 + 100) * 1000000 : undefined
        }
      };

      setBlockchainTxs(prev => [newTx, ...prev.slice(0, 19)]);
    }, 25000); // add a tx every 25 seconds

    return () => clearInterval(interval);
  }, []);

  const addRecentSearch = (term: string) => {
    if (!term.trim()) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== term.toLowerCase());
      return [term, ...filtered.slice(0, 4)];
    });
  };

  const decreaseFontScale = () => {
    setFontScalePercent(prev => Math.max(60, Math.round(prev - 2)));
  };

  const increaseFontScale = () => {
    setFontScalePercent(prev => Math.min(200, Math.round(prev + 2)));
  };

  const resetFontScale = () => {
    setFontScalePercent(100);
  };

  const addTransaction = (type: TxType, metadata: any, wallet?: string): string => {
    const hash = generateHash();
    const newTx: BlockchainTx = {
      txHash: hash,
      blockNumber: generateBlockNumber(),
      gasFee: 0.0084,
      timestamp: new Date().toISOString(),
      walletAddress: wallet || walletAddress || "0x12a8bc43def9a7812bcde78bcdaef90123ae89bd",
      type,
      status: "success",
      metadata
    };
    setBlockchainTxs(prev => [newTx, ...prev]);
    return hash;
  };

  const addNotification = (n: Omit<Notification, "id" | "read" | "timestamp">) => {
    const newN: Notification = {
      ...n,
      id: "N-" + Date.now(),
      read: false,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newN, ...prev]);
  };

  const connectWallet = (role: UserRole, customUser?: Partial<UserProfile>) => {
    const address = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join("");
    setWalletConnected(true);
    setWalletAddress(address);
    setWalletBalance((Math.random() * 100 + 50).toFixed(4) + " MATIC");
    setUserRole(role);
    issueSession();

    // Setup active mock user profile
    if (role === "officer") {
      const officer: UserProfile = {
        id: customUser?.id || "OFFICER-7712",
        name: customUser?.name || "Shri Rajesh Kumar",
        email: customUser?.email || "rajesh.kumar77@nic.in",
        role: "officer",
        designation: customUser?.designation || "Director (Procurement / Greenfield NH)",
        ministry: customUser?.ministry || "Ministry of Road Transport and Highways",
        ministryCode: customUser?.ministryCode || "MORTH-IND",
        permissions: customUser?.permissions || ["CREATE_TENDER", "PUBLISH_BLOCKCHAIN", "REVIEW_TECHNICAL_BIDS", "APPROVE_KYC"],
        deviceInfo: "NIC Secured Workstation (Dell OptiPlex)",
        ipAddress: "10.14.89.201 (NICNET VPN)",
        timestamp: new Date().toISOString()
      };
      setCurrentUser(officer);
      addNotification({
        title: "Secured Officer Session Initiated",
        message: "Logged in via Aadhaar e-sign credential. Session ID verified on blockchain ledger.",
        category: "system",
        actionUrl: "/admin/profile"
      });
      addTransaction("WALLET_CONNECTED", { tenderTitle: "Officer Wallet Connect", vendorName: "Aadhaar e-Signed" }, address);
    } else if (role === "vendor") {
      const vendor: UserProfile = {
        id: customUser?.id || "VENDOR-LNT-48",
        name: customUser?.name || "L&T Infrastructure Services",
        email: customUser?.email || "bid-ops@lntecc.com",
        role: "vendor",
        companyName: customUser?.companyName || "Larsen & Toubro Ltd",
        regNumber: customUser?.regNumber || "CIN-L99999MH1946PLC004768",
        pan: customUser?.pan || "AAACL8394E",
        gst: customUser?.gst || "27AAACL8394E1ZN",
        kycStatus: customUser?.kycStatus || "Approved",
        turnover: "₹42,150 Crore (FY 2024-25)",
        itrYears: ["2023", "2024", "2025"],
        solvencyCertificate: "Nationalized Bank Solvency Certified",
        deviceInfo: "Authorized Corporate Key (MacBook Pro M3)",
        ipAddress: "115.112.44.18",
        timestamp: new Date().toISOString()
      };
      setCurrentUser(vendor);
      addNotification({
        title: "Vendor Secure Workspace Connected",
        message: "Successfully connected company cold wallet (MetaMask) and verified KYC credentials.",
        category: "system",
        actionUrl: "/vendor/profile"
      });
      addTransaction("WALLET_CONNECTED", { tenderTitle: "Corporate Vendor Wallet Connect", vendorName: vendor.companyName }, address);
    } else {
      const citizen: UserProfile = {
        id: "CITIZEN-9921",
        name: "Citizen / Auditor Account",
        email: "auditor.verify@india.gov.in",
        role: "public"
      };
      setCurrentUser(citizen);
      addNotification({
        title: "Public Audit Portal Activated",
        message: "You have read-only auditor access. All blockchain smart contract references are fully queryable.",
        category: "system"
      });
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress("");
    setWalletBalance("0.00 MATIC");
    setUserRole("public");
    setCurrentUser(null);
  };

  const loginUser = (role: UserRole, profile: Partial<UserProfile>) => {
    setUserRole(role);
    setWalletConnected(false);
    setWalletAddress("");
    setWalletBalance("0.00 MATIC");
    issueSession();

    if (role === "officer") {
      const officer: UserProfile = {
        id: profile.id || "OFFICER-7712",
        name: profile.name || "Shri Rajesh Kumar",
        email: profile.email || "rajesh.kumar77@nic.in",
        role: "officer",
        designation: profile.designation || "Director (Procurement / Greenfield NH)",
        ministry: profile.ministry || "Ministry of Road Transport and Highways",
        ministryCode: profile.ministryCode || "MORTH-IND",
        permissions: profile.permissions || ["CREATE_TENDER", "PUBLISH_BLOCKCHAIN", "REVIEW_TECHNICAL_BIDS", "APPROVE_KYC"],
        deviceInfo: "NIC Secured Workstation (Dell OptiPlex)",
        ipAddress: "10.14.89.201 (NICNET VPN)",
        timestamp: new Date().toISOString()
      };
      setCurrentUser(officer);
      addNotification({
        title: "Secured Officer Session Initiated",
        message: "Logged in via credentials / Aadhaar e-sign. Connect your Web3 wallet to authorize actions.",
        category: "system",
        actionUrl: "/admin/profile"
      });
    } else if (role === "vendor") {
      const vendor: UserProfile = {
        id: profile.id || "VENDOR-LNT-48",
        name: profile.name || "L&T Infrastructure Services",
        email: profile.email || "bid-ops@lntecc.com",
        role: "vendor",
        companyName: profile.companyName || "Larsen & Toubro Ltd",
        regNumber: profile.regNumber || "CIN-L99999MH1946PLC004768",
        pan: profile.pan || "AAACL8394E",
        gst: profile.gst || "27AAACL8394E1ZN",
        kycStatus: profile.kycStatus || "Approved",
        turnover: "₹42,150 Crore (FY 2024-25)",
        itrYears: ["2023", "2024", "2025"],
        solvencyCertificate: "Nationalized Bank Solvency Certified",
        deviceInfo: "Authorized Corporate Key (MacBook Pro M3)",
        ipAddress: "115.112.44.18",
        timestamp: new Date().toISOString()
      };
      setCurrentUser(vendor);
      addNotification({
        title: "Vendor Secure Workspace Active",
        message: "Successfully logged in. Please connect your MetaMask wallet to initiate bidding actions.",
        category: "system",
        actionUrl: "/vendor/profile"
      });
    } else {
      const citizen: UserProfile = {
        id: profile.id || "CITIZEN-9921",
        name: profile.name || "Citizen / Auditor Account",
        email: profile.email || "auditor.verify@india.gov.in",
        role: "public"
      };
      setCurrentUser(citizen);
      addNotification({
        title: "Public Audit Portal Activated",
        message: "You have read-only auditor access. No wallet required.",
        category: "system"
      });
    }
  };

  const logoutUser = () => {
    setWalletConnected(false);
    setWalletAddress("");
    setWalletBalance("0.00 MATIC");
    setUserRole("public");
    setCurrentUser(null);
    setNotifications(initialNotifications);
    setRecentSearches(initialRecentSearches);
    clearSession();
  };

  const connectWalletOnly = () => {
    if (!currentUser || currentUser.role === "public") return;
    const address = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join("");
    setWalletConnected(true);
    setWalletAddress(address);
    setWalletBalance((Math.random() * 100 + 50).toFixed(4) + " MATIC");
    if (!sessionToken) issueSession();
    
    addNotification({
      title: "MetaMask Wallet Connected",
      message: `On-chain wallet address ${address.substring(0, 6)}...${address.substring(34)} successfully linked to session.`,
      category: "system"
    });
    addTransaction("WALLET_CONNECTED", { tenderTitle: `${currentUser.role === "officer" ? "Officer" : "Vendor"} Wallet Connect`, vendorName: currentUser.name }, address);
  };

  const disconnectWalletOnly = () => {
    setWalletConnected(false);
    setWalletAddress("");
    setWalletBalance("0.00 MATIC");
    addNotification({
      title: "Wallet Disconnected",
      message: "Your Web3 wallet has been unlinked. Session remains active.",
      category: "system"
    });
  };

  const publishTender = (tenderData: Omit<Tender, "id" | "txHash" | "blockNumber" | "createdAt" | "bidsCount" | "bids" | "auditTimeline">) => {
    const tenderId = "TC-" + tenderData.ministry.substring(12, 16).toUpperCase().replace(" ", "") + "-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 900 + 100);
    const txHash = generateHash();
    const blockNumber = generateBlockNumber();
    const createdAt = new Date().toISOString();

    const newTender: Tender = {
      ...tenderData,
      id: tenderId,
      txHash,
      blockNumber,
      createdAt,
      bidsCount: 0,
      bids: [],
      auditTimeline: [
        { id: "AUD-" + Date.now() + "-1", title: "Tender Drafted", description: `Tender created by ${currentUser?.name || "Officer"}`, timestamp: createdAt, iconType: "created" },
        { id: "AUD-" + Date.now() + "-2", title: "Tender Sealed on Blockchain", description: `Published on-chain with IPFS hash ${tenderData.ipfsHash}`, timestamp: createdAt, txHash, iconType: "published" }
      ],
      isNew: true
    };

    setTenders(prev => [newTender, ...prev]);
    
    // Add transaction record
    addTransaction("TENDER_PUBLISHED", {
      tenderId,
      tenderTitle: tenderData.title
    });

    // Notify registered vendors in real-time
    addNotification({
      title: "🚨 LIVE TENDER: " + tenderData.title,
      message: `A new tender has been published on-chain by ${tenderData.ministry}. Review specs and submit encrypted bids.`,
      category: "tender",
      actionUrl: `/tenders/${tenderId}`
    });
  };

  const submitBid = (tenderId: string, price: number, vendorName: string) => {
    const txHash = generateHash();
    const blockNumber = generateBlockNumber();
    const bidId = "BID-" + vendorName.substring(0, 4).toUpperCase() + "-" + Math.floor(Math.random() * 90 + 10);
    const submittedAt = new Date().toISOString();

    const newBid: Bid = {
      id: bidId,
      tenderId,
      vendorName,
      vendorAddress: walletAddress || "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(""),
      price,
      isEncrypted: true,
      submittedAt,
      txHash,
      blockNumber
    };

    setTenders(prev => prev.map(t => {
      if (t.id === tenderId) {
        const updatedBids = [...t.bids, newBid];
        const updatedTimeline = [
          ...t.auditTimeline,
          {
            id: "AUD-" + Date.now(),
            title: "Encrypted Bid Submitted",
            description: `Sealed bid hash locked for ${vendorName}`,
            timestamp: submittedAt,
            txHash,
            iconType: "bid_submitted" as const
          }
        ];
        return {
          ...t,
          bidsCount: updatedBids.length,
          bids: updatedBids,
          auditTimeline: updatedTimeline
        };
      }
      return t;
    }));

    // Add transaction record
    addTransaction("BID_SUBMITTED", {
      tenderId,
      tenderTitle: tenders.find(t => t.id === tenderId)?.title || "Decentralized Tender",
      vendorName,
      bidAmount: price
    });

    // Notify Officer who created tender (simulated)
    addNotification({
      title: `📨 New Sealed Bid: ${tenders.find(t => t.id === tenderId)?.title}`,
      message: `Vendor '${vendorName}' submitted an encrypted bid. Bids count is now ${tenders.find(t => t.id === tenderId)!.bidsCount + 1}.`,
      category: "bid",
      actionUrl: `/tenders/${tenderId}`
    });
  };

  const registerVendor = (data: any) => {
    const mockVendor: UserProfile = {
      id: "VENDOR-" + Math.floor(Math.random() * 9000 + 1000),
      name: data.companyName,
      email: data.contactEmail,
      role: "vendor",
      companyName: data.companyName,
      regNumber: data.regNumber,
      pan: data.pan,
      gst: data.gst,
      kycStatus: "Under Review",
      turnover: "₹" + data.turnover + " Crore",
      itrYears: ["2024", "2025"],
      solvencyCertificate: "Bank solvency uploaded",
      deviceInfo: navigator.userAgent,
      ipAddress: "122.160.112.4",
      timestamp: new Date().toISOString()
    };
    setCurrentUser(mockVendor);
    setWalletConnected(false);
    setWalletAddress("");
    setWalletBalance("0.00 MATIC");
    setUserRole("vendor");
    issueSession();

    addNotification({
      title: "Registration Submitted Successfully",
      message: "Your vendor KYC documents are submitted and pending blockchain officer verification.",
      category: "kyc"
    });
  };

  const registerOfficer = (data: any) => {
    const mockOfficer: UserProfile = {
      id: data.officerId || "OFFICER-" + Math.floor(Math.random() * 9000 + 1000),
      name: data.fullName,
      email: data.officerEmail,
      role: "officer",
      designation: data.designation,
      ministry: data.ministryCode + " - India Secretariat",
      permissions: data.permissions || ["CREATE_TENDER", "PUBLISH_BLOCKCHAIN"],
      deviceInfo: navigator.userAgent,
      ipAddress: "10.42.12.89",
      timestamp: new Date().toISOString()
    };
    setCurrentUser(mockOfficer);
    setWalletConnected(false);
    setWalletAddress("");
    setWalletBalance("0.00 MATIC");
    setUserRole("officer");
    issueSession();

    addNotification({
      title: "Officer Verified On-Chain",
      message: "Security clearance granted. Your blockchain administrative keys have been activated.",
      category: "system"
    });
  };

  const updateKYCStatus = (vendorId: string, status: "Pending" | "Under Review" | "Approved" | "Rejected") => {
    if (currentUser?.role === "officer") {
      addNotification({
        title: `Vendor KYC Status Update: ${status}`,
        message: `Vendor ${vendorId} KYC has been set to '${status}' by administrative officer.`,
        category: "kyc"
      });
      addTransaction("KYC_APPROVED", { vendorName: vendorId, tenderTitle: `KYC set to ${status}` });
    }
  };

  const disputeTender = (tenderId: string, disputeText: string) => {
    const txHash = addTransaction("SMART_CONTRACT_EXECUTED", { tenderId, tenderTitle: "Tender Dispute Escalated" });
    addNotification({
      title: "Dispute / Appeal Registered",
      message: `Dispute regarding ${tenderId} successfully cataloged on the blockchain ledger under Tx: ${txHash.substring(0, 10)}...`,
      category: "system"
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider value={{
      hydrated,
      walletConnected,
      walletAddress,
      walletBalance,
      userRole,
      currentUser,
      tenders,
      blockchainTxs,
      notifications,
      newsFeed,
      language,
      theme,
      fontSize,
      unreadCount,
      recentSearches,
      addRecentSearch,
      connectWallet,
      disconnectWallet,
      loginUser,
      logoutUser,
      connectWalletOnly,
      disconnectWalletOnly,
      publishTender,
      submitBid,
      addNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      setLanguage,
      setTheme,
      setFontSize,
      fontScalePercent,
      increaseFontScale,
      decreaseFontScale,
      resetFontScale,
      addTransaction,
      registerVendor,
      registerOfficer,
      updateKYCStatus,
      disputeTender
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
