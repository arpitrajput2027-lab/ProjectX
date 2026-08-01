import React, { useState, useEffect } from "react";
import { X, Trash2, Plus, GripVertical } from "lucide-react";

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  initialEducation: any[];
  onSave: (education: any[]) => void;
}

export default function EducationModal({ isOpen, onClose, resumeId, initialEducation, onSave }: EducationModalProps) {
  const [educationList, setEducationList] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setEducationList([...initialEducation]);
      setSelectedIndex(0);
    }
  }, [isOpen, initialEducation]);

  if (!isOpen) return null;

  const handleAddEducation = () => {
    const newEdu = { institution: "New Institution", degree: "", field_of_study: "", start_date: "", end_date: "", gpa: "", location: "" };
    setEducationList([...educationList, newEdu]);
    setSelectedIndex(educationList.length);
  };

  const handleUpdateSelected = (field: string, value: string) => {
    const updated = [...educationList];
    updated[selectedIndex] = { ...updated[selectedIndex], [field]: value };
    setEducationList(updated);
  };

  const handleDelete = (index: number) => {
    const updated = educationList.filter((_, i) => i !== index);
    setEducationList(updated);
    if (selectedIndex >= updated.length) {
      setSelectedIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleSaveChanges = async () => {
    try {
      onSave(educationList);
      onClose();
    } catch (error) {
      console.error("Error saving education", error);
      alert("Failed to save education");
    }
  };

  const selectedEdu = educationList[selectedIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-light bg-card">
          <h2 className="text-xl font-semibold font-serif">Edit Education</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-1/3 border-r border-border-light bg-cream flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {educationList.map((edu, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${idx === selectedIndex ? 'bg-white shadow-sm border border-border-light' : 'hover:bg-card-hover border border-transparent'}`}
                  onClick={() => setSelectedIndex(idx)}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <GripVertical className="w-4 h-4 text-text-caption flex-shrink-0" />
                    <span className="text-sm font-medium truncate text-text-primary">
                      {edu.institution || "Untitled Institution"}
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
                onClick={handleAddEducation}
                className="flex items-center space-x-2 text-accent font-medium text-sm hover:text-accent/80 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Education</span>
              </button>
            </div>
          </div>

          {/* Form Area */}
          <div className="w-2/3 p-8 overflow-y-auto bg-card">
            {selectedEdu ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Institution *</label>
                  <input 
                    type="text" 
                    value={selectedEdu.institution || ""}
                    onChange={(e) => handleUpdateSelected("institution", e.target.value)}
                    className="w-full bg-white border border-border-dark rounded-md px-4 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-text-primary"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Degree</label>
                    <input 
                      type="text" 
                      value={selectedEdu.degree || ""}
                      onChange={(e) => handleUpdateSelected("degree", e.target.value)}
                      className="w-full bg-white border border-border-dark rounded-md px-4 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Field of Study</label>
                    <input 
                      type="text" 
                      value={selectedEdu.field_of_study || ""}
                      onChange={(e) => handleUpdateSelected("field_of_study", e.target.value)}
                      className="w-full bg-white border border-border-dark rounded-md px-4 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-text-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Start Date</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Jan 2020"
                      value={selectedEdu.start_date || ""}
                      onChange={(e) => handleUpdateSelected("start_date", e.target.value)}
                      className="w-full bg-white border border-border-dark rounded-md px-4 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">End Date</label>
                    <input 
                      type="text" 
                      placeholder="e.g. May 2024"
                      value={selectedEdu.end_date || ""}
                      onChange={(e) => handleUpdateSelected("end_date", e.target.value)}
                      className="w-full bg-white border border-border-dark rounded-md px-4 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-text-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">GPA</label>
                    <input 
                      type="text" 
                      value={selectedEdu.gpa || ""}
                      onChange={(e) => handleUpdateSelected("gpa", e.target.value)}
                      className="w-full bg-white border border-border-dark rounded-md px-4 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Location</label>
                    <input 
                      type="text" 
                      value={selectedEdu.location || ""}
                      onChange={(e) => handleUpdateSelected("location", e.target.value)}
                      className="w-full bg-white border border-border-dark rounded-md px-4 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-text-primary"
                    />
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-text-muted">
                Select an education entry or add a new one.
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
