"use client";

import React, { useRef, useState } from "react";
import { FileText, Flame, Loader2, UploadCloud, CheckCircle } from "lucide-react";
import { roastResume, ApiError, type RoastResponse } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface ResumeUploadProps {
  tone: string;
  onResult: (roast: RoastResponse) => void;
}

export default function ResumeUpload({ tone, onResult }: ResumeUploadProps) {
  const { user, token, refreshUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const PHASES = [
    "Extracting PDF text layers & structure...",
    "Scanning for buzzwords ('ninja', 'guru', 'synergy')...",
    "Measuring quantifiable metrics & achievements...",
    "Drafting Senior Recruiter verdict & rewrite blueprint...",
  ];

  async function handleFile(file: File) {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File exceeds maximum allowed size of 5MB.");
      return;
    }
    setSelectedFile(file);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setPhaseIndex(0);

    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % PHASES.length);
    }, 900);

    try {
      const result = await roastResume(
        selectedFile,
        user?.github_username || undefined,
        tone,
        token
      );
      onResult(result);
      refreshUser();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong while roasting resume."
      );
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
          dragOver
            ? "border-flame-orange bg-flame-orange/10"
            : selectedFile
            ? "border-cyber-emerald/50 bg-cyber-emerald/5"
            : "border-border bg-surface hover:border-flame-orange/60"
        }`}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-raised border border-border text-flame-orange mb-3">
          {selectedFile ? (
            <CheckCircle className="h-7 w-7 text-cyber-emerald" />
          ) : (
            <UploadCloud className="h-7 w-7" />
          )}
        </div>

        {selectedFile ? (
          <div>
            <p className="font-bold text-white text-base truncate max-w-sm mx-auto">
              {selectedFile.name}
            </p>
            <p className="mt-1 text-xs text-cyber-emerald font-semibold">
              {(selectedFile.size / 1024).toFixed(1)} KB — Ready to roast! Click to replace.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold text-gray-200">
              Drag & drop your resume PDF here, or click to browse
            </p>
            <p className="mt-1 text-xs text-gray-500">
              PDF only, max 5MB. Evaluates ATS compatibility, impact metrics, and clarity.
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2.5 rounded-xl border border-flame-orange/30 bg-flame-orange/5 p-3 text-xs font-mono text-flame-orange">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{PHASES[phaseIndex]}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !selectedFile}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-flame-red via-flame-orange to-flame-gold py-3 text-base font-extrabold text-black shadow-flame-glow-sm transition hover:scale-[1.01] hover:shadow-flame-glow disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Shredding Resume...</span>
          </>
        ) : (
          <>
            <Flame className="h-5 w-5" />
            <span>Roast My Resume</span>
          </>
        )}
      </button>
    </form>
  );
}
