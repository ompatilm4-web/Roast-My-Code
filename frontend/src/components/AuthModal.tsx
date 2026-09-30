"use client";

import React, { useState } from "react";
import { X, Flame, Lock, User, Mail, Loader2, Sparkles, LogIn } from "lucide-react";
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
      setError(err instanceof ApiError ? err.message : "Invalid login credentials.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border-glow bg-surface-raised p-6 shadow-2xl sm:p-8">
        {/* Glow */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-flame-orange/20 blur-3xl" />

        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border text-gray-400 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-flame-orange/20 text-flame-orange border border-flame-orange/30 shadow-flame-glow-sm mb-3">
            <Flame className="h-6 w-6 animate-flame-flicker" />
          </div>
          <h3 className="text-2xl font-black text-white">
            {authModalTab === "login" ? "Welcome Back" : "Join RoastMyCode"}
          </h3>
          <p className="mt-1 text-xs text-gray-400">
            {authModalTab === "login"
              ? "Sign in to save roasts, blueprints, and manage your audit history."
              : "Create a free account to track your code quality progression over time."}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex rounded-xl border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => {
              openAuthModal("login");
              setError(null);
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              authModalTab === "login"
                ? "bg-flame-orange text-black shadow-flame-glow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              openAuthModal("register");
              setError(null);
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              authModalTab === "register"
                ? "bg-flame-orange text-black shadow-flame-glow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error box */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Login Form */}
        {authModalTab === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                Username or Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="demodev or email@domain.com"
                  disabled={loading}
                  className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-gray-200 outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-gray-200 outline-none focus:border-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !loginIdentifier || !loginPassword}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-flame-red via-flame-orange to-flame-gold py-2.5 text-sm font-extrabold text-black shadow-flame-glow-sm transition hover:scale-[1.01] hover:shadow-flame-glow disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>

            {/* Quick Demo Credentials */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={fillDemoAccount}
                className="text-xs text-accent font-semibold hover:underline flex items-center gap-1 mx-auto"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Fill Demo Account (demodev / password123)</span>
              </button>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                Username *
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="e.g. dev_ninja"
                  disabled={loading}
                  className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2 text-sm text-gray-200 outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                Email Address (Optional)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@domain.com"
                  disabled={loading}
                  className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2 text-sm text-gray-200 outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                Password * (min 6 characters)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2 text-sm text-gray-200 outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Alex Rivers"
                  disabled={loading}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-300">
                  GitHub Handle
                </label>
                <input
                  type="text"
                  value={regGithub}
                  onChange={(e) => setRegGithub(e.target.value)}
                  placeholder="octocat"
                  disabled={loading}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !regUsername || !regPassword}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-flame-red via-flame-orange to-flame-gold py-2.5 text-sm font-extrabold text-black shadow-flame-glow-sm transition hover:scale-[1.01] hover:shadow-flame-glow disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
