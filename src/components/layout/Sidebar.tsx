// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, CheckSquare, FileText,
  Timer, BarChart3, Layers, Sparkles, Settings,
  ChevronLeft, ChevronRight, LogOut, GraduationCap,
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

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const user     = session?.user;
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() ?? "U";

  function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: typeof LayoutDashboard }) {
    const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
    const isAI     = href === "/ai-guide";

    return (
      <Link href={href}>
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
            {!sidebarCollapsed && (
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
          {/* AI badge */}
          {isAI && !sidebarCollapsed && !isActive && (
            <span className="ml-auto text-[9px] font-bold bg-violet-100 text-violet-600 rounded-full px-1.5 py-0.5">
              AI
            </span>
          )}
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-full border-r bg-card shrink-0 overflow-hidden"
    >
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

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-[72px] z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-md hover:bg-accent transition-colors"
      >
        {sidebarCollapsed
          ? <ChevronRight className="h-3.5 w-3.5" />
          : <ChevronLeft  className="h-3.5 w-3.5" />}
      </button>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      {/* Divider + Bottom nav */}
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
  );
}
