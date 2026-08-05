import React from "react";

interface EmptyStateProps {
  title: string;
  detail?: string;
}

export default function EmptyState({ title, detail }: EmptyStateProps) {
  return (
    <div className="border border-rule-med rounded-xl bg-white p-10 text-center shadow-sm max-w-xl mx-auto my-8">
      <h3 className="font-serif font-semibold text-lg text-ink">{title}</h3>
      {detail && (
        <p className="font-mono text-xs text-ink-3 mt-2 leading-relaxed">
          {detail}
        </p>
      )}
    </div>
  );
}
