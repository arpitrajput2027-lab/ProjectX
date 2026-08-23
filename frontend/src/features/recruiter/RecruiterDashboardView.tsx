"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Users, Briefcase, FileText, ArrowUpRight, Clock, MapPin, X, DollarSign, Pencil, Trash2, Pause, Play, ChevronDown, UserCircle } from "lucide-react";
import PostJobModal from "@/components/modals/PostJobModal";
import { ProfileView } from "@/features/profile/ProfileView";

export function RecruiterDashboardView() {
  const [recruiter, setRecruiter] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalPlatformCandidates, setTotalPlatformCandidates] = useState(0);

  // View All toggle
  const [showAllJobs, setShowAllJobs] = useState(false);

  // Job Detail Drawer
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [drawerMode, setDrawerMode] = useState<'details' | 'candidates'>('candidates');
  
  // Applications for selected job
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  // Student Profile Drawer
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Fetch recruiter and company info
    const { data: profile } = await supabase
      .from('recruiter_profiles')
      .select('*, company_profiles(*)')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (profile) {
      setRecruiter(profile);
      if (profile.company_profiles) {
        setCompany(profile.company_profiles);
      }

      // Fetch jobs posted by this recruiter with application count
      const { data: jobsData } = await supabase
        .from('jobs')
        .select(`*, applications(count)`)
        .eq('recruiter_id', profile.id)
        .order('created_at', { ascending: false });

      if (jobsData) {
        setJobs(jobsData);
      }

      // Fetch total candidates in platform
      const { count } = await supabase
        .from('student_profiles')
        .select('*', { count: 'exact', head: true });
        
      if (count !== null) {
        setTotalPlatformCandidates(count);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
  }, []);

  // Fetch applications when a job is selected
  useEffect(() => {
    const fetchApplications = async () => {
      if (!selectedJob) {
        setJobApplications([]);
        return;
      }

      setLoadingApplications(true);
      const { data } = await supabase
        .from('applications')
        .select(`
          *,
          student:student_profiles(*)
        `)
        .eq('job_id', selectedJob.id)
        .order('applied_at', { ascending: false });

      if (data) {
        setJobApplications(data);
      }
      setLoadingApplications(false);
    };

    fetchApplications();
  }, [selectedJob]);

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', applicationId);

    if (!error) {
      setJobApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
    }
  };

  const activeJobsCount = jobs.filter(j => j.status === 'active').length;
  const totalApplications = jobs.reduce((sum, job) => sum + (job.applications?.[0]?.count || 0), 0);

  // Jobs to show: recent 5 or all
  const displayedJobs = showAllJobs ? jobs : jobs.slice(0, 5);

  // Toggle job status
  const toggleJobStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    const { error } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', jobId);

    if (!error) {
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
      if (selectedJob?.id === jobId) {
        setSelectedJob((prev: any) => ({ ...prev, status: newStatus }));
      }
    }
  };

  // Delete job
  const deleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) return;
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);

    if (!error) {
      setJobs(prev => prev.filter(j => j.id !== jobId));
      if (selectedJob?.id === jobId) setSelectedJob(null);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-success-lt text-success',
      paused: 'bg-yellow-50 text-yellow-600',
      closed: 'bg-red-50 text-red-500',
    };
    return colors[status] || 'bg-cream text-muted';
  };

  const appStatusColors: Record<string, string> = {
    applied: 'bg-blue-50 text-blue-600',
    interview_scheduled: 'bg-purple-50 text-purple-600',
    selected: 'bg-success-lt text-success',
    rejected: 'bg-red-50 text-red-600'
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="font-serif text-4xl text-ink mb-2">
            Welcome back, {recruiter?.full_name?.split(' ')[0] || 'Recruiter'}
          </h1>
          <p className="text-ink-3">
            {company?.name ? `${company.name} Dashboard` : "Here's what's happening with your job postings."}
          </p>
        </div>
        <button 
          onClick={() => setIsPostJobModalOpen(true)}
          className="bg-ink text-cream px-5 py-2.5 rounded-md font-mono text-[11px] uppercase tracking-widest hover:bg-accent transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job</span>
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-rule-med p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-accent-lt text-accent flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">Active Jobs</div>
          <div className="font-serif text-3xl text-ink">{activeJobsCount}</div>
        </div>
        
        <div className="bg-white border border-rule-med p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-success-lt text-success flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">Available Candidates</div>
          <div className="font-serif text-3xl text-ink">{totalPlatformCandidates}</div>
        </div>

        <div className="bg-white border border-rule-med p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">Total Applications</div>
          <div className="font-serif text-3xl text-ink">{totalApplications}</div>
        </div>
      </div>

      {/* Job Postings List */}
      <div className="bg-white border border-rule-med rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-rule-lt flex justify-between items-center bg-[#fcfbfa]">
          <h2 className="font-serif text-xl text-ink">
            {showAllJobs ? "All Job Postings" : "Recent Job Postings"}
            <span className="ml-2 text-sm font-mono text-muted">({jobs.length})</span>
          </h2>
          {jobs.length > 5 && (
            <button 
              onClick={() => setShowAllJobs(!showAllJobs)}
              className="text-accent hover:text-ink transition-colors font-mono text-[10px] uppercase tracking-widest flex items-center gap-1"
            >
              {showAllJobs ? "Show Recent" : "View All"} <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-ink-3 text-sm font-mono uppercase tracking-widest">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mb-4 border border-rule-lt">
              <Briefcase className="w-6 h-6 text-muted" />
            </div>
            <h3 className="font-serif text-xl text-ink mb-2">No active jobs</h3>
            <p className="text-sm text-ink-3 max-w-sm mb-6">You haven&apos;t posted any jobs yet. Create your first job posting to start matching with our verified talent pool.</p>
            <button 
              onClick={() => setIsPostJobModalOpen(true)}
              className="bg-white border border-rule-med text-ink px-5 py-2.5 rounded-md font-mono text-[11px] uppercase tracking-widest hover:border-accent hover:text-accent transition-colors"
            >
              Create Job Post
            </button>
          </div>
        ) : (
          <div className="divide-y divide-rule-lt">
            {displayedJobs.map(job => (
              <div 
                key={job.id} 
                onClick={() => { setSelectedJob(job); setDrawerMode('details'); }}
                className="p-6 hover:bg-cream/50 transition-colors flex justify-between items-center group cursor-pointer"
              >
                <div>
                  <h3 className="font-medium text-ink text-lg flex items-center gap-2 mb-1 group-hover:text-accent transition-colors">
                    {job.title}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest ${statusBadge(job.status)}`}>
                      {job.status}
                    </span>
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-ink-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location || "Remote"} ({job.work_mode})</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-xl font-serif text-ink">{job.applications?.[0]?.count || 0}</div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted">Candidates</div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedJob(job); setDrawerMode('candidates'); }}
                    className="text-ink-3 hover:text-accent border border-rule-med px-3 py-1.5 rounded text-xs font-medium bg-white transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Slide-bar */}
      {selectedJob && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setSelectedJob(null)}
          ></div>
          <div className="relative bg-cream-2 w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 bg-white border-b border-rule-med sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-serif font-medium text-ink">{selectedJob.title}</h2>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest ${statusBadge(selectedJob.status)}`}>
                  {selectedJob.status}
                </span>
              </div>
              <button 
                onClick={() => setSelectedJob(null)} 
                className="p-2 hover:bg-cream rounded-full transition-colors text-ink-3 hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Key Info Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-rule-med rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted text-xs font-mono uppercase tracking-widest mb-2">
                    <Briefcase className="w-3.5 h-3.5" /> Target Role
                  </div>
                  <div className="text-sm font-medium text-ink">{selectedJob.target_role || "Not specified"}</div>
                </div>
                <div className="bg-white border border-rule-med rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted text-xs font-mono uppercase tracking-widest mb-2">
                    <MapPin className="w-3.5 h-3.5" /> Location
                  </div>
                  <div className="text-sm font-medium text-ink">{selectedJob.location || "Remote"} ({selectedJob.work_mode})</div>
                </div>
              </div>

              {drawerMode === 'details' ? (
                <>
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
                </>
              ) : (
                <>
                  {/* Candidates Section */}
                  <div className="bg-white border border-rule-med rounded-lg p-5">
                    <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-4 border-b border-rule-lt pb-2">Candidates Applied ({jobApplications.length})</h4>
                    
                    {loadingApplications ? (
                      <div className="text-center py-8 text-xs font-mono text-muted uppercase tracking-widest animate-pulse">
                        Loading candidates...
                      </div>
                    ) : jobApplications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-12 h-12 bg-cream rounded-full flex items-center justify-center mb-3 border border-rule-lt">
                          <Users className="w-5 h-5 text-muted" />
                        </div>
                        <p className="text-sm text-ink-3">No candidates have applied yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {jobApplications.map(app => (
                          <div key={app.id} className="border border-rule-med rounded-lg p-4 flex items-center justify-between hover:border-accent/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-cream rounded-full flex items-center justify-center text-lg font-serif text-ink uppercase">
                                {app.student?.full_name ? app.student.full_name.charAt(0) : "C"}
                              </div>
                              <div>
                                <div className="font-medium text-ink hover:text-accent cursor-pointer transition-colors" onClick={() => setSelectedStudentId(app.student.user_id)}>
                                  {app.student?.full_name || "Unknown Candidate"}
                                </div>
                                <div className="text-xs text-ink-3 mt-0.5">Match: <span className="font-medium text-ink-2">{app.match_score}%</span></div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <select 
                                  value={app.status}
                                  onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                                  className={`appearance-none pl-3 pr-8 py-1.5 rounded text-xs font-mono uppercase tracking-widest border outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer ${appStatusColors[app.status] || 'bg-cream text-ink border-rule-med'}`}
                                >
                                  <option value="applied">Applied</option>
                                  <option value="interview_scheduled">Interview</option>
                                  <option value="selected">Selected</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                                <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                              </div>
                              
                              <button 
                                onClick={() => setSelectedStudentId(app.student.user_id)}
                                className="text-xs font-medium text-ink-3 hover:text-accent border border-rule-med bg-cream hover:bg-white px-3 py-1.5 rounded transition-colors"
                              >
                                Profile
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {/* Footer Actions */}
            <div className="p-4 bg-white border-t border-rule-med flex justify-between items-center sticky bottom-0 z-10">
              <button 
                onClick={() => deleteJob(selectedJob.id)}
                className="text-red-500 hover:text-red-700 text-[11px] font-mono uppercase tracking-widest flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={() => toggleJobStatus(selectedJob.id, selectedJob.status)}
                  className="border border-rule-med text-ink px-4 py-2 rounded text-[11px] font-mono uppercase tracking-widest hover:border-accent hover:text-accent transition-colors flex items-center gap-1.5"
                >
                  {selectedJob.status === 'active' ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Activate</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Slide-bar (Overlays the Job Detail drawer) */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setSelectedStudentId(null)}
          ></div>
          <div className="relative bg-cream-2 w-full max-w-4xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 bg-white border-b border-rule-med sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-serif font-medium text-ink">Candidate Profile</h2>
              </div>
              <button 
                onClick={() => setSelectedStudentId(null)} 
                className="p-2 hover:bg-cream rounded-full transition-colors text-ink-3 hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <ProfileView studentId={selectedStudentId} readOnly={true} />
            </div>
            
            <div className="p-4 bg-white border-t border-rule-med flex justify-end gap-3 sticky bottom-0 z-10">
              <button 
                onClick={() => setSelectedStudentId(null)}
                className="px-6 py-2 text-[11px] font-mono uppercase tracking-widest text-ink-3 hover:text-ink transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      <PostJobModal 
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
        recruiterId={recruiter?.id || ''}
        companyId={company?.id || ''}
        onJobPosted={fetchDashboardData}
      />
    </div>
  );
}
