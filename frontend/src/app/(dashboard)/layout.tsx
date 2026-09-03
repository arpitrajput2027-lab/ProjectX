"use client";

import Link from "next/link";
import React from "react";
import {
  UserCircle,
  FileText,
  Briefcase,
  Shield,
  CheckCircle,
  Target,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-cream text-ink font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-ink text-cream flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center px-6 border-b border-rule-med bg-ink-2/30">
          <img src="/katalyst-hire-horizontal.png" alt="Katalyst Hire" style={{ width: '170px', height: 'auto' }} className="object-contain border border-black rounded-[5%]" />
        </div>

        <nav className="flex flex-col py-6 px-3 space-y-1">
          <div className="px-3 mb-3 text-xs font-semibold text-muted uppercase tracking-wider">
            Menu
          </div>

          <Link
            href="/profile"
            className="flex items-center px-3 py-2.5 rounded-md hover:bg-ink-2 transition-colors font-medium text-sm text-cream-2 group"
          >
            <UserCircle className="w-4 h-4 mr-3 opacity-70 group-hover:opacity-100 group-hover:text-accent" />
            Profile
          </Link>

          <Link
            href="/resume"
            className="flex items-center px-3 py-2.5 rounded-md hover:bg-ink-2 transition-colors font-medium text-sm text-cream-2 group"
          >
            <FileText className="w-4 h-4 mr-3 opacity-70 group-hover:opacity-100 group-hover:text-accent" />
            Resume Builder
          </Link>

          <Link
            href="/resume?tab=ats"
            className="flex items-center px-3 py-2.5 rounded-md hover:bg-ink-2 transition-colors font-medium text-sm text-cream-2 group"
          >
            <Shield className="w-4 h-4 mr-3 opacity-70 group-hover:opacity-100 group-hover:text-accent" />
            ATS & JD Tools
          </Link>

          <Link
            href="/katalyst-jobs"
            className="flex items-center px-3 py-2.5 rounded-md hover:bg-ink-2 transition-colors font-medium text-sm text-cream-2 group"
          >
            <Target className="w-4 h-4 mr-3 opacity-70 group-hover:opacity-100 group-hover:text-accent" />
            Jobs on Katalyst Hire
          </Link>

          <Link
            href="/jobs"
            className="flex items-center px-3 py-2.5 rounded-md hover:bg-ink-2 transition-colors font-medium text-sm text-cream-2 group"
          >
            <Briefcase className="w-4 h-4 mr-3 opacity-70 group-hover:opacity-100 group-hover:text-accent" />
            Browse Jobs
          </Link>

          <Link
            href="/mock-interview"
            className="flex items-center px-3 py-2.5 rounded-md hover:bg-ink-2 transition-colors font-medium text-sm text-cream-2 group"
          >
            <UserCircle className="w-4 h-4 mr-3 opacity-70 group-hover:opacity-100 group-hover:text-accent" />
            Mock Interview
          </Link>

          <Link
            href="/applications"
            className="flex items-center px-3 py-2.5 rounded-md hover:bg-ink-2 transition-colors font-medium text-sm text-cream-2 group"
          >
            <CheckCircle className="w-4 h-4 mr-3 opacity-70 group-hover:opacity-100 group-hover:text-accent" />
            My Applications
          </Link>

          <Link
            href="/contest-upskilling"
            className="flex items-center px-3 py-2.5 rounded-md hover:bg-ink-2 transition-colors font-medium text-sm text-cream-2 group"
          >
            <Target className="w-4 h-4 mr-3 opacity-70 group-hover:opacity-100 group-hover:text-accent" />
            Contest & Upskilling
          </Link>
        </nav>

        <div className="mt-auto p-4 m-3 rounded-lg bg-ink-2/40 border border-rule-med flex items-center gap-3 hover:bg-ink-2/80 transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-accent text-cream flex items-center justify-center font-bold font-serif text-sm shadow-sm">
            AV
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-cream">
              Arpit Verma
            </span>
            <span className="text-xs text-muted">Student</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-cream-2 relative">
        {children}
      </main>
    </div>
  );
}
