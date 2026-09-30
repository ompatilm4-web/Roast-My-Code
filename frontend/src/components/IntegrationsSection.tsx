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
  ArrowUpRight,
  ShieldCheck,
  Workflow,
  Sparkles,
} from "lucide-react";
import GithubIcon from "./GithubIcon";

const CODE_EXAMPLES = {
  curl: `curl -X POST "http://127.0.0.1:8000/api/v1/roast/snippet" \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "function hack(a) { return eval(a); }",
    "language": "javascript",
    "tone": "senior_dev"
  }'`,
  python: `import requests

payload = {
    "repo": "octocat/Hello-World",
    "tone": "senior_dev"
}

response = requests.post(
    "http://127.0.0.1:8000/api/v1/roast/github",
    json=payload
)
roast = response.json()
print("Roast:", roast["roast"])
print("Blueprint:", roast["constructive_blueprint"])`,
  typescript: `import { roastSnippet } from "@/lib/api";

const roast = await roastSnippet(
  \`const x: any = 42;\`,
  "typescript",
  "data_handler.ts",
  "senior_dev"
);

console.log(roast.roast);
console.log(roast.code_quality_score);`,
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
      icon: <GithubIcon className="h-6 w-6 text-white" />,
      title: "GitHub REST & GraphQL API",
      tag: "Live Traversal",
      description:
        "Deeply indexes repository tree files, dependencies (package.json, pyproject.toml, Cargo.toml), commit frequency, and README documentation.",
      badge: "5000 req/hr token support",
    },
    {
      icon: <Zap className="h-6 w-6 text-flame-orange" />,
      title: "Groq LPU AI Acceleration",
      tag: "Llama 3.1 70B & 8B",
      description:
        "Leverages Groq's Language Processing Units (LPUs) for sub-second responses (>300 tokens/sec) and guaranteed structured JSON schema adherence.",
      badge: "< 850ms latency",
    },
    {
      icon: <FileCode className="h-6 w-6 text-cyber-purple" />,
      title: "Direct Code Snippet Parser",
      tag: "Multi-Language AST",
      description:
        "Instant analysis of raw code snippets across 10+ languages (Python, TypeScript, Rust, Go, C++, SQL) detecting anti-patterns and code smells.",
      badge: "Real-time syntax scan",
    },
    {
      icon: <Workflow className="h-6 w-6 text-cyber-cyan" />,
      title: "CI/CD & GitHub Actions Bot",
      tag: "Pull Request Automation",
      description:
        "Automatically trigger roast reviews on pull requests. Leaves educational inline review comments before merging into main.",
      badge: "PR Webhook Ready",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-cyber-emerald" />,
      title: "PDF Resume & ATS Engine",
      tag: "Multi-Page PDF Parsing",
      description:
        "Pypdf stream extractor with semantic text normalization, evaluating impact metrics, corporate fluff, and technical relevance.",
      badge: "Strict ATS Compliance",
    },
    {
      icon: <Boxes className="h-6 w-6 text-yellow-400" />,
      title: "Docker & Cloud Native",
      tag: "Zero-Config Deploy",
      description:
        "Production multi-stage Docker builds for both FastAPI and Next.js, fully pre-configured for Render, Railway, Fly.io, and Vercel.",
      badge: "docker-compose up",
    },
  ];

  return (
    <section id="integrations" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 scroll-mt-20">
      {/* Glow orb */}
      <div className="pointer-events-none absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-cyber-cyan/10 blur-[120px]" />

      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyber-cyan/30 bg-cyber-cyan/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyber-cyan mb-3">
          <Cpu className="h-3.5 w-3.5" />
          <span>High-Performance Ecosystem</span>
        </div>
        <h2 className="text-3xl font-black text-white sm:text-5xl">
          Engineered With <span className="gradient-text-cyan">Deep Integrations</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
          Built on production-grade infrastructure: from high-throughput LLM accelerators and GitHub AST analyzers to flexible developer REST webhooks.
        </p>
      </div>

      {/* Grid of Integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {INTEGRATIONS.map((item, i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-2xl border border-border bg-surface-raised/70 p-6 backdrop-blur-md transition hover:-translate-y-1 hover:border-border-glow hover:bg-surface-raised"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface border border-border">
                  {item.icon}
                </div>
                <span className="rounded-full bg-surface px-2.5 py-0.5 text-[10px] font-bold text-gray-400 border border-border">
                  {item.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">{item.description}</p>
            </div>

            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-cyber-emerald">
              <span>● {item.badge}</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-gray-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Developer API & SDK Integration Code Box */}
      <div className="rounded-3xl border border-border bg-surface-raised p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-accent mb-1">
              <Terminal className="h-4 w-4" />
              <span>Developer REST API & SDK</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Integrate RoastMyCode Into Your Own Pipeline
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Automate code reviews from CLI tools, pre-commit hooks, or CI actions.
            </p>
          </div>

          {/* Code Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-border bg-surface p-1">
              {(["curl", "python", "typescript"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveCodeTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-mono font-bold uppercase transition ${
                    activeCodeTab === tab
                      ? "bg-flame-orange text-black"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-gray-200 transition hover:border-accent hover:text-white"
              title="Copy code"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-cyber-emerald" /> : <Copy className="h-3.5 w-3.5 text-accent" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Code Viewport */}
        <div className="relative rounded-2xl border border-border/80 bg-black/70 p-4 font-mono-code text-xs text-gray-200 overflow-x-auto shadow-inner">
          <pre>
            <code>{CODE_EXAMPLES[activeCodeTab]}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
