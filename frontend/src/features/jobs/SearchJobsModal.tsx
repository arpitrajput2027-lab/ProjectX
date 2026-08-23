import React, { useEffect, useRef, useState } from "react";
import { X, Upload, MapPin, Search, Plus } from "lucide-react";
import { parseResume } from "./api";

const PRESET_ROLES = [
  "Python Developer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Data Analyst",
  "Data Scientist",
  "ML Engineer",
  "DevOps Engineer",
  "React Developer",
  "Node.js Developer",
  "Software Engineer",
  "Product Manager",
  "UI/UX Designer",
  "Cloud Engineer",
  "Django Developer",
  "FastAPI Developer",
];

const LOCATION_SUGGESTIONS = [
  "India (Remote)",
  "Bangalore",
  "Delhi / NCR",
  "Mumbai",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Remote",
];

interface SearchJobsModalProps {
  onClose: () => void;
  onSearch: (args: { jobRoles: string[]; location: string; resumeText?: string }) => void;
}

export default function SearchJobsModal({ onClose, onSearch }: SearchJobsModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [location, setLocation] = useState("");
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Resume upload state */
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const togglePreset = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const addCustomRole = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selectedRoles.includes(trimmed)) {
      setSelectedRoles((prev) => [...prev, trimmed]);
    }
    setCustomInput("");
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomRole();
    }
  };

  const removeRole = (role: string) => {
    setSelectedRoles((prev) => prev.filter((r) => r !== role));
  };

  const handleSubmit = () => {
    const allRoles = [...selectedRoles];
    const trimmed = customInput.trim();
    if (trimmed && !allRoles.includes(trimmed)) allRoles.push(trimmed);
    if (allRoles.length === 0 && !resumeText) {
      inputRef.current?.focus();
      return;
    }
    onSearch({ jobRoles: allRoles, location, resumeText });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  /* ---- Resume upload handling ---- */
  const processResumeFile = async (file: File) => {
    setResumeError("");
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setResumeError("Only PDF files are accepted.");
      return;
    }
    setResumeFile(file);
    setExtracting(true);
    try {
      // Use ReadyIndex backend parser to extract resume info
      const result = await parseResume(file);
      if (!result.resume_text) {
        setResumeError("Couldn't read any text from that PDF — try a different file.");
        setResumeFile(null);
      } else {
        setResumeText(result.resume_text);
        // Prepopulate location if found and none exists
        if (result.suggested_location && !location) {
          setLocation(result.suggested_location);
        }
        // Prepopulate parsed roles that match presets or are custom
        if (result.suggested_roles && result.suggested_roles.length > 0) {
          setSelectedRoles((prev) => {
            const updated = [...prev];
            result.suggested_roles.forEach((r) => {
              if (!updated.includes(r)) updated.push(r);
            });
            return updated;
          });
        }
      }
    } catch (err: any) {
      setResumeError(err.message || "Couldn't parse that PDF. Please try another file.");
      setResumeFile(null);
    } finally {
      setExtracting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processResumeFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processResumeFile(file);
  };

  const clearResume = () => {
    setResumeFile(null);
    setResumeText("");
    setResumeError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSearchFromResume = () => {
    if (!resumeText) return;
    onSearch({ jobRoles: selectedRoles, location, resumeText });
  };

  const filteredLocSuggestions = LOCATION_SUGGESTIONS.filter(
    (l) => l.toLowerCase().includes(location.toLowerCase()) && location.length > 0
  );

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
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .preset-chip {
          transition: all 0.14s ease;
        }
        .preset-chip:hover {
          border-color: var(--color-accent) !important;
          color: var(--color-accent) !important;
        }
        .preset-chip-selected {
          background-color: var(--color-accent) !important;
          color: #fff !important;
          border-color: var(--color-accent) !important;
        }
        .preset-chip-selected:hover {
          background-color: #725631 !important;
        }
      `}</style>

      <div
        className="bg-cream border border-rule-med rounded-2xl p-7 w-full max-w-[560px] max-h-[calc(100vh-48px)] overflow-y-auto shadow-2xl relative animate-[slideUp_0.22s_cubic-bezier(0.34,1.1,0.64,1)]"
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
          Search Jobs
        </p>
        <h2 className="font-serif text-xl font-semibold text-ink mb-1">
          What jobs are you looking for?
        </h2>
        <p className="font-sans text-xs text-ink-3 mb-5 leading-relaxed">
          Drop your resume to pre-fill search roles automatically, or pick roles manually below.
        </p>

        {/* Resume Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !resumeFile && fileInputRef.current?.click()}
          className={`border-1.5 border-dashed rounded-xl p-5 text-center transition-all duration-150 mb-4.5 ${
            isDragging
              ? "border-accent bg-accent-lt/30"
              : resumeFile
              ? "border-success bg-success-lt"
              : "border-rule-med bg-white hover:border-accent cursor-pointer"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {!resumeFile && !extracting && (
            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-lg bg-cream-2 text-accent flex items-center justify-center flex-shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="font-serif font-bold text-xs text-ink mb-0.5">
                  Drag & drop your resume (PDF)
                </p>
                <p className="font-sans text-[11px] text-ink-3 leading-none">
                  or click to browse — we&apos;ll pull matching roles from it directly
                </p>
              </div>
            </div>
          )}

          {extracting && (
            <div className="flex items-center gap-3 text-left">
              <span className="animate-spin text-accent">⏳</span>
              <p className="font-mono text-xs text-ink-2">
                Parsing {resumeFile?.name} using AI...
              </p>
            </div>
          )}

          {resumeFile && !extracting && resumeText && (
            <div className="flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-success text-sm">✅</span>
                <p className="font-mono text-xs text-ink font-semibold truncate">
                  {resumeFile.name} (Resume Text Extracted)
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearResume();
                }}
                className="background-none border-none text-ink-3 hover:text-accent cursor-pointer text-xs font-mono underline flex-shrink-0"
              >
                remove
              </button>
            </div>
          )}
        </div>

        {resumeError && (
          <p className="font-mono text-[11px] text-red-600 -mt-2 mb-4">
            {resumeError}
          </p>
        )}

        {resumeText && !extracting && (
          <button
            onClick={handleSearchFromResume}
            className="w-full bg-accent hover:bg-accent/90 text-white border-none rounded-lg py-2.5 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer mb-5 shadow-sm active:scale-98 transition-all"
          >
            🔍 Find Jobs From Resume
          </button>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3.5 my-5">
          <div className="flex-1 h-px bg-rule-med" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-3">
            or configure roles manually
          </span>
          <div className="flex-1 h-px bg-rule-med" />
        </div>

        {/* Selected Roles Tags */}
        {selectedRoles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {selectedRoles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center gap-1.5 bg-ink text-white font-mono text-[9px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm"
              >
                {role}
                <button
                  onClick={() => removeRole(role)}
                  className="background-none border-none text-white/70 hover:text-white cursor-pointer p-0 text-[11px]"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Custom Role Input */}
        <div className="flex gap-2 mb-4.5">
          <input
            ref={inputRef}
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleCustomKeyDown}
            placeholder="Type a role (e.g. backend developer) and click Add..."
            className="flex-1 border border-rule-med rounded-lg px-3 py-2 text-xs bg-white outline-none focus:border-accent text-ink placeholder:text-muted/70 transition-colors"
          />
          <button
            onClick={addCustomRole}
            disabled={!customInput.trim()}
            className="border border-rule-med hover:border-accent hover:text-accent rounded-lg px-4 py-2 bg-white font-mono text-xs font-bold uppercase tracking-wider text-ink cursor-pointer disabled:opacity-50 transition-colors"
          >
            + Add
          </button>
        </div>

        {/* Preset Chips */}
        <p className="font-mono text-[10px] uppercase tracking-wider text-ink-3 mb-2 font-bold">
          Quick select
        </p>
        <div className="flex flex-wrap gap-1.5 mb-5 max-h-[140px] overflow-y-auto p-1 bg-white rounded-lg border border-rule-med">
          {PRESET_ROLES.map((role) => {
            const sel = selectedRoles.includes(role);
            return (
              <button
                key={role}
                onClick={() => togglePreset(role)}
                className={`preset-chip border rounded-full px-3 py-1 bg-cream-2 text-ink-2 font-mono text-[10px] cursor-pointer ${
                  sel ? "preset-chip-selected" : "border-rule-med"
                }`}
              >
                {role}
              </button>
            );
          })}
        </div>

        {/* Location Preference */}
        <p className="font-mono text-[10px] uppercase tracking-wider text-ink-3 mb-1.5 font-bold">
          Location preference (optional)
        </p>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-3">
            <MapPin className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setShowLocSuggestions(true);
            }}
            onFocus={() => setShowLocSuggestions(true)}
            onBlur={() => setTimeout(() => setShowLocSuggestions(false), 150)}
            placeholder="e.g. Bangalore, Remote, Delhi..."
            className="w-full border border-rule-med rounded-lg pl-9 pr-3 py-2 text-xs bg-white outline-none focus:border-accent text-ink placeholder:text-muted/70 transition-colors"
          />
          {showLocSuggestions && filteredLocSuggestions.length > 0 && (
            <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-rule-med rounded-lg shadow-lg z-10 max-h-[160px] overflow-y-auto">
              {filteredLocSuggestions.map((sug) => (
                <button
                  key={sug}
                  onMouseDown={() => {
                    setLocation(sug);
                    setShowLocSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-sans text-ink hover:bg-cream-2 transition-colors border-b border-rule last:border-b-0 cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 border-t border-rule-med pt-4">
          <p className="font-mono text-[9px] text-ink-3 leading-none">
            {selectedRoles.length === 0
              ? "Select at least one role"
              : `${selectedRoles.length} role${selectedRoles.length > 1 ? "s" : ""} selected`}
          </p>
          <button
            onClick={handleSubmit}
            className="bg-accent hover:bg-accent/90 text-white border-none rounded-lg px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm active:scale-95 transition-all"
          >
            🔍 Find Jobs
          </button>
        </div>
      </div>
    </div>
  );
}
