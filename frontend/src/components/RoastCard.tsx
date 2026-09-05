"use client";

import ScoreGauge from "./ScoreGauge";
import type { RoastResponse } from "@/lib/api";

interface RoastCardProps {
  roast: RoastResponse;
}

export default function RoastCard({ roast }: RoastCardProps) {
  const isResume = roast.target_type === "resume";

  return (
    <div className="w-full max-w-2xl rounded-xl border border-border bg-surface p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-200">{roast.target_url_or_name}</h2>
        <span className="rounded-full bg-accent-dim/20 px-3 py-1 text-xs font-medium text-accent">
          {isResume ? "Resume Roast" : "Repo Roast"}
        </span>
      </div>

      <blockquote className="mb-6 rounded-lg border-l-4 border-accent bg-black/20 p-4 italic text-gray-300">
        &ldquo;{roast.roast}&rdquo;
      </blockquote>

      <div className="mb-6 flex justify-around gap-4">
        <ScoreGauge
          label={isResume ? "Impact & Specificity" : "Code Quality"}
          score={roast.code_quality_score}
        />
        <ScoreGauge
          label={isResume ? "Clarity & Formatting" : "Documentation"}
          score={roast.documentation_score}
        />
        <ScoreGauge
          label={isResume ? "Structure & Relevance" : "Architecture"}
          score={roast.architecture_score}
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
          The Blueprint
        </h3>
        <ul className="space-y-2">
          {roast.constructive_blueprint.map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-300">
              <span className="text-accent">→</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
