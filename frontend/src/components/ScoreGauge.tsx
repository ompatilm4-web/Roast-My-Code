"use client";

import React from "react";

interface ScoreGaugeProps {
  label: string;
  score: number; // 0-100
  subtitle?: string;
}

function getScoreMeta(score: number): { color: string; status: string; badgeBg: string } {
  if (score >= 75) {
    return {
      color: "#10b981", // Emerald
      status: "Solid",
      badgeBg: "rgba(16, 185, 129, 0.1)",
    };
  }
  if (score >= 45) {
    return {
      color: "#f59e0b", // Amber
      status: "Moderate",
      badgeBg: "rgba(245, 158, 11, 0.1)",
    };
  }
  return {
    color: "#f43f5e", // Rose
    status: "Critical",
    badgeBg: "rgba(244, 63, 94, 0.1)",
  };
}

export default function ScoreGauge({ label, score, subtitle }: ScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score || 0)));
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;
  const { color, status, badgeBg } = getScoreMeta(clampedScore);

  return (
    <div className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-border bg-surface transition-colors hover:border-zinc-700">
      <div className="relative flex items-center justify-center">
        <svg width="84" height="84" viewBox="0 0 84 84" className="-rotate-90 transform">
          {/* Background circle track */}
          <circle
            cx="42"
            cy="42"
            r={radius}
            stroke="#27272a"
            strokeWidth="5"
            fill="none"
          />
          {/* Score arc */}
          <circle
            cx="42"
            cy="42"
            r={radius}
            stroke={color}
            strokeWidth="5"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold tracking-tight text-white">
            {clampedScore}
          </span>
          <span className="text-[9px] uppercase font-medium text-zinc-500">
            /100
          </span>
        </div>
      </div>

      <div className="mt-2.5 text-center">
        <div className="text-xs font-medium text-zinc-200">{label}</div>
        <div
          className="mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium"
          style={{ color, backgroundColor: badgeBg }}
        >
          {status}
        </div>
        {subtitle && <div className="text-[10px] text-zinc-500 mt-1 line-clamp-1">{subtitle}</div>}
      </div>
    </div>
  );
}
