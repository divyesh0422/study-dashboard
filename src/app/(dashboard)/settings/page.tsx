// src/app/(dashboard)/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { User, Bell, Palette, Timer, Bot, Save, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTimerStore } from "@/store/timerStore";
import { useTheme } from "@/components/shared/ThemeProvider";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

const THEMES = [
  { value: "system", label: "System",  icon: "💻" },
  { value: "light",  label: "Light",   icon: "☀️" },
  { value: "dark",   label: "Dark",    icon: "🌙" },
];

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { settings, updateSettings } = useTimerStore();
  const { theme, setTheme } = useTheme();

  const [isSaving, setIsSaving]       = useState(false);
  const [aiEnabled, setAiEnabled]     = useState(true);
  const [dailyGoal, setDailyGoal]     = useState(4);
  const [name, setName]               = useState(session?.user?.name ?? "");

  // Load user prefs from API
  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setAiEnabled(d.data.aiGuideEnabled ?? true);
          setDailyGoal(d.data.dailyGoalHours ?? 4);
          setName(d.data.name ?? "");
          updateSettings({
            workDuration:       d.data.pomodoroWork  ?? 25,
            shortBreakDuration: d.data.pomodoroBreak ?? 5,
            longBreakDuration:  d.data.pomodoroLong  ?? 15,
          });
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveProfile() {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name,
          dailyGoalHours:    dailyGoal,
          pomodoroWork:      settings.workDuration,
          pomodoroBreak:     settings.shortBreakDuration,
          pomodoroLong:      settings.longBreakDuration,
          theme,
          aiGuideEnabled:    aiEnabled,
        }),
      });
      if (!res.ok) throw new Error();
      await update({ name });
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 animate-fade-in max-w-2xl">
      <PageHeader
        title="Settings"
        description="Manage your profile and preferences"
        action={
          <Button onClick={saveProfile} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        }
      />

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="profile"><User className="h-3.5 w-3.5 mr-1.5" />Profile</TabsTrigger>
          <TabsTrigger value="timer"><Timer className="h-3.5 w-3.5 mr-1.5" />Timer</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="h-3.5 w-3.5 mr-1.5" />Theme</TabsTrigger>
          <TabsTrigger value="ai"><Bot className="h-3.5 w-3.5 mr-1.5" />AI Guide</TabsTrigger>
        </TabsList>

        {/* ── Profile ── */}
        <TabsContent value="profile">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border bg-card p-6 space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={session?.user?.email ?? ""} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-3">
              <Label>Daily Study Goal: <span className="font-bold text-primary">{dailyGoal}h</span></Label>
              <Slider
                min={1} max={12} step={0.5}
                value={[dailyGoal]}
                onValueChange={([v]) => setDailyGoal(v)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1h</span><span>12h</span>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* ── Timer ── */}
        <TabsContent value="timer">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border bg-card p-6 space-y-6"
          >
            {[
              { label: "Focus Duration", key: "workDuration",       min: 5,  max: 60, step: 5  },
              { label: "Short Break",    key: "shortBreakDuration", min: 1,  max: 15, step: 1  },
              { label: "Long Break",     key: "longBreakDuration",  min: 10, max: 30, step: 5  },
            ].map(({ label, key, min, max, step }) => {
              const val = settings[key as keyof typeof settings] as number;
              return (
                <div key={key} className="space-y-3">
                  <Label>{label}: <span className="font-bold text-primary">{val} min</span></Label>
                  <Slider
                    min={min} max={max} step={step}
                    value={[val]}
                    onValueChange={([v]) => updateSettings({ [key]: v } as any)}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{min}m</span><span>{max}m</span>
                  </div>
                </div>
              );
            })}

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium mb-1">Current configuration</p>
              <p className="text-xs text-muted-foreground">
                {settings.workDuration}m focus → {settings.shortBreakDuration}m break (×4) → {settings.longBreakDuration}m long break
              </p>
            </div>
          </motion.div>
        </TabsContent>

        {/* ── Appearance ── */}
        <TabsContent value="appearance">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border bg-card p-6 space-y-4"
          >
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value as "light" | "dark" | "system")}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                    theme === t.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent"
                  )}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <span className="text-sm font-medium">{t.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Note: Theme preference is saved. Full dark/light mode requires additional setup in your Next.js config.
            </p>
          </motion.div>
        </TabsContent>

        {/* ── AI Guide ── */}
        <TabsContent value="ai">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border bg-card p-6 space-y-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">AI Study Guide</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  The floating ✨ button gives you access to an AI tutor powered by Claude.
                </p>
              </div>
              <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
            </div>

            <div className="rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200/50 p-4 space-y-2">
              <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">Setup required</p>
              <p className="text-xs text-violet-600 dark:text-violet-400">
                Add your Anthropic API key to your <code className="font-mono bg-violet-100 dark:bg-violet-900 px-1 rounded">.env</code> file:
              </p>
              <code className="block text-xs font-mono bg-violet-100 dark:bg-violet-900 px-3 py-2 rounded-lg text-violet-800 dark:text-violet-200">
                ANTHROPIC_API_KEY=&quot;sk-ant-...&quot;
              </code>
              <p className="text-xs text-violet-600 dark:text-violet-400">
                Get a free key at{" "}
                <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="underline">
                  console.anthropic.com
                </a>
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">What the AI guide can do:</p>
              {[
                "Explain difficult concepts in simple terms",
                "Suggest study strategies and techniques",
                "Help you create flashcard questions",
                "Give motivational support",
                "Answer questions across all subjects",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
