"use client";

import { useState } from "react";
import RepoForm from "@/components/RepoForm";
import ResumeUpload from "@/components/ResumeUpload";
import RoastCard from "@/components/RoastCard";
import type { RoastResponse } from "@/lib/api";

type Tab = "github" | "resume";

export default function Home() {
  const [tab, setTab] = useState<Tab>("github");
  const [githubUsername, setGithubUsername] = useState("");
  const [roast, setRoast] = useState<RoastResponse | null>(null);

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-100">
          Roast<span className="text-accent">My</span>Code
        </h1>
        <p className="mt-2 text-gray-400">
          Brutally honest, weirdly helpful feedback on your repo or resume.
        </p>
      </div>

      <input
        type="text"
        placeholder="Your GitHub username (optional, saves your history)"
        value={githubUsername}
        onChange={(e) => setGithubUsername(e.target.value)}
        className="w-full max-w-2xl rounded-lg border border-border bg-black/30 px-4 py-2 text-sm text-gray-300 placeholder-gray-500 outline-none focus:border-accent"
      />

      <div className="flex gap-2 rounded-lg border border-border bg-black/20 p-1">
        <button
          onClick={() => setTab("github")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
            tab === "github" ? "bg-accent text-black" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          GitHub Repo
        </button>
        <button
          onClick={() => setTab("resume")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
            tab === "resume" ? "bg-accent text-black" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Resume
        </button>
      </div>

      {tab === "github" ? (
        <RepoForm githubUsername={githubUsername} onResult={setRoast} />
      ) : (
        <ResumeUpload githubUsername={githubUsername} onResult={setRoast} />
      )}

      {roast && <RoastCard roast={roast} />}
    </main>
  );
}
