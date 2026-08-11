"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Video, Clock, User, Briefcase, MessageSquare, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

type FilterType = 'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export function InterviewsView() {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [interviews, setInterviews] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    setIsFetching(true);
    try {
      const res = await fetch("http://localhost:8000/api/interviews/");
      if (res.ok) {
        const data = await res.json();
        const formatted = (data.data || []).map((i: any) => ({
          id: i.id,
          candidateName: i.applications?.student_profiles?.full_name || "Unknown Candidate",
          jobTitle: i.applications?.jobs?.title || "Unknown Job",
          interviewerName: i.interviewer_name,
          scheduledAt: i.scheduled_at,
          durationMinutes: i.duration_minutes,
          status: i.status,
          meetingLink: i.meeting_link,
          rating: i.rating,
          feedbackText: i.feedback_text
        }));
        setInterviews(formatted);
      }
    } catch (error) {
      console.error("Failed to fetch interviews", error);
    } finally {
      setIsFetching(false);
    }
  };

  const filteredInterviews = filter === 'ALL' ? interviews : interviews.filter(i => i.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'COMPLETED': return 'bg-success-lt text-success border-success/30';
      case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-cream-2 text-ink-3 border-rule-med';
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto font-body animate-in fade-in duration-500">
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-white border border-rule-med rounded-xl shadow-sm">
            <Calendar className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="font-serif text-4xl text-ink">Interviews</h1>
            <p className="text-sm text-ink-3">Manage scheduled interviews and provide feedback.</p>
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-3 mb-8">
        {(['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-md text-xs font-mono uppercase tracking-widest transition-colors flex items-center gap-2 ${
              filter === f
                ? 'bg-ink text-cream'
                : 'bg-white border border-rule-med text-muted hover:border-accent hover:text-accent'
            }`}
          >
            {f} 
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filter === f ? 'bg-cream/20' : 'bg-cream-2'}`}>
              {f === 'ALL' ? interviews.length : interviews.filter(i => i.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {isFetching ? (
          <div className="bg-white border border-rule-med rounded-xl p-12 text-center flex flex-col items-center gap-3 text-muted">
            <Loader2 size={32} className="animate-spin text-accent" />
            <p>Loading interviews...</p>
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="bg-white border border-rule-med rounded-xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4 border border-rule-lt">
              <Calendar className="w-6 h-6 text-muted" />
            </div>
            <h3 className="font-serif text-xl text-ink mb-2">No {filter === 'ALL' ? '' : filter.toLowerCase()} interviews found</h3>
            <p className="text-sm text-ink-3">Schedule interviews from the Bulk Resume or Talent Pool sections.</p>
          </div>
        ) : (
          filteredInterviews.map((interview) => {
            const date = new Date(interview.scheduledAt);
            const isExpanded = expandedId === interview.id;
            
            return (
              <div key={interview.id} className="bg-white border border-rule-med rounded-xl shadow-sm overflow-hidden hover:border-accent/50 transition-colors">
                <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                  
                  {/* Date Block */}
                  <div className="flex flex-col items-center justify-center w-16 h-16 bg-cream border border-rule-lt rounded-lg flex-shrink-0 text-ink">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-xl font-serif">{date.getDate()}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-lg text-ink">{interview.candidateName}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest border ${getStatusColor(interview.status)}`}>
                        {interview.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-3 font-mono">
                      <span className="flex items-center gap-1.5"><Briefcase size={12} /> {interview.jobTitle}</span>
                      <span className="flex items-center gap-1.5"><User size={12} /> {interview.interviewerName}</span>
                      <span className="flex items-center gap-1.5"><Clock size={12} /> {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({interview.durationMinutes}m)</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 md:border-l md:border-rule-lt md:pl-6">
                    {interview.meetingLink && interview.status === 'SCHEDULED' && (
                      <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-accent-lt text-accent hover:bg-accent hover:text-cream px-4 py-2 rounded text-[11px] font-mono uppercase tracking-widest transition-colors">
                        <Video size={14} /> Join Call
                      </a>
                    )}
                    
                    <button 
                      onClick={() => setExpandedId(isExpanded ? null : interview.id)}
                      className="p-2 text-muted hover:text-ink hover:bg-cream rounded-md transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details (Feedback) */}
                {isExpanded && (
                  <div className="px-6 py-4 bg-cream/30 border-t border-rule-lt">
                    {interview.status === 'COMPLETED' ? (
                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-muted block mb-1">Rating</span>
                          <div className="text-xl">{"⭐".repeat(interview.rating || 0)}</div>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-muted block mb-1">Feedback Notes</span>
                          <p className="text-sm text-ink-2 bg-white p-3 rounded-md border border-rule-lt">{interview.feedbackText}</p>
                        </div>
                      </div>
                    ) : interview.status === 'SCHEDULED' ? (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-ink-3">Interview has not occurred yet. Feedback form will unlock after the scheduled time.</p>
                        <button className="flex items-center gap-2 border border-rule-med bg-white text-ink hover:border-accent hover:text-accent px-4 py-2 rounded text-[11px] font-mono uppercase tracking-widest transition-colors">
                          <MessageSquare size={14} /> Copy Feedback Link
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-ink-3">Interview was cancelled.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
