import React, { useState, useEffect } from "react";
import { X, Trash2, Plus, GripVertical } from "lucide-react";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  initialProjects: any[];
  onSave: (projects: any[]) => void;
}

export default function ProjectModal({ isOpen, onClose, resumeId, initialProjects, onSave }: ProjectModalProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setProjects([...initialProjects]);
      setSelectedIndex(0);
    }
  }, [isOpen, initialProjects]);

  if (!isOpen) return null;

  const handleAddProject = () => {
    const newProject = { title: "New Project", description: "", start_date: "", end_date: "", live_url: "", github_url: "" };
    setProjects([...projects, newProject]);
    setSelectedIndex(projects.length);
  };

  const handleUpdateSelected = (field: string, value: string) => {
    const updated = [...projects];
    updated[selectedIndex] = { ...updated[selectedIndex], [field]: value };
    setProjects(updated);
  };

  const handleDelete = (index: number) => {
    const updated = projects.filter((_, i) => i !== index);
    setProjects(updated);
    if (selectedIndex >= updated.length) {
      setSelectedIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleSaveChanges = async () => {
    try {
      onSave(projects);
      onClose();
    } catch (error) {
      console.error("Error saving projects", error);
      alert("Failed to save projects");
    }
  };

  const selectedProject = projects[selectedIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-light bg-card">
          <h2 className="text-xl font-semibold font-serif">Edit Projects</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-1/3 border-r border-border-light bg-cream flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {projects.map((proj, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${idx === selectedIndex ? 'bg-white shadow-sm border border-border-light' : 'hover:bg-card-hover border border-transparent'}`}
                  onClick={() => setSelectedIndex(idx)}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <GripVertical className="w-4 h-4 text-text-caption flex-shrink-0" />
                    <span className="text-sm font-medium truncate text-text-primary">
                      {proj.title || "Untitled Project"}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(idx); }}
                    className="text-text-caption hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border-light">
              <button 
                onClick={handleAddProject}
                className="flex items-center space-x-2 text-accent font-medium text-sm hover:text-accent/80 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Project</span>
              </button>
            </div>
          </div>

          {/* Form Area */}
          <div className="w-2/3 p-8 overflow-y-auto bg-card">
            {selectedProject ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Title *</label>
                  <input 
                    type="text" 
                    value={selectedProject.title || ""}
                    onChange={(e) => handleUpdateSelected("title", e.target.value)}
                    className="w-full bg-white border border-border-dark rounded-md px-4 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-text-primary"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Start Date</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Jan 2023"
                      value={selectedProject.start_date || ""}
                      onChange={(e) => handleUpdateSelected("start_date", e.target.value)}
                      className="w-full bg-white border border-border-dark rounded-md px-4 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">End Date</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Present"
                      value={selectedProject.end_date || ""}
                      onChange={(e) => handleUpdateSelected("end_date", e.target.value)}
                      className="w-full bg-white border border-border-dark rounded-md px-4 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-text-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Live Demo URL</label>
                  <input 
                    type="text" 
                    value={selectedProject.live_url || ""}
                    onChange={(e) => handleUpdateSelected("live_url", e.target.value)}
                    className="w-full bg-white border border-border-dark rounded-md px-4 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">GitHub URL</label>
                  <input 
                    type="text" 
                    value={selectedProject.github_url || ""}
                    onChange={(e) => handleUpdateSelected("github_url", e.target.value)}
                    className="w-full bg-white border border-border-dark rounded-md px-4 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Details (Description)</label>
                  <textarea 
                    value={selectedProject.description || ""}
                    onChange={(e) => handleUpdateSelected("description", e.target.value)}
                    rows={6}
                    className="w-full bg-white border border-border-dark rounded-md px-4 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-text-primary resize-none"
                    placeholder="Enter project details..."
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-text-muted">
                Select a project or add a new one.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-border-light bg-cream space-x-3">
          <button 
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveChanges}
            className="px-5 py-2 text-sm font-medium bg-text-primary text-white rounded-md hover:bg-black transition-colors"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
