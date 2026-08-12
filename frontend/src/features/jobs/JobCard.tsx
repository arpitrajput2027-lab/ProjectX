import React, { useState } from "react";
import CompanyMark from "./CompanyMark";
import MatchMeter from "./MatchMeter";
import ApplyModal from "./ApplyModal";
import { Job } from "./api";

const PASTEL_PALETTE = [
  { bg: "bg-[#e5f6ed]", border: "border-[#bde3cf]", name: "mint" },
  { bg: "bg-[#fdf4e9]", border: "border-[#f4dfc7]", name: "peach" },
  { bg: "bg-[#faeaea]", border: "border-[#eed1d1]", name: "rose" },
  { bg: "bg-[#fcf5de]", border: "border-[#ebdca8]", name: "yellow" },
  { bg: "bg-[#e8f2ff]", border: "border-[#c4dcff]", name: "blue" },
  { bg: "bg-[#fce7f3]", border: "border-[#fbcfe8]", name: "pink" },
  { bg: "bg-[#fee2e2]", border: "border-[#fca5a5]", name: "red" },
  { bg: "bg-[#ffedd5]", border: "border-[#fed7aa]", name: "orange" },
  { bg: "bg-[#fae8ff]", border: "border-[#f5d0fe]", name: "fuchsia" },
  { bg: "bg-[#f3e8ff]", border: "border-[#e9d5ff]", name: "purple" },
  { bg: "bg-[#ccfbf1]", border: "border-[#99f6e4]", name: "teal" },
  { bg: "bg-[#e0e7ff]", border: "border-[#c7d2fe]", name: "indigo" },
];

function getPastelColors(companyName: string) {
  const str = companyName || "?";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PASTEL_PALETTE[Math.abs(hash) % PASTEL_PALETTE.length];
}

interface JobCardProps {
  job: Job;
  onSave: (jobId: string) => Promise<void>;
  onApply: (jobId: string, mode: "manual" | "agentic") => Promise<void>;
}

export default function JobCard({ job, onSave, onApply }: JobCardProps) {
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [agentStatus, setAgentStatus] = useState<"running" | "done" | null>(null);

  const colors = getPastelColors(job.company || "General");

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(job.id);
    } finally {
      setSaving(false);
    }
  };

  const openApplyModal = () => {
    if (job.applied || applying) return;
    setShowModal(true);
  };

  const handleModeChosen = async (mode: "manual" | "agentic") => {
    setShowModal(false);
    setApplying(true);

    try {
      if (mode === "manual") {
        const url = job.source_url;
        if (url) {
          window.open(url, "_blank", "noopener,noreferrer");
        } else {
          const query = encodeURIComponent(`${job.job_title} ${job.company || ""} job apply`);
          window.open(`https://www.google.com/search?q=${query}`, "_blank", "noopener,noreferrer");
        }
        await onApply(job.id, "manual");
      } else {
        setAgentStatus("running");
        await onApply(job.id, "agentic");
        setTimeout(() => setAgentStatus("done"), 2000);
      }
    } finally {
      setApplying(false);
    }
  };

  return (
    <>
      {showModal && (
        <ApplyModal
          job={job}
          onClose={() => setShowModal(false)}
          onChoose={handleModeChosen}
        />
      )}

      <div
        className={`flex flex-col justify-between p-5 rounded-2xl border ${colors.bg} ${colors.border} transition-all duration-200 hover:shadow-md h-[270px] w-full max-w-[340px] font-sans`}
      >
        {/* Top Section: Location/Date & MatchMeter */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-bold text-ink-2 truncate max-w-[130px]">
              {job.location || "Remote"}
            </span>
            <span className="text-[10px] text-ink-3 font-mono">
              {job.posted_relative || "Just now"}
            </span>
          </div>
          <MatchMeter score={job.match_score} label={job.match_label} />
        </div>

        {/* Middle Section: Job Title & Skills Tags */}
        <div className="flex-1 my-3 flex flex-col justify-center">
          <h3 className="font-serif font-bold text-[16px] text-ink leading-snug line-clamp-2" title={job.job_title}>
            {job.job_title}
          </h3>
          
          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {job.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white/60 border border-rule/10 text-ink-3"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Agentic status stub info (optional rendering) */}
          {agentStatus === "running" && (
            <div className="mt-2 flex items-center gap-1 font-mono text-[10px] text-accent animate-pulse">
              <span>⚡</span>
              <span>Sift agent is filling form...</span>
            </div>
          )}
          {agentStatus === "done" && (
            <div className="mt-2 flex items-center gap-1 font-mono text-[10px] text-success">
              <span>✓</span>
              <span>Submitted! Check your inbox.</span>
            </div>
          )}
        </div>

        {/* Bottom Section: Company & Action Buttons */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-rule/10 gap-2">
          {/* Company identity */}
          <div className="flex items-center gap-2 min-w-0">
            <CompanyMark name={job.company} />
            <span className="font-serif font-bold text-xs text-ink truncate max-w-[75px]" title={job.company || "General"}>
              {job.company || "General"}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-cream border border-rule text-[11px] font-bold font-mono uppercase tracking-wider text-ink transition-colors disabled:opacity-50 cursor-pointer"
            >
              {job.saved ? "Saved" : "Pass"}
            </button>
            
            <button
              onClick={openApplyModal}
              disabled={applying || job.applied}
              className="px-3 py-1.5 rounded-full bg-ink hover:bg-accent text-white text-[11px] font-bold font-mono uppercase tracking-wider transition-all disabled:opacity-60 cursor-pointer shadow-sm"
            >
              {job.applied
                ? job.apply_mode === "agentic"
                  ? "Agentic ✓"
                  : "Applied ✓"
                : applying
                ? "..."
                : "Apply"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
