// src/components/subjects/SubjectCard.tsx
"use client";

import { motion } from "framer-motion";
import { BookOpen, Clock, FileText, CheckSquare, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Subject } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface SubjectCardProps {
  subject: Subject;
  index?: number;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

export function SubjectCard({ subject, index = 0, onEdit, onDelete }: SubjectCardProps) {
  const { stats } = subject;
  const progress = stats && stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -2 }}
      className="group relative rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Color stripe at top */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ backgroundColor: subject.color }}
      />

      <div className="flex items-start justify-between mt-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${subject.color}20` }}
          >
            <BookOpen className="h-5 w-5" style={{ color: subject.color }} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold truncate">{subject.name}</h3>
            {subject.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{subject.description}</p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(subject)}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(subject)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-muted/50 px-2 py-2">
            <CheckSquare className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs font-semibold">{stats.completedTasks}/{stats.totalTasks}</p>
            <p className="text-[10px] text-muted-foreground">Tasks</p>
          </div>
          <div className="rounded-lg bg-muted/50 px-2 py-2">
            <FileText className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs font-semibold">{stats.totalNotes}</p>
            <p className="text-[10px] text-muted-foreground">Notes</p>
          </div>
          <div className="rounded-lg bg-muted/50 px-2 py-2">
            <Clock className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs font-semibold">{stats.totalStudyHours}h</p>
            <p className="text-[10px] text-muted-foreground">Studied</p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className="text-xs font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>
    </motion.div>
  );
}
