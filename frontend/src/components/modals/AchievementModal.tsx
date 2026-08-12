import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";

interface Achievement {
  title: string;
  description?: string;
  date?: string;
}

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  initialAchievements: Achievement[];
  onSave: (achievements: Achievement[]) => void;
}

export default function AchievementModal({ isOpen, onClose, initialAchievements, onSave }: AchievementModalProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAchievements(initialAchievements.length ? [...initialAchievements] : []);
    }
  }, [isOpen, initialAchievements]);

  if (!isOpen) return null;

  const handleChange = (index: number, field: keyof Achievement, value: string) => {
    const updated = [...achievements];
    updated[index] = { ...updated[index], [field]: value };
    setAchievements(updated);
  };

  const addAchievement = () => {
    setAchievements([...achievements, { title: "", description: "", date: "" }]);
  };

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const valid = achievements.filter(a => a.title.trim() !== "");
    onSave(valid);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 bg-gradient-to-b from-white via-cream-2 to-cream-2 overflow-hidden">

        {/* Decorative ambient glow */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 w-72 h-72 rounded-full bg-accent/5 blur-3xl" />

        <div className="relative flex items-center justify-between p-6 bg-white/70 backdrop-blur-sm border-b border-rule-med">
          <h2 className="text-xl font-serif font-medium text-ink">Edit Achievements</h2>
          <button onClick={onClose} className="text-ink-3 hover:text-ink"><X className="w-6 h-6" /></button>
        </div>
        
        <div className="relative flex-1 overflow-y-auto p-6 space-y-8">
          {achievements.length === 0 && (
            <p className="text-sm text-ink-3 text-center py-8">No achievements added. Click below to add one.</p>
          )}

          {achievements.map((ach, idx) => (
            <div key={idx} className="bg-white/90 backdrop-blur-sm p-5 rounded-md border border-rule-med shadow-sm relative group">
              <button 
                onClick={() => removeAchievement(idx)}
                className="absolute top-4 right-4 text-ink-3 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-1">Title / Award</label>
                  <input 
                    type="text" 
                    value={ach.title} 
                    onChange={(e) => handleChange(idx, "title", e.target.value)}
                    className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:border-accent outline-none"
                    placeholder="e.g. 1st Place - National Hackathon"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-1">Date</label>
                  <input 
                    type="text" 
                    value={ach.date || ""} 
                    onChange={(e) => handleChange(idx, "date", e.target.value)}
                    className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:border-accent outline-none"
                    placeholder="e.g. Oct 2023"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-1">Description</label>
                  <textarea 
                    value={ach.description || ""} 
                    onChange={(e) => handleChange(idx, "description", e.target.value)}
                    rows={3}
                    className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:border-accent outline-none resize-none"
                    placeholder="Describe what you achieved or your responsibilities..."
                  />
                </div>
              </div>
            </div>
          ))}

          <button 
            onClick={addAchievement}
            className="w-full py-4 border-2 border-dashed border-rule-med rounded-md text-ink-3 hover:text-ink hover:border-accent hover:bg-white transition-colors flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" /> Add Achievement
          </button>
        </div>

        <div className="relative p-6 bg-white/70 backdrop-blur-sm border-t border-rule-med flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded-md font-mono text-xs uppercase tracking-widest border border-rule-med text-ink hover:bg-cream transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2 rounded-md font-mono text-xs uppercase tracking-widest bg-ink text-cream hover:bg-accent transition-colors">Save Changes</button>
        </div>
      </div>
    </div>
  );
}