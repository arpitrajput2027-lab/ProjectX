import React, { useState, useEffect } from "react";
import { X, Trash2, Plus, GripVertical } from "lucide-react";

interface SkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  initialSkills: any[];
  onSave: (skills: any[]) => void;
}

export default function SkillModal({ isOpen, onClose, resumeId, initialSkills, onSave }: SkillModalProps) {
  const [skillCategories, setSkillCategories] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSkillCategories([...initialSkills]);
      setSelectedIndex(0);
    }
  }, [isOpen, initialSkills]);

  if (!isOpen) return null;

  const handleAddSkillCategory = () => {
    const newSkill = { category_name: "New Category", skills_list: "" };
    setSkillCategories([...skillCategories, newSkill]);
    setSelectedIndex(skillCategories.length);
  };

  const handleUpdateSelected = (field: string, value: string) => {
    const updated = [...skillCategories];
    updated[selectedIndex] = { ...updated[selectedIndex], [field]: value };
    setSkillCategories(updated);
  };

  const handleDelete = (index: number) => {
    const updated = skillCategories.filter((_, i) => i !== index);
    setSkillCategories(updated);
    if (selectedIndex >= updated.length) {
      setSelectedIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleSaveChanges = async () => {
    try {
      onSave(skillCategories);
      onClose();
    } catch (error) {
      console.error("Error saving skills", error);
      alert("Failed to save skills");
    }
  };

  const selectedSkill = skillCategories[selectedIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-light bg-card">
          <h2 className="text-xl font-semibold font-serif">Edit Skills</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-1/3 border-r border-border-light bg-cream flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {skillCategories.map((skill, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${idx === selectedIndex ? 'bg-white shadow-sm border border-border-light' : 'hover:bg-card-hover border border-transparent'}`}
                  onClick={() => setSelectedIndex(idx)}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <GripVertical className="w-4 h-4 text-text-caption flex-shrink-0" />
                    <span className="text-sm font-medium truncate text-text-primary capitalize">
                      {skill.category_name || "Untitled Category"}
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
                onClick={handleAddSkillCategory}
                className="flex items-center space-x-2 text-accent font-medium text-sm hover:text-accent/80 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Skill Category</span>
              </button>
            </div>
          </div>

          {/* Form Area */}
          <div className="w-2/3 p-8 overflow-y-auto bg-card">
            {selectedSkill ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Category Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Programming Languages"
                    value={selectedSkill.category_name || ""}
                    onChange={(e) => handleUpdateSelected("category_name", e.target.value)}
                    className="w-full bg-white border border-border-dark rounded-md px-4 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-text-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Skills List (Comma separated) *</label>
                  <textarea 
                    value={selectedSkill.skills_list || ""}
                    onChange={(e) => handleUpdateSelected("skills_list", e.target.value)}
                    rows={4}
                    className="w-full bg-white border border-border-dark rounded-md px-4 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-text-primary resize-none"
                    placeholder="e.g. JavaScript, Python, React, Next.js..."
                  />
                </div>
                
                <div className="bg-cream rounded-md p-4 mt-6">
                  <h4 className="text-sm font-medium text-text-primary mb-2">Preview</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSkill.skills_list?.split(',').filter((s: string) => s.trim()).map((s: string, i: number) => (
                      <span key={i} className="bg-accent/10 text-accent font-mono text-xs px-3 py-1 rounded-full">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-text-muted">
                Select a skill category or add a new one.
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
