"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { X, ArrowRight } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "signup";
  targetRole: "student" | "recruiter";
}

export default function AuthModal({ isOpen, onClose, defaultMode = "signup", targetRole }: AuthModalProps) {
  const router = useRouter();
  
  const [authMode, setAuthMode] = useState<"login" | "signup">(defaultMode);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let currentSessionUser = null;

      if (authMode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              role: targetRole
            }
          }
        });
        if (signUpError) throw signUpError;
        currentSessionUser = data.user;
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;
        currentSessionUser = data.user;
      }

      if (!currentSessionUser) {
        throw new Error("Failed to authenticate.");
      }

      // Check user role from metadata or db (if login, we might not know their role beforehand, 
      // but they are on a specific landing page, we assume targetRole for routing initially.
      // However, it's safer to fetch the `users` table, but our users table is populated by a trigger.
      // Let's rely on targetRole for now, or check student_profiles directly.
      
      if (targetRole === "student") {
        // Check if student profile exists and onboarding is complete
        const { data: profile } = await supabase
          .from("student_profiles")
          .select("onboarding_completed")
          .eq("user_id", currentSessionUser.id)
          .single();

        if (profile?.onboarding_completed) {
          router.push("/profile"); // Dashboard
        } else {
          router.push("/onboarding");
        }
      } else {
        // Recruiter flow
        router.push("/recruiter-dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl border border-rule-med overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-4 border-b border-rule-lt bg-cream">
          <div className="font-mono text-[10px] tracking-widest uppercase text-ink-3">
            {authMode === "signup" ? "Create Account" : "Welcome Back"}
          </div>
          <button onClick={onClose} className="text-ink-3 hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          <h2 className="font-serif text-3xl text-ink mb-1">
            {targetRole === "student" ? "For Professionals" : "For Recruiters"}
          </h2>
          <p className="text-sm text-ink-3 mb-6">
            {authMode === "signup" 
              ? `Join to get started.` 
              : `Log in to your account.`}
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === "signup" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">First Name</label>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required 
                    className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Last Name</label>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required 
                    className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" 
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" 
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-cream font-mono text-[11px] tracking-widest uppercase py-3.5 rounded-md hover:bg-accent transition-colors disabled:opacity-70 mt-4 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  <span>{authMode === "signup" ? "Sign Up" : "Log In"}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-ink-3">
            {authMode === "signup" ? (
              <>
                Already have an account?{" "}
                <button onClick={() => setAuthMode("login")} className="text-accent hover:underline font-medium">Log in</button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button onClick={() => setAuthMode("signup")} className="text-accent hover:underline font-medium">Sign up</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
