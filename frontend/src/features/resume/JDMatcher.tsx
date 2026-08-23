"use client";

import React, { useState, useEffect } from "react";
import { 
  Briefcase, Target, CheckCircle, XCircle, AlertTriangle, 
  Zap, ArrowRight, RefreshCw, Sparkles, FileText, 
  TrendingUp, Award, Building, Loader2, Check, ChevronLeft, Info
} from "lucide-react";

interface JDMatcherProps {
  profileData: any;
  onApplyCustomization: (customizedProfile: any) => void;
  onSwitchToATS: () => void;
  onBackToEditor?: () => void;
}

interface MatchAnalysis {
  overall_match_score?: number;
  match_score?: number;
  readiness_score?: number;
  matched_skills?: string[];
  missing_skills?: Array<{ skill: string; importance: string } | string>;
  skills_analysis?: {
    matched_skills?: string[];
    missing_skills?: Array<{ skill: string; importance: string } | string>;
  };
  keyword_matches?: Array<{
    keyword: string;
    found: boolean;
    context?: string;
  }>;
  keyword_analysis?: Array<{
    keyword: string;
    found: boolean;
    context?: string;
  }>;
  experience_alignment?: string;
  strengths?: string[];
  gaps?: string[];
  recommendations?: string[];
}

interface CustomizationResult {
  customized_resume?: any;
  customized_profile?: any;
  changes_made?: Array<{
    section: string;
    change_type: string;
    description: string;
  }>;
  warnings?: string[];
}

export function JDMatcher({ profileData, onApplyCustomization, onSwitchToATS, onBackToEditor }: JDMatcherProps) {
  // Phase state: 1 = Input, 2 = Results, 3 = Customization
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  
  // Input Phase State
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jdText, setJdText] = useState("");
  
  // Loading & Error states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Result States
  const [matchAnalysis, setMatchAnalysis] = useState<MatchAnalysis | null>(null);
  const [customizationResult, setCustomizationResult] = useState<CustomizationResult | null>(null);

  const handleAnalyze = async () => {
    if (jdText.length < 50) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/ats/match-jd`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_data: profileData,
          job_description: jdText,
          job_title: jobTitle,
          company: company
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze job match");
      }

      const data = await response.json();
      setMatchAnalysis(data);
      setPhase(2);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCustomize = async () => {
    setIsCustomizing(true);
    setError(null);
    setPhase(3);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/ats/customize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_data: profileData,
          job_description: jdText,
          match_analysis: matchAnalysis
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to customize resume");
      }

      const data = await response.json();
      setCustomizationResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during customization.");
    } finally {
      setIsCustomizing(false);
    }
  };

  const handleApply = () => {
    if (customizationResult) {
      const updatedProfile = customizationResult.customized_resume || customizationResult.customized_profile;
      if (updatedProfile) {
        onApplyCustomization(updatedProfile);
      }
    }
  };

  // Helper values extracted safely from matchAnalysis
  const matchScore = matchAnalysis?.overall_match_score ?? matchAnalysis?.match_score ?? 0;
  const readinessScore = matchAnalysis?.readiness_score ?? 0;
  const matchedSkills: string[] = matchAnalysis?.matched_skills || matchAnalysis?.skills_analysis?.matched_skills || [];
  const rawMissingSkills = matchAnalysis?.missing_skills || matchAnalysis?.skills_analysis?.missing_skills || [];
  const missingSkills = rawMissingSkills.map((item) => {
    if (typeof item === "string") {
      return { skill: item, importance: "Medium" };
    }
    return { skill: item.skill || "", importance: item.importance || "Medium" };
  });
  const keywordMatches = matchAnalysis?.keyword_matches || matchAnalysis?.keyword_analysis || [];
  const strengths = matchAnalysis?.strengths || [];
  const gaps = matchAnalysis?.gaps || [];
  const recommendations = matchAnalysis?.recommendations || [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* PHASE 1: INPUT FORM */}
      {phase === 1 && (
        <div className="space-y-6">
          <div className="bg-white border border-rule rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-accent-lt rounded-lg text-accent">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-ink">Match Resume to Job Description</h2>
                <p className="text-sm text-muted">Paste any target Job Description below to evaluate your match score, readiness, and skill gaps.</p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Job Title (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. Senior Frontend Developer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-cream border border-rule rounded-lg text-sm text-ink outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Company Name (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-2 bg-cream border border-rule rounded-lg text-sm text-ink outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted">Job Description Text *</label>
                <span className={`text-xs ${jdText.length >= 50 ? 'text-success' : 'text-muted'}`}>
                  {jdText.length} / 50 characters min
                </span>
              </div>
              <textarea 
                rows={8}
                placeholder="Paste the full job description text here including requirements, skills, responsibilities..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="w-full p-4 bg-cream border border-rule rounded-xl font-mono text-sm text-ink outline-none focus:border-accent resize-y"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || jdText.length < 50}
              className={`w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center space-x-2 transition-all ${
                jdText.length >= 50 && !isAnalyzing
                  ? "bg-ink text-cream hover:bg-accent shadow-md cursor-pointer"
                  : "bg-cream-3 text-muted cursor-not-allowed border border-rule"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Analyzing Match with AI...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Analyze Job Match & Readiness</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: RESULTS DASHBOARD */}
      {phase === 2 && matchAnalysis && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <button 
                onClick={onBackToEditor || (() => setPhase(1))}
                className="p-2 rounded-lg bg-cream border border-rule text-ink hover:bg-cream-3 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-serif text-ink">Match Analysis Results</h2>
                {jobTitle && <p className="text-sm text-muted">{jobTitle} {company ? `at ${company}` : ''}</p>}
              </div>
            </div>
            <button
              onClick={() => setPhase(1)}
              className="text-sm text-accent hover:underline flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              New Analysis
            </button>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScoreRing 
              score={matchScore} 
              label="Job Match Score" 
              subtext="How well your resume aligns with the job requirements overall."
            />
            <ScoreRing 
              score={readinessScore} 
              label="Readiness Score" 
              subtext="Your level of qualification and preparedness for this specific role."
            />
          </div>

          {/* Experience Alignment */}
          {matchAnalysis.experience_alignment && (
            <div className="bg-white border border-rule rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-ink flex items-center mb-4">
                <Briefcase className="w-5 h-5 mr-2 text-accent" />
                Experience Alignment
              </h3>
              <div className="flex items-start bg-cream-3/50 p-4 rounded-lg border border-rule-med">
                <Info className="w-5 h-5 mr-3 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-ink-2 text-sm leading-relaxed">{matchAnalysis.experience_alignment}</p>
              </div>
            </div>
          )}

          {/* Skills Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-rule rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="bg-success/10 border-b border-success/20 px-4 py-3 flex items-center">
                <CheckCircle className="w-5 h-5 text-success mr-2" />
                <h3 className="font-medium text-success-800">Matched Skills ({matchedSkills.length})</h3>
              </div>
              <div className="p-4 flex-1 flex flex-wrap gap-2 content-start">
                {matchedSkills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-success-lt text-success border border-success/20 rounded-full text-xs font-medium">
                    {skill}
                  </span>
                ))}
                {matchedSkills.length === 0 && (
                  <p className="text-sm text-muted w-full text-center py-4">No exact skill matches found.</p>
                )}
              </div>
            </div>

            <div className="bg-white border border-rule rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="bg-red-50 border-b border-red-100 px-4 py-3 flex items-center">
                <XCircle className="w-5 h-5 text-red-500 mr-2" />
                <h3 className="font-medium text-red-700">Missing Skills ({missingSkills.length})</h3>
              </div>
              <div className="p-4 flex-1 flex flex-col gap-2">
                {missingSkills.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-cream p-2 rounded-lg border border-rule">
                    <span className="text-sm font-medium text-ink-2">{item.skill}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider
                      ${String(item.importance).toLowerCase() === 'high' ? 'bg-red-100 text-red-700 border border-red-200' : 
                        String(item.importance).toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                        'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                      {item.importance}
                    </span>
                  </div>
                ))}
                {missingSkills.length === 0 && (
                  <p className="text-sm text-muted w-full text-center py-4">No critical skills missing!</p>
                )}
              </div>
            </div>
          </div>

          {/* Keyword Analysis Table */}
          {keywordMatches.length > 0 && (
            <div className="bg-white border border-rule rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-rule">
                <h3 className="font-semibold text-ink flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-accent" />
                  Keyword Matrix
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-cream text-muted text-xs uppercase bg-rule/5">
                    <tr>
                      <th className="px-6 py-3 font-medium">Keyword</th>
                      <th className="px-6 py-3 font-medium text-center">Status</th>
                      <th className="px-6 py-3 font-medium">Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule">
                    {keywordMatches.map((kw, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-cream-3/30"}>
                        <td className="px-6 py-4 font-medium text-ink-2">{kw.keyword}</td>
                        <td className="px-6 py-4 text-center">
                          {kw.found ? (
                            <Check className="w-5 h-5 text-success inline-block" />
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-muted text-xs">{kw.context || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Strengths & Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {strengths.length > 0 && (
              <div className="bg-white border border-rule rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-ink flex items-center mb-4">
                  <TrendingUp className="w-5 h-5 mr-2 text-success" />
                  Key Strengths
                </h3>
                <ul className="space-y-3">
                  {strengths.map((strength, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-ink-2">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {gaps.length > 0 && (
              <div className="bg-white border border-rule rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-ink flex items-center mb-4">
                  <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
                  Notable Gaps
                </h3>
                <ul className="space-y-3">
                  {gaps.map((gap, i) => (
                    <li key={i} className="flex items-start">
                      <XCircle className="w-4 h-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-ink-2">{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-white border border-rule rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-ink flex items-center mb-4">
                <Zap className="w-5 h-5 mr-2 text-accent" />
                Recommendations to Improve Match
              </h3>
              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-lg bg-cream border border-rule-med">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent-lt text-accent text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm text-ink-2 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA to customize */}
          <div className="bg-cream-3 border border-accent/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between shadow-sm relative overflow-hidden">
            <div className="space-y-1 mb-4 md:mb-0">
              <h3 className="font-semibold text-ink flex items-center text-lg">
                <Sparkles className="w-5 h-5 text-accent mr-2" />
                Customize Resume for This Job
              </h3>
              <p className="text-sm text-muted">Automatically re-order skills and emphasize relevant experience for this specific JD.</p>
            </div>
            <button
              onClick={handleCustomize}
              className="bg-accent text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-accent/90 transition-colors shadow-md flex items-center space-x-2"
            >
              <span>Customize Resume Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* PHASE 3: CUSTOMIZATION PREVIEW */}
      {phase === 3 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setPhase(2)}
                className="p-2 rounded-lg bg-cream border border-rule text-ink hover:bg-cream-3 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-serif text-ink">Job-Specific Resume Customization</h2>
            </div>
          </div>

          {isCustomizing ? (
            <div className="bg-white border border-rule rounded-xl p-12 text-center space-y-4 shadow-sm">
              <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto" />
              <h3 className="text-lg font-medium text-ink">Optimizing Resume with AI...</h3>
              <p className="text-sm text-muted max-w-md mx-auto">Re-ordering technical skills and re-phrasing descriptions to emphasize JD requirements truthfully.</p>
            </div>
          ) : customizationResult ? (
            <div className="space-y-6">
              {/* Changes list */}
              <div className="bg-white border border-rule rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="font-semibold text-ink flex items-center text-lg">
                  <CheckCircle className="w-5 h-5 text-success mr-2" />
                  Optimizations Applied
                </h3>
                <div className="space-y-3">
                  {customizationResult.changes_made?.map((change, idx) => (
                    <div key={idx} className="p-4 bg-cream rounded-lg border border-rule flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold uppercase bg-accent-lt text-accent mr-2">
                          {change.section}
                        </span>
                        <span className="text-xs font-medium text-muted uppercase tracking-wider mr-3">
                          {change.change_type}
                        </span>
                        <p className="text-sm text-ink-2 mt-1">{change.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warnings if any */}
              {customizationResult.warnings && customizationResult.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800 space-y-2">
                  <h4 className="font-semibold flex items-center text-amber-900">
                    <AlertTriangle className="w-5 h-5 mr-2 text-amber-600" />
                    Truthfulness Guard Notes
                  </h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {customizationResult.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-rule">
                <button
                  onClick={handleApply}
                  className="bg-success text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-success/90 transition-colors shadow-md flex items-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Changes to Resume</span>
                </button>
                <button
                  onClick={() => {
                    handleApply();
                    onSwitchToATS();
                  }}
                  className="bg-ink text-cream px-6 py-3 rounded-lg font-medium text-sm hover:bg-accent transition-colors shadow-md flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Apply & Run ATS Check</span>
                </button>
                <button
                  onClick={() => setPhase(2)}
                  className="px-6 py-3 rounded-lg font-medium text-sm border border-rule text-ink hover:bg-cream-3 transition-colors"
                >
                  Discard Changes
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// Sub-component for Score Ring
function ScoreRing({ score, label, subtext }: { score: number; label: string; subtext: string }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = "text-red-500";
  if (score >= 90) colorClass = "text-emerald-600";
  else if (score >= 70) colorClass = "text-success";
  else if (score >= 40) colorClass = "text-amber-500";

  return (
    <div className="bg-white border border-rule rounded-xl p-6 shadow-sm flex items-center space-x-6">
      <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle 
            cx="48" cy="48" r={radius} 
            className="text-cream-3" 
            strokeWidth="8" 
            stroke="currentColor" 
            fill="transparent" 
          />
          <circle 
            cx="48" cy="48" r={radius} 
            className={`${colorClass} transition-all duration-1000 ease-out`} 
            strokeWidth="8" 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor" 
            fill="transparent" 
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-ink">{score}</span>
          <span className="text-[10px] text-muted font-semibold">%</span>
        </div>
      </div>
      <div>
        <h3 className="font-serif text-lg text-ink font-semibold">{label}</h3>
        <p className="text-xs text-muted leading-relaxed mt-1">{subtext}</p>
      </div>
    </div>
  );
}
