import React from "react";

const MODES = [
  { value: "any", label: "Any mode" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

const SORT_OPTIONS = [
  { value: "best_match", label: "Best match" },
  { value: "latest", label: "Latest" },
];

export interface Filters {
  keyword: string;
  location: string;
  workMode: string;
  sortBy: string;
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export default function FilterBar({ filters, onChange, onRefresh, refreshing }: FilterBarProps) {
  const update = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const sortBy = filters.sortBy || "best_match";

  return (
    <div className="bg-white border border-rule-med rounded-xl p-5 flex flex-col lg:flex-row gap-4 lg:items-end shadow-sm">
      <div className="flex-1">
        <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-3 mb-1.5 font-bold">
          Keyword
        </label>
        <input
          suppressHydrationWarning
          type="text"
          value={filters.keyword}
          onChange={(e) => update({ keyword: e.target.value })}
          placeholder="e.g. python developer"
          className="w-full border border-rule-med rounded-lg px-3 py-2 text-sm bg-cream focus:border-accent outline-none text-ink placeholder:text-muted/70 transition-colors"
        />
      </div>

      <div className="flex-1">
        <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-3 mb-1.5 font-bold">
          Location
        </label>
        <input
          suppressHydrationWarning
          type="text"
          value={filters.location}
          onChange={(e) => update({ location: e.target.value })}
          placeholder="e.g. Delhi, Remote"
          className="w-full border border-rule-med rounded-lg px-3 py-2 text-sm bg-cream focus:border-accent outline-none text-ink placeholder:text-muted/70 transition-colors"
        />
      </div>

      <div>
        <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-3 mb-1.5 font-bold">
          Work mode
        </label>
        <select
          suppressHydrationWarning
          value={filters.workMode}
          onChange={(e) => update({ workMode: e.target.value })}
          className="border border-rule-med rounded-lg px-3 py-2 text-sm bg-cream focus:border-accent outline-none text-ink w-full lg:w-auto transition-colors cursor-pointer"
        >
          {MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-3 mb-1.5 font-bold">
          Sort by
        </label>
        <div className="inline-flex border border-rule-med rounded-lg overflow-hidden w-full lg:w-auto">
          {SORT_OPTIONS.map((opt) => {
            const active = sortBy === opt.value;
            return (
              <button
                suppressHydrationWarning
                key={opt.value}
                type="button"
                onClick={() => update({ sortBy: opt.value })}
                aria-pressed={active}
                className={`flex-1 lg:flex-none font-mono text-xs uppercase tracking-wider px-4 py-2 transition-all cursor-pointer ${
                  active
                    ? "bg-ink text-white font-bold"
                    : "bg-cream text-ink hover:bg-cream-3"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        suppressHydrationWarning
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="w-full lg:w-auto bg-accent hover:bg-accent/90 text-white font-semibold rounded-lg px-4 py-2 text-xs uppercase tracking-wider transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer shadow-sm active:scale-95"
      >
        {refreshing ? "Searching…" : "Pull new roles"}
      </button>
    </div>
  );
}
