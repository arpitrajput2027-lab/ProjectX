import React, { useEffect, useRef, useState } from "react";
import { X, Hand, Bot } from "lucide-react";
import { Job } from "./api";

interface ApplyModalProps {
  job: Job;
  onClose: () => void;
  onChoose: (mode: "manual" | "agentic") => void;
}

export default function ApplyModal({ job, onClose, onChoose }: ApplyModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const [showSoonAlert, setShowSoonAlert] = useState(false);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  /* Prevent background scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-[4px] p-4 animate-[fadeIn_0.18s_ease]"
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .apply-card-manual:hover {
          border-color: var(--color-accent) !important;
          background-color: var(--color-accent-lt) !important;
        }
        .apply-card-agentic {
          cursor: not-allowed !important;
          opacity: 0.65;
        }
        .soon-alert {
          animation: fadeInUp 0.2s ease;
        }
      `}</style>

      <div
        className="bg-cream border border-rule-med rounded-2xl p-7 w-full max-w-[480px] shadow-2xl relative animate-[slideUp_0.22s_cubic-bezier(0.34,1.1,0.64,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-7 h-7 rounded-full border border-rule-med bg-transparent hover:bg-cream-2 text-ink-3 hover:text-ink cursor-pointer flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <p className="font-mono text-[10px] uppercase tracking-wider text-accent mb-1 font-bold">
          Apply
        </p>
        <h2 className="font-serif text-xl font-semibold text-ink mb-1">
          How do you want to apply?
        </h2>
        <p className="font-mono text-xs text-ink-3 mb-6 truncate leading-relaxed">
          {job.job_title}{job.company ? ` · ${job.company}` : ""}
        </p>

        {/* Option Cards */}
        <div className="flex flex-col gap-3">
          {/* Manual Apply */}
          <button
            id="apply-manual-btn"
            onClick={() => onChoose("manual")}
            className="apply-card-manual flex items-start gap-4 border border-rule-med rounded-xl p-4.5 bg-white text-left w-full cursor-pointer transition-all duration-150"
          >
            <div className="w-10 h-10 rounded-lg bg-accent-lt text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
              <Hand className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif font-bold text-sm text-ink mb-1">
                Manual Apply
              </p>
              <p className="font-sans text-xs text-ink-3 leading-relaxed">
                Opens the job portal in a new tab. You fill in the form yourself — full control.
              </p>
            </div>
          </button>

          {/* Agentic Apply (disabled / coming soon) */}
          <button
            id="apply-agentic-btn"
            onClick={() => setShowSoonAlert(true)}
            className="apply-card-agentic flex items-start gap-4 border border-rule-med rounded-xl p-4.5 bg-cream-2 text-left w-full relative overflow-hidden transition-all duration-150"
          >
            {/* Feature Coming Soon Pill */}
            <span className="absolute top-2.5 right-3 font-mono text-[8px] font-bold uppercase tracking-wider bg-accent text-white px-2 py-0.5 rounded">
              Coming Soon
            </span>

            <div className="w-10 h-10 rounded-lg bg-ink-2/10 text-ink-3 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif font-bold text-sm text-ink-3 mb-1">
                Agentic Apply
              </p>
              <p className="font-sans text-xs text-ink-3/70 leading-relaxed">
                Let Sift fill and submit the form for you. AI reads the ATS portal and applies on your behalf.
              </p>
            </div>
          </button>

          {/* Coming Soon Alert Message */}
          {showSoonAlert && (
            <div className="soon-alert bg-accent-lt border border-accent/25 rounded-lg p-3 text-xs text-accent font-mono leading-relaxed mt-2">
              ⚡ <strong>Agentic Apply</strong> is under active development and will be available soon. Please use Manual Apply for now.
            </div>
          )}
        </div>

        {/* Footer Note */}
        <p className="font-mono text-[9px] text-ink-3 mt-6 text-center">
          Manual apply marks this role as applied in your feed.
        </p>
      </div>
    </div>
  );
}
