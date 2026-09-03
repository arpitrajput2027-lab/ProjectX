"use client";

import React, { useState, useEffect } from "react";
import { Trophy, BookOpen, Code, Brain, Target, ArrowRight, Star, CheckCircle, BarChart, Loader2, Link2 } from "lucide-react";

export default function ContestUpskillingPage() {
  const [activeSection, setActiveSection] = useState<"contest" | "upskilling">("contest");
  const [targetRole, setTargetRole] = useState<"sde" | "genai">("sde");
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    if (activeSection === "upskilling" && courses.length === 0) {
      setLoadingCourses(true);
      fetch("http://localhost:8000/api/courses/recommend?gap=System+Design")
        .then(res => res.json())
        .then(data => {
          setCourses(data);
          setLoadingCourses(false);
        })
        .catch(err => {
          console.error("Failed to fetch courses:", err);
          setLoadingCourses(false);
        });
    }
  }, [activeSection, courses.length]);
  
  const mockLeaderboard = [
    { rank: 1, name: "Arpit Verma", score: 980, role: "Gen AI" },
    { rank: 2, name: "Rahul Singh", score: 950, role: "SDE" },
    { rank: 3, name: "Priya Sharma", score: 910, role: "SDE" },
    { rank: 4, name: "Amit Kumar", score: 880, role: "Gen AI" },
    { rank: 5, name: "Neha Gupta", score: 850, role: "SDE" },
  ];

  const dsaQuestions = [
    { id: 1, title: "Two Sum", difficulty: "Easy", type: "Arrays" },
    { id: 2, title: "Reverse Linked List", difficulty: "Medium", type: "Linked List" },
    { id: 3, title: "Number of Islands", difficulty: "Medium", type: "Graph" },
    { id: 4, title: "Longest Valid Parentheses", difficulty: "Hard", type: "DP" },
  ];

  const genAiQuestions = [
    { id: 1, text: "Which architecture is fundamental to most Modern LLMs like GPT-4?", options: ["RNN", "LSTM", "Transformer", "CNN"], answer: "Transformer" },
    { id: 2, text: "What technique is used to adapt a pre-trained LLM to a specific domain without retraining from scratch?", options: ["Pre-training", "Fine-tuning", "Pruning", "Quantization"], answer: "Fine-tuning" },
    { id: 3, text: "Which metric is commonly used to evaluate generated text against reference text in summarization tasks?", options: ["Accuracy", "F1 Score", "ROUGE", "MSE"], answer: "ROUGE" },
  ];

  // We now fetch courses dynamically from the backend

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink mb-2">Contest & Upskilling</h1>
        <p className="text-muted">Participate in mock contests, climb the leaderboard, and bridge your skill gaps.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b border-rule-med pb-4">
        <button
          onClick={() => setActiveSection("contest")}
          className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
            activeSection === "contest"
              ? "bg-ink text-cream"
              : "bg-cream-2 text-ink hover:bg-ink-2/10"
          }`}
        >
          <Trophy className="w-5 h-5 mr-2" />
          Weekly Contest
        </button>
        <button
          onClick={() => setActiveSection("upskilling")}
          className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
            activeSection === "upskilling"
              ? "bg-ink text-cream"
              : "bg-cream-2 text-ink hover:bg-ink-2/10"
          }`}
        >
          <BookOpen className="w-5 h-5 mr-2" />
          Upskilling Hub
        </button>
      </div>

      {activeSection === "contest" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-cream rounded-xl p-6 shadow-sm border border-rule-med">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-ink flex items-center">
                  <Target className="w-6 h-6 mr-2 text-accent" />
                  Target Role Selection
                </h2>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setTargetRole("sde")}
                  className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${
                    targetRole === "sde" ? "border-accent bg-accent/5 text-ink font-bold" : "border-rule-med hover:border-ink-2/30"
                  }`}
                >
                  <Code className="w-8 h-8 mx-auto mb-2 text-ink-2" />
                  Software Engineer (DSA)
                </button>
                <button
                  onClick={() => setTargetRole("genai")}
                  className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${
                    targetRole === "genai" ? "border-accent bg-accent/5 text-ink font-bold" : "border-rule-med hover:border-ink-2/30"
                  }`}
                >
                  <Brain className="w-8 h-8 mx-auto mb-2 text-ink-2" />
                  Gen AI Engineer (MCQ)
                </button>
              </div>
            </div>

            <div className="bg-cream rounded-xl p-6 shadow-sm border border-rule-med">
              <h2 className="text-xl font-bold text-ink mb-6">Contest Questions</h2>
              
              {targetRole === "sde" ? (
                <div className="space-y-4">
                  {dsaQuestions.map((q) => (
                    <div key={q.id} className="p-4 border border-rule-med rounded-lg flex justify-between items-center hover:bg-cream-2 transition-colors">
                      <div>
                        <h3 className="font-semibold text-ink">{q.title}</h3>
                        <p className="text-sm text-muted">{q.type}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                          q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {q.difficulty}
                        </span>
                        <button className="px-4 py-2 bg-ink text-cream rounded-md text-sm hover:bg-ink-2 transition-colors">
                          Solve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {genAiQuestions.map((q, index) => (
                    <div key={q.id} className="p-4 border border-rule-med rounded-lg">
                      <h3 className="font-semibold text-ink mb-3">{index + 1}. {q.text}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {q.options.map((opt, i) => (
                          <button key={i} className="p-3 border border-rule-med rounded-md text-left hover:bg-accent hover:text-cream transition-colors text-sm font-medium">
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-ink text-cream rounded-xl p-6 shadow-xl sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center">
                  <Trophy className="w-6 h-6 mr-2 text-accent" />
                  Leaderboard
                </h2>
                <span className="text-xs font-semibold bg-accent/20 text-accent px-2 py-1 rounded-full">Live</span>
              </div>
              
              <div className="space-y-4">
                {mockLeaderboard.map((user, index) => (
                  <div key={index} className="flex items-center p-3 bg-ink-2 rounded-lg border border-rule-med/20">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-800' :
                      index === 2 ? 'bg-amber-600 text-amber-100' :
                      'bg-cream/10 text-cream'
                    }`}>
                      {user.rank}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-cream/60">{user.role}</p>
                    </div>
                    <div className="font-bold text-accent">
                      {user.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === "upskilling" && (
        <div className="space-y-8">
          <div className="bg-cream rounded-xl p-6 shadow-sm border border-rule-med flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-ink mb-2 flex items-center">
                <BarChart className="w-6 h-6 mr-2 text-accent" />
                Your Skill Gap Analysis
              </h2>
              <p className="text-muted text-sm max-w-2xl">
                Based on your recent mock interviews and contest performance, we've identified areas where you can improve to reach your target role faster.
              </p>
            </div>
            <div className="hidden md:flex space-x-3">
              <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold border border-red-200">
                Critical Gap: System Design
              </div>
              <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg text-sm font-semibold border border-yellow-200">
                Needs Work: RAG & LLMs
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-ink mb-6 flex items-center">
              Recommended for You 
              {loadingCourses && <Loader2 className="w-5 h-5 ml-3 animate-spin text-accent" />}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {!loadingCourses && courses.length === 0 && (
                 <p className="text-muted col-span-full">No courses found right now. Try checking back later.</p>
              )}
              {courses.map((course) => (
                <div key={course.id} className="bg-cream rounded-xl p-6 shadow-sm border border-rule-med hover:border-accent hover:shadow-md transition-all flex flex-col h-full">
                  <div className="mb-4 text-accent">
                    {course.provider === "Udemy" ? <Code className="w-6 h-6" /> : course.provider === "Coursera" ? <BookOpen className="w-6 h-6" /> : <Link2 className="w-6 h-6" />}
                  </div>
                  <h3 className="font-bold text-lg text-ink mb-1 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-muted mb-4">{course.provider} • {course.duration}</p>
                  
                  <div className="mt-auto">
                    <div className="flex items-center text-xs font-semibold text-accent bg-accent/10 w-fit px-3 py-1 rounded-full mb-4">
                      <Target className="w-3 h-3 mr-1" />
                      Targets Gap: {course.gap}
                    </div>
                    <a href={course.url} target="_blank" rel="noopener noreferrer" className="w-full py-2.5 bg-ink text-cream rounded-md font-medium flex items-center justify-center hover:bg-ink-2 transition-colors">
                      View Course
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-ink-2 text-cream rounded-xl p-8 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-2 flex items-center">
                <Star className="w-6 h-6 mr-2 text-yellow-400" />
                Schedule a 1:1 Mentorship Session
              </h3>
              <p className="text-cream/80 max-w-xl">
                Get personalized guidance from industry experts at top tech companies. Review your skill gaps and create a custom roadmap.
              </p>
            </div>
            <button className="px-6 py-3 bg-accent text-cream rounded-md font-bold whitespace-nowrap hover:bg-accent/90 transition-colors">
              Book a Mentor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
