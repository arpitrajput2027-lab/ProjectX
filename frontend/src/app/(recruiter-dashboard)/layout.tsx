"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Users, Briefcase, Building, LogOut, FileText, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RecruiterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [recruiterName, setRecruiterName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from('recruiter_profiles')
        .select('full_name')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!profile) {
        router.push("/recruiter-onboarding");
      } else {
        setRecruiterName(profile.full_name);
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center font-mono text-xs uppercase tracking-widest text-ink">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-cream text-ink font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-ink text-cream flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center px-6 border-b border-rule-med bg-ink-2/30">
          <Briefcase className="w-5 h-5 text-accent mr-3" />
          <h1 className="font-serif text-xl font-semibold tracking-wide text-cream">ReadyIndex</h1>
        </div>
        
        <nav className="flex flex-col py-6 px-3 space-y-1">
          <div className="px-3 mb-3 text-xs font-semibold text-muted uppercase tracking-wider">
            Recruiting
          </div>
          <Link
            href="/recruiter-dashboard"
            className="flex items-center px-3 py-2.5 rounded-md hover:bg-ink-2 transition-colors font-medium text-sm text-cream-2 group"
          >
            <Briefcase className="w-4 h-4 mr-3 opacity-70 group-hover:opacity-100 group-hover:text-accent" />
            Active Jobs
          </Link>
          <Link
            href="/recruiter-dashboard/bulk-resume"
            className="flex items-center px-3 py-2.5 rounded-md hover:bg-ink-2 transition-colors font-medium text-sm text-cream-2 group"
          >
            <FileText className="w-4 h-4 mr-3 opacity-70 group-hover:opacity-100 group-hover:text-accent" />
            Bulk Resume
          </Link>
          <Link
            href="/recruiter-dashboard/interviews"
            className="flex items-center px-3 py-2.5 rounded-md hover:bg-ink-2 transition-colors font-medium text-sm text-cream-2 group"
          >
            <Calendar className="w-4 h-4 mr-3 opacity-70 group-hover:opacity-100 group-hover:text-accent" />
            Interview
          </Link>
          <Link
            href="/recruiter-dashboard/talent"
            className="flex items-center px-3 py-2.5 rounded-md hover:bg-ink-2 transition-colors font-medium text-sm text-cream-2 group"
          >
            <Users className="w-4 h-4 mr-3 opacity-70 group-hover:opacity-100 group-hover:text-accent" />
            Talent Pool
          </Link>
          <Link
            href="/recruiter-dashboard/company"
            className="flex items-center px-3 py-2.5 rounded-md hover:bg-ink-2 transition-colors font-medium text-sm text-cream-2 group"
          >
            <Building className="w-4 h-4 mr-3 opacity-70 group-hover:opacity-100 group-hover:text-accent" />
            Company Profile
          </Link>
        </nav>
        
        <div className="mt-auto p-4 m-3 rounded-lg bg-ink-2/40 border border-rule-med flex items-center gap-3 hover:bg-ink-2/80 transition-colors cursor-pointer" onClick={handleLogout}>
          <div className="w-9 h-9 rounded-full bg-accent text-cream flex items-center justify-center font-bold font-serif text-sm shadow-sm uppercase">
            {recruiterName.slice(0, 2)}
          </div>
          <div className="flex flex-col flex-grow">
            <span className="text-sm font-semibold text-cream truncate max-w-[120px]">{recruiterName}</span>
            <span className="text-xs text-muted">Recruiter</span>
          </div>
          <LogOut className="w-4 h-4 text-muted hover:text-red-400" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-cream-2 relative">
        {children}
      </main>
    </div>
  );
}
