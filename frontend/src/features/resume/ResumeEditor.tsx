"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Download, Save, AlignLeft, AlignCenter, AlignJustify, FileText, Shield, Briefcase } from "lucide-react";
import { ATSChecker } from "./ATSChecker";
import { JDMatcher } from "./JDMatcher";

type ActiveTab = "editor" | "ats" | "jd-match";

export function ResumeEditor({ id = "me" }: { id?: string }) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as ActiveTab) || "editor";
  
  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    ["editor", "ats", "jd-match"].includes(initialTab) ? initialTab : "editor"
  );
  
  // Toolbar state
  const [font, setFont] = useState("'Times New Roman', Times, serif");
  const [size, setSize] = useState("11pt");
  const [alignment, setAlignment] = useState<"left" | "center" | "justify">("left");
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);

  const resumeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        setSession(session);
        
        const { data, error } = await supabase
          .from("student_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();
          
        if (data) {
          setProfile(data);
        }
      } catch (error) {
        console.error("Error fetching profile", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [id]);

  const handleExport = async () => {
    if (!resumeRef.current) return;
    setExporting(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin:       [0.5, 0.5, 0.5, 0.5],
        filename:     `Resume_${profile?.full_name || 'Export'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(resumeRef.current).save();
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to export PDF.");
    } finally {
      setExporting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profile && profile.id) {
        const { error } = await supabase
          .from("student_profiles")
          .update({
            full_name: profile.full_name,
            location: profile.location,
            phone: profile.phone,
            education: profile.education,
            experience: profile.experience,
            projects: profile.projects,
            skills: profile.skills
          })
          .eq("id", profile.id);

        if (error) throw error;
        alert("Changes saved successfully!");
      }
    } catch (error) {
      console.error("Error saving profile", error);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  // --- Update Handlers ---
  const updateField = (field: string, value: string) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  const updateArrayItem = (arrayName: string, index: number, field: string, value: string) => {
    setProfile((prev: any) => {
      const newArray = [...prev[arrayName]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  const renderBullets = (text: string, arrayName: string, itemIndex: number, field: string) => {
    if (!text) return null;
    const items = text.split('\n').filter((i: string) => i.trim() !== '' && i.trim() !== '•' && i.trim() !== '-');
    return (
      <ul className="list-disc ml-5 mt-1 space-y-1">
        {items.map((item: string, bulletIdx: number) => (
          <li 
            key={bulletIdx}
            contentEditable 
            suppressContentEditableWarning 
            onBlur={(e) => {
              const newBulletText = e.currentTarget.textContent || "";
              const newItems = [...items];
              if (newBulletText.trim() === "") {
                newItems.splice(bulletIdx, 1);
              } else {
                newItems[bulletIdx] = newBulletText;
              }
              updateArrayItem(arrayName, itemIndex, field, newItems.join('\n'));
            }}
            className="focus:outline-none editor-hover-area rounded px-1 transition-colors"
          >
            {item.replace(/^[•-]\s*/, '')}
          </li>
        ))}
      </ul>
    );
  };

  // --- Cross-component navigation handlers ---
  const handleNavigateToSection = (section: string) => {
    setActiveTab("editor");
    // Small delay to allow tab switch render, then scroll to section
    setTimeout(() => {
      const sectionEl = document.querySelector(`[data-section="${section.toLowerCase()}"]`);
      if (sectionEl) {
        sectionEl.scrollIntoView({ behavior: "smooth", block: "center" });
        sectionEl.classList.add("ring-2", "ring-accent", "ring-offset-2");
        setTimeout(() => sectionEl.classList.remove("ring-2", "ring-accent", "ring-offset-2"), 2000);
      }
    }, 100);
  };

  const handleApplyCustomization = (customizedProfile: any) => {
    // Merge the customized fields into the existing profile
    setProfile((prev: any) => ({
      ...prev,
      ...customizedProfile,
    }));
    setActiveTab("editor");
  };

  const handleSwitchToATS = () => {
    setActiveTab("ats");
  };

  if (loading) return <div className="p-24 text-center font-mono uppercase tracking-widest text-muted">Loading editor...</div>;
  if (!profile) return <div className="p-24 text-center">Profile not found.</div>;

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: "editor", label: "Resume Editor", icon: <FileText className="w-4 h-4" /> },
    { id: "ats", label: "ATS Check", icon: <Shield className="w-4 h-4" /> },
    { id: "jd-match", label: "JD Match", icon: <Briefcase className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-full bg-cream-2">
      {/* Editor Sub-Header */}
      <div className="bg-cream border-b border-rule px-6 py-3 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center space-x-3">
          {/* Tab Navigation */}
          <div className="flex items-center bg-parchment rounded-lg border border-rule p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-ink text-cream shadow-sm"
                    : "text-ink-3 hover:text-ink hover:bg-cream-3"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Toolbar - only show for editor tab */}
        {activeTab === "editor" && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-parchment px-3 py-1.5 rounded-md border border-rule">
              <select 
                className="bg-transparent text-sm outline-none text-ink-2 cursor-pointer"
                value={font}
                onChange={(e) => setFont(e.target.value)}
              >
                <option value="'Times New Roman', Times, serif">Times New Roman</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Calibri, sans-serif">Calibri</option>
                <option value="Garamond, serif">Garamond</option>
                <option value="Georgia, serif">Georgia</option>
              </select>
              <div className="w-px h-4 bg-rule"></div>
              <select 
                className="bg-transparent text-sm outline-none text-ink-2 cursor-pointer"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              >
                <option value="11pt">11pt</option>
                <option value="12pt">12pt</option>
                <option value="10pt">10pt</option>
              </select>
              <div className="w-px h-4 bg-rule"></div>
              <div className="flex space-x-1 text-ink-3">
                <button onClick={() => setAlignment("left")} className={`p-1 rounded hover:bg-cream-3 ${alignment === "left" ? "text-accent bg-accent-lt" : ""}`}><AlignLeft className="w-4 h-4" /></button>
                <button onClick={() => setAlignment("center")} className={`p-1 rounded hover:bg-cream-3 ${alignment === "center" ? "text-accent bg-accent-lt" : ""}`}><AlignCenter className="w-4 h-4" /></button>
                <button onClick={() => setAlignment("justify")} className={`p-1 rounded hover:bg-cream-3 ${alignment === "justify" ? "text-accent bg-accent-lt" : ""}`}><AlignJustify className="w-4 h-4" /></button>
              </div>
            </div>
            
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-cream border border-ink text-ink px-4 py-1.5 rounded-md text-sm font-medium hover:bg-accent hover:border-accent hover:text-white transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save"}</span>
            </button>

            <button 
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center space-x-2 bg-ink text-cream px-4 py-1.5 rounded-md text-sm font-medium hover:bg-accent transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{exporting ? "Generating..." : "Download PDF"}</span>
            </button>
          </div>
        )}

        {/* Save button for non-editor tabs too */}
        {activeTab !== "editor" && (
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-cream border border-ink text-ink px-4 py-1.5 rounded-md text-sm font-medium hover:bg-accent hover:border-accent hover:text-white transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Resume"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === "editor" && (
        /* Main Canvas Area */
        <div className="flex-1 overflow-auto py-10 flex justify-center">
          {/* A4 Paper Container */}
          <div 
            className="bg-white shadow-2xl relative"
            style={{ width: "816px", minHeight: "1056px" }} 
          >
            <div 
              ref={resumeRef}
              className="w-full h-full p-12"
              style={{ 
                color: '#000000',
                backgroundColor: '#ffffff',
                fontFamily: font, 
                fontSize: size, 
                lineHeight: "1.4",
                textAlign: alignment
              }}
            >
              {/* Header */}
              <header className="text-center mb-6">
                <h1 className="font-bold mb-2 leading-none" style={{ fontSize: "24pt" }}>
                  <span contentEditable suppressContentEditableWarning onBlur={(e) => updateField("full_name", e.currentTarget.textContent || "")} className="focus:outline-none editor-hover-area px-1 rounded">{profile.full_name}</span>
                </h1>
                <div className="flex justify-center flex-wrap gap-x-2 text-center" style={{ fontSize: size }}>
                  {profile.location && <span contentEditable suppressContentEditableWarning onBlur={(e) => updateField("location", e.currentTarget.textContent || "")} className="focus:outline-none editor-hover-area px-1">{profile.location}</span>}
                  {profile.location && <span>|</span>}
                  
                  {profile.phone && <span contentEditable suppressContentEditableWarning onBlur={(e) => updateField("phone", e.currentTarget.textContent || "")} className="focus:outline-none editor-hover-area px-1">{profile.phone}</span>}
                  {profile.phone && <span>|</span>}
                  
                  {session?.user?.email && (
                    <span className="focus:outline-none px-1 editor-link">
                      {session.user.email}
                    </span>
                  )}
                  
                  {profile.portfolio_url && (
                    <>
                      <span>|</span>
                      <a href={profile.portfolio_url} className="focus:outline-none editor-hover-area px-1 editor-link">Portfolio</a>
                    </>
                  )}
                  {profile.github_username && (
                    <>
                      <span>|</span>
                      <a href={`https://github.com/${profile.github_username}`} className="focus:outline-none editor-hover-area px-1 editor-link">GitHub</a>
                    </>
                  )}
                </div>
              </header>

              {/* Education */}
              {profile.education && profile.education.length > 0 && (
                <section className="mb-5" data-section="education">
                  <h2 className="font-bold uppercase border-b-2 editor-border-black mb-3 pb-1" style={{ fontSize: "1.2em", letterSpacing: "0.05em" }}>Education</h2>
                  {profile.education.map((edu: any, idx: number) => (
                    <div key={idx} className="mb-3">
                      <div className="flex justify-between items-baseline font-bold">
                        <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("education", idx, "institution", e.currentTarget.textContent || "")} className="focus:outline-none editor-hover-area rounded px-1 -ml-1">{edu.institution}</span>
                        <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("education", idx, "location", e.currentTarget.textContent || "")} className="font-normal italic focus:outline-none editor-hover-area px-1">{edu.location}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="italic">
                          <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("education", idx, "degree", e.currentTarget.textContent || "")} className="focus:outline-none editor-hover-area px-1 -ml-1">{edu.degree}</span> in <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("education", idx, "field_of_study", e.currentTarget.textContent || "")} className="focus:outline-none editor-hover-area px-1">{edu.field_of_study}</span>
                          {edu.gpa && <>, GPA: <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("education", idx, "gpa", e.currentTarget.textContent || "")} className="focus:outline-none editor-hover-area px-1">{edu.gpa}</span></>}
                        </span>
                        <span className="italic">
                          <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("education", idx, "start_date", e.currentTarget.textContent || "")} className="focus:outline-none editor-hover-area px-1">{edu.start_date}</span> - 
                          <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("education", idx, "end_date", e.currentTarget.textContent || "")} className="focus:outline-none editor-hover-area px-1">{edu.end_date}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {/* Experience */}
              {profile.experience && profile.experience.length > 0 && (
                <section className="mb-5" data-section="experience">
                  <h2 className="font-bold uppercase border-b-2 editor-border-black mb-3 pb-1" style={{ fontSize: "1.2em", letterSpacing: "0.05em" }}>Experience</h2>
                  {profile.experience.map((exp: any, idx: number) => (
                    <div key={idx} className="mb-4">
                      <div className="flex justify-between items-baseline font-bold">
                        <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("experience", idx, "role", e.currentTarget.textContent || "")} className="focus:outline-none editor-hover-area rounded px-1 -ml-1 text-[1.05em]">{exp.role}</span>
                        <span className="font-normal italic">
                          <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("experience", idx, "start_date", e.currentTarget.textContent || "")} className="focus:outline-none editor-hover-area px-1">{exp.start_date}</span> - 
                          <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("experience", idx, "end_date", e.currentTarget.textContent || "")} className="focus:outline-none editor-hover-area px-1">{exp.end_date}</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline mb-2">
                        <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("experience", idx, "company", e.currentTarget.textContent || "")} className="italic focus:outline-none editor-hover-area px-1 -ml-1 font-medium">{exp.company}</span>
                        <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("experience", idx, "location", e.currentTarget.textContent || "")} className="italic focus:outline-none editor-hover-area px-1">{exp.location}</span>
                      </div>
                      {renderBullets(exp.description, "experience", idx, "description")}
                    </div>
                  ))}
                </section>
              )}

              {/* Projects */}
              {profile.projects && profile.projects.length > 0 && (
                <section className="mb-5" data-section="projects">
                  <h2 className="font-bold uppercase border-b-2 editor-border-black mb-3 pb-1" style={{ fontSize: "1.2em", letterSpacing: "0.05em" }}>Projects</h2>
                  {profile.projects.map((proj: any, idx: number) => (
                    <div key={idx} className="mb-4">
                      <div className="flex justify-between items-baseline font-bold">
                        <span>
                          <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("projects", idx, "title", e.currentTarget.textContent || "")} className="focus:outline-none editor-hover-area rounded px-1 -ml-1 text-[1.05em]">{proj.title}</span>
                        </span>
                        <span className="font-normal italic">
                          <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("projects", idx, "start_date", e.currentTarget.textContent || "")} className="focus:outline-none editor-hover-area px-1">{proj.start_date}</span> - 
                          <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("projects", idx, "end_date", e.currentTarget.textContent || "")} className="focus:outline-none editor-hover-area px-1">{proj.end_date}</span>
                        </span>
                      </div>
                      {renderBullets(proj.description, "projects", idx, "description")}
                    </div>
                  ))}
                </section>
              )}

              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <section className="mb-4" data-section="skills">
                  <h2 className="font-bold uppercase border-b-2 editor-border-black mb-3 pb-1" style={{ fontSize: "1.2em", letterSpacing: "0.05em" }}>Technical Skills</h2>
                  {profile.skills.map((skill: any, idx: number) => (
                    <div key={idx} className="mb-2 pl-1 leading-relaxed">
                      <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("skills", idx, "category_name", e.currentTarget.textContent || "")} className="font-bold focus:outline-none editor-hover-area px-1 -ml-1">{skill.category_name}</span>:{" "}
                      <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("skills", idx, "skills_list", e.currentTarget.textContent || "")} className="focus:outline-none editor-hover-area px-1 rounded inline-block min-w-[50px]">{skill.skills_list}</span>
                    </div>
                  ))}
                </section>
              )}

            </div>
          </div>
        </div>
      )}

      {activeTab === "ats" && (
        <div className="flex-1 overflow-auto">
          <ATSChecker 
            profileData={profile} 
            onNavigateToSection={handleNavigateToSection} 
          />
        </div>
      )}

      {activeTab === "jd-match" && (
        <div className="flex-1 overflow-auto">
          <JDMatcher 
            profileData={profile} 
            onApplyCustomization={handleApplyCustomization}
            onSwitchToATS={handleSwitchToATS}
          />
        </div>
      )}
    </div>
  );
}
