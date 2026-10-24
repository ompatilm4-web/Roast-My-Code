"use client";

import React from "react";
import { Flame } from "lucide-react";
import GithubIcon from "./GithubIcon";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/80 bg-background py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-border/60">
          {/* Logo & description */}
          <div className="flex flex-col items-center md:items-start gap-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded border border-white/10 bg-surface-raised">
                <Flame className="h-3.5 w-3.5 text-accent" />
              </div>
              <span className="text-sm font-semibold text-white">
                Roast<span className="text-zinc-400">My</span>Code
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">v2.0</span>
            </div>
            <p className="text-xs text-zinc-500 text-center md:text-left">
              High-signal AI code reviewer & actionable architecture planner.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-zinc-400">
            <a href="#roast-studio" className="hover:text-zinc-100 transition-colors">
              Studio
            </a>
            <a href="#hall-of-flame" className="hover:text-zinc-100 transition-colors">
              Audits
            </a>
            <a href="#integrations" className="hover:text-zinc-100 transition-colors">
              Architecture
            </a>
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-100 transition-colors"
            >
              OpenAPI
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-zinc-100 transition-colors"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>
          </div>

          {/* System status */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Systems Normal</span>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} RoastMyCode. All rights reserved.</p>
          <p className="font-mono text-[11px]">Powered by Next.js & Groq</p>
        </div>
      </div>
    </footer>
  );
}
