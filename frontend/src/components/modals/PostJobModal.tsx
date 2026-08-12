"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  recruiterId: string;
  companyId: string;
  onJobPosted: () => void;
}

export default function PostJobModal({ isOpen, onClose, recruiterId, companyId, onJobPosted }: PostJobModalProps) {
  const [title, setTitle] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("Remote");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const required_skills = skillsInput.split(",").map(s => s.trim()).filter(s => s.length > 0);

    const { error: insertError } = await supabase
      .from('jobs')
      .insert({
        recruiter_id: recruiterId,
        company_id: companyId,
        title,
        target_role: targetRole,
        location,
        work_mode: workMode,
        salary,
        description,
        required_skills
      });

    setLoading(false);

    if (insertError) {
      console.error(insertError);
      setError(insertError.message);
    } else {
      onJobPosted();
      onClose();
      // Reset form
      setTitle("");
      setLocation("");
      setSalary("");
      setDescription("");
      setSkillsInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl rounded-xl shadow-2xl border border-rule-med flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 bg-gradient-to-br from-white via-white to-cream overflow-hidden">

        {/* Decorative ambient glow */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-accent/5 blur-3xl" />

        <div className="relative flex items-center justify-between p-5 border-b border-rule-lt bg-cream/70 backdrop-blur-sm sticky top-0 z-10 rounded-t-xl">
          <div className="font-mono text-[10px] tracking-widest uppercase text-ink-3">Post a New Job</div>
          <button onClick={onClose} className="text-ink-3 hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative p-6 overflow-y-auto">
          {error && <div className="mb-4 text-xs text-red-500 bg-red-50 p-3 rounded border border-red-100">{error}</div>}
          
          <form id="post-job-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Job Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Senior Frontend Engineer" 
                className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Target Role</label>
                <select 
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
                >
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Designer">Designer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Work Mode</label>
                <select 
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Location</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA" 
                  className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Salary Range</label>
                <input 
                  type="text" 
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. $120k - $150k" 
                  className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Required Skills (comma separated)</label>
              <input 
                type="text" 
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="e.g. React, TypeScript, Node.js" 
                className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Job Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                placeholder="Describe the role, responsibilities, and requirements..." 
                className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent resize-y" 
              ></textarea>
            </div>
          </form>
        </div>

        <div className="relative p-5 border-t border-rule-lt bg-cream/70 backdrop-blur-sm sticky bottom-0 rounded-b-xl flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-ink-3 hover:text-ink text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="post-job-form"
            disabled={loading}
            className="bg-ink text-cream px-5 py-2 rounded-md font-mono text-[11px] uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post Job"}
          </button>
        </div>
        
      </div>
    </div>
  );
}