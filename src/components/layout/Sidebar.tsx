// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, CheckSquare, FileText,
  Timer, BarChart3, Layers, Sparkles, Settings,
  ChevronLeft, ChevronRight, LogOut, GraduationCap, X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUIStore } from "@/store/uiStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { href: "/subjects",  label: "Subjects",   icon: BookOpen        },
  { href: "/tasks",     label: "Tasks",      icon: CheckSquare     },
  { href: "/notes",     label: "Notes",      icon: FileText        },
  { href: "/timer",     label: "Study Timer",icon: Timer           },
  { href: "/tools",     label: "Study Tools",icon: Layers          },
  { href: "/analytics", label: "Analytics",  icon: BarChart3       },
  { href: "/ai-guide",  label: "AI Guide",   icon: Sparkles        },
];

const BOTTOM_ITEMS = [
  { href: "/settings", label: "Settings", icon: Settings },
];

// Items shown in mobile bottom tab bar (most used 5)
const MOBILE_TABS = [
  { href: "/dashboard", label: "Home",     icon: LayoutDashboard },
  { href: "/tasks",     label: "Tasks",    icon: CheckSquare     },
  { href: "/timer",     label: "Timer",    icon: Timer           },
  { href: "/notes",     label: "Notes",    icon: FileText        },
  { href: "/ai-guide",  label: "AI Guide", icon: Sparkles        },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();

  const user     = session?.user;
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() ?? "U";

  function NavItem({
    href, label, icon: Icon, onClick,
  }: { href: string; label: string; icon: typeof LayoutDashboard; onClick?: () => void }) {
    const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
    const isAI     = href === "/ai-guide";

    return (
      <Link href={href} onClick={onClick}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
            isActive
              ? isAI
                ? "gradient-purple text-white shadow-sm"
                : "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Icon className={cn("h-4 w-4 shrink-0", isAI && !isActive && "text-violet-500")} />
          <AnimatePresence>
            {(!sidebarCollapsed) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
          {isAI && !sidebarCollapsed && !isActive && (
            <span className="ml-auto text-[9px] font-bold bg-violet-100 text-violet-600 rounded-full px-1.5 py-0.5">
              AI
            </span>
          )}
        </motion.div>
      </Link>
    );
  }

  function MobileNavItem({
    href, label, icon: Icon,
  }: { href: string; label: string; icon: typeof LayoutDashboard }) {
    const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
    const isAI     = href === "/ai-guide";
    return (
      <Link href={href} onClick={() => setMobileSidebarOpen(false)}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
            isActive
              ? isAI
                ? "gradient-purple text-white shadow-sm"
                : "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Icon className={cn("h-4 w-4 shrink-0", isAI && !isActive && "text-violet-500")} />
          <span>{label}</span>
          {isAI && !isActive && (
            <span className="ml-auto text-[9px] font-bold bg-violet-100 text-violet-600 rounded-full px-1.5 py-0.5">
              AI
            </span>
          )}
        </motion.div>
      </Link>
    );
  }

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 240 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative hidden md:flex flex-col h-full border-r bg-card shrink-0 overflow-hidden"
      >
        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-[72px] z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-md hover:bg-accent transition-colors"
        >
          {sidebarCollapsed
            ? <ChevronRight className="h-3.5 w-3.5" />
            : <ChevronLeft  className="h-3.5 w-3.5" />}
        </button>

        {/* Logo */}
        <div className="flex h-16 items-center px-4 border-b gap-3 shrink-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-purple">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-bold text-sm truncate"
              >
                StudyDash
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="border-t px-3 py-3 space-y-1">
          {BOTTOM_ITEMS.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>

        {/* User + Sign out */}
        <div className="border-t px-3 py-3">
          <div className={cn(
            "flex items-center gap-3 rounded-xl px-2 py-2",
            sidebarCollapsed ? "justify-center" : ""
          )}>
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={user?.image ?? ""} />
              <AvatarFallback className="text-xs gradient-purple text-white">{initials}</AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-xs font-medium truncate">{user?.name ?? "Student"}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
            {!sidebarCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* ── Mobile drawer overlay ─────────────────────────── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
            />
            {/* Drawer panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col bg-card border-r shadow-2xl md:hidden overflow-hidden"
            >
              {/* Logo + close */}
              <div className="flex h-16 items-center px-4 border-b gap-3 shrink-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-purple">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-sm flex-1">StudyDash</span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <MobileNavItem key={item.href} {...item} />
                ))}
              </nav>

              <div className="border-t px-3 py-3 space-y-1">
                {BOTTOM_ITEMS.map((item) => (
                  <MobileNavItem key={item.href} {...item} />
                ))}
              </div>

              {/* User */}
              <div className="border-t px-3 py-3">
                <div className="flex items-center gap-3 rounded-xl px-2 py-2">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={user?.image ?? ""} />
                    <AvatarFallback className="text-xs gradient-purple text-white">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{user?.name ?? "Student"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    title="Sign out"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile bottom tab bar ─────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex md:hidden items-center bg-card/95 backdrop-blur border-t shadow-lg safe-area-bottom">
        {MOBILE_TABS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          const isAI = href === "/ai-guide";
          return (
            <Link key={href} href={href} className="flex-1">
              <div className={cn(
                "flex flex-col items-center gap-0.5 py-2 px-1 transition-colors",
                isActive
                  ? isAI ? "text-violet-600" : "text-primary"
                  : "text-muted-foreground"
              )}>
                <Icon className={cn("h-5 w-5", isActive && "scale-110 transition-transform")} />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
