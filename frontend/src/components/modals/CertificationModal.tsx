import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";

interface Certification {
  name: string;
  issuer?: string;
  date?: string;
  url?: string;
}

interface CertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  initialCertifications: Certification[];
  onSave: (certifications: Certification[]) => void;
}

export default function CertificationModal({ isOpen, onClose, initialCertifications, onSave }: CertificationModalProps) {
  const [certifications, setCertifications] = useState<Certification[]>([]);

  useEffect(() => {
    if (isOpen) {
      setCertifications(initialCertifications.length ? [...initialCertifications] : []);
    }
  }, [isOpen, initialCertifications]);

  if (!isOpen) return null;

  const handleChange = (index: number, field: keyof Certification, value: string) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };

  const addCertification = () => {
    setCertifications([...certifications, { name: "", issuer: "", date: "", url: "" }]);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const valid = certifications.filter(c => c.name.trim() !== "");
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
          <h2 className="text-xl font-serif font-medium text-ink">Edit Certifications</h2>
          <button onClick={onClose} className="text-ink-3 hover:text-ink"><X className="w-6 h-6" /></button>
        </div>
        
        <div className="relative flex-1 overflow-y-auto p-6 space-y-8">
          {certifications.length === 0 && (
            <p className="text-sm text-ink-3 text-center py-8">No certifications added. Click below to add one.</p>
          )}

          {certifications.map((cert, idx) => (
            <div key={idx} className="bg-white/90 backdrop-blur-sm p-5 rounded-md border border-rule-med shadow-sm relative group">
              <button 
                onClick={() => removeCertification(idx)}
                className="absolute top-4 right-4 text-ink-3 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-1">Certification Name</label>
                  <input 
                    type="text" 
                    value={cert.name} 
                    onChange={(e) => handleChange(idx, "name", e.target.value)}
                    className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:border-accent outline-none"
                    placeholder="e.g. AWS Certified Solutions Architect"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-1">Issuer</label>
                    <input 
                      type="text" 
                      value={cert.issuer || ""} 
                      onChange={(e) => handleChange(idx, "issuer", e.target.value)}
                      className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:border-accent outline-none"
                      placeholder="e.g. Amazon Web Services"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-1">Date</label>
                    <input 
                      type="text" 
                      value={cert.date || ""} 
                      onChange={(e) => handleChange(idx, "date", e.target.value)}
                      className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:border-accent outline-none"
                      placeholder="e.g. 2023"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-1">Credential URL</label>
                  <input 
                    type="text" 
                    value={cert.url || ""} 
                    onChange={(e) => handleChange(idx, "url", e.target.value)}
                    className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:border-accent outline-none"
                    placeholder="e.g. https://credly.com/..."
                  />
                </div>
              </div>
            </div>
          ))}

          <button 
            onClick={addCertification}
            className="w-full py-4 border-2 border-dashed border-rule-med rounded-md text-ink-3 hover:text-ink hover:border-accent hover:bg-white transition-colors flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" /> Add Certification
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