"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/profile");
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="bg-white border border-rule-med p-8 rounded-md w-full max-w-md shadow-sm">
        <h1 className="font-serif text-3xl text-ink mb-2">Welcome Back</h1>
        <p className="text-sm text-ink-3 mb-6">Log in to view your ReadyIndex score.</p>
        
        {error && <div className="mb-4 text-xs text-red-500 bg-red-50 p-2 rounded">{error}</div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4 mb-6">
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
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        
        <div className="text-center text-sm text-ink-3">
          Don't have an account? <Link href="/auth/signup" className="text-accent hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
