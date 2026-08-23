"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, MapPin, X, ChevronRight, UserCircle, Users, Heart, HeartOff, Bookmark } from "lucide-react";
import { ProfileView } from "@/features/profile/ProfileView";

export function TalentPoolView() {
  const [recruiter, setRecruiter] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  
  // Drawer state
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Saved candidates
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch recruiter profile
      const { data: profile } = await supabase
        .from('recruiter_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (profile) {
        setRecruiter(profile);

        // Fetch saved candidates for this recruiter
        const { data: savedData } = await supabase
          .from('saved_candidates')
          .select('student_id')
          .eq('recruiter_id', profile.id);

        if (savedData) {
          setSavedIds(new Set(savedData.map((s: any) => s.student_id)));
        }
      }

      // Fetch all students
      const { data } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('onboarding_completed', true)
        .order('created_at', { ascending: false });

      if (data) {
        setStudents(data);
      }
      setLoading(false);
    };
    
    fetchData();
  }, []);

  const toggleSave = async (studentProfileId: string) => {
    if (!recruiter) return;
    setSavingId(studentProfileId);

    if (savedIds.has(studentProfileId)) {
      // Unsave
      await supabase
        .from('saved_candidates')
        .delete()
        .eq('recruiter_id', recruiter.id)
        .eq('student_id', studentProfileId);

      setSavedIds(prev => {
        const next = new Set(prev);
        next.delete(studentProfileId);
        return next;
      });
    } else {
      // Save
      await supabase
        .from('saved_candidates')
        .insert({
          recruiter_id: recruiter.id,
          student_id: studentProfileId,
        });

      setSavedIds(prev => new Set(prev).add(studentProfileId));
    }
    setSavingId(null);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "All" || student.target_role === filterRole;
    const matchesSaved = !showSavedOnly || savedIds.has(student.id);
    return matchesSearch && matchesRole && matchesSaved;
  });

  const savedCount = savedIds.size;

  return (
    <div className="p-8 max-w-7xl mx-auto font-body animate-in fade-in duration-500">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-serif text-4xl text-ink mb-2">Talent Pool</h1>
          <p className="text-sm text-ink-3">Discover and connect with verified candidates.</p>
        </div>
        <button
          onClick={() => setShowSavedOnly(!showSavedOnly)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-md font-mono text-[11px] uppercase tracking-widest transition-colors ${
            showSavedOnly 
              ? 'bg-accent text-cream hover:bg-ink' 
              : 'bg-white border border-rule-med text-ink hover:border-accent hover:text-accent'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Candidates ({savedCount})</span>
        </button>
      </header>

      {/* Search & Filters */}
      <div className="bg-white border border-rule-med p-4 rounded-xl shadow-sm mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            type="text" 
            placeholder="Search by candidate name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-cream border border-rule-lt rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="w-full md:w-64">
          <select 
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

      {/* Saved only banner */}
      {showSavedOnly && (
        <div className="bg-accent-lt border border-accent/20 rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-accent font-medium">
            <Bookmark className="w-4 h-4" />
            Showing {filteredStudents.length} saved candidate{filteredStudents.length !== 1 ? 's' : ''}
          </div>
          <button 
            onClick={() => setShowSavedOnly(false)}
            className="text-xs font-mono uppercase tracking-widest text-accent hover:text-ink transition-colors"
          >
            Show All
          </button>
        </div>
      )}

      {/* Student Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <span className="font-mono text-xs tracking-widest uppercase text-muted animate-pulse">Loading talent pool...</span>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white border border-rule-med rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4 border border-rule-lt">
            {showSavedOnly ? <Bookmark className="w-6 h-6 text-muted" /> : <Users className="w-6 h-6 text-muted" />}
          </div>
          <h3 className="font-serif text-xl text-ink mb-2">
            {showSavedOnly ? "No saved candidates" : "No candidates found"}
          </h3>
          <p className="text-sm text-ink-3 max-w-sm mx-auto">
            {showSavedOnly 
              ? "You haven't saved any candidates yet. Browse the talent pool and click 'Save' on profiles you're interested in." 
              : "We couldn't find any candidates matching your current search criteria. Try adjusting your filters."}
          </p>
          {showSavedOnly && (
            <button 
              onClick={() => setShowSavedOnly(false)}
              className="mt-4 bg-white border border-rule-med text-ink px-5 py-2 rounded-md font-mono text-[11px] uppercase tracking-widest hover:border-accent hover:text-accent transition-colors"
            >
              Browse All Candidates
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.map(student => {
            const isSaved = savedIds.has(student.id);
            return (
              <div 
                key={student.id} 
                className={`bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between ${
                  isSaved ? 'border-accent/40 ring-1 ring-accent/10' : 'border-rule-med hover:border-accent/50'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-cream border border-rule-lt rounded-full flex items-center justify-center text-xl font-serif text-ink uppercase">
                      {student.full_name ? student.full_name.charAt(0) : "C"}
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full border-2 border-accent flex items-center justify-center bg-accent-lt text-accent text-xs font-bold font-mono">
                        85%
                      </div>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-muted mt-1">Match</span>
                    </div>
                  </div>
                  
                  <h3 className="font-serif text-lg text-ink line-clamp-1">{student.full_name}</h3>
                  <p className="text-sm font-medium text-ink-2 mb-2">{student.target_role || "Unspecified Role"}</p>
                  
                  <div className="flex items-center gap-1 text-xs text-ink-3 mb-4 font-mono">
                    <MapPin className="w-3 h-3" /> 
                    <span className="line-clamp-1">{student.location || "Location not specified"}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {student.skills?.slice(0, 3).map((skillGroup: any, i: number) => {
                      const skill = skillGroup.skills_list.split(',')[0].trim();
                      return skill ? (
                        <span key={i} className="px-2 py-1 bg-cream-2 rounded text-[10px] font-mono text-ink-2 uppercase tracking-wider line-clamp-1 max-w-[120px]">
                          {skill}
                        </span>
                      ) : null;
                    })}
                    {(student.skills?.length > 3) && (
                      <span className="px-2 py-1 bg-cream-2 rounded text-[10px] font-mono text-muted uppercase tracking-wider">
                        +{student.skills.length - 3}
                      </span>
                    )}
                    {(!student.skills || student.skills.length === 0) && (
                      <span className="px-2 py-1 bg-cream-2 rounded text-[10px] font-mono text-muted uppercase tracking-wider italic">
                        No skills listed
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-auto">
                  <button 
                    onClick={() => toggleSave(student.id)}
                    disabled={savingId === student.id}
                    className={`flex-1 py-2 rounded text-[11px] font-mono uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                      isSaved 
                        ? 'bg-accent text-cream hover:bg-red-500' 
                        : 'bg-white border border-rule-med text-ink hover:text-accent hover:border-accent'
                    }`}
                  >
                    {isSaved ? <><HeartOff className="w-3 h-3" /> Unsave</> : <><Heart className="w-3 h-3" /> Save</>}
                  </button>
                  <button 
                    onClick={() => setSelectedStudentId(student.user_id)}
                    className="flex-[2] bg-ink text-cream py-2 rounded text-[11px] font-mono uppercase tracking-widest hover:bg-accent transition-colors flex items-center justify-center gap-1"
                  >
                    Details <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-bar Profile Viewer */}
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
                Close
              </button>
              <button className="bg-ink text-cream px-6 py-2 rounded text-[11px] font-mono uppercase tracking-widest hover:bg-accent transition-colors">
                Contact Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
