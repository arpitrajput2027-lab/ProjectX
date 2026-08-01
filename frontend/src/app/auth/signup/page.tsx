"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
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
        
        <div className="text-center text-sm text-ink-3">
          Already have an account? <Link href="/auth/login" className="text-accent hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
