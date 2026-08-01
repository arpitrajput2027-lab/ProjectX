"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, GraduationCap } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-cream text-ink font-body selection:bg-accent selection:text-cream flex flex-col">
      {/* --- NAVIGATION --- */}
      <header className="fixed top-0 left-0 right-0 h-[72px] z-40 bg-cream/80 backdrop-blur-md border-b border-rule-lt flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-ink text-cream rounded-[4px] flex items-center justify-center font-serif font-bold text-sm">RI</div>
          <span className="font-mono text-xs tracking-widest text-ink uppercase font-semibold">ReadyIndex</span>
        </div>
      </header>

      {/* --- GATEWAY HERO --- */}
      <main className="flex-1 flex flex-col items-center justify-center pt-[72px] px-6">
        <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-accent mb-8 bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
          The New Standard in Hiring
        </div>
        
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] text-ink mb-12 max-w-4xl text-center">
          Where skills speak <br />
          <span className="text-ink-2 italic font-light">louder than resumes.</span>
        </h1>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-2xl justify-center">
          <Link 
            href="/student"
            className="w-full flex-1 flex flex-col items-center justify-center gap-3 bg-white border border-rule-med hover:border-accent hover:shadow-md text-ink p-8 rounded-xl transition-all group"
          >
            <div className="w-12 h-12 bg-cream text-accent rounded-full flex items-center justify-center mb-2">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="font-mono text-xs tracking-widest uppercase font-semibold">For Students</span>
            <span className="text-sm text-ink-3 text-center">Build your profile, prove your skills, and get hired.</span>
            <div className="mt-2 text-accent flex items-center gap-1 text-xs uppercase tracking-widest font-mono font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Explore</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          
          <Link 
            href="/recruiter"
            className="w-full flex-1 flex flex-col items-center justify-center gap-3 bg-white border border-rule-med hover:border-ink hover:shadow-md text-ink p-8 rounded-xl transition-all group"
          >
            <div className="w-12 h-12 bg-cream text-ink rounded-full flex items-center justify-center mb-2">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="font-mono text-xs tracking-widest uppercase font-semibold">For Recruiters</span>
            <span className="text-sm text-ink-3 text-center">Find verified talent with zero noise and objective scoring.</span>
            <div className="mt-2 text-ink flex items-center gap-1 text-xs uppercase tracking-widest font-mono font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Explore</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-rule-lt py-6 bg-cream text-center mt-auto">
        <div className="font-mono text-[10px] tracking-widest text-ink-3 uppercase">ReadyIndex © 2025</div>
      </footer>
    </div>
  );
}
