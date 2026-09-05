"use client";

interface ScoreGaugeProps {
  label: string;
  score: number; // 0-100
}

function scoreColor(score: number): string {
  if (score >= 70) return "#22c55e"; // green
  if (score >= 40) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

export default function ScoreGauge({ label, score }: ScoreGaugeProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="90" height="90" viewBox="0 0 90 90" className="-rotate-90">
        <circle cx="45" cy="45" r={radius} stroke="#30363d" strokeWidth="8" fill="none" />
        <circle
          cx="45"
          cy="45"
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="-mt-16 flex flex-col items-center">
        <span className="text-xl font-bold" style={{ color }}>
          {score}
        </span>
      </div>
      <span className="mt-8 text-sm text-gray-400 text-center">{label}</span>
    </div>
  );
}
