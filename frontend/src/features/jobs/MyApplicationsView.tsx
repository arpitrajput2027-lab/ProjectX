"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, MapPin, Building, Clock, CheckCircle, Clock3, XCircle, FileText, Calendar, X, DollarSign, Briefcase } from "lucide-react";

export function MyApplicationsView() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Drawer state
  const [selectedApp, setSelectedApp] = useState<any>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile } = await supabase
          .from('student_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (profile) {
          const { data } = await supabase
            .from('applications')
            .select(`
              *,
              job:jobs (
                title, target_role, location, work_mode, salary, description, required_skills, created_at,
                company:company_profiles (name, logo_url, industry, website)
              )
            `)
            .eq('student_id', profile.id)
            .order('applied_at', { ascending: false });

          if (data) setApplications(data);
        }
      }
      setLoading(false);
    };
    
    fetchApplications();
  }, []);

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'applied':
        return { color: 'bg-blue-50 text-blue-600 border-blue-200', icon: <CheckCircle className="w-3 h-3" />, label: 'Applied' };
      case 'interview_scheduled':
        return { color: 'bg-purple-50 text-purple-600 border-purple-200', icon: <Calendar className="w-3 h-3" />, label: 'Interview' };
      case 'selected':
        return { color: 'bg-success-lt text-success border-success/30', icon: <CheckCircle className="w-3 h-3" />, label: 'Selected' };
      case 'rejected':
        return { color: 'bg-red-50 text-red-600 border-red-200', icon: <XCircle className="w-3 h-3" />, label: 'Rejected' };
      default:
        return { color: 'bg-cream text-muted border-rule-lt', icon: <Clock3 className="w-3 h-3" />, label: status };
    }
  };

  const filteredApps = applications.filter(app => {
    const job = app.job;
    if (!job) return false;
    
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (job.company?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 max-w-5xl mx-auto font-body animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="font-serif text-4xl text-ink mb-2">My Applications</h1>
        <p className="text-sm text-ink-3">Track the status of your job applications.</p>
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-cream border border-rule-lt rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
          >
            <option value="All">All Statuses</option>
            <option value="applied">Applied</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Application List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <span className="font-mono text-xs tracking-widest uppercase text-muted animate-pulse">Loading applications...</span>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white border border-rule-med rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4 border border-rule-lt">
            <FileText className="w-6 h-6 text-muted" />
          </div>
          <h3 className="font-serif text-xl text-ink mb-2">No applications found</h3>
          <p className="text-sm text-ink-3 max-w-sm mx-auto">
            {applications.length === 0 
              ? "You haven't applied to any jobs yet. Check out the Jobs board to start applying!" 
              : "We couldn't find any applications matching your search criteria."}
          </p>
          {applications.length === 0 && (
            <a 
              href="/jobs"
              className="mt-6 inline-block bg-ink text-cream px-5 py-2.5 rounded-md font-mono text-[11px] uppercase tracking-widest hover:bg-accent transition-colors"
            >
              Browse Jobs
            </a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredApps.map(app => {
            const config = getStatusConfig(app.status);
            return (
              <div 
                key={app.id} 
                onClick={() => setSelectedApp(app)}
                className="bg-white border border-rule-med rounded-xl p-6 shadow-sm hover:shadow-md hover:border-accent/50 transition-all flex flex-col md:flex-row gap-6 items-center cursor-pointer"
              >
                
                <div className="w-16 h-16 rounded-lg bg-cream border border-rule-lt flex items-center justify-center flex-shrink-0 text-xl font-serif text-ink uppercase">
                  {app.job?.company?.name ? app.job.company.name.substring(0, 2) : "CO"}
                </div>

                <div className="flex-grow w-full md:w-auto">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-serif text-xl text-ink">
                      {app.job?.title}
                    </h3>
                  </div>
                  
                  <div className="text-sm font-medium text-ink-2 mb-3">
                    {app.job?.company?.name || "Unknown Company"}
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-ink-3 font-mono">
                    <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {app.job?.location || "Remote"}</div>
                    <div className="flex items-center gap-1"><Building className="w-3 h-3" /> {app.job?.work_mode || "Remote"}</div>
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> Applied {new Date(app.applied_at).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 min-w-[150px] w-full md:w-auto mt-4 md:mt-0 border-t md:border-t-0 border-rule-lt pt-4 md:pt-0">
                  <div className={`px-4 py-2 rounded-full border ${config.color} text-[11px] font-mono uppercase tracking-widest flex items-center gap-2`}>
                    {config.icon} {config.label}
                  </div>
                  <div className="text-xs text-ink-3 font-mono">
                    Match Score: <span className="font-bold text-accent">{app.match_score}%</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Job Detail Slide-bar */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setSelectedApp(null)}
          ></div>
          <div className="relative bg-cream-2 w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="flex items-start justify-between p-6 bg-white border-b border-rule-med sticky top-0 z-10">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-lg bg-cream border border-rule-lt flex items-center justify-center flex-shrink-0 text-xl font-serif text-ink uppercase mt-1">
                  {selectedApp.job?.company?.name ? selectedApp.job.company.name.substring(0, 2) : "CO"}
                </div>
                <div>
                  <h2 className="text-xl font-serif text-ink">{selectedApp.job?.title}</h2>
                  <div className="text-sm font-medium text-ink-2 mt-1">
                    {selectedApp.job?.company?.name} <span className="text-muted font-normal ml-1">• {selectedApp.job?.company?.industry}</span>
                  </div>
                  {selectedApp.job?.company?.website && (
                    <a href={selectedApp.job.company.website} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline mt-1 inline-block font-mono">
                      {selectedApp.job.company.website}
                    </a>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setSelectedApp(null)} 
                className="p-2 hover:bg-cream rounded-full transition-colors text-ink-3 hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Application Status Banner */}
              {(() => {
                const config = getStatusConfig(selectedApp.status);
                return (
                  <div className={`px-5 py-3 rounded-lg border ${config.color} flex items-center justify-between`}>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {config.icon} Status: {config.label}
                    </div>
                    <div className="text-xs font-mono opacity-75">
                      Applied on {new Date(selectedApp.applied_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                );
              })()}

              {/* Key Info Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-rule-med rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted text-xs font-mono uppercase tracking-widest mb-2">
                    <Briefcase className="w-3.5 h-3.5" /> Target Role
                  </div>
                  <div className="text-sm font-medium text-ink">{selectedApp.job?.target_role || "Not specified"}</div>
                </div>
                <div className="bg-white border border-rule-med rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted text-xs font-mono uppercase tracking-widest mb-2">
                    <MapPin className="w-3.5 h-3.5" /> Location
                  </div>
                  <div className="text-sm font-medium text-ink">{selectedApp.job?.location || "Remote"} ({selectedApp.job?.work_mode})</div>
                </div>
                <div className="bg-white border border-rule-med rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted text-xs font-mono uppercase tracking-widest mb-2">
                    <DollarSign className="w-3.5 h-3.5" /> Salary
                  </div>
                  <div className="text-sm font-medium text-ink">{selectedApp.job?.salary || "Not disclosed"}</div>
                </div>
                <div className="bg-white border border-rule-med rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted text-xs font-mono uppercase tracking-widest mb-2">
                    <CheckCircle className="w-3.5 h-3.5" /> Match Score
                  </div>
                  <div className="text-sm font-medium text-accent">{selectedApp.match_score}%</div>
                </div>
              </div>

              {/* Job Description */}
              <div className="bg-white border border-rule-med rounded-lg p-5">
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">Job Description</h4>
                <div className="text-sm text-ink-2 whitespace-pre-wrap leading-relaxed">
                  {selectedApp.job?.description || "No description provided."}
                </div>
              </div>

              {/* Required Skills */}
              <div className="bg-white border border-rule-med rounded-lg p-5">
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">Required Skills</h4>
                {selectedApp.job?.required_skills && selectedApp.job.required_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.job.required_skills.map((skill: string, idx: number) => (
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
            
            {/* Footer */}
            <div className="p-4 bg-white border-t border-rule-med flex justify-end sticky bottom-0 z-10">
              <button 
                onClick={() => setSelectedApp(null)}
                className="px-6 py-2 text-[11px] font-mono uppercase tracking-widest text-ink-3 hover:text-ink transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
