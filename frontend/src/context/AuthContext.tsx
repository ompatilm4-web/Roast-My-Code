"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  UserResponse,
  loginUser,
  registerUser,
  getCurrentUser,
  updateUserProfile,
} from "@/lib/api";

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: "login" | "register";
  isHistoryOpen: boolean;
  isSettingsOpen: boolean;
  login: (username_or_email: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    password: string;
    email?: string;
    full_name?: string;
    github_username?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: {
    full_name?: string;
    github_username?: string;
    avatar_url?: string;
    custom_api_key?: string;
  }) => Promise<void>;
  refreshUser: () => Promise<void>;
  openAuthModal: (tab?: "login" | "register") => void;
  closeAuthModal: () => void;
  openHistory: () => void;
  closeHistory: () => void;
  openSettings: () => void;
  closeSettings: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "roastmycode_jwt_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        setToken(storedToken);
        try {
          const profile = await getCurrentUser(storedToken);
          setUser(profile);
        } catch {
          // Token expired or invalid
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    initAuth();
  }, []);

  async function login(username_or_email: string, password: string) {
    const res = await loginUser({ username_or_email, password });
    localStorage.setItem(TOKEN_KEY, res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    setIsAuthModalOpen(false);
  }

  async function register(data: {
    username: string;
    password: string;
    email?: string;
    full_name?: string;
    github_username?: string;
  }) {
    const res = await registerUser(data);
    localStorage.setItem(TOKEN_KEY, res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    setIsAuthModalOpen(false);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setIsHistoryOpen(false);
    setIsSettingsOpen(false);
  }

  async function updateProfile(data: {
    full_name?: string;
    github_username?: string;
    avatar_url?: string;
    custom_api_key?: string;
  }) {
    if (!token) return;
    const updated = await updateUserProfile(data, token);
    setUser(updated);
  }

  async function refreshUser() {
    if (!token) return;
    try {
      const profile = await getCurrentUser(token);
      setUser(profile);
    } catch {
      // Ignored
    }
  }

  function openAuthModal(tab: "login" | "register" = "login") {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }

  function closeAuthModal() {
    setIsAuthModalOpen(false);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        authModalTab,
        isHistoryOpen,
        isSettingsOpen,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        openAuthModal,
        closeAuthModal,
        openHistory: () => setIsHistoryOpen(true),
        closeHistory: () => setIsHistoryOpen(false),
        openSettings: () => setIsSettingsOpen(true),
        closeSettings: () => setIsSettingsOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
