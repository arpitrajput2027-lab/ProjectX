"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Save, ArrowRight, Pencil, FileText, BarChart2, X, GitBranch, Code } from "lucide-react";

import ProjectModal from "@/components/modals/ProjectModal";
import EducationModal from "@/components/modals/EducationModal";
import ExperienceModal from "@/components/modals/ExperienceModal";
import SkillModal from "@/components/modals/SkillModal";
import AchievementModal from "@/components/modals/AchievementModal";
import CertificationModal from "@/components/modals/CertificationModal";

export function ProfileView({ studentId, readOnly }: { studentId?: string; readOnly?: boolean } = {}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Drawer state
  const [isStatsDrawerOpen, setIsStatsDrawerOpen] = useState(false);

  // Modal states
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [isCertificationModalOpen, setIsCertificationModalOpen] = useState(false);

  // Form for Contact Info
  const { register: registerContact, handleSubmit: handleSubmitContact, reset: resetContact } = useForm();

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      let targetUserId = session?.user.id;
      if (studentId) {
        targetUserId = studentId;
      } else if (!session) {
        router.push("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("user_id", targetUserId)
        .single();

      if (error || !data) {
        // Redirect to onboarding if they don't have a profile
        if (!readOnly) router.push("/onboarding");
        setLoading(false);
        return;
      } else if (data) {
        setProfile(data);
        resetContact({
          full_name: data.full_name,
          email: session?.user?.email || "Contact for email",
          phone: data.phone,
          location: data.location,
          target_role: data.target_role,
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, [router, resetContact]);

  const onSubmitContact = async (data: any) => {
    try {
      const { error } = await supabase
        .from("student_profiles")
        .update({
          full_name: data.full_name,
          phone: data.phone,
          location: data.location,
          target_role: data.target_role,
        })
        .eq("id", profile.id);

      if (error) throw error;
      alert("Contact info saved.");
    } catch (error) {
      console.error(error);
      alert("Failed to save contact info");
    }
  };

  const handleSaveSection = async (field: string, data: any[]) => {
    try {
      const { error } = await supabase
        .from("student_profiles")
        .update({ [field]: data })
        .eq("id", profile.id);

      if (error) throw error;
      setProfile((prev: any) => ({ ...prev, [field]: data }));
    } catch (error) {
      console.error(`Error saving ${field}:`, error);
      alert(`Failed to save ${field}`);
    }
  };

  if (loading) return <div className="p-24 text-center font-mono uppercase tracking-widest text-muted">Loading profile...</div>;
  if (!profile) return null; // Let the redirect handle it

  const githubUsername = profile.github_username;
  const leetcodeUsername = profile.leetcode_username;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl relative">

      {/* Top Banner: Identity & Documents */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">Identity & Documents</h2>
          <button
            onClick={() => setIsStatsDrawerOpen(true)}
            className="flex items-center space-x-2 bg-ink text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors"
          >
            <BarChart2 className="w-4 h-4" />
            <span>Github Leetcode Stats 📊</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-rule-med p-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-ink text-white flex items-center justify-center rounded-lg font-bold text-xl uppercase">
                {profile.full_name ? profile.full_name.charAt(0) : "U"}
              </div>
              <div>
                <h3 className="font-semibold text-ink">{profile.full_name}</h3>
                <p className="text-xs text-ink-3 mt-1 truncate max-w-[200px]">{profile.target_role || "No role set"}</p>
              </div>
            </div>
            {!readOnly && (
              <button className="text-xs font-medium text-ink-3 hover:text-ink flex items-center space-x-1 cursor-pointer transition-colors">
                <span>Edit</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {!readOnly && (
            <div className="bg-white rounded-xl border border-rule-med p-6 flex items-center justify-between shadow-sm cursor-pointer hover:border-accent/50 transition-colors" onClick={() => router.push(`/resume`)}>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-accent-lt text-accent flex items-center justify-center rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink">Resume</h3>
                  <p className="text-xs text-ink-3 mt-1">Wording, order and formatting</p>
                </div>
              </div>
              <button className="text-xs font-medium text-ink-3 hover:text-ink flex items-center space-x-1 transition-colors cursor-pointer">
                <span>Preview</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">Profile Details</h2>

          {/* Education Section */}
          <div className="bg-white rounded-xl border border-rule-med p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-ink flex items-center space-x-2">
                <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-sm">🎓</span>
                <span>Education</span>
              </h3>
              {!readOnly && (
                <button
                  onClick={() => setIsEducationModalOpen(true)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-md border border-rule-med hover:bg-cream transition-colors text-sm font-medium text-ink-2 cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <div className="space-y-6">
              {(!profile.education || profile.education.length === 0) && <p className="text-ink-3 text-sm">No education entries found.</p>}
              {profile.education?.map((edu: any, idx: number) => (
                <div key={idx} className="flex space-x-4">
                  <div className="w-10 h-10 rounded-full bg-cream border border-rule-med flex-shrink-0 flex items-center justify-center text-ink font-bold">
                    {edu.institution ? edu.institution.charAt(0) : "U"}
                  </div>
                  <div>
                    <h4 className="font-medium text-ink">{edu.institution} {edu.location ? `, ${edu.location}` : ''}</h4>
                    <p className="text-sm text-ink-2 mt-0.5">{edu.degree} - {edu.field_of_study}</p>
                    <p className="text-xs text-ink-3 mt-1">{edu.start_date} - {edu.end_date} {edu.gpa ? `• GPA: ${edu.gpa}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Section */}
          <div className="bg-white rounded-xl border border-rule-med p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-ink flex items-center space-x-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm">💼</span>
                <span>Experience</span>
              </h3>
              {!readOnly && (
                <button
                  onClick={() => setIsExperienceModalOpen(true)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-md border border-rule-med hover:bg-cream transition-colors text-sm font-medium text-ink-2 cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <div className="space-y-6">
              {(!profile.experience || profile.experience.length === 0) && <p className="text-ink-3 text-sm">No experience entries found.</p>}
              {profile.experience?.map((exp: any, idx: number) => (
                <div key={idx} className="flex space-x-4">
                  <div className="w-10 h-10 rounded-full bg-cream border border-rule-med flex-shrink-0 flex items-center justify-center text-ink font-bold">
                    {exp.company ? exp.company.charAt(0) : "C"}
                  </div>
                  <div>
                    <h4 className="font-medium text-ink">{exp.company} {exp.location ? `, ${exp.location}` : ''}</h4>
                    <p className="text-sm text-ink-2 mt-0.5">{exp.role}</p>
                    <p className="text-xs text-ink-3 mt-1 mb-2">{exp.start_date} - {exp.end_date}</p>
                    <div className="text-sm text-ink-2 whitespace-pre-wrap">{exp.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects Section */}
          <div className="bg-white rounded-xl border border-rule-med p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-ink flex items-center space-x-2">
                <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-sm">🚀</span>
                <span>Projects</span>
              </h3>
              {!readOnly && (
                <button
                  onClick={() => setIsProjectModalOpen(true)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-md border border-rule-med hover:bg-cream transition-colors text-sm font-medium text-ink-2 cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <div className="space-y-6">
              {(!profile.projects || profile.projects.length === 0) && <p className="text-ink-3 text-sm">No project entries found.</p>}
              {profile.projects?.map((proj: any, idx: number) => (
                <div key={idx} className="border-l-2 border-rule-med pl-4 ml-2">
                  <h4 className="font-medium text-ink flex items-center space-x-2">
                    <span>{proj.title}</span>
                    {proj.live_url && <a href={proj.live_url} target="_blank" className="text-xs text-accent hover:underline">Live Demo</a>}
                  </h4>
                  <p className="text-xs text-ink-3 mt-1 mb-2">{proj.start_date} - {proj.end_date}</p>
                  <div className="text-sm text-ink-2 whitespace-pre-wrap">{proj.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-xl border border-rule-med p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-ink flex items-center space-x-2">
                <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm">⚙️</span>
                <span>Skills</span>
              </h3>
              {!readOnly && (
                <button
                  onClick={() => setIsSkillModalOpen(true)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-md border border-rule-med hover:bg-cream transition-colors text-sm font-medium text-ink-2 cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {(!profile.skills || profile.skills.length === 0) && <p className="text-ink-3 text-sm">No skills found.</p>}
              {profile.skills?.map((skill: any, idx: number) => (
                <div key={idx}>
                  <h4 className="text-sm font-medium text-ink capitalize mb-2">{skill.category_name}</h4>
                  <div className="flex flex-wrap gap-2">
                    {skill.skills_list.split(',').filter((s: string) => s.trim()).map((s: string, sIdx: number) => (
                      <span key={sIdx} className="bg-cream text-ink-2 border border-rule-med text-xs px-3 py-1 rounded-md">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements Section */}
          <div className="bg-white rounded-xl border border-rule-med p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-ink flex items-center space-x-2">
                <span className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 text-sm">🏆</span>
                <span>Achievements</span>
              </h3>
              {!readOnly && (
                <button
                  onClick={() => setIsAchievementModalOpen(true)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-md border border-rule-med hover:bg-cream transition-colors text-sm font-medium text-ink-2 cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <div className="space-y-6">
              {(!profile.achievements || profile.achievements.length === 0) && <p className="text-ink-3 text-sm">No achievements found.</p>}
              {profile.achievements?.map((ach: any, idx: number) => (
                <div key={idx} className="border-l-2 border-rule-med pl-4 ml-2">
                  <h4 className="font-medium text-ink">{ach.title}</h4>
                  <p className="text-xs text-ink-3 mt-1 mb-2">{ach.date}</p>
                  <div className="text-sm text-ink-2 whitespace-pre-wrap">{ach.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications Section */}
          <div className="bg-white rounded-xl border border-rule-med p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-ink flex items-center space-x-2">
                <span className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-sm">📜</span>
                <span>Certifications</span>
              </h3>
              {!readOnly && (
                <button
                  onClick={() => setIsCertificationModalOpen(true)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-md border border-rule-med hover:bg-cream transition-colors text-sm font-medium text-ink-2 cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <div className="space-y-6">
              {(!profile.certifications || profile.certifications.length === 0) && <p className="text-ink-3 text-sm">No certifications found.</p>}
              {profile.certifications?.map((cert: any, idx: number) => (
                <div key={idx} className="flex space-x-4">
                  <div className="w-10 h-10 rounded-full bg-cream border border-rule-med flex-shrink-0 flex items-center justify-center text-ink font-bold">
                    {cert.name ? cert.name.charAt(0) : "C"}
                  </div>
                  <div>
                    <h4 className="font-medium text-ink flex items-center space-x-2">
                      <span>{cert.name}</span>
                      {cert.url && <a href={cert.url} target="_blank" className="text-xs text-accent hover:underline">View Credential</a>}
                    </h4>
                    <p className="text-sm text-ink-2 mt-0.5">{cert.issuer}</p>
                    <p className="text-xs text-ink-3 mt-1">{cert.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Settings / Contact Form */}
        <div className="space-y-6">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">Settings & Contact</h2>
          <div className="bg-white rounded-xl border border-rule-med p-6 shadow-sm sticky top-6">
            <h3 className="font-medium text-ink mb-4 flex items-center justify-between">
              <span>Contact Information</span>
              <button
                onClick={handleSubmitContact(onSubmitContact)}
                className={`text-xs text-accent hover:text-accent-dk font-medium flex items-center space-x-1 m-2 p-2 rounded-md bg-black text-white cursor-pointer ${readOnly ? 'hidden' : ''}`}
              >
                <Save className="w-3 h-3" />
                <span >Save</span>
              </button>
            </h3>
            <form className="space-y-4">
              <div>
                <label className="block text-xs text-ink-3 mb-1">Full Name</label>
                <input {...registerContact("full_name")} disabled={readOnly} className="w-full bg-cream border border-rule-med rounded-md px-3 py-1.5 text-sm focus:border-accent outline-none disabled:opacity-70" />
              </div>
              <div>
                <label className="block text-xs text-ink-3 mb-1">Email (Read Only)</label>
                <input {...registerContact("email")} readOnly className="w-full bg-cream-2 border border-rule-med rounded-md px-3 py-1.5 text-sm outline-none opacity-70" />
              </div>
              <div>
                <label className="block text-xs text-ink-3 mb-1">Phone</label>
                <input {...registerContact("phone")} disabled={readOnly} className="w-full bg-cream border border-rule-med rounded-md px-3 py-1.5 text-sm focus:border-accent outline-none disabled:opacity-70" />
              </div>
              <div>
                <label className="block text-xs text-ink-3 mb-1">Location</label>
                <input {...registerContact("location")} disabled={readOnly} className="w-full bg-cream border border-rule-med rounded-md px-3 py-1.5 text-sm focus:border-accent outline-none disabled:opacity-70" />
              </div>
              <div>
                <label className="block text-xs text-ink-3 mb-1">Target Role</label>
                <input {...registerContact("target_role")} disabled={readOnly} className="w-full bg-cream border border-rule-med rounded-md px-3 py-1.5 text-sm focus:border-accent outline-none disabled:opacity-70" />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* --- STATS DRAWER --- */}
      {isStatsDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
          onClick={() => setIsStatsDrawerOpen(false)}
        >
          <div
            className="bg-cream-2 w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 bg-white border-b border-rule-med">
              <h2 className="text-xl font-serif font-medium text-ink flex items-center space-x-2">
                <BarChart2 className="w-5 h-5" />
                <span>Your Analytics</span>
              </h2>
              <button onClick={() => setIsStatsDrawerOpen(false)} className="text-ink-3 hover:text-ink">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-10">

              {/* --- GITHUB SECTION --- */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-rule-med">
                  <GitBranch className="w-5 h-5 text-ink" />
                  <h2 className="text-lg font-serif font-medium text-ink">GitHub Analytics</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* GitHub Stats Card */}
                  <div className="bg-white border border-rule-med p-5 rounded-md shadow-sm">
                    <h3 className="font-mono text-xs uppercase tracking-widest text-muted mb-4 border-b border-rule pb-2">Overview</h3>
                    {githubUsername ? (
                      <img
                        src={`https://github-readme-stats-eight-theta.vercel.app/api?username=${githubUsername}&show_icons=true&theme=tokyonight&bg_color=faf8f4&title_color=1a1814&text_color=3d3a35&icon_color=8b6a3e&border_color=e2dbd0`}
                        alt="GitHub Stats"
                        className="w-full rounded-md"
                      />
                    ) : (
                      <div className="text-sm text-ink-3 p-4 bg-cream-2 rounded text-center">Not connected</div>
                    )}
                  </div>

                  {/* GitHub Top Languages */}
                  <div className="bg-white border border-rule-med p-5 rounded-md shadow-sm">
                    <h3 className="font-mono text-xs uppercase tracking-widest text-muted mb-4 border-b border-rule pb-2">Top Languages</h3>
                    {githubUsername ? (
                      <img
                        src={`https://github-readme-stats-eight-theta.vercel.app/api/top-langs/?username=${githubUsername}&layout=compact&theme=tokyonight&bg_color=faf8f4&title_color=1a1814&text_color=3d3a35&border_color=e2dbd0`}
                        alt="Top Languages"
                        className="w-full rounded-md"
                      />
                    ) : (
                      <div className="text-sm text-ink-3 p-4 bg-cream-2 rounded text-center">Not connected</div>
                    )}
                  </div>

                  {/* GitHub Streak Card */}
                  <div className="bg-white border border-rule-med p-5 rounded-md shadow-sm md:col-span-2">
                    <h3 className="font-mono text-xs uppercase tracking-widest text-muted mb-4 border-b border-rule pb-2">Commit Streak</h3>
                    {githubUsername ? (
                      <img
                        src={`https://streak-stats.demolab.com?user=${githubUsername}&theme=tokyonight&background=faf8f4&border=e2dbd0&stroke=8b6a3e&ring=8b6a3e&fire=8b6a3e&currStreakLabel=3d3a35`}
                        alt="GitHub Streak"
                        className="w-full rounded-md"
                      />
                    ) : (
                      <div className="text-sm text-ink-3 p-4 bg-cream-2 rounded text-center">Not connected</div>
                    )}
                  </div>

                  {/* GitHub Activity Graph */}
                  <div className="bg-white border border-rule-med p-5 rounded-md shadow-sm md:col-span-2">
                    <h3 className="font-mono text-xs uppercase tracking-widest text-muted mb-4 border-b border-rule pb-2">Activity Graph</h3>
                    {githubUsername ? (
                      <img
                        src={`https://github-readme-activity-graph.vercel.app/graph?username=${githubUsername}&theme=github-compact&bg_color=faf8f4&title_color=1a1814&color=3d3a35&line=8b6a3e&point=1a1814&hide_border=true`}
                        alt="GitHub Activity Graph"
                        className="w-full rounded-md"
                      />
                    ) : (
                      <div className="text-sm text-ink-3 p-4 bg-cream-2 rounded text-center">Not connected</div>
                    )}
                  </div>

                  {/* GitHub Heatmap */}
                  <div className="bg-white border border-rule-med p-5 rounded-md shadow-sm md:col-span-2">
                    <h3 className="font-mono text-xs uppercase tracking-widest text-muted mb-4 border-b border-rule pb-2">Contributions Heatmap</h3>
                    {githubUsername ? (
                      <img
                        src={`https://ghchart.rshah.org/8b6a3e/${githubUsername}`}
                        alt="GitHub Heatmap"
                        className="w-full rounded-md"
                      />
                    ) : (
                      <div className="text-sm text-ink-3 p-4 bg-cream-2 rounded text-center">Not connected</div>
                    )}
                  </div>
                </div>
              </div>

              {/* --- LEETCODE SECTION --- */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-rule-med">
                  <Code className="w-5 h-5 text-yellow-600" />
                  <h2 className="text-lg font-serif font-medium text-ink">LeetCode Analytics</h2>
                </div>

                <div className="flex flex-col gap-6">
                  {/* LeetCode Card */}
                  <div className="bg-white border border-rule-med p-5 rounded-md shadow-sm flex flex-col items-center">
                    <h3 className="font-mono text-xs uppercase tracking-widest text-muted mb-4 border-b border-rule pb-2 w-full text-left">Stats Overview</h3>
                    {leetcodeUsername ? (
                      <img
                        src={`https://leetcard.jacoblin.cool/${leetcodeUsername}?theme=light&font=baloo`}
                        alt="LeetCode Stats"
                        className="w-full max-w-[400px] rounded-md shadow-sm"
                      />
                    ) : (
                      <div className="text-sm text-ink-3 p-4 bg-cream-2 rounded text-center w-full">Not connected</div>
                    )}
                  </div>

                  {/* LeetCode Heatmap */}
                  <div className="bg-white border border-rule-med p-5 rounded-md shadow-sm flex flex-col items-center">
                    <h3 className="font-mono text-xs uppercase tracking-widest text-muted mb-4 border-b border-rule pb-2 w-full text-left">Activity Heatmap</h3>
                    {leetcodeUsername ? (
                      <div className="w-full bg-white rounded-md shadow-sm overflow-hidden" style={{ aspectRatio: "500 / 120", position: "relative" }}>
                        <img
                          src={`https://leetcard.jacoblin.cool/${leetcodeUsername}?theme=light&font=baloo&ext=heatmap`}
                          alt="LeetCode Heatmap"
                          style={{ width: "100%", height: "auto", position: "absolute", top: 0, left: 0, transform: "translateY(-62.5%)" }}
                        />
                      </div>
                    ) : (
                      <div className="text-sm text-ink-3 p-4 bg-cream-2 rounded text-center w-full">Not connected</div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        resumeId={profile.id}
        initialProjects={profile.projects || []}
        onSave={(data) => handleSaveSection("projects", data)}
      />

      <EducationModal
        isOpen={isEducationModalOpen}
        onClose={() => setIsEducationModalOpen(false)}
        resumeId={profile.id}
        initialEducation={profile.education || []}
        onSave={(data) => handleSaveSection("education", data)}
      />

      <ExperienceModal
        isOpen={isExperienceModalOpen}
        onClose={() => setIsExperienceModalOpen(false)}
        resumeId={profile.id}
        initialExperience={profile.experience || []}
        onSave={(data) => handleSaveSection("experience", data)}
      />

      <SkillModal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        resumeId={profile.id}
        initialSkills={profile.skills || []}
        onSave={(data) => handleSaveSection("skills", data)}
      />

      <AchievementModal
        isOpen={isAchievementModalOpen}
        onClose={() => setIsAchievementModalOpen(false)}
        resumeId={profile.id}
        initialAchievements={profile.achievements || []}
        onSave={(data) => handleSaveSection("achievements", data)}
      />

      <CertificationModal
        isOpen={isCertificationModalOpen}
        onClose={() => setIsCertificationModalOpen(false)}
        resumeId={profile.id}
        initialCertifications={profile.certifications || []}
        onSave={(data) => handleSaveSection("certifications", data)}
      />

    </div>
  );
}
