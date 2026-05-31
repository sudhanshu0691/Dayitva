"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserProfile, Notification } from "../types";
import authService from "@/services/authService";
import tenderService from "@/services/tenderService";
import notificationService from "@/services/notificationService";

interface AppContextProps {
  hydrated: boolean;
  currentUser: UserProfile | null;
  userRole: string | null;
  isAuthenticated: boolean;
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  setCurrentUser: (user: UserProfile | null) => void;
  setUserRole: (role: string | null) => void;
  language: "en" | "hi";
  theme: "light" | "dark";
  fontSize: "sm" | "base" | "lg";
  fontScalePercent: number;
  increaseFontScale: () => void;
  decreaseFontScale: () => void;
  resetFontScale: () => void;
  setLanguage: (lang: "en" | "hi") => void;
  setTheme: (theme: "light" | "dark") => void;
  setFontSize: (size: "sm" | "base" | "lg") => void;
  logoutUser: () => Promise<void>;
  
  // Wallet
  walletConnected: boolean;
  walletAddress: string;
  walletBalance: string;
  connectWallet: (role: string, customUser?: any) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  loginUser: (role: string, profile: any) => void;
  connectWalletOnly: () => Promise<void>;
  disconnectWalletOnly: () => Promise<void>;
  
  // Notifications
  unreadCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Searches & Tenders
  recentSearches: string[];
  addRecentSearch: (search: string) => void;
  tenders: any[];
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [fontScalePercent, setFontScalePercent] = useState<number>(100);

  // Wallet State
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<string>("0.00 ETH");

  // Tenders & Searches State
  const [tenders, setTenders] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Sync dark mode class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.style.setProperty("--app-font-scale", String(fontScalePercent));
  }, [theme, fontScalePercent]);

  // Restore auth from stored data on hydration - verify with backend
  useEffect(() => {
    if (typeof window === "undefined") return;

    const restoreAuth = async () => {
      const storedToken = authService.getStoredToken();
      const storedUser = authService.getStoredUser();

      if (storedToken && storedUser) {
        try {
          // Verify token by calling /auth/me endpoint
          const user = await authService.getCurrentUser();
          setCurrentUser(user);
          setUserRole(user.role || null);
          setIsAuthenticated(true);
          // Update stored user data with fresh data from backend
          localStorage.setItem("user", JSON.stringify(user));
        } catch (error) {
          // Token invalid - check if we can refresh
          try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
              const { token } = await authService.refreshToken(refreshToken);
              localStorage.setItem("authToken", token);
              // Try again with new token
              const user = await authService.getCurrentUser();
              setCurrentUser(user);
              setUserRole(user.role || null);
              setIsAuthenticated(true);
              localStorage.setItem("user", JSON.stringify(user));
            } else {
              // No refresh token, clear everything
              authService.clearAuthData();
            }
          } catch {
            // Refresh failed too, clear everything
            authService.clearAuthData();
          }
        }
      }

      setHydrated(true);
    };

    restoreAuth();
  }, []);

  // Fetch notifications and searches when authenticated or hydrated
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const list = await notificationService.getNotifications();
        setNotifications(list || []);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated]);

  // Fetch tenders on hydration
  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const res = await tenderService.listTenders();
        setTenders(res.data || []);
      } catch (err) {
        console.error("Failed to fetch tenders:", err);
      }
    };
    if (hydrated) {
      fetchTenders();
    }
  }, [hydrated]);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("recentSearches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    }
  }, [hydrated]);

  const logoutUser = async () => {
    await authService.logout();
    setCurrentUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
    disconnectWalletOnly();
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

  // Wallet implementations
  const connectWalletOnly = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const provider = (window as any).ethereum;
        const accounts = await provider.request({ method: "eth_requestAccounts" });
        if (accounts.length > 0) {
          const address = accounts[0];
          setWalletAddress(address);
          setWalletConnected(true);
          try {
            const balanceHex = await provider.request({
              method: "eth_getBalance",
              params: [address, "latest"],
            });
            const balanceEth = parseInt(balanceHex, 16) / 1e18;
            setWalletBalance(`${balanceEth.toFixed(4)} ETH`);
          } catch (balanceErr) {
            setWalletBalance("100.00 ETH");
          }
          return;
        }
      } catch (err) {
        console.error("MetaMask connection error, falling back to simulation:", err);
      }
    }
    // Simulation fallback
    const randomAddress = "0x" + Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    setWalletAddress(randomAddress);
    setWalletConnected(true);
    setWalletBalance("100.00 ETH");
  };

  const disconnectWalletOnly = async () => {
    setWalletConnected(false);
    setWalletAddress("");
    setWalletBalance("0.00 ETH");
  };

  const connectWallet = async (role: string, customUser?: any) => {
    await connectWalletOnly();
  };

  const disconnectWallet = async () => {
    await disconnectWalletOnly();
  };

  const loginUser = (role: string, profile: any) => {
    setCurrentUser(profile);
    setUserRole(role);
    setIsAuthenticated(true);
  };

  // Notifications implementations
  const markNotificationAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await notificationService.markAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  // Searches implementation
  const addRecentSearch = (search: string) => {
    if (!search.trim()) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== search);
      const next = [search, ...filtered].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(next));
      return next;
    });
  };

  return (
    <AppContext.Provider value={{
      hydrated,
      currentUser,
      userRole,
      notifications,
      setNotifications,
      isAuthenticated,
      setCurrentUser,
      setUserRole,
      language,
      theme,
      fontSize,
      fontScalePercent,
      increaseFontScale,
      decreaseFontScale,
      resetFontScale,
      setLanguage,
      setTheme,
      setFontSize,
      logoutUser,
      
      // Wallet
      walletConnected,
      walletAddress,
      walletBalance,
      connectWallet,
      disconnectWallet,
      loginUser,
      connectWalletOnly,
      disconnectWalletOnly,
      
      // Notifications
      unreadCount,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      
      // Tenders & Searches
      recentSearches,
      addRecentSearch,
      tenders,
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