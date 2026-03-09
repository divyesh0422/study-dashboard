// src/components/shared/OnboardingModal.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, CheckSquare, Timer, BarChart3,
  Sparkles, ArrowRight, GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const STEPS = [
  {
    icon:        GraduationCap,
    color:       "bg-violet-100 text-violet-600",
    title:       "Welcome to StudyDash! 🎓",
    description: "Your all-in-one study management platform. Let's take a quick tour of what you can do.",
  },
  {
    icon:        BookOpen,
    color:       "bg-blue-100 text-blue-600",
    title:       "Organize by Subjects",
    description: "Create subjects for each of your courses. Track hours studied, tasks, and notes all in one place.",
  },
  {
    icon:        CheckSquare,
    color:       "bg-green-100 text-green-600",
    title:       "Manage Your Tasks",
    description: "Add tasks with priorities and due dates. Mark them complete as you work through your studies.",
  },
  {
    icon:        Timer,
    color:       "bg-orange-100 text-orange-600",
    title:       "Study with Pomodoro Timer",
    description: "Use the built-in Pomodoro timer for focused study sessions. Your sessions are tracked automatically.",
  },
  {
    icon:        Sparkles,
    color:       "bg-purple-100 text-purple-600",
    title:       "AI Study Guide",
    description: "Click the ✨ button anytime to ask your AI guide for help with concepts, strategies, or motivation.",
  },
  {
    icon:        BarChart3,
    color:       "bg-pink-100 text-pink-600",
    title:       "Track Your Progress",
    description: "View your study streaks, hours, and completion rates in the Analytics page. Stay motivated!",
  },
];

interface OnboardingModalProps {
  open:    boolean;
  onClose: () => void;
}

export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  async function handleClose() {
    // Mark onboarding done
    await fetch("/api/user/profile", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ onboardingDone: true }),
    });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="p-8 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0  }}
              exit={{   opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {/* Icon */}
              <div className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl ${current.color}`}>
                <current.icon className="h-10 w-10" />
              </div>

              <h2 className="text-xl font-bold mb-3">{current.title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {current.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-8 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-primary" : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                Back
              </Button>
            )}
            <Button
              className="flex-1"
              onClick={() => isLast ? handleClose() : setStep(step + 1)}
            >
              {isLast ? (
                "Get Started! 🚀"
              ) : (
                <>Next <ArrowRight className="ml-1 h-4 w-4" /></>
              )}
            </Button>
          </div>

          {step === 0 && (
            <button
              onClick={handleClose}
              className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip tour
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
