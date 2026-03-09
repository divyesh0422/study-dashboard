// src/app/(dashboard)/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { Sidebar }           from "@/components/layout/Sidebar";
import { AIGuideWidget }     from "@/components/ai/AIGuideWidget";
import { OnboardingModal }   from "@/components/shared/OnboardingModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(false);

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
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full">{children}</div>
      </main>

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
