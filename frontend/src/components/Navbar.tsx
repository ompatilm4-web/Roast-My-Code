"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Flame,
  User,
  History,
  Settings,
  LogOut,
  ChevronDown,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const { user, openAuthModal, openHistory, openSettings, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-flame-red via-flame-orange to-flame-gold p-0.5 shadow-flame-glow-sm transition group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-surface">
                <Flame className="h-5 w-5 text-flame-orange animate-flame-flicker" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white">
                  Roast<span className="gradient-text">My</span>Code
                </span>
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent border border-accent/30">
                  v2.0 Turbo
                </span>
              </div>
              <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">
                AI Code Auditor & Sarcastic Critic
              </span>
            </div>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          <a
            href="#roast-studio"
            className="flex items-center gap-1.5 transition hover:text-accent"
          >
            <Terminal className="h-4 w-4 text-accent" />
            <span>Roast Studio</span>
          </a>
          <a
            href="#hall-of-flame"
            className="flex items-center gap-1.5 transition hover:text-flame-red"
          >
            <Flame className="h-4 w-4 text-flame-red" />
            <span>Hall of Flame</span>
          </a>
          <a
            href="#integrations"
            className="flex items-center gap-1.5 transition hover:text-cyber-cyan"
          >
            <Cpu className="h-4 w-4 text-cyber-cyan" />
            <span>Integrations</span>
          </a>
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-gray-400 transition hover:text-white"
          >
            <Layers className="h-4 w-4" />
            <span>API Docs</span>
          </a>
        </nav>

        {/* Right Action / Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface-raised px-3 py-1.5 text-sm font-medium text-gray-200 transition hover:border-accent hover:bg-surface-card"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="h-6 w-6 rounded-full object-cover ring-1 ring-accent/40"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-semibold text-gray-200 max-w-[120px] truncate">
                  {user.full_name || user.username}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-surface-raised p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                    <div className="border-b border-border/60 px-3 py-2">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="truncate text-sm font-bold text-white">
                        @{user.username}
                      </p>
                      {user.github_username && (
                        <p className="text-[11px] text-accent font-mono truncate">
                          github: @{user.github_username}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        openHistory();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-gray-200 transition hover:bg-surface hover:text-white"
                    >
                      <History className="h-4 w-4 text-accent" />
                      <span>My Roasts History</span>
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        openSettings();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-gray-200 transition hover:bg-surface hover:text-white"
                    >
                      <Settings className="h-4 w-4 text-cyber-cyan" />
                      <span>Profile & API Key</span>
                    </button>

                    <div className="my-1 border-t border-border/60" />

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-flame-red transition hover:bg-flame-red/10"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal("login")}
                className="rounded-lg px-3.5 py-1.5 text-sm font-semibold text-gray-300 transition hover:text-white"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal("register")}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-flame-red to-flame-orange px-4 py-1.5 text-sm font-bold text-black shadow-flame-glow-sm transition hover:scale-105 hover:shadow-flame-glow"
              >
                <Sparkles className="h-4 w-4 text-black" />
                <span>Get Started</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
