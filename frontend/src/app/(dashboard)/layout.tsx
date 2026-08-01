import Link from "next/link";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-cream text-ink font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-rule flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-rule">
          <h1 className="font-serif text-xl font-medium tracking-tight">ProjectX</h1>
          <span className="ml-auto text-ink-3">&raquo;</span>
        </div>
        <nav className="flex flex-col py-4">
          <Link
            href="/profile"
            className="px-6 py-3 border-b border-rule hover:bg-parchment transition-colors font-medium text-sm"
          >
            Profile
          </Link>
          <Link
            href="/resume"
            className="px-6 py-3 border-b border-rule hover:bg-parchment transition-colors font-medium text-sm"
          >
            Resume
          </Link>
        </nav>
        <div className="mt-auto border-t border-rule p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-ink flex items-center justify-center">
            {/* Avatar Placeholder */}
          </div>
          <span className="text-sm font-medium">Arpit Verma</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-cream-2">
        {children}
      </main>
    </div>
  );
}
