import React from "react";
import { JobBoardView } from "@/features/jobs/JobBoardView";
import JobsFeed from "@/features/jobs/JobsFeed";

export default function JobsPage() {
  return (
    <div className="h-full w-full min-h-full space-y-6">
      <JobBoardView />
      <JobsFeed />
    </div>
  );
}