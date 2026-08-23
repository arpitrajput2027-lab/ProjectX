"use client";

import React, { useState, useEffect } from "react";
import { UploadCloud, FileText, Users, Award, Zap, X, ChevronRight, CheckCircle, Mail, Calendar as CalendarIcon, Loader2, UserCircle } from "lucide-react";
import { ProfileView } from "@/features/profile/ProfileView";

type TabType = 'resumes' | 'candidates' | 'ranking' | 'actions';

export function BulkResumeView() {
  const [activeTab, setActiveTab] = useState<TabType>('resumes');
  
  // Data states
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");
  
  const [jobs, setJobs] = useState<any[]>([]); // To fetch jobs for dropdown
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isFetchingCandidates, setIsFetchingCandidates] = useState(false);
  const [isRanking, setIsRanking] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Fetch Mock Jobs for now, or real ones if endpoint exists
  // Assuming a generic /api/jobs exists, but we'll hardcode options for MVP if not
  
  useEffect(() => {
    fetch('http://localhost:8000/api/recruiters/my-jobs')
      .then(r => r.json())
      .then(data => setJobs(data.data || []))
      .catch(err => console.error("Failed to fetch jobs:", err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (!selectedJobId || files.length === 0) return;
    
    setIsUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append("files", file);
    });

    try {
      const res = await fetch(`http://localhost:8000/api/recruiters/jobs/${selectedJobId}/bulk-resumes`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error("Upload failed");
      
      setUploadComplete(true);
      // Switch to candidates tab after 2 seconds
      setTimeout(() => setActiveTab('candidates'), 2000);
      
    } catch (error) {
      console.error("Error uploading resumes:", error);
      alert("Failed to upload resumes.");
    } finally {
      setIsUploading(false);
    }
  };

  const fetchCandidates = async () => {
    if (!selectedJobId) return;
    setIsFetchingCandidates(true);
    try {
      const res = await fetch(`http://localhost:8000/api/recruiters/jobs/${selectedJobId}/candidates`);
      const data = await res.json();
      setCandidates(data.data || []);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setIsFetchingCandidates(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'candidates' || activeTab === 'ranking') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCandidates();
    }
  }, [activeTab, selectedJobId]);

  const handleRank = async () => {
    if (!selectedJobId) return;
    setIsRanking(true);
    try {
      const res = await fetch(`http://localhost:8000/api/recruiters/jobs/${selectedJobId}/rank`, {
        method: 'POST'
      });
      if (res.ok) {
        await fetchCandidates(); // Refresh list to get new scores
      }
    } catch (error) {
      console.error("Error ranking:", error);
    } finally {
      setIsRanking(false);
    }
  };

  const renderTabs = () => (
    <div className="flex space-x-2 mb-8 border-b border-rule-lt pb-2">
      {(['resumes', 'candidates', 'ranking', 'actions'] as TabType[]).map(tab => (
        <button 
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 text-sm font-mono uppercase tracking-widest rounded-t-md transition-colors ${
            activeTab === tab 
              ? 'bg-ink text-cream border-t border-l border-r border-ink' 
              : 'text-muted hover:text-ink hover:bg-cream-2 border border-transparent'
          }`}
        >
          {tab === 'actions' ? 'Action Require' : tab}
        </button>
      ))}
    </div>
  );

  const renderResumesTab = () => (
    <div className="animate-in fade-in duration-300">
      <div className="bg-white border border-rule-med p-8 rounded-xl shadow-sm max-w-2xl mx-auto">
        <h3 className="font-serif text-2xl text-ink mb-6 text-center">Upload Bulk Resumes</h3>
        
        <div className="mb-6">
          <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">Target Job Profile</label>
          <select 
            value={selectedJobId} 
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:border-accent outline-none"
          >
            <option value="">-- Select a Job Post --</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </div>

        {!uploadComplete ? (
          <>
            <div className="border-2 border-dashed border-rule-med rounded-xl p-12 text-center bg-cream-2 relative mb-6 hover:bg-cream transition-colors group cursor-pointer">
              <input
                type="file"
                multiple
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex justify-center mb-4 text-accent group-hover:scale-110 transition-transform">
                <UploadCloud size={48} />
              </div>
              <p className="text-ink font-medium text-lg mb-1">Drag & drop PDFs here</p>
              <p className="text-muted text-sm mb-3">or click to browse files</p>
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest">Max 500 files (up to 100MB total)</p>
            </div>

            {files.length > 0 && (
              <div className="mb-6 bg-cream border border-rule-lt p-4 rounded-lg">
                <div className="text-xs font-mono uppercase tracking-widest text-muted mb-3">Selected Files ({files.length})</div>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-rule-lt">
                      <div className="flex items-center gap-2 text-sm text-ink-2 truncate">
                        <FileText size={14} className="text-accent flex-shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </div>
                      <button 
                        onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                        className="text-red-400 hover:text-red-600 p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={handleUpload}
              disabled={files.length === 0 || !selectedJobId || isUploading}
              className="w-full bg-ink text-cream py-3 rounded-md font-mono text-[11px] uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isUploading ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : "Process Resumes"}
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-success-lt rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-success" />
            </div>
            <h3 className="font-serif text-3xl text-ink mb-2">Upload Complete!</h3>
            <p className="text-ink-3 mb-8">Successfully queued {files.length} resumes for background AI parsing.</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => { setUploadComplete(false); setFiles([]); }}
                className="px-6 py-2 border border-rule-med rounded-md text-[11px] font-mono uppercase tracking-widest hover:border-accent hover:text-accent transition-colors"
              >
                Upload More
              </button>
              <button 
                onClick={() => setActiveTab('candidates')}
                className="px-6 py-2 bg-ink text-cream rounded-md text-[11px] font-mono uppercase tracking-widest hover:bg-accent transition-colors flex items-center gap-2"
              >
                View Candidates <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCandidatesTab = () => (
    <div className="animate-in fade-in duration-300">
      <div className="bg-white border border-rule-med rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-rule-lt flex justify-between items-center bg-cream/30">
          <h2 className="font-serif text-xl text-ink">Extracted Candidates</h2>
          <button 
            onClick={() => {
              setActiveTab('ranking');
              handleRank();
            }}
            disabled={!selectedJobId}
            className="text-xs bg-ink text-cream hover:bg-accent px-4 py-2 rounded-md font-mono uppercase tracking-widest transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            Run Ranking Engine <Zap size={14} />
          </button>
        </div>
        
        {isFetchingCandidates ? (
          <div className="p-12 text-center text-muted flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-accent" />
            <p>Fetching candidates...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4 border border-rule-lt">
              <Users className="w-6 h-6 text-muted" />
            </div>
            <p className="text-ink-3 max-w-md mx-auto">
              No candidates found for this job yet. Try uploading resumes first.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-rule-lt max-h-[500px] overflow-y-auto">
            {candidates.map((app, i) => (
              <div 
                key={app.id} 
                className="p-4 flex items-center justify-between hover:bg-cream-2 transition-colors cursor-pointer"
                onClick={() => setSelectedStudentId(app.student_profiles?.id)}
              >
                <div>
                  <h4 className="font-medium text-ink group-hover:text-accent transition-colors">
                    {app.student_profiles?.full_name || "Processing..."}
                  </h4>
                  <p className="text-xs text-ink-3 mt-1">
                    Status: <span className="uppercase font-mono tracking-widest text-[10px] px-2 py-0.5 bg-cream border border-rule-lt rounded">{app.status}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-muted block mb-1">Skills Extracted</span>
                  <div className="flex gap-1">
                    {(app.student_profiles?.skills || []).slice(0, 3).map((s:any, idx:number) => (
                      <span key={idx} className="bg-ink text-cream text-[9px] px-1.5 py-0.5 rounded">{s.category_name}</span>
                    ))}
                    {(app.student_profiles?.skills?.length || 0) > 3 && <span className="text-xs text-muted">...</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderRankingTab = () => (
    <div className="animate-in fade-in duration-300">
      <div className="bg-white border border-rule-med rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-rule-lt flex justify-between items-center bg-cream/30">
          <div>
            <h2 className="font-serif text-xl text-ink">AI Candidate Ranking</h2>
            <p className="text-xs text-muted font-mono mt-1">Hybrid Score = 40% AI + 30% Embeddings + 30% BM25</p>
          </div>
          <button 
            onClick={() => setActiveTab('actions')}
            className="text-xs bg-ink text-cream hover:bg-accent px-4 py-2 rounded-md font-mono uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            Proceed to Actions <ChevronRight size={14} />
          </button>
        </div>
        
        {isRanking ? (
          <div className="p-12 text-center text-muted flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-accent" />
            <p>AI Engine is analyzing and ranking profiles...</p>
          </div>
        ) : (
          <div className="divide-y divide-rule-lt max-h-[500px] overflow-y-auto">
            {/* Sort candidates by match score desc */}
            {[...candidates].sort((a,b) => (b.match_score || 0) - (a.match_score || 0)).map((c, i) => (
              <div 
                key={c.id} 
                className="p-4 flex items-center justify-between hover:bg-cream-2 transition-colors cursor-pointer group"
                onClick={() => setSelectedStudentId(c.student_profiles?.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-ink text-cream flex items-center justify-center font-serif text-xs">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-ink group-hover:text-accent transition-colors">
                      {c.student_profiles?.full_name}
                    </h4>
                    <p className="text-xs text-ink-3">Extracted {c.student_profiles?.skills?.length || 0} skill categories</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-lg font-serif text-ink">{c.match_score || 0}%</div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-muted">Match</div>
                  </div>
                  <div className={`w-2 h-10 rounded-full ${(c.match_score || 0) > 90 ? 'bg-success' : (c.match_score || 0) > 75 ? 'bg-accent' : 'bg-yellow-400'}`}></div>
                </div>
              </div>
            ))}
            {candidates.length === 0 && (
               <div className="p-8 text-center text-muted text-sm">No candidates available to rank.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderActionsTab = () => (
    <div className="animate-in fade-in duration-300 grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <div className="bg-white border border-rule-med rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-rule-lt pb-4">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Mail size={20} />
          </div>
          <div>
            <h3 className="font-serif text-lg text-ink">Email Top Candidates</h3>
            <p className="text-xs text-muted font-mono mt-1">Select top K candidates</p>
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">Select Top &apos;K&apos;</label>
            <input type="number" defaultValue={5} min={1} className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:border-accent outline-none" />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">Email Template</label>
            <select className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:border-accent outline-none">
              <option>Interview Invitation (Standard)</option>
              <option>Coding Assessment Request</option>
              <option>Rejection (Polite)</option>
            </select>
          </div>
        </div>
        
        <button className="w-full bg-ink text-cream py-2.5 rounded-md font-mono text-[11px] uppercase tracking-widest hover:bg-accent transition-colors text-center">
          Send Emails (Demo)
        </button>
      </div>

      <div className="bg-white border border-rule-med rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-rule-lt pb-4">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h3 className="font-serif text-lg text-ink">Schedule Interviews</h3>
            <p className="text-xs text-muted font-mono mt-1">Move to interview stage</p>
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">Select Candidates</label>
            <select className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:border-accent outline-none">
              <option>Top 5 Ranked</option>
              <option>All Selected</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">Default Duration</label>
            <select className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:border-accent outline-none">
              <option>30 Minutes</option>
              <option>45 Minutes</option>
              <option>60 Minutes</option>
            </select>
          </div>
        </div>
        
        <button 
          onClick={async () => {
             // Mock sending schedule requests for top 1
             if (candidates.length > 0) {
                 alert("Scheduling feature connected! Mock scheduling Top candidate.");
             }
          }}
          className="w-full border border-ink text-ink bg-white py-2.5 rounded-md font-mono text-[11px] uppercase tracking-widest hover:bg-cream-2 transition-colors text-center"
        >
          Proceed to Scheduling
        </button>
      </div>

    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto font-body animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="font-serif text-4xl text-ink mb-2">Bulk Resume Processing</h1>
        <p className="text-sm text-ink-3">Upload, parse, rank, and manage candidates in bulk.</p>
      </header>

      {renderTabs()}

      <div className="mt-6">
        {activeTab === 'resumes' && renderResumesTab()}
        {activeTab === 'candidates' && renderCandidatesTab()}
        {activeTab === 'ranking' && renderRankingTab()}
        {activeTab === 'actions' && renderActionsTab()}
      </div>

      {/* Student Profile Slide-bar */}
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
    </div>
  );
}
