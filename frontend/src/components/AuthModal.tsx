"use client";

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    openAuthModal,
    login,
    register,
  } = useAuth();

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regFullName, setRegFullName] = useState("");
  const [regGithub, setRegGithub] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) return;

    setLoading(true);
    setError(null);
    try {
      await login(loginIdentifier, loginPassword);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!regUsername || !regPassword) return;

    setLoading(true);
    setError(null);
    try {
      await register({
        username: regUsername.trim(),
        email: regEmail.trim() || undefined,
        password: regPassword,
        full_name: regFullName.trim() || undefined,
        github_username: regGithub.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemoAccount() {
    setLoginIdentifier("demodev");
    setLoginPassword("password123");
    setError(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-surface-raised p-6 shadow-modal">
        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-lg bg-surface border border-border text-zinc-400 hover:text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <h3 className="text-base font-semibold text-white">
            {authModalTab === "login" ? "Sign In" : "Create Account"}
          </h3>
          <p className="mt-1 text-xs text-zinc-400">
            {authModalTab === "login"
              ? "Access your saved reviews and custom API settings."
              : "Save your audit history and sync with GitHub."}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-lg border border-border bg-surface p-1 mb-5">
          <button
            onClick={() => {
              openAuthModal("login");
              setError(null);
            }}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
              authModalTab === "login"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              openAuthModal("register");
              setError(null);
            }}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
              authModalTab === "register"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-900/50 bg-red-950/20 p-2.5 text-xs text-red-400">
            {error}
          </div>
        )}

        {authModalTab === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                Username or Email
              </label>
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none transition focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none transition focus:border-zinc-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-white disabled:opacity-40"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Sign In"}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={fillDemoAccount}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 underline underline-offset-2"
              >
                Use demo account (demodev)
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                Username *
              </label>
              <input
                type="text"
                required
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="developer"
                className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none transition focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                Email
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="alex@company.com"
                className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none transition focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                Password *
              </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none transition focus:border-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none transition focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-300">
                  GitHub Handle
                </label>
                <input
                  type="text"
                  value={regGithub}
                  onChange={(e) => setRegGithub(e.target.value)}
                  placeholder="alexr"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none transition focus:border-zinc-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-white disabled:opacity-40"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Create Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
