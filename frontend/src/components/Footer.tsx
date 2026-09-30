"use client";

import React from "react";
import { Flame, Terminal, Heart, Cpu } from "lucide-react";
import GithubIcon from "./GithubIcon";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/80 bg-surface/50 py-12 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-border/60">
          {/* Logo & description */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-flame-orange/20 text-flame-orange border border-flame-orange/30">
                <Flame className="h-4 w-4" />
              </div>
              <span className="text-lg font-black text-white">
                Roast<span className="gradient-text">My</span>Code
              </span>
              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[9px] font-bold uppercase text-accent border border-accent/30">
                v2.0
              </span>
            </div>
            <p className="text-xs text-gray-400 max-w-sm text-center md:text-left">
              Brutally sarcastic AI code auditor and constructive blueprint generator.
              Turning messy code into senior-grade architecture.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-gray-400">
            <a href="#roast-studio" className="hover:text-accent transition">
              Roast Studio
            </a>
            <a href="#hall-of-flame" className="hover:text-flame-red transition">
              Hall of Flame
            </a>
            <a href="#integrations" className="hover:text-cyber-cyan transition">
              Integrations
            </a>
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition"
            >
              OpenAPI Docs
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-white transition"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>
          </div>

          {/* System status pill */}
          <div className="flex items-center gap-2 rounded-full border border-cyber-emerald/30 bg-cyber-emerald/10 px-3 py-1 text-xs text-cyber-emerald font-mono">
            <span className="h-2 w-2 rounded-full bg-cyber-emerald animate-pulse" />
            <span>Groq LPU Inference Ready</span>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} RoastMyCode. Built for developers with high standards and thick skin.</p>
          <p className="flex items-center gap-1">
            <span>Powered by Next.js, FastAPI & Groq LPUs</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
