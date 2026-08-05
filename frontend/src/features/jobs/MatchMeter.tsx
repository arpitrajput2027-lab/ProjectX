import React from "react";

interface MatchMeterProps {
  score?: number;
  label?: string;
}

export default function MatchMeter({ score = 0, label = "Match" }: MatchMeterProps) {
  const radius = 24;
  const stroke = 3.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Color selection based on match quality
  let strokeColor = "stroke-accent"; // Default brown
  if (score >= 85) {
    strokeColor = "stroke-success"; // Soft green
  } else if (score >= 70) {
    strokeColor = "stroke-accent"; // Warm brown
  } else if (score >= 50) {
    strokeColor = "stroke-ink-3"; // Gray-brown
  } else {
    strokeColor = "stroke-muted"; // Muted gray
  }

  return (
    <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
        {/* Background Track */}
        <circle
          cx="30"
          cy="30"
          r={radius}
          className="stroke-cream-3 fill-none"
          strokeWidth={stroke}
        />
        {/* Progress Fill */}
        <circle
          cx="30"
          cy="30"
          r={radius}
          className={`fill-none ${strokeColor} transition-all duration-500`}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[12px] font-bold text-ink leading-none">{score}%</span>
        <span className="text-[7px] font-semibold text-ink-3 tracking-wider uppercase leading-none mt-0.5">
          {label.toLowerCase() === "unscored" ? "Score" : "Match"}
        </span>
      </div>
    </div>
  );
}
