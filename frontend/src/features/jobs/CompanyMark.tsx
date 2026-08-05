import React from "react";

const PALETTE = ["#1a1814", "#8b6a3e", "#3d3a35", "#6b6760", "#5f7350", "#78350f"];

function colorFor(name: string) {
  const str = name || "?";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

interface CompanyMarkProps {
  name?: string;
}

export default function CompanyMark({ name }: CompanyMarkProps) {
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  const bg = colorFor(name || "");

  return (
    <div
      className="flex items-center justify-center w-11 h-11 rounded-lg shrink-0 font-sans font-semibold text-white text-lg shadow-sm"
      style={{ backgroundColor: bg }}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}
