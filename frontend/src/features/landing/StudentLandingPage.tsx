"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, GraduationCap, GitBranch, LineChart, MessageSquare, Briefcase, FileText, Bot, Target } from "lucide-react";
import AuthModal from "@/components/modals/AuthModal";

export function StudentLandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [activeStep, setActiveStep] = useState(0);

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-cream text-ink font-body selection:bg-accent selection:text-cream">
      {/* --- NAVIGATION --- */}
      <header className="fixed top-0 left-0 right-0 h-[72px] z-40 bg-cream/95 backdrop-blur-md border-b border-rule-lt flex items-center justify-between px-6 md:px-12 transition-all">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-6 h-6 bg-ink text-cream rounded-[3px] flex items-center justify-center font-serif font-bold text-sm transition-transform group-hover:scale-105">RI</div>
          <span className="font-mono text-xs tracking-widest text-ink uppercase font-semibold">ReadyIndex</span>
        </Link>
        <div className="flex items-center gap-8 hidden md:flex">
          <a href="#how-it-works" className="font-mono text-[10px] tracking-widest uppercase text-ink-3 hover:text-ink transition-colors pb-1 border-b border-transparent hover:border-accent">How it works</a>
          <a href="#features" className="font-mono text-[10px] tracking-widest uppercase text-ink-3 hover:text-ink transition-colors pb-1 border-b border-transparent hover:border-accent">Features</a>
          <a href="#journey" className="font-mono text-[10px] tracking-widest uppercase text-ink-3 hover:text-ink transition-colors pb-1 border-b border-transparent hover:border-accent">Journey</a>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => openAuth("login")}
            className="font-mono text-[10px] tracking-widest uppercase text-ink hover:text-accent transition-colors hidden sm:block"
          >
            Log In
          </button>
          <button 
            onClick={() => openAuth("signup")}
            className="font-mono text-[10px] tracking-widest uppercase px-4 py-2 border border-accent text-accent rounded hover:bg-accent hover:text-white transition-all"
          >
            Get your score
          </button>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <main className="pt-[72px]">
        <section className="relative flex flex-col lg:flex-row min-h-[calc(100vh-72px)] max-w-[1400px] mx-auto px-6 md:px-12 py-12 gap-12">
          
          {/* Left Content */}
          <div className="flex-1 flex flex-col justify-center max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-ink-3 mb-10">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Now in early access · India
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] tracking-tight leading-[0.95] text-ink mb-8">
              Know exactly <br />
              <span className="text-ink-2 italic font-light ml-8 md:ml-16">how ready.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-ink-3 font-light leading-relaxed mb-10 max-w-lg">
              ReadyIndex pulls your LeetCode, GitHub, LinkedIn & resume — analyzes everything in one place — and tells you <em className="text-accent italic">exactly</em> where you stand. No CGPA. No college filter. Skills only.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-12">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] tracking-widest uppercase text-muted">Score threshold</span>
                <span className="text-sm text-ink-2"><strong className="text-accent">76%</strong> to go public</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] tracking-widest uppercase text-muted">Data sources</span>
                <span className="text-sm text-ink-2">5 platforms</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] tracking-widest uppercase text-muted">Requirements</span>
                <span className="text-sm text-ink-2">Zero — skills only</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => openAuth("signup")}
                className="flex items-center gap-2 bg-ink text-cream px-7 py-3.5 rounded-[4px] font-mono text-[10px] tracking-widest uppercase hover:bg-accent border border-ink hover:border-accent transition-all group"
              >
                <span>Analyze my profile</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
              <a 
                href="#how-it-works"
                className="flex items-center gap-2 bg-transparent text-ink-3 px-7 py-3.5 rounded-[4px] font-mono text-[10px] tracking-widest uppercase border border-rule-med hover:border-ink-3 hover:text-ink transition-all"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Right Mockup (Hidden on small screens) */}
          <div className="hidden lg:flex flex-1 items-center justify-center border-l border-rule-lt pl-12 py-12 relative">
            <div className="w-full max-w-md bg-slate-50 border border-cream-3 rounded-lg p-6 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent"></div>
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-ink text-cream rounded-full flex items-center justify-center font-serif text-sm">AR</div>
                  <div>
                    <div className="font-mono text-xs text-ink-2 font-medium">Arpit Rajput</div>
                    <div className="text-[10px] text-muted font-mono uppercase tracking-widest mt-0.5">Targeting: SDE</div>
                  </div>
                </div>
                <div className="font-mono text-[9px] px-2 py-1 rounded bg-accent/10 border border-accent/20 text-accent uppercase tracking-wider">
                  Almost Ready
                </div>
              </div>

              {/* Mock Gauge */}
              <div className="relative h-32 mb-6 flex flex-col items-center justify-end">
                <svg viewBox="0 0 200 100" className="w-full absolute inset-0">
                  <path d="M20,90 A80,80 0 0,1 180,90" fill="none" stroke="#ede8dd" strokeWidth="8" strokeLinecap="round" />
                  <path d="M20,90 A80,80 0 0,1 180,90" fill="none" stroke="#8b6a3e" strokeWidth="8" strokeLinecap="round" strokeDasharray="251" strokeDashoffset="60" />
                  <line x1="45" y1="70" x2="38" y2="65" stroke="#8b6a3e" strokeWidth="1.5" />
                  <circle cx="45" cy="70" r="2.5" fill="#8b6a3e" />
                  <text x="25" y="60" fontSize="8" fill="#8b6a3e" className="font-mono">76%</text>
                </svg>
                <div className="font-serif text-5xl text-ink leading-none mb-1">72%</div>
                <div className="font-mono text-[8px] text-muted uppercase tracking-widest">ReadyIndex Score</div>
              </div>

              <div className="space-y-2 mb-6">
                {[
                  { label: "DSA", val: 58, width: "58%" },
                  { label: "Projects", val: 71, width: "71%" },
                  { label: "Role Fit", val: 78, width: "78%" },
                  { label: "Consistency", val: 65, width: "65%" },
                ].map(param => (
                  <div key={param.label} className="flex items-center gap-3">
                    <span className="font-mono text-[9px] text-ink-3 w-16 uppercase tracking-wider">{param.label}</span>
                    <div className="flex-1 h-1 bg-[#ede8dd] rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: param.width }}></div>
                    </div>
                    <span className="font-mono text-[9px] text-muted w-4 text-right">{param.val}</span>
                  </div>
                ))}
              </div>

              <div className="bg-[#f4f0e8] border border-rule-lt p-3 rounded text-xs text-ink-3 leading-relaxed flex gap-2">
                <ArrowRight className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span className="font-mono">Solve 30 more Medium LeetCode problems to unlock recruiter visibility.</span>
              </div>
            </div>
          </div>
        </section>

        {/* --- INTRO BAND --- */}
        <section className="bg-ink py-16 border-t border-rule-med text-cream">
          <div className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <p className="font-serif text-xl md:text-2xl font-light leading-relaxed text-[#f4f0e8]">
              Every year, <strong className="font-normal text-white">1.5 million</strong> engineering students graduate in India. Most don't know exactly where they stand. ReadyIndex changes that — one honest score that tells you <em className="italic text-accent">everything.</em>
            </p>
            <div className="flex flex-col gap-6">
              <div className="flex items-baseline gap-4 border-b border-white/10 pb-4">
                <span className="font-serif text-4xl text-[#8b6a3e] opacity-90">80%</span>
                <span className="font-mono text-[10px] tracking-widest uppercase text-cream/40">of applicants are unqualified for roles they apply to</span>
              </div>
              <div className="flex items-baseline gap-4 border-b border-white/10 pb-4">
                <span className="font-serif text-4xl text-[#8b6a3e] opacity-90">45d</span>
                <span className="font-mono text-[10px] tracking-widest uppercase text-cream/40">avg time to fill a single tech role in india</span>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="font-serif text-4xl text-[#8b6a3e] opacity-90">5</span>
                <span className="font-mono text-[10px] tracking-widest uppercase text-cream/40">platforms checked to understand one candidate</span>
              </div>
            </div>
          </div>
        </section>

        {/* --- THE PROBLEM --- */}
        <section className="py-24 bg-cream">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="font-mono text-[10px] tracking-widest uppercase text-muted mb-8 pb-4 border-b border-rule-lt">— 00 / The problem</div>
            <h2 className="font-serif text-4xl md:text-5xl font-light leading-tight text-ink mb-12">
              The market is broken <br /><em className="italic text-accent">on both sides.</em>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 border border-rule-lt rounded-lg overflow-hidden">
              <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-rule-lt bg-cream hover:bg-[#f4f0e8] transition-colors">
                <div className="font-serif text-5xl text-accent mb-4">5</div>
                <p className="text-sm text-ink-3 leading-relaxed">Platforms a recruiter must visit to understand one candidate — LeetCode, GitHub, LinkedIn, resume, portfolio. All separately.</p>
              </div>
              <div className="p-8 md:p-10 bg-cream hover:bg-[#f4f0e8] transition-colors">
                <div className="font-serif text-5xl text-accent mb-4">0</div>
                <p className="text-sm text-ink-3 leading-relaxed">Honest tools that tell a student exactly how ready they really are — and what to fix before applying.</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS (End-to-End) --- */}
        <section id="how-it-works" className="py-24 bg-slate-50 border-y border-rule-lt">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="font-mono text-[10px] tracking-widest uppercase text-muted mb-8 pb-4 border-b border-rule-lt">— 01 / The Journey</div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16 items-start">
              <div>
                <h2 className="font-serif text-4xl md:text-5xl font-light leading-tight text-ink mb-6">
                  From scattered data to <br /><em className="italic text-accent">one honest score.</em>
                </h2>
                <p className="text-ink-3 leading-relaxed">
                  Connect your profiles once. Our AI Career Intelligence Layer fetches everything automatically, cross-verifies claimed skills against actual code, and provides a continuous feedback loop: <span className="font-mono text-[11px] text-ink uppercase tracking-wider">Analyze → Improve → Match → Apply</span>.
                </p>
              </div>

              {/* Journey Steps List */}
              <div className="relative pl-6">
                <div className="absolute left-[27px] top-8 bottom-8 w-[1px] bg-gradient-to-b from-[#e2dbd0] via-accent to-[#e2dbd0]"></div>
                
                {[
                  { step: "01", title: "Intelligent Onboarding", desc: "Connect GitHub, LeetCode, and LinkedIn. Tell us your target role (e.g., SDE, Frontend)." },
                  { step: "02", title: "AI Resume Intelligence", desc: "Upload your existing PDF. Our AI parses it into structured data, spots weak points, and suggests improvements via RAG chat." },
                  { step: "03", title: "Job Description Matching", desc: "Paste a JD. See your match score instantly. AI identifies missing keywords and customizes your resume for that specific job." },
                  { step: "04", title: "Agentic Job Search", desc: "Our AI agent searches for jobs matching your skills, filters the noise, and prepares customized applications for your approval." },
                  { step: "05", title: "Mock Interview Coach", desc: "Practice before the real thing. Dynamic AI interviews based on your resume and target role, with detailed feedback." },
                ].map((item, i) => (
                  <div key={i} className="relative mb-10 last:mb-0 flex gap-6 group cursor-default">
                    <div className="w-[14px] h-[14px] bg-slate-50 border-[2px] border-accent rounded-full mt-1.5 flex-shrink-0 z-10 group-hover:scale-125 transition-transform"></div>
                    <div>
                      <div className="font-mono text-[10px] tracking-widest uppercase text-accent mb-1">{item.step}</div>
                      <h3 className="font-serif text-xl text-ink mb-2">{item.title}</h3>
                      <p className="text-sm text-ink-3 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- DETAILED FEATURES --- */}
        <section id="features" className="py-24 bg-cream">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="font-mono text-[10px] tracking-widest uppercase text-muted mb-8 pb-4 border-b border-rule-lt">— 02 / Features</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-rule-lt rounded-lg overflow-hidden">
              {[
                { icon: <Bot />, title: "RAG-Based Resume Chat", desc: "Ask 'What's missing for a Google SDE role?' Our AI knows your exact resume and gives hyper-personalized, actionable advice." },
                { icon: <FileText />, title: "ATS Optimizer", desc: "Check formatting, readability, and keywords. Get an instant ATS Score with a breakdown of exactly what a tracking system sees." },
                { icon: <Target />, title: "Resume-JD Matcher", desc: "Don't apply blind. Compare your profile to any job description. Know your Skill Gap before you click submit." },
                { icon: <Briefcase />, title: "Job Customization", desc: "With one click, AI restructures and rewrites your resume experience to perfectly align with a specific job's requirements." },
                { icon: <MessageSquare />, title: "AI Mock Interviews", desc: "Targeting Backend? The AI will grill you on System Design and Node.js based on what's actually on your resume." },
                { icon: <LineChart />, title: "Centralized Tracking", desc: "No more spreadsheets. Track Applied, Interviewing, and Rejected statuses automatically within your dashboard." },
              ].map((feat, i) => (
                <div key={i} className={`p-8 border-b border-rule-lt ${i % 3 !== 2 ? 'lg:border-r' : ''} ${i % 2 === 0 ? 'md:border-r' : ''} hover:bg-[#f4f0e8] hover:border-l-2 hover:border-l-accent transition-all`}>
                  <div className="text-accent mb-4">{feat.icon}</div>
                  <h3 className="font-serif text-lg text-ink mb-2">{feat.title}</h3>
                  <p className="text-sm text-ink-3 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- CTA --- */}
        <section className="py-32 bg-ink text-center relative overflow-hidden">
          <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(139,106,62,0.1)_0%,transparent_65%)] pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto px-6">
            <span className="font-mono text-[10px] tracking-widest uppercase text-accent/80 mb-6 block">Ready to go public?</span>
            <h2 className="font-serif text-5xl md:text-6xl text-cream mb-6 leading-tight">
              Stop guessing. <br /><em className="italic text-[#8b6a3e]">Start matching.</em>
            </h2>
            <p className="text-cream/50 mb-10 max-w-md mx-auto">
              Join thousands of engineering students who use ReadyIndex to prove their skills and land better jobs.
            </p>
            <button 
              onClick={() => openAuth("signup")}
              className="inline-flex items-center gap-2 bg-cream text-ink px-8 py-4 rounded-[4px] font-mono text-[11px] tracking-widest uppercase hover:bg-accent hover:text-white transition-all"
            >
              Get Your Score
            </button>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-[#f4f0e8] border-t border-rule-lt py-12">
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-ink text-cream rounded-[2px] flex items-center justify-center font-serif font-bold text-[10px]">RI</div>
            <span className="font-mono text-[10px] tracking-widest text-ink uppercase font-semibold">ReadyIndex</span>
          </div>
          <div className="font-mono text-[9px] tracking-widest text-muted uppercase">
            © 2025 · The New Standard in Hiring
          </div>
        </div>
      </footer>

      {/* --- AUTH MODAL --- */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        defaultMode={authMode} 
        targetRole="student" 
      />
    </div>
  );
}
