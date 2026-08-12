"use client";

import Link from "next/link";
import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetRole = searchParams.get("role") || "student";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: targetRole,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Since we disabled email verification, the user is signed in immediately
    router.push("/onboarding");
  };

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/profile`,
      },
    });
    
    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="bg-white border border-rule-med p-8 rounded-md w-full max-w-md shadow-sm">
        <h1 className="font-serif text-3xl text-ink mb-2">Create an Account</h1>
        <p className="text-sm text-ink-3 mb-6">Join ReadyIndex and discover your score.</p>
        
        {error && <div className="mb-4 text-xs text-red-500 bg-red-50 p-2 rounded">{error}</div>}

        <form onSubmit={handleSignup} className="flex flex-col gap-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] tracking-widest uppercase text-muted mb-2">First Name</label>
              <input 
                type="text" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="Arpit" 
                className="w-full bg-cream text-ink border border-rule-med rounded-md p-3 text-sm focus:outline-none focus:border-accent" 
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] tracking-widest uppercase text-muted mb-2">Last Name</label>
              <input 
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Rajput" 
                className="w-full bg-cream text-ink border border-rule-med rounded-md p-3 text-sm focus:outline-none focus:border-accent" 
              />
            </div>
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-muted mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com" 
              className="w-full bg-cream text-ink border border-rule-med rounded-md p-3 text-sm focus:outline-none focus:border-accent" 
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-muted mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••" 
              className="w-full bg-cream text-ink border border-rule-med rounded-md p-3 text-sm focus:outline-none focus:border-accent" 
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-cream font-mono text-[11px] tracking-widest uppercase py-3 rounded-md hover:bg-accent transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-rule-med"></div>
          <span className="flex-shrink-0 mx-4 text-ink-3 text-xs">OR</span>
          <div className="flex-grow border-t border-rule-med"></div>
        </div>

        <button 
          onClick={handleGoogleSignup}
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-white border border-rule-med text-ink font-mono text-[11px] tracking-widest uppercase py-3 rounded-md hover:bg-slate-100 transition-colors mb-6"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Sign up with Google
        </button>
        
        <div className="text-center text-sm text-ink-3">
          Already have an account? <Link href="/auth/login" className="text-accent hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center p-6"><div className="text-ink font-mono text-xs tracking-widest uppercase">Loading...</div></div>}>
      <SignupForm />
    </Suspense>
  );
}
