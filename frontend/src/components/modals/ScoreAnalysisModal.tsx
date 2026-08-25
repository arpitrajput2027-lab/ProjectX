import React from "react";
import { X, Activity, CheckCircle, AlertTriangle, Info, Target, GitBranch, Code, Briefcase, FileText } from "lucide-react";

interface ScoreAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}

export default function ScoreAnalysisModal({ isOpen, onClose, profile }: ScoreAnalysisModalProps) {
  if (!isOpen) return null;

  const breakdown = profile?.katalyst_score_breakdown || {};
  const github = breakdown.github || { score: 0, breakdown: {} };
  const leetcode = breakdown.leetcode || { score: 0, breakdown: {} };
  const profileScores = breakdown.profile || { score: 0, breakdown: {} };
  
  const targetRole = profile?.target_role || "Software Engineer";

  // Generate dynamic recommendations
  const generateRecommendations = () => {
    const recs = [];
    
    // Leetcode
    if (leetcode.score < 15) {
      recs.push({
        type: 'warning',
        icon: <Code className="w-5 h-5 text-orange-500" />,
        title: "Level up your Data Structures & Algorithms",
        desc: `Since you are targeting a ${targetRole} role, problem-solving skills are crucial. Try solving more Medium and Hard LeetCode questions to boost your score and interview readiness.`
      });
    } else {
      recs.push({
        type: 'success',
        icon: <Code className="w-5 h-5 text-green-500" />,
        title: "Solid Algorithmic Foundation",
        desc: "Your LeetCode activity is strong! Keep maintaining your streak to stay sharp."
      });
    }

    // Github
    if (github.score < 15) {
      recs.push({
        type: 'warning',
        icon: <GitBranch className="w-5 h-5 text-orange-500" />,
        title: "Increase Open Source Contributions",
        desc: "Your GitHub activity seems a bit low. Commit regularly, structure your repositories well with READMEs, and try contributing to open source."
      });
    } else {
      recs.push({
        type: 'success',
        icon: <GitBranch className="w-5 h-5 text-green-500" />,
        title: "Great GitHub Presence",
        desc: "You have a solid GitHub footprint. Keep showcasing your work through well-documented repos."
      });
    }

    // Profile & Projects
    if (profileScores.breakdown?.Projects < 5) {
      recs.push({
        type: 'info',
        icon: <Briefcase className="w-5 h-5 text-blue-500" />,
        title: "Build and Deploy Projects",
        desc: "Add more structured projects to your profile. Deploying them and adding live URLs significantly increases your visibility to recruiters."
      });
    }

    // Experience
    if (profileScores.breakdown?.Experience < 5) {
      recs.push({
        type: 'info',
        icon: <Target className="w-5 h-5 text-blue-500" />,
        title: "Seek Real-World Experience",
        desc: "Try to land an internship or do freelance work to add professional experience to your profile. It's a huge plus for your resume."
      });
    }

    // Resume/Skills
    if (profileScores.breakdown?.Skills < 4) {
      recs.push({
        type: 'warning',
        icon: <FileText className="w-5 h-5 text-orange-500" />,
        title: "Highlight Your Technical Skills",
        desc: "Your skill section is sparse. List down all relevant frameworks, languages, and tools you know."
      });
    }

    return recs;
  };

  const recommendations = generateRecommendations();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
      
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-rule-med flex items-center justify-between bg-cream-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-accent-lt text-accent flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-ink">Detailed Score Analysis</h2>
              <p className="text-sm text-ink-3 mt-0.5">Understand your Katalyst Score breakdown & get recommendations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-ink-3 hover:text-ink hover:bg-cream rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#faf8f4]">
          {/* Left Column: Score Breakdown */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg text-ink flex items-center space-x-2">
              <Target className="w-5 h-5 text-ink-2" />
              <span>Score Breakdown</span>
            </h3>
            
            <div className="bg-white rounded-xl border border-rule-med p-5 shadow-sm space-y-5">
              
              {/* GitHub Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-ink flex items-center space-x-2">
                    <GitBranch className="w-4 h-4 text-ink-3" />
                    <span>GitHub Score</span>
                  </span>
                  <span className="font-bold text-ink">{github.score}/40</span>
                </div>
                <div className="w-full bg-cream-2 rounded-full h-2">
                  <div className="bg-ink h-2 rounded-full" style={{ width: `${(github.score / 40) * 100}%` }}></div>
                </div>
              </div>

              {/* LeetCode Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-ink flex items-center space-x-2">
                    <Code className="w-4 h-4 text-ink-3" />
                    <span>LeetCode Score</span>
                  </span>
                  <span className="font-bold text-ink">{leetcode.score}/35</span>
                </div>
                <div className="w-full bg-cream-2 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(leetcode.score / 35) * 100}%` }}></div>
                </div>
              </div>

              {/* Profile Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-ink flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-ink-3" />
                    <span>Profile & Resume</span>
                  </span>
                  <span className="font-bold text-ink">{profileScores.score}/25</span>
                </div>
                <div className="w-full bg-cream-2 rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full" style={{ width: `${(profileScores.score / 25) * 100}%` }}></div>
                </div>
                
                {/* Profile Sub-breakdown */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-ink-2">
                  {profileScores.breakdown && Object.entries(profileScores.breakdown).map(([key, val]: any) => (
                    <div key={key} className="flex justify-between border-b border-rule-med pb-1">
                      <span className="truncate pr-2">{key}</span>
                      <span className="font-medium">{val} pts</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Recommendations */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg text-ink flex items-center space-x-2">
              <Info className="w-5 h-5 text-accent" />
              <span>Personalized Recommendations</span>
            </h3>

            <div className="space-y-4">
              {recommendations.map((rec, idx) => (
                <div 
                  key={idx} 
                  className={`bg-white rounded-xl border p-4 shadow-sm flex space-x-4 ${
                    rec.type === 'success' ? 'border-green-200' :
                    rec.type === 'warning' ? 'border-orange-200' : 'border-blue-200'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {rec.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink mb-1">{rec.title}</h4>
                    <p className="text-sm text-ink-2 leading-relaxed">{rec.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-rule-med bg-white flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-ink text-white rounded-md text-sm font-medium hover:bg-ink-2 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
