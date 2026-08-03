import React, { Suspense } from "react";
import { ResumeEditor } from "@/features/resume/ResumeEditor";

export default function ResumePage() {
  return (
    <div className="h-full w-full">
      <Suspense fallback={<div className="p-24 text-center font-mono uppercase tracking-widest text-muted">Loading...</div>}>
        <ResumeEditor />
      </Suspense>
    </div>
  );
}
