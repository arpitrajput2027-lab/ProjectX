"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, UploadCloud, ChevronRight, GitBranch, Code, Target, MapPin, Briefcase } from "lucide-react";

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);

  // Form Data - Step 1
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  
  // Form Data - Step 2 (Preferences)
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [workPreference, setWorkPreference] = useState("Remote");
  const [location, setLocation] = useState("");

  // Form Data - Step 3 (Uploads & Extracted Data)
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeParsing, setResumeParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  // Form Data - Step 4 (Verification)
  const [githubUsername, setGithubUsername] = useState("");
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [githubConnected, setGithubConnected] = useState(false);
  const [leetcodeConnected, setLeetcodeConnected] = useState(false);
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || "");
      } else {
        router.push("/auth/login");
      }
    };
    fetchUser();
  }, [router]);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setResumeParsing(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Call the backend extraction API
      const response = await fetch("http://localhost:8000/api/resumes/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to parse resume");
      }

      const result = await response.json();
      setParsedData(result.data);
      setResumeUploaded(true);
      
      // Auto-fill some fields if possible
      if (result.data.education && result.data.education.length > 0 && !location) {
          setLocation(result.data.education[0].location || "");
      }
      
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error parsing resume. Please try again.");
    } finally {
      setResumeParsing(false);
    }
  };

  const handleFinishSetup = async () => {
    if (!userId) return;
    setSaving(true);
    
    // 1. Ensure user exists
    const { error: userError } = await supabase.from('users').upsert({
      id: userId,
      email: userEmail,
      role: 'student'
    }, { onConflict: 'id' });

    if (userError) {
      console.error("Error creating user:", userError);
      alert("Failed to initialize user record.");
      setSaving(false);
      return;
    }

    // 2. Save everything to student_profiles
    const profilePayload = {
      user_id: userId,
      full_name: fullName,
      phone: phone,
      target_role: targetRole,
      work_preference: workPreference,
      location: location,
      github_username: githubUsername,
      leetcode_username: leetcodeUsername,
      onboarding_completed: true,
      education: parsedData?.education || [],
      experience: parsedData?.experience || [],
      projects: parsedData?.projects || [],
      skills: parsedData?.skills || [],
      achievements: parsedData?.achievements || [],
      certifications: parsedData?.certifications || []
    };

    const { error } = await supabase.from('student_profiles').upsert(profilePayload, { onConflict: 'user_id' });

    if (error) {
      console.error("Error saving profile:", error.message || error);
      alert("Failed to save profile: " + (error.message || "Unknown error"));
      setSaving(false);
      return;
    }

    router.push("/profile");
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    else handleFinishSetup();
  };
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  return (
    <div className="min-h-screen bg-cream text-ink font-body flex flex-col" suppressHydrationWarning>
      <header className="flex justify-between items-center px-10 py-5 border-b border-rule-lt bg-cream/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-ink text-cream rounded-[2px] flex items-center justify-center font-serif font-bold text-[10px]">RI</div>
          <span className="font-mono text-[10px] tracking-widest text-ink uppercase font-semibold">ReadyIndex</span>
        </div>
        <div className="text-xs text-ink-3 font-mono">{userEmail}</div>
      </header>

      <main className="max-w-4xl mx-auto w-full mt-12 px-6 pb-24">
        <div className="bg-white border border-rule-lt rounded-xl shadow-sm overflow-hidden">
          
          {/* Progress Header */}
          <div className="pt-8 px-10">
            <div className="flex justify-between items-center mb-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Step {currentStep} of {totalSteps}</span>
              {currentStep > 1 && (
                <button onClick={prevStep} disabled={resumeParsing} className="font-mono text-[10px] uppercase text-ink-3 hover:text-accent transition-colors disabled:opacity-50">Go Back</button>
              )}
            </div>
            <div className="h-1 bg-cream-3 mb-8 w-full rounded-full overflow-hidden">
              <div className="h-full bg-accent transition-all duration-500 ease-out" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
            </div>
          </div>

          <div className="p-10 pt-4">
            
            {/* STEP 1: Basic Info */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span> Basic Information
                </div>
                <h1 className="font-serif text-4xl mb-4 text-ink">Welcome aboard.</h1>
                <p className="text-sm text-ink-3 mb-10 leading-relaxed max-w-lg">Let&apos;s start with the basics. This forms the foundation of your ReadyIndex identity.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Full Name</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Arpit Rajput" 
                      className="w-full bg-[#f7f3ec] border border-rule-lt rounded-md p-3 text-sm focus:outline-none focus:border-accent focus:bg-white transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Phone Number</label>
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 00000 00000" 
                      className="w-full bg-[#f7f3ec] border border-rule-lt rounded-md p-3 text-sm focus:outline-none focus:border-accent focus:bg-white transition-colors" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Career Preferences */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span> Career Goals
                </div>
                <h1 className="font-serif text-4xl mb-4 text-ink">What are you looking for?</h1>
                <p className="text-sm text-ink-3 mb-10 leading-relaxed max-w-lg">Recruiters use these preferences to filter the talent pool. Be specific to get relevant matches.</p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-2 flex items-center gap-2"><Target className="w-3 h-3"/> Target Role</label>
                    <input 
                      type="text" 
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Frontend Engineer, SDE-1, Data Scientist" 
                      className="w-full bg-[#f7f3ec] border border-rule-lt rounded-md p-3 text-sm focus:outline-none focus:border-accent focus:bg-white transition-colors" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-2 flex items-center gap-2"><Briefcase className="w-3 h-3"/> Work Mode</label>
                      <select 
                        value={workPreference} 
                        onChange={(e) => setWorkPreference(e.target.value)}
                        className="w-full bg-[#f7f3ec] border border-rule-lt rounded-md p-3 text-sm focus:outline-none focus:border-accent focus:bg-white transition-colors appearance-none"
                      >
                        <option value="Remote">Remote</option>
                        <option value="Office">Office / On-site</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-2 flex items-center gap-2"><MapPin className="w-3 h-3"/> Preferred Location</label>
                      <input 
                        type="text" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Bangalore, Remote, London" 
                        className="w-full bg-[#f7f3ec] border border-rule-lt rounded-md p-3 text-sm focus:outline-none focus:border-accent focus:bg-white transition-colors" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Resume Upload */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span> AI Extraction
                </div>
                <h1 className="font-serif text-4xl mb-4 text-ink">Upload your resume</h1>
                <p className="text-sm text-ink-3 mb-10 leading-relaxed max-w-lg">Our AI will extract your experience, projects, skills, and achievements to automatically build your profile.</p>
                
                <div className="mb-6 relative">
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={resumeParsing || resumeUploaded}
                  />
                  <div className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all ${
                    resumeUploaded ? 'border-green-500 bg-green-50' : 
                    resumeParsing ? 'border-accent bg-accent/5 scale-[1.02]' : 
                    'border-rule-med hover:border-accent bg-[#f7f3ec]'
                  }`}>
                    
                    {resumeParsing ? (
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
                        <div className="font-serif text-lg text-ink">AI is analyzing your resume...</div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-muted mt-2">Extracting skills, projects, and history</div>
                      </div>
                    ) : resumeUploaded ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                        <div className="font-serif text-lg text-ink">Resume Parsed Successfully!</div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-muted mt-2">
                          Found {parsedData?.skills?.length || 0} skill categories and {parsedData?.experience?.length || 0} roles
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <UploadCloud className="w-10 h-10 text-ink-3 mb-4" />
                        <div className="font-serif text-lg text-ink">Drop your PDF resume here</div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-muted mt-2">Maximum file size: 5MB</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Verification */}
            {currentStep === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span> Proof of Work
                </div>
                <h1 className="font-serif text-4xl mb-4 text-ink">Verify your skills</h1>
                <p className="text-sm text-ink-3 mb-10 leading-relaxed max-w-lg">ReadyIndex ranks you based on verified code. Connect your public platforms.</p>
                
                <div className="space-y-4">
                  {/* GitHub */}
                  <div className={`border rounded-lg p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between transition-colors ${githubConnected ? 'border-green-500 bg-green-50' : 'border-rule-lt bg-[#f7f3ec]'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-full border border-rule-lt flex items-center justify-center">
                        <GitBranch className="w-5 h-5 text-ink" />
                      </div>
                      <div>
                        <div className="font-serif text-lg text-ink">GitHub</div>
                        <div className="font-mono text-[10px] text-muted mt-1 uppercase tracking-widest">Commits, Repos, Languages</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!githubConnected && (
                        <input 
                          type="text" 
                          value={githubUsername}
                          onChange={(e) => setGithubUsername(e.target.value)}
                          placeholder="Username" 
                          className="bg-white border border-rule-lt rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent" 
                        />
                      )}
                      <button 
                        onClick={() => { if(githubUsername) setGithubConnected(true); else alert("Enter username"); }}
                        disabled={githubConnected}
                        className="bg-ink text-cream px-4 py-2 rounded-md font-mono text-[10px] uppercase tracking-widest disabled:opacity-50 hover:bg-accent transition-colors whitespace-nowrap"
                      >
                        {githubConnected ? 'Linked ✓' : 'Connect'}
                      </button>
                    </div>
                  </div>

                  {/* LeetCode */}
                  <div className={`border rounded-lg p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between transition-colors ${leetcodeConnected ? 'border-green-500 bg-green-50' : 'border-rule-lt bg-[#f7f3ec]'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-full border border-rule-lt flex items-center justify-center">
                        <Code className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-serif text-lg text-ink">LeetCode</div>
                        <div className="font-mono text-[10px] text-muted mt-1 uppercase tracking-widest">Problem Solving, Consistency</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!leetcodeConnected && (
                        <input 
                          type="text" 
                          value={leetcodeUsername}
                          onChange={(e) => setLeetcodeUsername(e.target.value)}
                          placeholder="Username" 
                          className="bg-white border border-rule-lt rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent" 
                        />
                      )}
                      <button 
                        onClick={() => { if(leetcodeUsername) setLeetcodeConnected(true); else alert("Enter username"); }}
                        disabled={leetcodeConnected}
                        className="bg-ink text-cream px-4 py-2 rounded-md font-mono text-[10px] uppercase tracking-widest disabled:opacity-50 hover:bg-accent transition-colors whitespace-nowrap"
                      >
                        {leetcodeConnected ? 'Linked ✓' : 'Connect'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Review */}
            {currentStep === 5 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span> Final Review
                </div>
                <h1 className="font-serif text-4xl mb-4 text-ink">All set to go public.</h1>
                <p className="text-sm text-ink-3 mb-10 leading-relaxed max-w-lg">Here is a quick summary of your generated profile. You can edit all details later.</p>
                
                <div className="bg-[#f7f3ec] border border-rule-lt rounded-xl p-8">
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">Name</div>
                      <div className="font-medium text-ink">{fullName || "Not provided"}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">Target Role</div>
                      <div className="font-medium text-ink">{targetRole}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">Location</div>
                      <div className="font-medium text-ink">{location || "Not provided"}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">AI Extracted Data</div>
                      <div className="font-medium text-accent">
                        {parsedData ? `${parsedData.experience?.length || 0} Exp, ${parsedData.projects?.length || 0} Proj` : "None"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-12 pt-6 border-t border-rule-lt flex justify-between items-center">
              <span className="font-mono text-[10px] text-muted hidden sm:block">Press Enter to continue</span>
              <button 
                onClick={nextStep}
                disabled={saving || resumeParsing}
                className="ml-auto bg-ink text-cream font-mono text-[10px] uppercase tracking-widest px-8 py-3.5 rounded-[4px] hover:bg-accent transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? 'Saving...' : currentStep === totalSteps ? 'Complete Profile' : 'Continue'} 
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
