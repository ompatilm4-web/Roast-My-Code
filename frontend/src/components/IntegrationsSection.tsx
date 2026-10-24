"use client";

import React, { useState } from "react";
import {
  Zap,
  FileCode,
  Terminal,
  Cpu,
  Boxes,
  Copy,
  Check,
  ShieldCheck,
  Workflow,
  ArrowUpRight,
} from "lucide-react";
import GithubIcon from "./GithubIcon";

const CODE_EXAMPLES = {
  curl: `curl -X POST "http://127.0.0.1:8000/api/v1/roast/snippet" \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "function verify(a) { return eval(a); }",
    "language": "javascript",
    "tone": "senior_dev"
  }'`,
  python: `import requests

payload = {
    "repo": "fastapi/fastapi",
    "tone": "senior_dev"
}

response = requests.post(
    "http://127.0.0.1:8000/api/v1/roast/github",
    json=payload
)
data = response.json()
print("Score:", data["code_quality_score"])
print("Blueprint:", data["constructive_blueprint"])`,
  typescript: `import { roastSnippet } from "@/lib/api";

const audit = await roastSnippet(
  \`const user: any = { role: "admin" };\`,
  "typescript",
  "auth.ts",
  "senior_dev"
);

console.log(audit.roast);
console.log(audit.constructive_blueprint);`,
};

export default function IntegrationsSection() {
  const [activeCodeTab, setActiveCodeTab] = useState<"curl" | "python" | "typescript">("curl");
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(CODE_EXAMPLES[activeCodeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const INTEGRATIONS = [
    {
      icon: <GithubIcon className="h-4 w-4 text-zinc-300" />,
      title: "GitHub REST & GraphQL",
      tag: "Deep Traversal",
      description:
        "Indexes file trees, lockfiles, commit velocity, and README documentation.",
      badge: "Full Repo Context",
    },
    {
      icon: <Zap className="h-4 w-4 text-accent" />,
      title: "Groq LPU Acceleration",
      tag: "Llama 3.1",
      description:
        "Sub-second inference delivering structured architectural reviews in milliseconds.",
      badge: "< 850ms response",
    },
    {
      icon: <FileCode className="h-4 w-4 text-zinc-300" />,
      title: "Snippet AST Parser",
      tag: "Multi-Language",
      description:
        "Evaluates raw snippets across 10+ languages for security risks and code smells.",
      badge: "Real-time parsing",
    },
    {
      icon: <Workflow className="h-4 w-4 text-zinc-300" />,
      title: "CI/CD & Pull Requests",
      tag: "Automation",
      description:
        "Run automated code reviews on GitHub pull requests with structured remarks.",
      badge: "Webhook Ready",
    },
    {
      icon: <ShieldCheck className="h-4 w-4 text-zinc-300" />,
      title: "Resume ATS Engine",
      tag: "PDF Parsing",
      description:
        "Evaluates technical resumes for impact metrics, clarity, and structural relevance.",
      badge: "ATS Calibrated",
    },
    {
      icon: <Boxes className="h-4 w-4 text-zinc-300" />,
      title: "Docker Native",
      tag: "Production",
      description:
        "Multi-stage Docker containers configured for one-click deployment.",
      badge: "Zero Config",
    },
  ];

  return (
    <section id="integrations" className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 scroll-mt-16">
      <div className="text-center mb-12">
        <h2 className="text-xl sm:text-3xl font-semibold tracking-tight text-white">
          Architecture & Integrations
        </h2>
        <p className="mt-1.5 text-xs text-zinc-400 max-w-lg mx-auto">
          High-throughput LLM accelerators, AST analyzers, and developer REST endpoints designed for low latency.
        </p>
      </div>

      {/* Grid of Integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {INTEGRATIONS.map((item, i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-xl border border-border bg-surface-raised/40 p-5 transition-colors hover:border-zinc-700 hover:bg-surface-raised"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface">
                  {item.icon}
                </div>
                <span className="rounded px-2 py-0.5 text-[10px] font-medium text-zinc-400 bg-surface border border-border">
                  {item.tag}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">{item.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-3">{item.description}</p>
            </div>

            <div className="pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>{item.badge}</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-zinc-600" />
            </div>
          </div>
        ))}
      </div>

      {/* Developer API Preview */}
      <div className="rounded-xl border border-border bg-surface p-5 max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="ml-2 text-xs font-medium text-zinc-400">Developer API</span>
          </div>

          <div className="flex items-center gap-1">
            {(["curl", "python", "typescript"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveCodeTab(lang)}
                className={`rounded px-2.5 py-1 text-[11px] font-medium transition ${
                  activeCodeTab === lang
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {lang}
              </button>
            ))}

            <button
              onClick={handleCopy}
              className="ml-2 flex items-center gap-1 rounded border border-border bg-surface-raised px-2 py-1 text-[11px] text-zinc-400 transition hover:text-white"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        <pre className="overflow-x-auto rounded-lg bg-black/40 p-4 text-xs font-mono-code text-zinc-300 border border-white/5">
          <code>{CODE_EXAMPLES[activeCodeTab]}</code>
        </pre>
      </div>
    </section>
  );
}
