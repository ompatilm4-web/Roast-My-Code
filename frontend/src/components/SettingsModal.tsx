"use client";

import React, { useState, useEffect } from "react";
import { X, Settings, Key, User, GitBranch, Check, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SettingsModal() {
  const { user, isSettingsOpen, closeSettings, updateProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [customApiKey, setCustomApiKey] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setGithubUsername(user.github_username || "");
      setAvatarUrl(user.avatar_url || "");
    }
  }, [user]);

  if (!isSettingsOpen || !user) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await updateProfile({
        full_name: fullName.trim() || undefined,
        github_username: githubUsername.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
        custom_api_key: customApiKey.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      alert("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border-glow bg-surface-raised p-6 shadow-2xl sm:p-8">
        <button
          onClick={closeSettings}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border text-gray-400 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Profile & Preferences</h3>
            <p className="text-xs text-gray-400">Manage account information and custom Groq API key</p>
          </div>
        </div>

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
            <Check className="h-4 w-4" />
            <span>Profile and settings updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-300">
              Username
            </label>
            <input
              type="text"
              disabled
              value={user.username}
              className="w-full rounded-xl border border-border bg-black/40 px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                GitHub Username
              </label>
              <input
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="octocat"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-300">
              Custom Groq API Key (Optional)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Key className="h-4 w-4" />
              </div>
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder={
                  user.custom_api_key_set
                    ? "•••••••• (Custom key active. Enter new key to override)"
                    : "gsk_... (Leave blank to use platform default engine)"
                }
                className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2 text-sm text-gray-200 outline-none focus:border-accent"
              />
            </div>
            <p className="mt-1 text-[11px] text-gray-500">
              Provide your own Groq API key from{" "}
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-accent underline"
              >
                console.groq.com
              </a>{" "}
              for unlimited personal rate limits.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeSettings}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-flame-orange px-5 py-2 text-xs font-bold text-black shadow-flame-glow-sm hover:scale-105 transition disabled:opacity-50"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
