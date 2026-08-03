"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  FileText,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface ATSCheckerProps {
  profileData: any;
  onNavigateToSection?: (section: string) => void;
}

type DimensionScore = {
  score: number;
  feedback: string;
};

type SectionRecommendation = {
  section: string;
  issues: string[];
  suggestions: string[];
};

type ATSResponse = {
  overall_score: number;
  dimension_scores: Record<string, DimensionScore>;
  missing_keywords: string[];
  section_recommendations: SectionRecommendation[];
  strengths: string[];
  weaknesses: string[];
  improvement_tips: string[];
};

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-emerald-600";
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
};

const getScoreBg = (score: number) => {
  if (score >= 90) return "bg-emerald-600";
  if (score >= 70) return "bg-success";
  if (score >= 40) return "bg-amber-600";
  return "bg-red-600";
};

export function ATSChecker({ profileData, onNavigateToSection }: ATSCheckerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ATSResponse | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(0);

  const analyzeResume = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setProgress(0);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/ats/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resume_data: profileData }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze resume");
      }

      const data = await response.json();
      
      // Normalize dimension_scores if returned as array or object
      let normalizedDimensions: Record<string, DimensionScore> = {};
      if (Array.isArray(data.dimension_scores)) {
        data.dimension_scores.forEach((item: any) => {
          if (item && item.dimension) {
            normalizedDimensions[item.dimension] = {
              score: item.score || 0,
              feedback: item.feedback || "",
            };
          }
        });
      } else if (data.dimension_scores && typeof data.dimension_scores === "object") {
        normalizedDimensions = data.dimension_scores;
      }

      const finalData: ATSResponse = {
        overall_score: data.overall_score || 0,
        dimension_scores: normalizedDimensions,
        missing_keywords: data.missing_keywords || [],
        section_recommendations: data.section_recommendations || [],
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        improvement_tips: data.improvement_tips || [],
      };
      
      setResults(finalData);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while analyzing the resume.");
      
      // For development, provide mock data if API fails
      if (process.env.NODE_ENV === 'development') {
         setResults({
            overall_score: 72,
            dimension_scores: {
              Impact: { score: 65, feedback: "Use more action verbs and quantify achievements." },
              Brevity: { score: 80, feedback: "Good length, avoiding unnecessary filler words." },
              Style: { score: 85, feedback: "Consistent formatting and styling throughout." },
              Structure: { score: 70, feedback: "Ensure sections are clearly defined." },
            },
            missing_keywords: ["React", "TypeScript", "Agile", "REST API"],
            section_recommendations: [
              {
                section: "Experience",
                issues: ["Missing quantifiable results in bullet points."],
                suggestions: ["Add metrics (e.g., 'increased sales by 20%')."]
              }
            ],
            strengths: ["Strong educational background.", "Good project descriptions."],
            weaknesses: ["Lacking specific technical keywords.", "Experience bullet points are too brief."],
            improvement_tips: ["Quantify your impact.", "Tailor keywords to the job description."]
         });
         setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (results && progress < results.overall_score) {
      const timer = setTimeout(() => setProgress(prev => Math.min(prev + 2, results.overall_score)), 20);
      return () => clearTimeout(timer);
    }
  }, [results, progress]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 space-y-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-accent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-6 h-6 text-ink-3" />
          </div>
        </div>
        <h3 className="text-xl font-serif text-ink font-medium">Analyzing your resume with AI...</h3>
        <div className="w-full max-w-md space-y-3">
          <div className="h-2 bg-rule rounded-full overflow-hidden">
            <div className="h-full bg-accent animate-pulse w-3/4 rounded-full"></div>
          </div>
          <div className="h-2 bg-rule rounded-full overflow-hidden">
            <div className="h-full bg-accent animate-pulse w-1/2 rounded-full delay-75"></div>
          </div>
          <div className="h-2 bg-rule rounded-full overflow-hidden">
            <div className="h-full bg-accent animate-pulse w-5/6 rounded-full delay-150"></div>
          </div>
        </div>
        <p className="text-muted text-sm mt-4 text-center">
          Checking for keywords, structure, impact, and ATS compatibility.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-2" />
        <h3 className="text-xl font-serif text-ink font-medium">Analysis Failed</h3>
        <p className="text-muted text-center max-w-md">{error}</p>
        <button
          onClick={analyzeResume}
          className="mt-6 px-6 py-2 bg-ink text-cream hover:bg-accent rounded-lg transition-colors font-medium flex items-center gap-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-10 text-center space-y-6">
        <div className="w-24 h-24 bg-cream-3 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <Shield className="w-12 h-12 text-accent" />
        </div>
        <h2 className="text-3xl font-serif text-ink mb-2">Check how ATS-friendly your resume is</h2>
        <p className="text-muted max-w-lg mb-8 leading-relaxed">
          Our AI-powered analyzer scores your resume against common Applicant Tracking Systems (ATS). 
          It checks for readability, keywords, formatting issues, and provides actionable feedback to help you land the interview.
        </p>
        <button
          onClick={analyzeResume}
          className="px-8 py-3 bg-ink text-cream hover:bg-accent rounded-xl shadow-md transition-all duration-300 font-medium text-lg flex items-center gap-2 hover:-translate-y-1"
        >
          <Target className="w-5 h-5" />
          Analyze Resume
        </button>
      </div>
    );
  }

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col w-full h-full space-y-8 pb-12 animate-in fade-in duration-500">
      
      {/* 1. Overall Score Circle */}
      <div className="flex flex-col items-center justify-center py-6 bg-white border border-rule rounded-2xl shadow-sm">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r={radius}
              className="stroke-rule-med fill-none"
              strokeWidth="12"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              className={`fill-none transition-all duration-1000 ease-out ${getScoreColor(results.overall_score).replace('text', 'stroke')}`}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold font-serif ${getScoreColor(results.overall_score)}`}>
              {progress}
            </span>
            <span className="text-xs text-muted font-medium tracking-wider uppercase mt-1">/ 100</span>
          </div>
        </div>
        <h3 className="text-lg font-serif font-medium mt-4 text-ink">ATS Score</h3>
        <p className="text-sm text-muted max-w-sm text-center mt-2 px-4">
          {results.overall_score >= 90 ? "Excellent! Your resume is highly optimized for ATS." :
           results.overall_score >= 70 ? "Good job! A few tweaks can make it even better." :
           results.overall_score >= 40 ? "Needs improvement. Focus on the suggestions below." :
           "Major revision needed to pass most ATS filters."}
        </p>
      </div>

      {/* 2. Dimension Scores Grid */}
      {results.dimension_scores && Object.keys(results.dimension_scores).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-serif text-ink border-b border-rule pb-2">Category Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(results.dimension_scores).map(([name, dim]) => (
              <div key={name} className="bg-white border border-rule rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-ink capitalize">{name}</span>
                  <span className={`font-bold ${getScoreColor(dim.score)}`}>{dim.score}</span>
                </div>
                <div className="h-2 w-full bg-rule rounded-full overflow-hidden mb-3">
                  <div 
                    className={`h-full rounded-full ${getScoreBg(dim.score)} transition-all duration-1000`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
                <p className="text-xs text-muted leading-tight">{dim.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Missing Keywords */}
      {results.missing_keywords && results.missing_keywords.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-serif text-ink border-b border-rule pb-2">Missing Keywords</h3>
          <p className="text-sm text-muted">Consider adding these terms if applicable to your experience:</p>
          <div className="flex flex-wrap gap-2">
            {results.missing_keywords.map((kw, i) => (
              <span key={i} className="px-3 py-1 text-sm bg-[#fef3c7] text-[#92400e] border border-[#fcd34d] rounded-full">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4. Section Recommendations */}
      {results.section_recommendations && results.section_recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-serif text-ink border-b border-rule pb-2">Section Feedback</h3>
          <div className="space-y-3">
            {results.section_recommendations.map((rec, i) => {
              const isExpanded = expandedSections[rec.section];
              const issueCount = rec.issues?.length || 0;
              
              if (issueCount === 0 && (!rec.suggestions || rec.suggestions.length === 0)) return null;

              return (
                <div key={i} className="bg-white border border-rule rounded-xl shadow-sm overflow-hidden transition-all duration-300">
                  <button 
                    onClick={() => toggleSection(rec.section)}
                    className="w-full flex items-center justify-between p-4 hover:bg-cream-2 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-ink-3" />
                      <span className="font-medium text-ink">{rec.section}</span>
                      {issueCount > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-[#fff1f2] text-[#9f1239] rounded-full font-medium">
                          {issueCount} issue{issueCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="p-4 border-t border-rule bg-cream-2/50 space-y-4">
                      {rec.issues && rec.issues.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-ink flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            Issues Found
                          </h4>
                          <ul className="space-y-1">
                            {rec.issues.map((issue, j) => (
                              <li key={j} className="text-sm text-ink-2 pl-6 relative">
                                <span className="absolute left-2 top-1.5 w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {rec.suggestions && rec.suggestions.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-ink flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-accent" />
                            Suggestions
                          </h4>
                          <ul className="space-y-1">
                            {rec.suggestions.map((sug, j) => (
                              <li key={j} className="text-sm text-ink-2 pl-6 relative">
                                <span className="absolute left-2 top-1.5 w-1.5 h-1.5 rounded-full bg-accent"></span>
                                {sug}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {onNavigateToSection && (
                        <div className="pt-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onNavigateToSection(rec.section.toLowerCase()); }}
                            className="text-sm flex items-center gap-1 text-accent hover:text-ink font-medium transition-colors"
                          >
                            Fix in Editor <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.strengths && results.strengths.length > 0 && (
          <div className="bg-success-lt border border-success/20 rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-serif text-success flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5" />
              Strengths
            </h3>
            <ul className="space-y-2">
              {results.strengths.map((strength, i) => (
                <li key={i} className="text-sm text-success flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {results.weaknesses && results.weaknesses.length > 0 && (
          <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-serif text-[#9f1239] flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5" />
              Areas to Improve
            </h3>
            <ul className="space-y-2">
              {results.weaknesses.map((weakness, i) => (
                <li key={i} className="text-sm text-[#9f1239] flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 6. Improvement Tips */}
      {results.improvement_tips && results.improvement_tips.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-serif text-ink border-b border-rule pb-2">Actionable Tips</h3>
          <div className="space-y-3">
            {results.improvement_tips.map((tip, i) => (
              <div key={i} className="flex gap-4 p-4 bg-white border border-rule rounded-xl shadow-sm">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cream-3 text-ink flex items-center justify-center font-serif font-medium">
                  {i + 1}
                </div>
                <p className="text-sm text-ink-2 pt-1.5">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Re-analyze Button */}
      <div className="pt-6 flex justify-center border-t border-rule">
        <button
          onClick={analyzeResume}
          className="px-6 py-2.5 bg-ink text-cream hover:bg-accent rounded-xl shadow-sm transition-all duration-300 font-medium flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Re-check ATS Score
        </button>
      </div>

    </div>
  );
}
