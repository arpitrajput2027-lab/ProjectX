"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, MapPin, Building, Clock, ArrowRight, DollarSign, X, CheckCircle } from "lucide-react";

export function JobBoardView() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");

  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applying, setApplying] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Get student profile
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (profile) {
        setStudentId(profile.id);
        
        // Get applied jobs
        const { data: apps } = await supabase
          .from('applications')
          .select('job_id')
          .eq('student_id', profile.id);
          
        if (apps) {
          setAppliedJobIds(new Set(apps.map(a => a.job_id)));
        }
      }
    }

    const { data } = await supabase
      .from('jobs')
      .select(`
        *,
        company:company_profiles(name, logo_url, industry, description, website)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (data) setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleApply = async (job: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!studentId || appliedJobIds.has(job.id)) return;

    setApplying(true);
    const { error } = await supabase
      .from('applications')
      .insert({
        student_id: studentId,
        job_id: job.id,
        status: 'applied',
        match_score: 92 // Mocked match score for MVP
      });

    if (!error) {
      setAppliedJobIds(prev => new Set(prev).add(job.id));
    } else {
      alert("Error applying to job.");
      console.error(error);
    }
    setApplying(false);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (job.company?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "All" || job.target_role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-8 max-w-5xl mx-auto font-body animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="font-serif text-4xl text-ink mb-2">Jobs on Katalyst Hire</h1>
        <p className="text-sm text-ink-3">Discover and apply to roles matched to your verified skills.</p>
      </header>

      {/* Search & Filters */}
      <div className="bg-white border border-rule-med p-4 rounded-xl shadow-sm mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            suppressHydrationWarning
            type="text" 
            placeholder="Search by job title or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-cream border border-rule-lt rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="w-full md:w-64">
          <select 
            suppressHydrationWarning
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full bg-cream border border-rule-lt rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
          >
            <option value="All">All Roles</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="Data Scientist">Data Scientist</option>
            <option value="Product Manager">Product Manager</option>
            <option value="Designer">Designer</option>
          </select>
        </div>
      </div>

      {/* Job List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <span className="font-mono text-xs tracking-widest uppercase text-muted animate-pulse">Loading opportunities...</span>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white border border-rule-med rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4 border border-rule-lt">
            <Search className="w-6 h-6 text-muted" />
          </div>
          <h3 className="font-serif text-xl text-ink mb-2">No jobs found</h3>
          <p className="text-sm text-ink-3 max-w-sm mx-auto">We couldn&apos;t find any jobs matching your current search criteria. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map(job => {
            const hasApplied = appliedJobIds.has(job.id);
            return (
              <div 
                key={job.id} 
                onClick={() => setSelectedJob(job)}
                className="bg-white border border-rule-med rounded-xl p-6 shadow-sm hover:shadow-md hover:border-accent/50 transition-all group flex flex-col md:flex-row gap-6 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-lg bg-cream border border-rule-lt flex items-center justify-center flex-shrink-0 text-xl font-serif text-ink uppercase">
                  {job.company?.name ? job.company.name.substring(0, 2) : "CO"}
                </div>

                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-serif text-xl text-ink group-hover:text-accent transition-colors">
                      {job.title}
                    </h3>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted bg-cream px-2 py-1 rounded">
                      {job.target_role}
                    </span>
                  </div>
                  
                  <div className="text-sm font-medium text-ink-2 mb-3">
                    {job.company?.name || "Unknown Company"} <span className="text-muted font-normal ml-1">• {job.company?.industry || "Tech"}</span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-ink-3 mb-4 font-mono">
                    <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location || "Remote"}</div>
                    <div className="flex items-center gap-1"><Building className="w-3 h-3" /> {job.work_mode || "Remote"}</div>
                    {job.salary && <div className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {job.salary}</div>}
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(job.created_at).toLocaleDateString()}</div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.required_skills?.slice(0, 5).map((skill: string) => (
                      <span key={skill} className="px-2 py-1 bg-cream-2 rounded text-[10px] font-mono text-ink-2 uppercase tracking-wider">
                        {skill}
                      </span>
                    ))}
                    {job.required_skills?.length > 5 && (
                      <span className="px-2 py-1 bg-cream-2 rounded text-[10px] font-mono text-muted uppercase tracking-wider">
                        +{job.required_skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex md:flex-col justify-end items-end gap-3 min-w-[120px]">
                  {hasApplied ? (
                    <button 
                      disabled
                      className="w-full bg-success-lt text-success px-4 py-2.5 rounded text-[11px] font-mono uppercase tracking-widest flex items-center justify-center gap-2 cursor-default border border-success/20"
                    >
                      <CheckCircle className="w-3 h-3" /> Applied
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => handleApply(job, e)}
                      disabled={applying}
                      className="w-full bg-ink text-cream px-4 py-2.5 rounded text-[11px] font-mono uppercase tracking-widest hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {applying ? "Applying..." : <>Apply <ArrowRight className="w-3 h-3" /></>}
                    </button>
                  )}
                  <div className="text-[10px] font-mono text-success bg-success-lt px-2 py-1 rounded w-full text-center">
                    92% Match
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Job Details Drawer */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setSelectedJob(null)}
          ></div>
          <div className="relative bg-cream-2 w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="flex items-start justify-between p-6 bg-white border-b border-rule-med sticky top-0 z-10">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-lg bg-cream border border-rule-lt flex items-center justify-center flex-shrink-0 text-xl font-serif text-ink uppercase mt-1">
                  {selectedJob.company?.name ? selectedJob.company.name.substring(0, 2) : "CO"}
                </div>
                <div>
                  <h2 className="text-2xl font-serif text-ink">{selectedJob.title}</h2>
                  <div className="text-sm font-medium text-ink-2 mt-1">
                    {selectedJob.company?.name} <span className="text-muted font-normal ml-1">• {selectedJob.company?.industry}</span>
                  </div>
                  {selectedJob.company?.website && (
                    <a href={selectedJob.company.website} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline mt-1 inline-block font-mono">
                      {selectedJob.company.website}
                    </a>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setSelectedJob(null)} 
                className="p-2 hover:bg-cream rounded-full transition-colors text-ink-3 hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Key Info Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-rule-med rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted text-xs font-mono uppercase tracking-widest mb-2">
                    <MapPin className="w-3.5 h-3.5" /> Location
                  </div>
                  <div className="text-sm font-medium text-ink">{selectedJob.location || "Remote"} ({selectedJob.work_mode})</div>
                </div>
                <div className="bg-white border border-rule-med rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted text-xs font-mono uppercase tracking-widest mb-2">
                    <DollarSign className="w-3.5 h-3.5" /> Salary
                  </div>
                  <div className="text-sm font-medium text-ink">{selectedJob.salary || "Not disclosed"}</div>
                </div>
              </div>

              {/* Company About (if exists) */}
              {selectedJob.company?.description && (
                <div className="bg-white border border-rule-med rounded-lg p-5">
                  <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">About {selectedJob.company.name}</h4>
                  <div className="text-sm text-ink-2 whitespace-pre-wrap leading-relaxed">
                    {selectedJob.company.description}
                  </div>
                </div>
              )}

              {/* Job Description */}
              <div className="bg-white border border-rule-med rounded-lg p-5">
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">Job Description</h4>
                <div className="text-sm text-ink-2 whitespace-pre-wrap leading-relaxed">
                  {selectedJob.description || "No description provided."}
                </div>
              </div>

              {/* Required Skills */}
              <div className="bg-white border border-rule-med rounded-lg p-5">
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">Required Skills</h4>
                {selectedJob.required_skills && selectedJob.required_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.required_skills.map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1.5 bg-cream-2 rounded-md text-xs font-mono text-ink-2 uppercase tracking-wider border border-rule-lt">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink-3">No skills specified.</p>
                )}
              </div>
            </div>
            
            {/* Footer Apply Button */}
            <div className="p-4 bg-white border-t border-rule-med flex justify-end sticky bottom-0 z-10">
              {appliedJobIds.has(selectedJob.id) ? (
                <button 
                  disabled
                  className="bg-success-lt text-success px-8 py-3 rounded text-[11px] font-mono uppercase tracking-widest flex items-center justify-center gap-2 cursor-default border border-success/20 w-full sm:w-auto"
                >
                  <CheckCircle className="w-4 h-4" /> Application Submitted
                </button>
              ) : (
                <button 
                  onClick={() => handleApply(selectedJob)}
                  disabled={applying}
                  className="bg-ink text-cream px-8 py-3 rounded text-[11px] font-mono uppercase tracking-widest hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto"
                >
                  {applying ? "Submitting..." : "Apply Now"}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
