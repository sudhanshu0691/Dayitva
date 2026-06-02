"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CONTRACT_ABI = [
  "function createTender(string _title, string _ipfsHash, uint256 _budget, uint256 _deadline, uint256 _minScore, bool _msmeQuota) external returns (uint256 tenderId)",
  "function submitBid(uint256 _tenderId, bytes32 _encryptedBidHash) external",
  "function revealBid(uint256 _tenderId, uint256 _price, uint256[6] calldata _scores) external",
  "function declareWinner(uint256 _tenderId, address _winner, uint256 _winnerScore) external",
  "function closeTender(uint256 _tenderId) external",
  "event TenderCreated(uint256 indexed tenderId, address indexed officer, string title, string ipfsHash, uint256 budget, uint256 deadline, uint256 timestamp)",
  "event BidSubmitted(uint256 indexed tenderId, address indexed bidder, bytes32 encryptedBidHash, uint256 timestamp)",
  "event WinnerDeclared(uint256 indexed tenderId, address indexed winner, uint256 price, uint256 totalScore, uint256 timestamp)",
];

const GANACHE_CHAIN_ID = 1337;
const GANACHE_CHAIN_ID_HEX = "0x539";

interface TransactionStatus {
  stage: "pending" | "confirmed" | "failed" | null;
  txHash: string | null;
  error: string | null;
}

interface BlockchainContextType {
  account: string;
  chainId: number;
  balance: string;
  isConnecting: boolean;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  error: string;
  transactionStatus: TransactionStatus;
  connectWallet: () => Promise<string>;
  signTransaction: (functionName: string, params: any[]) => Promise<string>;
  getExplorerLink: (txHash: string) => string;
  clearTransactionStatus: () => void;
  getContractAddress: () => string;
}

const BlockchainContext = createContext<BlockchainContextType>({
  account: "",
  chainId: 0,
  balance: "0",
  isConnecting: false,
  isConnected: false,
  isCorrectNetwork: false,
  error: "",
  transactionStatus: { stage: null, txHash: null, error: null },
  connectWallet: async () => "",
  signTransaction: async () => "",
  getExplorerLink: () => "",
  clearTransactionStatus: () => {},
  getContractAddress: () => "",
});

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string>("");
  const [chainId, setChainId] = useState<number>(0);
  const [balance, setBalance] = useState<string>("0");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>("");
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>({
    stage: null,
    txHash: null,
    error: null,
  });

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

  const getExplorerLink = useCallback((txHash: string): string => {
    if (process.env.NEXT_PUBLIC_EXPLORER_URL) {
      return `${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${txHash}`;
    }
    return `#tx-${txHash.substring(0, 10)}...`; // local Ganache fallback
  }, []);

  const getContractAddress = useCallback((): string => {
    return contractAddress;
  }, [contractAddress]);

  const updateBalance = useCallback(async (addr: string) => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const bal = await provider.getBalance(addr);
        setBalance(ethers.formatEther(bal));
      } catch {}
    }
  }, []);

  const checkConnection = useCallback(async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const id = await window.ethereum.request({ method: "eth_chainId" });
          setChainId(parseInt(id, 16));
          updateBalance(accounts[0]);
        }
      } catch (err) {
        console.error("MetaMask check failed:", err);
      }
    }
  }, [updateBalance]);

  useEffect(() => {
    checkConnection();

    if (typeof window.ethereum !== "undefined") {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          updateBalance(accounts[0]);
        } else {
          setAccount("");
          setBalance("0");
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        setChainId(parseInt(chainIdHex, 16));
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [checkConnection, updateBalance]);

  const connectWallet = async (): Promise<string> => {
    if (typeof window.ethereum === "undefined") {
      const msg = "MetaMask is not installed. Please install MetaMask to continue.";
      setError(msg);
      throw new Error(msg);
    }

    setIsConnecting(true);
    setError("");

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      setAccount(accounts[0]);

      const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
      setChainId(parseInt(currentChainId, 16));

      // Try to switch to Ganache if not already on it
      if (parseInt(currentChainId, 16) !== GANACHE_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: GANACHE_CHAIN_ID_HEX }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [{
                  chainId: GANACHE_CHAIN_ID_HEX,
                  chainName: "Ganache Local",
                  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                  rpcUrls: ["http://127.0.0.1:7545"],
                }],
              });
            } catch {
              throw new Error("Failed to add Ganache network. Add it manually in MetaMask: Network Name=Ganache, RPC=http://127.0.0.1:7545, Chain ID=1337");
            }
          }
          throw new Error("Please switch to Ganache network in MetaMask");
        }
      }

      await updateBalance(accounts[0]);
      return accounts[0];
    } catch (err: any) {
      const message = err?.message || "Failed to connect MetaMask";
      setError(message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const signTransaction = async (functionName: string, params: any[]): Promise<string> => {
    if (!account) throw new Error("Wallet not connected");
    if (chainId !== GANACHE_CHAIN_ID) throw new Error("Please switch to Ganache network in MetaMask");
    if (!contractAddress) throw new Error("Contract address not configured. Deploy contract and set NEXT_PUBLIC_CONTRACT_ADDRESS.");

    setTransactionStatus({ stage: "pending", txHash: null, error: null });

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

      const tx = await contract[functionName](...params);
      setTransactionStatus({ stage: "pending", txHash: tx.hash, error: null });

      const receipt = await tx.wait();
      const txHash = receipt.hash;

      setTransactionStatus({ stage: "confirmed", txHash, error: null });
      return txHash;
    } catch (err: any) {
      const message = err?.message || "Transaction failed";
      
      if (message.includes("user rejected") || message.includes("User denied")) {
        setTransactionStatus({ stage: "failed", txHash: null, error: "Transaction was rejected by user" });
      } else if (message.includes("gas required exceeds") || message.includes("insufficient funds")) {
        setTransactionStatus({ stage: "failed", txHash: null, error: "Insufficient funds. Ganache accounts have free ETH." });
      } else {
        setTransactionStatus({ stage: "failed", txHash: null, error: message });
      }
      throw err;
    }
  };

  const clearTransactionStatus = useCallback(() => {
    setTransactionStatus({ stage: null, txHash: null, error: null });
  }, []);

  return (
    <BlockchainContext.Provider
      value={{
        account,
        chainId,
        balance,
        isConnecting,
        isConnected: !!account,
        isCorrectNetwork: chainId === GANACHE_CHAIN_ID,
        error,
        transactionStatus,
        connectWallet,
        signTransaction,
        getExplorerLink,
        clearTransactionStatus,
        getContractAddress,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error("useBlockchain must be used within a BlockchainProvider");
  }
  return context;
}

export default BlockchainContext;