"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, Users, Search, Target, UploadCloud, Mail, Filter, BarChart } from "lucide-react";
import AuthModal from "@/components/modals/AuthModal";

export function RecruiterLandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");

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
          <a href="#talent-pool" className="font-mono text-[10px] tracking-widest uppercase text-ink-3 hover:text-ink transition-colors pb-1 border-b border-transparent hover:border-accent">Talent Pool</a>
          <a href="#pipeline" className="font-mono text-[10px] tracking-widest uppercase text-ink-3 hover:text-ink transition-colors pb-1 border-b border-transparent hover:border-accent">Pipeline</a>
          <a href="#features" className="font-mono text-[10px] tracking-widest uppercase text-ink-3 hover:text-ink transition-colors pb-1 border-b border-transparent hover:border-accent">Features</a>
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
            className="font-mono text-[10px] tracking-widest uppercase px-4 py-2 border border-ink bg-ink text-cream rounded hover:bg-ink-2 transition-all"
          >
            Start Hiring
          </button>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <main className="pt-[72px]">
        <section className="relative flex flex-col lg:flex-row min-h-[calc(100vh-72px)] max-w-[1400px] mx-auto px-6 md:px-12 py-12 gap-12 bg-ink text-cream">
          
          {/* Left Content */}
          <div className="flex-1 flex flex-col justify-center max-w-2xl z-10">
            <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-accent mb-10 bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20 w-fit">
              <Briefcase className="w-3 h-3" />
              For Recruiters & Hiring Managers
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] tracking-tight leading-[0.95] text-cream mb-8">
              Hire verified talent <br />
              <span className="text-accent italic font-light ml-8 md:ml-16">with zero noise.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[#f4f0e8]/60 font-light leading-relaxed mb-10 max-w-lg">
              Stop sifting through hundreds of identical PDFs. Post a job, let AI match it against our verified Talent Pool, and process hundreds of candidates in minutes.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                <span className="font-mono text-[10px] tracking-widest uppercase text-cream/40 mb-1 block">Time to Shortlist</span>
                <span className="text-xl text-white font-serif"><strong className="text-accent">Minutes</strong>, not days</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                <span className="font-mono text-[10px] tracking-widest uppercase text-cream/40 mb-1 block">Candidate Quality</span>
                <span className="text-xl text-white font-serif">Verified Code & Skills</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => openAuth("signup")}
                className="flex items-center gap-2 bg-cream text-ink px-7 py-3.5 rounded-[4px] font-mono text-[10px] tracking-widest uppercase hover:bg-accent hover:text-white border border-cream hover:border-accent transition-all group"
              >
                <span>Create Company Profile</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Mockup (Hidden on small screens) */}
          <div className="hidden lg:flex flex-1 items-center justify-center relative">
            <div className="absolute inset-0 bg-accent blur-[100px] opacity-10 rounded-full"></div>
            <div className="w-full max-w-lg bg-[#222] border border-white/10 rounded-xl p-6 relative shadow-2xl z-10">
              
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3 text-cream">
                  <Users className="w-5 h-5 text-accent" />
                  <span className="font-serif text-xl">Talent Match</span>
                </div>
                <div className="font-mono text-[10px] uppercase text-cream/40">Req: Sr. Frontend Eng</div>
              </div>

              <div className="space-y-4">
                {[
                  { name: "Rahul Sharma", role: "Frontend Dev", score: "94%", tags: ["React", "TypeScript", "Redux"] },
                  { name: "Priya Menon", role: "Full Stack", score: "89%", tags: ["React", "Node.js"] },
                  { name: "Amit Verma", role: "UI Engineer", score: "82%", tags: ["Vue", "CSS"] },
                ].map((cand, i) => (
                  <div key={cand.name} className="bg-white/5 border border-white/10 p-4 rounded-lg flex items-center justify-between hover:border-accent/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-[#333] text-cream flex items-center justify-center font-serif text-sm">
                        {cand.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-cream">{cand.name}</div>
                        <div className="flex gap-2 mt-1">
                          {cand.tags.map(t => (
                            <span key={t} className="text-[9px] font-mono uppercase bg-accent/20 text-accent px-1.5 py-0.5 rounded">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs text-green-400 mb-1">{cand.score} Match</div>
                      <button className="text-[10px] font-mono uppercase text-cream/50 hover:text-cream border border-white/20 px-2 py-1 rounded">Shortlist</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- PIPELINE FLOW --- */}
        <section id="pipeline" className="py-24 bg-[#f4f0e8] border-y border-rule-lt">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="font-mono text-[10px] tracking-widest uppercase text-muted mb-8 pb-4 border-b border-rule-lt">— 01 / The Pipeline</div>
            <h2 className="font-serif text-4xl md:text-5xl font-light leading-tight text-ink mb-16 text-center">
              The end-to-end ecosystem. <br /><em className="italic text-accent">Automated.</em>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                "Post Job", "Discover", "Filter", "Shortlist", "Communicate", "Hire"
              ].map((step, i) => (
                <div key={step} className="flex flex-col items-center text-center group">
                  <div className="w-12 h-12 rounded-full bg-cream border border-rule-med flex items-center justify-center mb-4 group-hover:border-accent group-hover:bg-accent group-hover:text-white transition-all font-mono text-sm text-ink-3">
                    0{i+1}
                  </div>
                  <div className="font-serif text-lg text-ink">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- DETAILED FEATURES --- */}
        <section id="features" className="py-24 bg-cream">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="font-mono text-[10px] tracking-widest uppercase text-muted mb-8 pb-4 border-b border-rule-lt">— 02 / Recruiter Tools</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-rule-lt rounded-lg overflow-hidden">
              {[
                { icon: <Search />, title: "AI-Powered Talent Pool", desc: "Search a database of students ranked not by college name, but by verified GitHub commits, LeetCode stats, and actual code output." },
                { icon: <Target />, title: "AI Candidate Matching", desc: "Upload your Job Description. Our AI instantly ranks hundreds of candidates based on how closely their real skills match your requirements." },
                { icon: <UploadCloud />, title: "Bulk Resume Processing", desc: "Running a campus drive? Upload 100+ resumes at once. AI parses them, creates profiles, and ranks them against your target role instantly." },
                { icon: <Filter />, title: "Advanced Filtering", desc: "Filter the talent pool by specific targeting roles (e.g. AI/ML Engineer), framework experience, or ReadyIndex ATS Score." },
                { icon: <Mail />, title: "Automated Bulk Email", desc: "Select 50 shortlisted candidates and send a customized assessment invite in one click. Dynamic templates insert names and roles automatically." },
                { icon: <BarChart />, title: "Pipeline Analytics", desc: "Track your entire funnel on a centralized dashboard. See application drop-offs, average match scores, and hiring velocity in real time." },
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
            <span className="font-mono text-[10px] tracking-widest uppercase text-accent/80 mb-6 block">Ready to hire?</span>
            <h2 className="font-serif text-5xl md:text-6xl text-cream mb-6 leading-tight">
              Screen less. <br /><em className="italic text-[#8b6a3e]">Interview better.</em>
            </h2>
            <p className="text-cream/50 mb-10 max-w-md mx-auto">
              Join forward-thinking companies who rely on actual skill verification rather than resume formatting.
            </p>
            <button 
              onClick={() => openAuth("signup")}
              className="inline-flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-[4px] font-mono text-[11px] tracking-widest uppercase hover:bg-accent-mid hover:border-accent transition-all border border-transparent"
            >
              Start Free Trial
            </button>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-ink border-t border-white/10 py-12 text-cream">
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-cream text-ink rounded-[2px] flex items-center justify-center font-serif font-bold text-[10px]">RI</div>
            <span className="font-mono text-[10px] tracking-widest text-cream uppercase font-semibold">ReadyIndex</span>
          </div>
          <div className="font-mono text-[9px] tracking-widest text-cream/40 uppercase">
            © 2025 · The New Standard in Hiring
          </div>
        </div>
      </footer>

      {/* --- AUTH MODAL --- */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        defaultMode={authMode} 
        targetRole="recruiter" 
      />
    </div>
  );
}
