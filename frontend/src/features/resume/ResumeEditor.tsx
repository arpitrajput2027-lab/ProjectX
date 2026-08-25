"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Download, Save, AlignLeft, AlignCenter, AlignJustify, FileText, Shield, Briefcase, Sparkles } from "lucide-react";
import { ATSChecker } from "./ATSChecker";
import { JDMatcher } from "./JDMatcher";
import { SectionManager, SectionItem } from "./components/SectionManager";
import { ResumeAIChat } from "./components/ResumeAIChat";

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

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as ActiveTab;
    if (tabFromUrl && ["editor", "ats", "jd-match"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else if (!tabFromUrl) {
      setActiveTab("editor");
    }
  }, [searchParams]);

  // New States for Optimizations
  const [activeRightPanel, setActiveRightPanel] = useState<"sections" | "chat">("sections");
  const [sectionOrder, setSectionOrder] = useState<SectionItem[]>([
    { id: 'professional_summary', label: 'Professional Summary' },
    { id: 'education', label: 'Education' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Technical Skills' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'certifications', label: 'Certifications' }
  ]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Toolbar state
  const [font, setFont] = useState("'Times New Roman', Times, serif");
  const [size, setSize] = useState("11pt");
  const [alignment, setAlignment] = useState<"left" | "center" | "justify">("left");
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);

  const resumeRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(1);

  // Dynamic WYSIWYG Pagination Effect
  const paginateResume = () => {
    if (!resumeRef.current) return;

    // Use finer-grained blocks (header, h2, div items) to prevent huge gaps when pushing whole sections
    const blocks = Array.from(resumeRef.current.querySelectorAll('header, section > h2, section > div'));

    // Reset all margins for accurate measurement
    blocks.forEach(b => (b as HTMLElement).style.marginTop = '0px');

    const PAGE_HEIGHT = 1123;
    const PAGE_GAP = 40;
    const PADDING = 48; // p-12 = 48px

    let currentPage = 1;

    blocks.forEach(block => {
      const el = block as HTMLElement;

      let top = el.offsetTop;
      let bottom = top + el.offsetHeight;

      const pageStart = (currentPage - 1) * (PAGE_HEIGHT + PAGE_GAP);
      const usableBottom = pageStart + PAGE_HEIGHT - PADDING;

      if (bottom > usableBottom) {
        currentPage++;
        const newPageStart = (currentPage - 1) * (PAGE_HEIGHT + PAGE_GAP);
        const newUsableTop = newPageStart + PADDING;

        const pushAmount = newUsableTop - top;
        if (pushAmount > 0) {
          el.style.marginTop = `${pushAmount}px`;
        }
      }
    });

    const totalHeight = resumeRef.current.offsetHeight;
    let calculatedPages = 1;
    if (totalHeight > PAGE_HEIGHT) {
      calculatedPages = 1 + Math.ceil((totalHeight - PAGE_HEIGHT) / (PAGE_HEIGHT + PAGE_GAP));
    }
    setNumPages(Math.max(1, calculatedPages));
  };

  useEffect(() => {
    // Initial pagination and when dependencies change
    // Using setTimeout to ensure DOM is fully painted with actual heights
    const timeoutId = setTimeout(paginateResume, 50);

    const currentRef = resumeRef.current;
    if (currentRef) {
      currentRef.addEventListener("input", paginateResume);
    }
    
    return () => {
      clearTimeout(timeoutId);
      if (currentRef) {
        currentRef.removeEventListener("input", paginateResume);
      }
    };
  }, [profile, sectionOrder, font, size]);
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

  // Generate a fully standalone HTML string with inline styles (zero Tailwind)
  // This completely bypasses oklch parsing issues in html2canvas
  const buildExportHTML = () => {
    const esc = (s: string | undefined | null) => {
      if (!s) return '';
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    const bulletHTML = (text: string) => {
      if (!text) return '';
      const items = text.split('\n').filter((i: string) => i.trim() !== '' && i.trim() !== '•' && i.trim() !== '-');
      if (items.length === 0) return '';
      return `<ul style="list-style-type:disc;margin-left:20px;margin-top:4px;">${items.map(item => `<li style="margin-bottom:3px;">${esc(item.replace(/^[•-]\s*/, ''))}</li>`).join('')}</ul>`;
    };

    const sectionTitle = (title: string) =>
      `<h2 style="font-weight:bold;text-transform:uppercase;border-bottom:2px solid #000;margin-bottom:10px;padding-bottom:4px;font-size:1.2em;letter-spacing:0.05em;">${esc(title)}</h2>`;

    // Build sections HTML in the current section order
    const sectionsHTML = sectionOrder.map(section => {
      switch (section.id) {
        case 'professional_summary': {
          if (!profile.professional_summary) return '';
          return `<div style="margin-bottom:18px;page-break-inside:avoid;">${sectionTitle('Professional Summary')}<div style="font-size:1.05em;">${esc(profile.professional_summary)}</div></div>`;
        }
        case 'education': {
          if (!profile.education || profile.education.length === 0) return '';
          const items = profile.education.map((edu: any) => `
            <div style="margin-bottom:10px;">
              <div style="display:flex;justify-content:space-between;font-weight:bold;"><span>${esc(edu.institution)}</span><span style="font-weight:normal;font-style:italic;">${esc(edu.location)}</span></div>
              <div style="display:flex;justify-content:space-between;"><span style="font-style:italic;">${esc(edu.degree)} in ${esc(edu.field_of_study)}${edu.gpa ? `, GPA: ${esc(edu.gpa)}` : ''}</span><span style="font-style:italic;">${esc(edu.start_date)} - ${esc(edu.end_date)}</span></div>
            </div>`).join('');
          return `<div style="margin-bottom:18px;page-break-inside:avoid;">${sectionTitle('Education')}${items}</div>`;
        }
        case 'experience': {
          if (!profile.experience || profile.experience.length === 0) return '';
          const items = profile.experience.map((exp: any) => `
            <div style="margin-bottom:14px;page-break-inside:avoid;">
              <div style="display:flex;justify-content:space-between;font-weight:bold;"><span style="font-size:1.05em;">${esc(exp.role)}</span><span style="font-weight:normal;font-style:italic;">${esc(exp.start_date)} - ${esc(exp.end_date)}</span></div>
              <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-style:italic;font-weight:500;">${esc(exp.company)}</span><span style="font-style:italic;">${esc(exp.location)}</span></div>
              ${bulletHTML(exp.description)}
            </div>`).join('');
          return `<div style="margin-bottom:18px;page-break-inside:avoid;">${sectionTitle('Experience')}${items}</div>`;
        }
        case 'projects': {
          if (!profile.projects || profile.projects.length === 0) return '';
          const items = profile.projects.map((proj: any) => `
            <div style="margin-bottom:14px;page-break-inside:avoid;">
              <div style="display:flex;justify-content:space-between;font-weight:bold;"><span style="font-size:1.05em;">${esc(proj.title)}</span><span style="font-weight:normal;font-style:italic;">${esc(proj.start_date)} - ${esc(proj.end_date)}</span></div>
              ${bulletHTML(proj.description)}
            </div>`).join('');
          return `<div style="margin-bottom:18px;page-break-inside:avoid;">${sectionTitle('Projects')}${items}</div>`;
        }
        case 'skills': {
          if (!profile.skills || profile.skills.length === 0) return '';
          const items = profile.skills.map((skill: any) =>
            `<div style="margin-bottom:6px;padding-left:4px;"><span style="font-weight:bold;">${esc(skill.category_name)}</span>: ${esc(skill.skills_list)}</div>`
          ).join('');
          return `<div style="margin-bottom:14px;page-break-inside:avoid;">${sectionTitle('Technical Skills')}${items}</div>`;
        }
        case 'achievements': {
          if (!profile.achievements || profile.achievements.length === 0) return '';
          const items = profile.achievements.map((ach: any) => `
            <div style="margin-bottom:8px;">
              <div style="display:flex;justify-content:space-between;font-weight:bold;"><span style="font-size:1.05em;">${esc(ach.title)}</span><span style="font-weight:normal;font-style:italic;">${esc(ach.date)}</span></div>
              ${ach.description ? `<div style="margin-top:3px;font-size:0.95em;">${esc(ach.description)}</div>` : ''}
            </div>`).join('');
          return `<div style="margin-bottom:18px;page-break-inside:avoid;">${sectionTitle('Achievements')}${items}</div>`;
        }
        case 'certifications': {
          if (!profile.certifications || profile.certifications.length === 0) return '';
          const items = profile.certifications.map((cert: any) => `
            <div style="margin-bottom:8px;">
              <div style="display:flex;justify-content:space-between;font-weight:bold;"><span style="font-size:1.05em;">${esc(cert.name)}${cert.issuer ? `<span style="font-weight:normal;font-style:italic;font-size:0.9em;"> by ${esc(cert.issuer)}</span>` : ''}</span><span style="font-weight:normal;font-style:italic;">${esc(cert.date)}</span></div>
            </div>`).join('');
          return `<div style="margin-bottom:18px;page-break-inside:avoid;">${sectionTitle('Certifications')}${items}</div>`;
        }
        default:
          return '';
      }
    }).join('');

    // Build contact info line
    const contactParts: string[] = [];
    if (profile.location) contactParts.push(esc(profile.location));
    if (profile.phone) contactParts.push(esc(profile.phone));
    if (session?.user?.email) contactParts.push(esc(session.user.email));
    if (profile.linkedin_url) contactParts.push(`<a href="${esc(profile.linkedin_url)}" style="color:#2563eb;">LinkedIn</a>`);
    if (profile.portfolio_url) contactParts.push(`<a href="${esc(profile.portfolio_url)}" style="color:#2563eb;">Portfolio</a>`);
    if (profile.github_username) contactParts.push(`<a href="https://github.com/${esc(profile.github_username)}" style="color:#2563eb;">GitHub</a>`);

    return `
      <div style="width:100%;color:#000000;background:#ffffff;font-family:${font};font-size:${size};line-height:1.4;text-align:${alignment};padding:48px;box-sizing:border-box;">
        <div style="text-align:center;margin-bottom:20px;">
          <h1 style="font-weight:bold;font-size:24pt;margin:0 0 8px 0;line-height:1;">${esc(profile.full_name)}</h1>
          <div style="font-size:${size};">${contactParts.join(' | ')}</div>
        </div>
        ${sectionsHTML}
      </div>
    `;
  };

  const handleExport = async () => {
    if (!profile) return;
    setExporting(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;

      // Generate fully self-contained HTML with inline styles — no Tailwind, no oklch
      const htmlContent = buildExportHTML();

      // Create a temporary container
      const container = document.createElement('div');
      container.innerHTML = htmlContent;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '794px';
      document.body.appendChild(container);

      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 100));

      const opt = {
        margin: [0, 0, 0, 0],
        filename: `Resume_${profile?.full_name || 'Export'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', width: 794, windowWidth: 794 },
        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' as const },
        pagebreak: { mode: ['css', 'avoid-all'] }
      } as any;

      const exportEl = container.firstElementChild as HTMLElement;
      if (!exportEl) throw new Error('Failed to build export HTML');
      await html2pdf().set(opt).from(exportEl).save();

      // Clean up
      document.body.removeChild(container);
    } catch (error: any) {
      console.error("Export failed", error);
      alert("Failed to export PDF: " + (error?.message || JSON.stringify(error) || error));
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
            linkedin_url: profile.linkedin_url,
            professional_summary: profile.professional_summary,
            education: profile.education,
            experience: profile.experience,
            projects: profile.projects,
            skills: profile.skills,
            achievements: profile.achievements,
            certifications: profile.certifications
          })
          .eq("id", profile.id);

        if (error) throw error;
        alert("Changes saved successfully!");
      }
    } catch (error: any) {
      console.error("Error saving profile", error);
      alert(`Failed to save changes: ${error?.message || JSON.stringify(error) || "Unknown error"}`);
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
      const newArray = [...(prev[arrayName] || [])];
      if (newArray[index]) {
        newArray[index] = { ...newArray[index], [field]: value };
      }
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
    setActiveSectionId(section.toLowerCase());
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
    setProfile((prev: any) => ({
      ...prev,
      ...customizedProfile,
    }));
    setActiveTab("editor");
  };

  if (loading) return <div className="p-24 text-center font-mono uppercase tracking-widest text-muted">Loading editor...</div>;
  if (!profile) return <div className="p-24 text-center">Profile not found.</div>;

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: "ats", label: "ATS Check", icon: <Shield className="w-4 h-4" /> },
    { id: "jd-match", label: "JD Match", icon: <Briefcase className="w-4 h-4" /> },
  ];

  // Helper for dynamic section rendering
  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'professional_summary':
        if (!profile.professional_summary) return null;
        return (
          <section className="mb-5" style={{ pageBreakInside: 'avoid' }} data-section="professional_summary" key={sectionId}>
            <h2 className="font-bold uppercase border-b-2 editor-border-black mb-3 pb-1" style={{ fontSize: "1.2em", letterSpacing: "0.05em" }}>Professional Summary</h2>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => updateField("professional_summary", e.currentTarget.textContent || "")}
              className="focus:outline-none editor-hover-area px-1 rounded -ml-1 text-[1.05em]"
            >
              {profile.professional_summary}
            </div>
          </section>
        );

      case 'education':
        if (!profile.education || profile.education.length === 0) return null;
        return (
          <section className="mb-5" style={{ pageBreakInside: 'avoid' }} data-section="education" key={sectionId}>
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
        );

      case 'experience':
        if (!profile.experience || profile.experience.length === 0) return null;
        return (
          <section className="mb-5" style={{ pageBreakInside: 'avoid' }} data-section="experience" key={sectionId}>
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
        );

      case 'projects':
        if (!profile.projects || profile.projects.length === 0) return null;
        return (
          <section className="mb-5" style={{ pageBreakInside: 'avoid' }} data-section="projects" key={sectionId}>
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
        );

      case 'skills':
        if (!profile.skills || profile.skills.length === 0) return null;
        return (
          <section className="mb-4" data-section="skills" key={sectionId}>
            <h2 className="font-bold uppercase border-b-2 editor-border-black mb-3 pb-1" style={{ fontSize: "1.2em", letterSpacing: "0.05em" }}>Technical Skills</h2>
            {profile.skills.map((skill: any, idx: number) => (
              <div key={idx} className="mb-2 pl-1 leading-relaxed">
                <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("skills", idx, "category_name", e.currentTarget.textContent || "")} className="font-bold focus:outline-none editor-hover-area px-1 -ml-1">{skill.category_name}</span>:{" "}
                <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("skills", idx, "skills_list", e.currentTarget.textContent || "")} className="focus:outline-none editor-hover-area px-1 rounded inline-block min-w-[50px]">{skill.skills_list}</span>
              </div>
            ))}
          </section>
        );

      case 'achievements':
        if (!profile.achievements || profile.achievements.length === 0) return null;
        return (
          <section className="mb-5" style={{ pageBreakInside: 'avoid' }} data-section="achievements" key={sectionId}>
            <h2 className="font-bold uppercase border-b-2 editor-border-black mb-3 pb-1" style={{ fontSize: "1.2em", letterSpacing: "0.05em" }}>Achievements</h2>
            {profile.achievements.map((ach: any, idx: number) => (
              <div key={idx} className="mb-2">
                <div className="flex justify-between items-baseline font-bold">
                  <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("achievements", idx, "title", e.currentTarget.textContent || "")} className="focus:outline-none editor-hover-area rounded px-1 -ml-1 text-[1.05em]">{ach.title}</span>
                  <span className="font-normal italic">
                    <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("achievements", idx, "date", e.currentTarget.textContent || "")} className="focus:outline-none editor-hover-area px-1">{ach.date}</span>
                  </span>
                </div>
                {ach.description && (
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateArrayItem("achievements", idx, "description", e.currentTarget.textContent || "")}
                    className="focus:outline-none editor-hover-area px-1 rounded -ml-1 mt-1 text-[0.95em]"
                  >
                    {ach.description}
                  </div>
                )}
              </div>
            ))}
          </section>
        );

      case 'certifications':
        if (!profile.certifications || profile.certifications.length === 0) return null;
        return (
          <section className="mb-5" style={{ pageBreakInside: 'avoid' }} data-section="certifications" key={sectionId}>
            <h2 className="font-bold uppercase border-b-2 editor-border-black mb-3 pb-1" style={{ fontSize: "1.2em", letterSpacing: "0.05em" }}>Certifications</h2>
            {profile.certifications.map((cert: any, idx: number) => (
              <div key={idx} className="mb-2">
                <div className="flex justify-between items-baseline font-bold">
                  <span>
                    <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("certifications", idx, "name", e.currentTarget.textContent || "")} className="focus:outline-none editor-hover-area rounded px-1 -ml-1 text-[1.05em]">{cert.name}</span>
                    {cert.issuer && (
                      <span className="font-normal italic text-[0.9em]">
                        {" "}by <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("certifications", idx, "issuer", e.currentTarget.textContent || "")} className="focus:outline-none editor-hover-area px-1 rounded">{cert.issuer}</span>
                      </span>
                    )}
                  </span>
                  <span className="font-normal italic">
                    <span contentEditable suppressContentEditableWarning onBlur={(e) => updateArrayItem("certifications", idx, "date", e.currentTarget.textContent || "")} className="focus:outline-none editor-hover-area px-1">{cert.date}</span>
                  </span>
                </div>
              </div>
            ))}
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-cream-2">
      {/* Editor Sub-Header */}
      <div className="bg-cream border-b border-rule px-6 py-3 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center space-x-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-accent text-white border-accent"
                  : "bg-cream-2 text-ink-3 hover:bg-cream-3 hover:text-ink border-transparent"
              } border`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
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
        <div className="flex-1 flex overflow-hidden relative">

          {/* CENTER: Main Canvas Area */}
          <div className="flex-1 overflow-auto py-10 flex justify-center items-start bg-cream-3/30 relative">

            {/* Paginated Wrapper */}
            <div
              className="relative mx-10"
              style={{
                width: "794px",
                height: `${numPages * 1123 + (numPages - 1) * 40}px`
              }}
            >
              {/* Background Pages Layer */}
              <div className="absolute inset-0 z-0 flex flex-col pointer-events-none" style={{ gap: '40px' }}>
                {Array.from({ length: numPages }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white shadow-2xl shrink-0"
                    style={{ width: '794px', height: '1123px' }}
                  />
                ))}
              </div>

              {/* Foreground Content Layer */}
              <div
                ref={resumeRef}
                className="relative z-10 w-full p-12"
                style={{
                  color: '#000000',
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

                    {profile.linkedin_url && (
                      <>
                        <span>|</span>
                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }} className="hover:underline px-1">LinkedIn</a>
                      </>
                    )}

                    {profile.portfolio_url && (
                      <>
                        <span>|</span>
                        <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }} className="hover:underline px-1">Portfolio</a>
                      </>
                    )}

                    {profile.github_username && (
                      <>
                        <span>|</span>
                        <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }} className="hover:underline px-1">GitHub</a>
                      </>
                    )}
                  </div>
                </header>

                {/* Dynamically Rendered Sections based on Order */}
                {sectionOrder.map((section) => renderSectionContent(section.id))}

              </div>
            </div>
          </div>

          {/* RIGHT: Dynamic Panel */}
          {activeRightPanel === "sections" ? (
            <SectionManager
              sections={sectionOrder}
              onReorder={setSectionOrder}
              onNavigate={handleNavigateToSection}
              activeSectionId={activeSectionId}
            />
          ) : (
            <ResumeAIChat
              profileData={profile}
              onApplyChanges={(updatedProfile) => setProfile(updatedProfile)}
              isOpen={true}
              onToggle={() => setActiveRightPanel("sections")}
            />
          )}

          {/* FLOATING BUTTON (Only show when chat is closed) */}
          {activeRightPanel !== "chat" && (
            <button
              onClick={() => setActiveRightPanel("chat")}
              className="absolute bottom-8 right-[272px] z-50 bg-ink text-cream px-6 py-3.5 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.2)] hover:bg-accent hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-medium text-sm whitespace-nowrap">
                AI Resume Editor
              </span>
            </button>
          )}
        </div>
      )}

      {activeTab === "ats" && (
        <div className="flex-1 overflow-auto relative">
          <ATSChecker
            profileData={profile}
            onNavigateToSection={handleNavigateToSection}
            onBackToEditor={() => setActiveTab("editor")}
          />
        </div>
      )}

      {activeTab === "jd-match" && (
        <div className="flex-1 overflow-auto relative">
          <JDMatcher
            profileData={profile}
            onApplyCustomization={handleApplyCustomization}
            onSwitchToATS={() => setActiveTab("ats")}
            onBackToEditor={() => setActiveTab("editor")}
          />
        </div>
      )}
    </div>
  );
}
