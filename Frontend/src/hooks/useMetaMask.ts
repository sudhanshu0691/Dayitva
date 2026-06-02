"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CONTRACT_ABI = [
  "function createTender(string _title, string _ipfsHash, uint256 _budget, uint256 _deadline, uint256 _minScore, bool _msmeQuota) external returns (uint256 tenderId)",
  "function submitBid(uint256 _tenderId, bytes32 _encryptedBidHash) external",
  "function revealBid(uint256 _tenderId, uint256 _price, uint256[6] calldata _scoreHashes, bytes32 _nonce) external",
  "function evaluateWithWinner(uint256 _tenderId, address _winner, uint256 _winnerScore) external",
];

export function useMetaMask() {
  const [account, setAccount] = useState<string>("");
  const [chainId, setChainId] = useState<number>(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>("");

  const SEPOLIA_CHAIN_ID = 11155111;

  const checkConnection = useCallback(async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const id = await window.ethereum.request({ method: "eth_chainId" });
          setChainId(parseInt(id, 16));
        }
      } catch (err) {
        console.error("MetaMask check failed:", err);
      }
    }
  }, []);

  useEffect(() => {
    checkConnection();

    if (typeof window.ethereum !== "undefined") {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount("");
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
  }, [checkConnection]);

  const connectWallet = async (): Promise<string> => {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask is not installed. Please install MetaMask to continue.");
      throw new Error("MetaMask not installed");
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

      // Check network
      const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
      setChainId(parseInt(currentChainId, 16));

      if (parseInt(currentChainId, 16) !== SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }], // Sepolia chainId in hex
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0xaa36a7",
                  chainName: "Sepolia Testnet",
                  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                  rpcUrls: ["https://sepolia.infura.io/v3/"],
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ],
            });
          }
          throw new Error("Please switch to Sepolia Testnet");
        }
      }

      return accounts[0];
    } catch (err: any) {
      const message = err?.message || "Failed to connect MetaMask";
      setError(message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const signTransaction = async (
    contractAddress: string,
    functionName: string,
    params: any[]
  ): Promise<{ txHash: string; receipt: any }> => {
    if (!account) throw new Error("Wallet not connected");
    if (chainId !== SEPOLIA_CHAIN_ID) throw new Error("Please switch to Sepolia network");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

    const tx = await contract[functionName](...params);
    const receipt = await tx.wait();

    return { txHash: receipt.hash, receipt };
  };

  const getEtherscanLink = (txHash: string): string => {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  };

  return {
    account,
    chainId,
    isConnecting,
    error,
    isConnected: !!account,
    isCorrectNetwork: chainId === SEPOLIA_CHAIN_ID,
    connectWallet,
    signTransaction,
    getEtherscanLink,
  };
}