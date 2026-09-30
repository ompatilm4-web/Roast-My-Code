"use client";

import React from "react";

interface ScoreGaugeProps {
  label: string;
  score: number; // 0-100
  subtitle?: string;
}

function getScoreMeta(score: number): { color: string; bgGlow: string; status: string } {
  if (score >= 75) {
    return {
      color: "#10b981", // Emerald
      bgGlow: "rgba(16, 185, 129, 0.2)",
      status: "Solid",
    };
  }
  if (score >= 45) {
    return {
      color: "#f59e0b", // Amber
      bgGlow: "rgba(245, 158, 11, 0.2)",
      status: "Questionable",
    };
  }
  return {
    color: "#ef4444", // Red
    bgGlow: "rgba(239, 68, 68, 0.25)",
    status: "Catastrophic",
  };
}

export default function ScoreGauge({ label, score, subtitle }: ScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score || 0)));
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;
  const { color, bgGlow, status } = getScoreMeta(clampedScore);

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl border border-border/60 bg-surface/50 transition hover:bg-surface hover:border-border">
      <div className="relative flex items-center justify-center">
        {/* Glow backdrop */}
        <div
          className="absolute h-16 w-16 rounded-full blur-xl transition"
          style={{ backgroundColor: bgGlow }}
        />

        <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90 transform">
          {/* Background circle track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#20293d"
            strokeWidth="8"
            fill="none"
          />
          {/* Animated score arc */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black tracking-tight" style={{ color }}>
            {clampedScore}
          </span>
          <span className="text-[10px] uppercase font-bold text-gray-400">
            / 100
          </span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <div className="text-xs font-bold text-gray-200">{label}</div>
        <div className="mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold" style={{ color, backgroundColor: bgGlow }}>
          {status}
        </div>
        {subtitle && <div className="text-[10px] text-gray-500 mt-0.5">{subtitle}</div>}
      </div>
    </div>
  );
}
