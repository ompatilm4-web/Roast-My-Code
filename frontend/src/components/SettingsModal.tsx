"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface-raised p-6 shadow-modal">
        {/* Close Button */}
        <button
          onClick={closeSettings}
          className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-lg bg-surface border border-border text-zinc-400 hover:text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="mb-5">
          <h3 className="text-base font-semibold text-white">Profile & Preferences</h3>
          <p className="mt-1 text-xs text-zinc-400">
            Configure profile credentials and custom Groq API acceleration keys.
          </p>
        </div>

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-900/50 bg-emerald-950/20 p-2.5 text-xs text-emerald-400">
            <Check className="h-3.5 w-3.5" />
            <span>Preferences updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-300">
              Username
            </label>
            <input
              type="text"
              disabled
              value={user.username}
              className="w-full rounded-lg border border-border bg-black/40 px-3 py-1.5 text-xs text-zinc-500 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-zinc-200 outline-none transition focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                GitHub Handle
              </label>
              <input
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="octocat"
                className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-zinc-200 outline-none transition focus:border-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-300">
              Avatar Image URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-zinc-200 outline-none transition focus:border-zinc-500"
            />
          </div>

          <div className="pt-1">
            <label className="mb-1 block text-xs font-medium text-zinc-300">
              Custom Groq API Key (Optional)
            </label>
            <input
              type="password"
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-zinc-200 outline-none transition focus:border-zinc-500"
            />
            <p className="mt-1 text-[11px] text-zinc-500">
              By default, free platform quota is used. Provide your own key for dedicated rate limits.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={closeSettings}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-4 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-white disabled:opacity-40"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
