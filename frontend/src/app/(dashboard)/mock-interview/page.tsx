"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useInterviewWebSocket } from "@/hooks/useInterviewWebSocket";
import { useTTS } from "@/hooks/useTTS";
import { useSTT } from "@/hooks/useSTT";
import { useAvatarStore } from "@/store/avatarStore";
import { Play, Square, Pause, Mic, MicOff, MessageSquare, Clock, Timer, Send } from "lucide-react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";

const AvatarWindow = dynamic(() => import("@/components/assistant/AvatarWindow"), { ssr: false });

const TIME_OPTIONS = [
  { label: "5 min", value: 5 * 60 },
  { label: "10 min", value: 10 * 60 },
  { label: "15 min", value: 15 * 60 },
  { label: "20 min", value: 20 * 60 },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function MockInterviewPage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [inputText, setInputText] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isPausedRef = useRef(false);

  const { speak, stop: stopTTS } = useTTS();
  const { setAvatarState } = useAvatarStore();

  const handleMessageReceived = useCallback((text: string) => {
    speak(text);
  }, [speak]);

  const handleInterviewEnded = useCallback((data: any) => {
    setFeedback(data);
    stopTTS();
    setAvatarState("idle");
    // Clear the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [stopTTS, setAvatarState]);

  const {
    messages,
    status,
    connect,
    disconnect,
    sendAnswer,
    endInterview,
    reset
  } = useInterviewWebSocket({
    studentId: studentId || "test_id",
    onMessageReceived: handleMessageReceived,
    onInterviewEnded: handleInterviewEnded
  });

  const { isRecording, toggleRecording, stopRecording } = useSTT({
    onTranscript: (text) => {
      if (text.trim()) {
        setInputText(prev => prev ? prev + " " + text : text);
      }
    }
  });

  const handleSend = () => {
    if (inputText.trim()) {
      sendAnswer(inputText.trim());
      setInputText("");
    }
  };

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setStudentId(data.session.user.id);
      }
    }
    getUser();
  }, []);

  // Timer countdown logic
  useEffect(() => {
    // Only start the timer if connected AND the interviewer has asked the first question
    if (status === "connected" && messages.length > 0 && !isPaused && timeLeft > 0) {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) return 0;
            return prev - 1;
          });
        }, 1000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status, messages.length, isPaused, timeLeft]);

  // Auto-end when timer runs out
  useEffect(() => {
    if (timeLeft === 0 && status === "connected") {
      stopTTS();
      stopRecording();
      endInterview();
    }
  }, [timeLeft, status, stopTTS, stopRecording, endInterview]);

  const handleStart = () => {
    if (!studentId) {
      alert("User not logged in or profile not loaded.");
      return;
    }
    if (!selectedTime) {
      alert("Please select an interview duration.");
      return;
    }
    
    setFeedback(null);
    setTimeLeft(selectedTime);
    isPausedRef.current = false;
    setIsPaused(false);
    connect();
  };

  const handleStop = () => {
    stopTTS();
    stopRecording();
    endInterview(); 
  };

  const handlePauseResume = () => {
    const newPaused = !isPaused;
    setIsPaused(newPaused);
    isPausedRef.current = newPaused;
    if (newPaused) {
      stopTTS();
      stopRecording();
      setAvatarState("idle");
    } else {
      sendAnswer("I am ready to continue.");
    }
  };

  const handleNewInterview = () => {
    setFeedback(null);
    setSelectedTime(null);
    setTimeLeft(0);
    setIsPaused(false);
    isPausedRef.current = false;
    reset();
  };

  // Timer bar color
  const timerPercent = selectedTime ? (timeLeft / selectedTime) * 100 : 100;
  const timerColor = timerPercent > 50 ? "bg-green-500" : timerPercent > 20 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="flex h-full bg-cream relative">
      <div className="flex-1 flex flex-col p-6 max-w-4xl mx-auto w-full h-full lg:mr-[340px]">
        <h1 className="text-2xl font-serif font-bold text-ink mb-6 flex items-center space-x-2">
          <MessageSquare className="w-6 h-6 text-accent" />
          <span>AI Mock Interview</span>
        </h1>

        {/* ========== LANDING: TIME SELECTOR ========== */}
        {status === "idle" && !feedback && (
          <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-rule-med shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-accent-lt rounded-full flex items-center justify-center mb-6">
              <Mic className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-ink mb-2">Practice for your Target Role</h2>
            <p className="text-ink-3 max-w-md mb-8">
              The AI interviewer will analyze your resume and target role to ask relevant technical and behavioral questions.
              Speak naturally using your microphone.
            </p>

            {/* Time Limit Selection */}
            <div className="mb-8 w-full max-w-md">
              <p className="text-sm font-semibold text-ink-2 mb-3 flex items-center justify-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Select Interview Duration</span>
              </p>
              <div className="grid grid-cols-4 gap-3">
                {TIME_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedTime(opt.value)}
                    className={`py-3 px-4 rounded-lg border-2 font-semibold text-sm transition-all ${
                      selectedTime === opt.value
                        ? "border-accent bg-accent text-white shadow-md scale-105"
                        : "border-rule-med bg-cream-2 text-ink hover:border-accent hover:bg-accent-lt"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={!selectedTime}
              className="bg-accent text-cream px-6 py-3 rounded-md font-medium hover:bg-accent-dk transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5" />
              <span>Start Interview</span>
            </button>
          </div>
        )}

        {/* ========== INTERVIEW IN PROGRESS ========== */}
        {(status === "connecting" || status === "connected") && (
          <div className="flex-1 flex flex-col bg-white rounded-xl border border-rule-med shadow-sm overflow-hidden relative">
            {/* Timer Bar */}
            <div className="w-full h-1.5 bg-gray-200">
              <div
                className={`h-full ${timerColor} transition-all duration-1000 ease-linear`}
                style={{ width: `${timerPercent}%` }}
              />
            </div>

            {/* Header Controls */}
            <div className="p-4 border-b border-rule-med bg-cream-2 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${status === 'connected' ? 'bg-success animate-pulse' : 'bg-yellow-500 animate-bounce'}`} />
                <span className="font-medium text-sm text-ink-2">
                  {status === 'connecting' 
                    ? 'Connecting to AI...' 
                    : isPaused 
                      ? 'Interview Paused' 
                      : (messages.length === 0 ? 'Waiting for AI...' : 'Interview in Progress')}
                </span>
                {/* Timer display */}
                <div className={`flex items-center space-x-1 font-mono text-sm font-bold px-3 py-1 rounded-full ${timerPercent > 20 ? 'bg-ink text-cream' : 'bg-red-500 text-white animate-pulse'}`}>
                  <Timer className="w-3.5 h-3.5" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handlePauseResume}
                  className="px-4 py-2 bg-cream border border-rule-med rounded text-sm font-medium hover:bg-cream-2 transition-colors flex items-center space-x-2"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
                <button
                  onClick={handleStop}
                  className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded text-sm font-medium hover:bg-red-100 transition-colors flex items-center space-x-2"
                >
                  <Square className="w-4 h-4" />
                  <span>End Interview</span>
                </button>
              </div>
            </div>

            {/* Chat Transcript */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-ink-3 mt-10">
                  Waiting for the interviewer...
                </div>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-xl ${msg.role === 'user' ? 'bg-ink text-cream rounded-tr-none' : 'bg-cream-2 border border-rule-med text-ink rounded-tl-none'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Controls */}
            <div className="p-4 border-t border-rule-med bg-white flex flex-col space-y-3">
               <div className="flex items-end space-x-2">
                 <textarea 
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault();
                       handleSend();
                     }
                   }}
                   placeholder="Type your answer or use the microphone..."
                   className="flex-1 p-3 border border-rule-med rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none bg-cream-2 text-ink text-sm"
                   rows={3}
                   disabled={isPaused}
                 />
                 <div className="flex flex-col space-y-2">
                   <button
                      onClick={toggleRecording}
                      disabled={isPaused}
                      title={isRecording ? "Stop Recording" : "Start Recording"}
                      className={`p-3 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-md' : 'bg-ink text-cream hover:bg-accent disabled:opacity-50'}`}
                   >
                     {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                   </button>
                   <button 
                     onClick={handleSend}
                     disabled={!inputText.trim() || isPaused}
                     className="p-3 rounded-full bg-accent text-white hover:bg-accent-dk disabled:opacity-50 transition-all flex items-center justify-center"
                     title="Send Answer"
                   >
                     <Send className="w-5 h-5" />
                   </button>
                 </div>
               </div>
               {isRecording && <div className="text-xs text-red-500 font-medium animate-pulse flex justify-center">Listening... speak your answer. Click stop or send when done.</div>}
            </div>
          </div>
        )}

        {/* ========== FEEDBACK REPORT ========== */}
        {status === "ended" && feedback && (
          <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-rule-med shadow-sm p-8">
            <h2 className="text-2xl font-serif font-bold text-ink mb-6 border-b border-rule pb-4">Interview Feedback Report</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-5 bg-blue-50 border border-blue-100 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Communication Skills</h3>
                    <p className="text-sm text-blue-900">{feedback.communication}</p>
                </div>
                <div className="p-5 bg-red-50 border border-red-100 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-2">Grammar & Delivery</h3>
                    <p className="text-sm text-red-900">{feedback.grammar}</p>
                </div>
                <div className="p-5 bg-green-50 border border-green-100 rounded-lg md:col-span-2">
                    <h3 className="font-semibold text-green-800 mb-2">Technical Competence</h3>
                    <p className="text-sm text-green-900">{feedback.technical}</p>
                </div>
                <div className="p-5 bg-ink border border-ink-2 rounded-lg md:col-span-2 text-cream">
                    <h3 className="font-semibold text-accent mb-2">Overall Recommendation</h3>
                    <p className="text-sm text-cream-2">{feedback.overall}</p>
                </div>
            </div>

            <button
              onClick={handleNewInterview}
              className="bg-cream-2 border border-rule-med text-ink px-6 py-2 rounded-md font-medium hover:bg-cream transition-colors"
            >
              Start New Interview
            </button>
          </div>
        )}
      </div>

      {/* Render Avatar Floating Window when connected */}
      {(status === "connected" || status === "connecting") && (
        <AvatarWindow />
      )}
    </div>
  );
}
