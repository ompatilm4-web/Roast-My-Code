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
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-surface-raised transition-colors group-hover:border-accent/40">
              <Flame className="h-4 w-4 text-accent" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-white">
                Roast<span className="text-zinc-400">My</span>Code
              </span>
              <span className="rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-zinc-400 bg-surface-raised border border-white/5">
                v2.0
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-zinc-400">
            <a
              href="#roast-studio"
              className="transition-colors hover:text-zinc-100"
            >
              Studio
            </a>
            <a
              href="#hall-of-flame"
              className="transition-colors hover:text-zinc-100"
            >
              Hall of Flame
            </a>
            <a
              href="#integrations"
              className="transition-colors hover:text-zinc-100"
            >
              Architecture
            </a>
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-zinc-100"
            >
              API Docs
            </a>
          </nav>
        </div>

        {/* Right Action / Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-white"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="h-5 w-5 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-raised text-[10px] font-semibold text-zinc-300">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="max-w-[120px] truncate text-zinc-200">
                  {user.full_name || user.username}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-surface-raised p-1 shadow-card z-50 animate-fade-in">
                    <div className="border-b border-border/80 px-3 py-2">
                      <p className="text-[11px] text-zinc-400">Signed in as</p>
                      <p className="truncate text-xs font-semibold text-white">
                        @{user.username}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          openHistory();
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-zinc-300 transition hover:bg-surface hover:text-white"
                      >
                        <History className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Audit History</span>
                      </button>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          openSettings();
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-zinc-300 transition hover:bg-surface hover:text-white"
                      >
                        <Settings className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Settings & API Key</span>
                      </button>
                    </div>

                    <div className="border-t border-border/80 pt-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-red-400 transition hover:bg-surface hover:text-red-300"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal("login")}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:text-zinc-100"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal("register")}
                className="rounded-lg border border-white/10 bg-surface-raised px-3 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-800 hover:border-white/20"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
