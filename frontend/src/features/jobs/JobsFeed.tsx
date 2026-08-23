"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Briefcase, RefreshCw, AlertCircle, Search } from "lucide-react";
import FilterBar, { Filters } from "./FilterBar";
import JobCard from "./JobCard";
import EmptyState from "./EmptyState";
import SearchJobsModal from "./SearchJobsModal";
import { fetchJobs, toggleSave, applyToJob, refreshJobs, Job } from "./api";

export default function JobsFeed() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorDetail, setErrorDetail] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    keyword: "",
    location: "",
    workMode: "any",
    sortBy: "latest",
  });

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await fetchJobs({
        keyword: filters.keyword,
        location: filters.location,
        workMode: filters.workMode,
        sortBy: filters.sortBy,
      });
      setJobs(data);
      setStatus("ready");

      // Auto-open modal if there are no jobs at all on load
      if (data.length === 0 && filters.keyword === "" && filters.location === "" && filters.workMode === "any") {
        setShowSearchModal(true);
      }
    } catch (e: any) {
      setErrorDetail(e.message || "Unknown error");
      setStatus("error");
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce input typing
    return () => clearTimeout(t);
  }, [load]);

  const handleSave = async (jobId: string) => {
    try {
      const updated = await toggleSave(jobId);
      setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
    } catch (err) {
      console.error("Failed to toggle save", err);
    }
  };

  const handleApply = async (jobId: string, mode: "manual" | "agentic" = "manual") => {
    try {
      const updated = await applyToJob(jobId, mode);
      setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
    } catch (err) {
      console.error("Failed to apply to job", err);
    }
  };

  const handleRefreshClick = () => {
    setShowSearchModal(true);
  };

  const handleSearchConfirm = async ({
    jobRoles,
    location,
    resumeText,
  }: {
    jobRoles: string[];
    location: string;
    resumeText?: string;
  }) => {
    setShowSearchModal(false);
    setRefreshing(true);
    setRefreshMsg("");
    try {
      const result = await refreshJobs({
        resumeText,
        jobRoles,
        location,
      });

      const sourceNote = resumeText ? " · Matched from your resume" : "";
      setRefreshMsg(
        `${result.message}${location ? ` · Searched in ${location}` : ""}${sourceNote}`
      );
      // Reload jobs
      const data = await fetchJobs({
        keyword: filters.keyword,
        location: filters.location,
        workMode: filters.workMode,
        sortBy: filters.sortBy,
      });
      setJobs(data);
      setStatus("ready");
    } catch (e: any) {
      setRefreshMsg(`Couldn't pull new roles — ${e.message || "Unknown error"}`);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      {showSearchModal && (
        <SearchJobsModal
          onClose={() => setShowSearchModal(false)}
          onSearch={handleSearchConfirm}
        />
      )}

      <div className="flex flex-col gap-6 animate-[feedFadeIn_0.3s_ease] pb-16">
        <style>{`
          @keyframes feedFadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rule pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-mid text-accent flex items-center justify-center shadow-sm">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-ink">Browse Jobs</h1>
              <p className="text-xs text-ink-3">
                Score and find positions matching your Katalyst Hire profile.
              </p>
            </div>
          </div>

          <button
            suppressHydrationWarning
            onClick={handleRefreshClick}
            className="flex items-center justify-center gap-2 bg-ink hover:bg-accent text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Search Configurations</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onRefresh={handleRefreshClick}
          refreshing={refreshing}
        />

        {/* Search pipeline activity notification */}
        {refreshing && (
          <div className="flex items-center gap-2 font-mono text-xs text-accent bg-accent-lt border border-accent/15 px-4 py-3 rounded-lg animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Sourcing job boards (LinkedIn, Naukri, Indeed) and scoring with Sarvam AI...</span>
          </div>
        )}

        {refreshMsg && !refreshing && (
          <div className="flex items-center gap-2 font-mono text-xs text-ink-2 bg-cream-3 border border-rule-med px-4 py-3 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 text-accent" />
            <span>{refreshMsg}</span>
          </div>
        )}

        {/* Feed states */}
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-accent-mid border-t-accent rounded-full animate-spin" />
            <p className="font-mono text-xs text-ink-3">Reading the feed...</p>
          </div>
        )}

        {status === "error" && (
          <EmptyState
            title="Couldn't reach the job feed."
            detail={`Please check if your local FastAPI backend server is running on port 8000. Error details: ${errorDetail}`}
          />
        )}

        {status === "ready" && jobs.length === 0 && (
          <EmptyState
            title="No matching roles found."
            detail="Try loosening your filters (keyword, location) or click 'Search Configurations' to fetch new roles from job boards."
          />
        )}

        {status === "ready" && jobs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 justify-items-center">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSave={handleSave}
                onApply={handleApply}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
