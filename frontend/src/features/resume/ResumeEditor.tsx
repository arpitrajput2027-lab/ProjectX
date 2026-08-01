"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Download, Save, AlignLeft, AlignCenter, AlignJustify } from "lucide-react";

export function ResumeEditor({ id = "me" }: { id?: string }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
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
        // In MVP we use a mock if backend is not fully connected yet
        const mockProfile = {
          contact_info: {
            first_name: "Arpit", last_name: "Rajput", location: "India",
            phone: "+91 8953530464", email: "arpit@gmail.com",
            linkedin_url: "https://linkedin.com", github_url: "https://github.com/arpitrajput11"
          },
          education: [
            { institution: "University of Technology", location: "City, State", degree: "B.Tech", field_of_study: "Computer Science", gpa: "8.5", start_date: "2020", end_date: "2024" }
          ],
          experience: [
            { role: "Software Engineer Intern", company: "Tech Corp", location: "Remote", start_date: "Jun 2023", end_date: "Aug 2023", description: "• Built a React dashboard\n• Optimized API queries by 40%" }
          ],
          projects: [
            { title: "AI Career OS", start_date: "2024", end_date: "Present", description: "• Built using Next.js and FastAPI\n• Implemented AI resume parsing" }
          ],
          skills: [
            { category_name: "Languages", skills_list: "JavaScript, Python, TypeScript" },
            { category_name: "Frameworks", skills_list: "React, Next.js, FastAPI" }
          ]
        };
        // Simulate API call
        await new Promise(r => setTimeout(r, 500));
        setProfile(mockProfile);
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
        filename:     `Resume_${id}.pdf`,
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
      // Simulate save
      await new Promise(r => setTimeout(r, 1000));
      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving profile", error);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  // --- Update Handlers ---
  const updateContact = (field: string, value: string) => {
    setProfile((prev: any) => ({ ...prev, contact_info: { ...prev.contact_info, [field]: value } }));
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
            className="focus:outline-none focus:bg-blue-50/50 hover:bg-gray-100 rounded px-1 transition-colors"
          >
            {item.replace(/^[•-]\s*/, '')}
          </li>
        ))}
      </ul>
    );
  };

  if (loading) return <div className="p-24 text-center font-mono uppercase tracking-widest text-muted">Loading editor...</div>;
  if (!profile) return <div className="p-24 text-center">Profile not found.</div>;

  return (
    <div className="flex flex-col h-full bg-cream-2">
      {/* Editor Sub-Header */}
      <div className="bg-cream border-b border-rule px-6 py-3 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center space-x-3">
          <h2 className="font-serif text-2xl text-ink">Resume Editor</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-parchment px-3 py-1.5 rounded-md border border-rule">
            <span className="text-xs text-muted font-medium mr-1">Template</span>
            <span className="text-sm font-semibold text-ink-2">Standard</span>
          </div>

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
      </div>

      {/* Main Canvas Area */}
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
                <span contentEditable suppressContentEditableWarning onBlur={(e) => updateContact("first_name", e.currentTarget.textContent || "")} className="focus:outline-none hover:bg-gray-100 px-1 rounded">{profile.contact_info?.first_name}</span>{" "}
                <span contentEditable suppressContentEditableWarning onBlur={(e) => updateContact("last_name", e.currentTarget.textContent || "")} className="focus:outline-none hover:bg-gray-100 px-1 rounded">{profile.contact_info?.last_name}</span>
              </h1>
              <div className="flex justify-center flex-wrap gap-x-2 text-center" style={{ fontSize: size }}>
                {profile.contact_info?.location && <span contentEditable suppressContentEditableWarning onBlur={(e) => updateContact("location", e.currentTarget.textContent || "")} className="focus:outline-none hover:bg-gray-100 px-1">{profile.contact_info.location}</span>}
                {profile.contact_info?.location && <span>|</span>}
                
                {profile.contact_info?.phone && <span contentEditable suppressContentEditableWarning onBlur={(e) => updateContact("phone", e.currentTarget.textContent || "")} className="focus:outline-none hover:bg-gray-100 px-1">{profile.contact_info.phone}</span>}
                {profile.contact_info?.phone && <span>|</span>}
                
                {profile.contact_info?.email && (
                  <span contentEditable suppressContentEditableWarning onBlur={(e) => updateContact("email", e.currentTarget.textContent || "")} className="focus:outline-none hover:bg-gray-100 px-1 text-blue-600 underline">
                    {profile.contact_info.email}
                  </span>
                )}
                
                {profile.contact_info?.linkedin_url && (
                  <>
                    <span>|</span>
                    <a href={profile.contact_info.linkedin_url} className="focus:outline-none hover:bg-gray-100 px-1 text-blue-600 underline">LinkedIn</a>
                  </>
                )}
                {profile.contact_info?.github_url && (
                  <>
                    <span>|</span>
                    <a href={profile.contact_info.github_url} className="focus:outline-none hover:bg-gray-100 px-1 text-blue-600 underline">GitHub</a>
                  </>
                )}
              </div>
            </header>

            {/* Education */}
            {profile.education && profile.education.length > 0 && (
              <section className="mb-5">
                <h2 className="font-bold uppercase border-b-2 border-black mb-3 pb-1" style={{ fontSize: "1.2em", letterSpacing: "0.05em" }}>Education</h2>
                {profile.education.map((edu: any, idx: number) => (
                  <div key={idx} className="mb-3">
                    <div className="flex justify-between items-baseline font-bold">
                      <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("education", idx, "institution", e.currentTarget.textContent || "")} className="focus:outline-none hover:bg-gray-100 rounded px-1 -ml-1">{edu.institution}</span>
                      <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("education", idx, "location", e.currentTarget.textContent || "")} className="font-normal italic focus:outline-none hover:bg-gray-100 px-1">{edu.location}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="italic">
                        <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("education", idx, "degree", e.currentTarget.textContent || "")} className="focus:outline-none hover:bg-gray-100 px-1 -ml-1">{edu.degree}</span> in <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("education", idx, "field_of_study", e.currentTarget.textContent || "")} className="focus:outline-none hover:bg-gray-100 px-1">{edu.field_of_study}</span>
                        {edu.gpa && <>, GPA: <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("education", idx, "gpa", e.currentTarget.textContent || "")} className="focus:outline-none hover:bg-gray-100 px-1">{edu.gpa}</span></>}
                      </span>
                      <span className="italic">
                        <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("education", idx, "start_date", e.currentTarget.textContent || "")} className="focus:outline-none hover:bg-gray-100 px-1">{edu.start_date}</span> - 
                        <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("education", idx, "end_date", e.currentTarget.textContent || "")} className="focus:outline-none hover:bg-gray-100 px-1">{edu.end_date}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Experience */}
            {profile.experience && profile.experience.length > 0 && (
              <section className="mb-5">
                <h2 className="font-bold uppercase border-b-2 border-black mb-3 pb-1" style={{ fontSize: "1.2em", letterSpacing: "0.05em" }}>Experience</h2>
                {profile.experience.map((exp: any, idx: number) => (
                  <div key={idx} className="mb-4">
                    <div className="flex justify-between items-baseline font-bold">
                      <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("experience", idx, "role", e.currentTarget.textContent || "")} className="focus:outline-none hover:bg-gray-100 rounded px-1 -ml-1 text-[1.05em]">{exp.role}</span>
                      <span className="font-normal italic">
                        <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("experience", idx, "start_date", e.currentTarget.textContent || "")} className="focus:outline-none hover:bg-gray-100 px-1">{exp.start_date}</span> - 
                        <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("experience", idx, "end_date", e.currentTarget.textContent || "")} className="focus:outline-none hover:bg-gray-100 px-1">{exp.end_date}</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("experience", idx, "company", e.currentTarget.textContent || "")} className="italic focus:outline-none hover:bg-gray-100 px-1 -ml-1 font-medium">{exp.company}</span>
                      <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("experience", idx, "location", e.currentTarget.textContent || "")} className="italic focus:outline-none hover:bg-gray-100 px-1">{exp.location}</span>
                    </div>
                    {renderBullets(exp.description, "experience", idx, "description")}
                  </div>
                ))}
              </section>
            )}

            {/* Projects */}
            {profile.projects && profile.projects.length > 0 && (
              <section className="mb-5">
                <h2 className="font-bold uppercase border-b-2 border-black mb-3 pb-1" style={{ fontSize: "1.2em", letterSpacing: "0.05em" }}>Projects</h2>
                {profile.projects.map((proj: any, idx: number) => (
                  <div key={idx} className="mb-4">
                    <div className="flex justify-between items-baseline font-bold">
                      <span>
                        <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("projects", idx, "title", e.currentTarget.textContent || "")} className="focus:outline-none hover:bg-gray-100 rounded px-1 -ml-1 text-[1.05em]">{proj.title}</span>
                      </span>
                      <span className="font-normal italic">
                        <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("projects", idx, "start_date", e.currentTarget.textContent || "")} className="focus:outline-none hover:bg-gray-100 px-1">{proj.start_date}</span> - 
                        <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("projects", idx, "end_date", e.currentTarget.textContent || "")} className="focus:outline-none hover:bg-gray-100 px-1">{proj.end_date}</span>
                      </span>
                    </div>
                    {renderBullets(proj.description, "projects", idx, "description")}
                  </div>
                ))}
              </section>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <section className="mb-4">
                <h2 className="font-bold uppercase border-b-2 border-black mb-3 pb-1" style={{ fontSize: "1.2em", letterSpacing: "0.05em" }}>Technical Skills</h2>
                {profile.skills.map((skill: any, idx: number) => (
                  <div key={idx} className="mb-2 pl-1 leading-relaxed">
                    <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("skills", idx, "category_name", e.currentTarget.textContent || "")} className="font-bold focus:outline-none hover:bg-gray-100 px-1 -ml-1">{skill.category_name}</span>:{" "}
                    <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("skills", idx, "skills_list", e.currentTarget.textContent || "")} className="focus:outline-none hover:bg-gray-100 px-1 rounded inline-block min-w-[50px]">{skill.skills_list}</span>
                  </div>
                ))}
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
