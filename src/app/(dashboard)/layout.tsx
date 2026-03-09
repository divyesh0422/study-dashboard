// src/app/(dashboard)/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { Sidebar }           from "@/components/layout/Sidebar";
import { AIGuideWidget }     from "@/components/ai/AIGuideWidget";
import { OnboardingModal }   from "@/components/shared/OnboardingModal";
import { useUIStore }        from "@/store/uiStore";
import { GraduationCap, Menu } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { setMobileSidebarOpen } = useUIStore();

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.data && !d.data.onboardingDone) setShowOnboarding(true);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* ── Mobile top header ── */}
        <header className="flex md:hidden h-14 items-center justify-between px-4 border-b bg-card shrink-0">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-purple">
              <GraduationCap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">StudyDash</span>
          </div>
          {/* spacer to center logo */}
          <div className="w-9" />
        </header>

        <main className="flex-1 overflow-y-auto">
          {/* pb-20 on mobile = space above bottom tab bar */}
          <div className="min-h-full pb-20 md:pb-0">{children}</div>
        </main>
      </div>

      {/* Floating AI widget */}
      <AIGuideWidget />

      {/* First-time onboarding */}
      <OnboardingModal
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
}

