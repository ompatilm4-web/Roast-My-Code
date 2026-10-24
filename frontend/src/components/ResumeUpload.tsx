"use client";

import React, { useRef, useState } from "react";
import { FileText, Loader2, Upload, CheckCircle2 } from "lucide-react";
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
    "Extracting PDF text layer...",
    "Scanning buzzwords & impact metrics...",
    "Evaluating structure & ATS readability...",
    "Drafting recruiter critique & rewrite plan...",
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
        err instanceof ApiError ? err.message : "Something went wrong while auditing resume."
      );
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4">
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
        className={`cursor-pointer rounded-xl border border-dashed p-6 text-center transition ${
          dragOver
            ? "border-accent bg-accent/5"
            : selectedFile
            ? "border-emerald-500/50 bg-emerald-500/5"
            : "border-border bg-surface hover:border-zinc-600"
        }`}
      >
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-raised text-zinc-400 mb-2.5">
          {selectedFile ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : (
            <Upload className="h-5 w-5" />
          )}
        </div>

        {selectedFile ? (
          <div>
            <p className="font-medium text-zinc-200 text-xs truncate max-w-xs mx-auto">
              {selectedFile.name}
            </p>
            <p className="mt-0.5 text-[11px] text-emerald-400">
              {(selectedFile.size / 1024).toFixed(1)} KB • Ready to audit
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-medium text-zinc-300">
              Upload resume PDF
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-500">
              Drag and drop or click to browse (max 5MB)
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
        <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-2.5 text-xs text-red-400">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface p-2.5 text-xs text-zinc-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
          <span>{PHASES[phaseIndex]}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !selectedFile}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Auditing Resume...</span>
          </>
        ) : (
          <span>Audit Resume</span>
        )}
      </button>
    </form>
  );
}
