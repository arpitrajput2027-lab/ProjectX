"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Building, UserCircle } from "lucide-react";

export function RecruiterOnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;
  const router = useRouter();
  
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);

  // Form Data - Step 1: Company Info
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  
  // Form Data - Step 2: Recruiter Info
  const [fullName, setFullName] = useState("");
  const [designation, setDesignation] = useState("");
  const [phone, setPhone] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || "");
        
        // Populate full name if it exists in metadata
        if (session.user.user_metadata?.first_name) {
          setFullName(`${session.user.user_metadata.first_name} ${session.user.user_metadata.last_name || ''}`.trim());
        }
      } else {
        router.push("/auth/login");
      }
    };
    fetchUser();
  }, [router]);

  const handleFinishSetup = async () => {
    if (!userId) return;
    setSaving(true);
    
    try {
      // 1. Ensure user exists as recruiter
      const { error: userError } = await supabase.from('users').upsert({
        id: userId,
        email: userEmail,
        role: 'recruiter'
      }, { onConflict: 'id' });

      if (userError) throw userError;

      // 2. Create Company Profile
      // Check if company already exists (simplified logic, you might want a dropdown in a real app)
      let companyId;
      const { data: existingCompany } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('name', companyName)
        .maybeSingle();
        
      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        const { data: newCompany, error: companyError } = await supabase
          .from('company_profiles')
          .insert({
            name: companyName,
            industry,
            website,
          })
          .select()
          .single();
          
        if (companyError) throw companyError;
        companyId = newCompany.id;
      }

      // 3. Create Recruiter Profile
      const { error: recruiterError } = await supabase.from('recruiter_profiles').upsert({
        user_id: userId,
        company_id: companyId,
        full_name: fullName,
        designation,
        phone,
      }, { onConflict: 'user_id' });

      if (recruiterError) throw recruiterError;

      router.push("/recruiter-dashboard");
    } catch (error: any) {
      console.error("Error setting up profile:", error);
      alert("Failed to save profile: " + (error.message || "Unknown error"));
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    else handleFinishSetup();
  };
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  return (
    <div className="min-h-screen bg-cream text-ink font-body flex flex-col" suppressHydrationWarning>
      <header className="flex justify-between items-center px-10 py-5 border-b border-rule-lt bg-cream/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="absolute top-6 left-6 flex items-center">
          <img src="/katalyst-hire-horizontal.png" alt="Katalyst Hire" style={{ width: '150px', height: 'auto' }} className="object-contain border border-black rounded-[5%]" />
        </div>
        <div className="text-xs text-ink-3 font-mono">{userEmail}</div>
      </header>

      <main className="max-w-3xl mx-auto w-full mt-12 px-6 pb-24">
        <div className="bg-white border border-rule-lt rounded-xl shadow-sm overflow-hidden">
          
          {/* Progress Header */}
          <div className="pt-8 px-10">
            <div className="flex justify-between items-center mb-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Step {currentStep} of {totalSteps}</span>
              {currentStep > 1 && (
                <button onClick={prevStep} className="font-mono text-[10px] uppercase text-ink-3 hover:text-accent transition-colors disabled:opacity-50">Go Back</button>
              )}
            </div>
            <div className="h-1 bg-cream-3 mb-8 w-full rounded-full overflow-hidden">
              <div className="h-full bg-accent transition-all duration-500 ease-out" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
            </div>
          </div>

          <div className="p-10 pt-4">
            
            {/* STEP 1: Company Info */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3 flex items-center gap-2">
                  <Building className="w-3 h-3" /> Company Profile
                </div>
                <h1 className="font-serif text-4xl mb-4 text-ink">Set up your company.</h1>
                <p className="text-sm text-ink-3 mb-10 leading-relaxed max-w-lg">Tell us about your organization to help candidates understand who they are applying to.</p>
                
                <div className="space-y-6 mb-10">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Company Name</label>
                    <input 
                      type="text" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Corp" 
                      className="w-full bg-[#f7f3ec] border border-rule-lt rounded-md p-3 text-sm focus:outline-none focus:border-accent focus:bg-white transition-colors" 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Industry</label>
                      <input 
                        type="text" 
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="e.g. Software, Finance" 
                        className="w-full bg-[#f7f3ec] border border-rule-lt rounded-md p-3 text-sm focus:outline-none focus:border-accent focus:bg-white transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Website</label>
                      <input 
                        type="url" 
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://example.com" 
                        className="w-full bg-[#f7f3ec] border border-rule-lt rounded-md p-3 text-sm focus:outline-none focus:border-accent focus:bg-white transition-colors" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Recruiter Info */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3 flex items-center gap-2">
                  <UserCircle className="w-3 h-3" /> Your Profile
                </div>
                <h1 className="font-serif text-4xl mb-4 text-ink">About you.</h1>
                <p className="text-sm text-ink-3 mb-10 leading-relaxed max-w-lg">Let candidates know who they&apos;ll be speaking with.</p>
                
                <div className="space-y-6 mb-10">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Full Name</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe" 
                      className="w-full bg-[#f7f3ec] border border-rule-lt rounded-md p-3 text-sm focus:outline-none focus:border-accent focus:bg-white transition-colors" 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Designation / Title</label>
                      <input 
                        type="text" 
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Senior Technical Recruiter" 
                        className="w-full bg-[#f7f3ec] border border-rule-lt rounded-md p-3 text-sm focus:outline-none focus:border-accent focus:bg-white transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Phone Number (Optional)</label>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 234 567 8900" 
                        className="w-full bg-[#f7f3ec] border border-rule-lt rounded-md p-3 text-sm focus:outline-none focus:border-accent focus:bg-white transition-colors" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="pt-6 border-t border-rule-lt flex justify-end">
              <button 
                onClick={nextStep}
                disabled={saving || (currentStep === 1 && (!companyName || !industry))}
                className="bg-ink text-cream px-6 py-3 rounded-md font-mono text-[11px] uppercase tracking-widest hover:bg-accent transition-colors flex items-center gap-2 disabled:opacity-50 disabled:hover:bg-ink"
              >
                <span>{currentStep === totalSteps ? (saving ? "Finishing..." : "Complete Setup") : "Continue"}</span>
                {currentStep < totalSteps && <ArrowRight className="w-3 h-3" />}
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
