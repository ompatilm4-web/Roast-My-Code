"use client";

import { useRef, useState } from "react";
import { roastResume, ApiError, type RoastResponse } from "@/lib/api";

interface ResumeUploadProps {
  githubUsername?: string;
  onResult: (roast: RoastResponse) => void;
}

export default function ResumeUpload({ githubUsername, onResult }: ResumeUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await roastResume(file, githubUsername);
      onResult(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl">
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
        className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition ${
          dragOver ? "border-accent bg-accent/5" : "border-border bg-black/20"
        }`}
      >
        <p className="text-gray-300">
          {loading ? "Roasting your resume..." : "Drop your resume PDF here, or click to browse"}
        </p>
        <p className="mt-1 text-xs text-gray-500">PDF only, max 5MB</p>
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
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
