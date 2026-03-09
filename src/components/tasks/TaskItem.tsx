// src/components/tasks/TaskItem.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Calendar, Trash2, Pencil } from "lucide-react";
import { Task, TaskPriority } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { isDueOverdue } from "@/lib/utils/date";

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const priorityConfig: Record<TaskPriority, { label: string; class: string }> = {
  LOW:    { label: "Low",    class: "bg-slate-100 text-slate-600 border-slate-200" },
  MEDIUM: { label: "Medium", class: "bg-blue-100 text-blue-600 border-blue-200" },
  HIGH:   { label: "High",   class: "bg-orange-100 text-orange-600 border-orange-200" },
  URGENT: { label: "Urgent", class: "bg-red-100 text-red-700 border-red-200" },
};

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const isCompleted = task.status === "COMPLETED";
  const isOverdue = isDueOverdue(task.dueDate);
  const priority = priorityConfig[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={cn(
        "group flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md",
        isCompleted && "opacity-60"
      )}
    >
      <Checkbox
        checked={isCompleted}
        onCheckedChange={() => onToggle(task)}
        className="mt-0.5 shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start gap-2">
          <p className={cn("font-medium leading-snug", isCompleted && "line-through text-muted-foreground")}>
            {task.title}
          </p>
          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4 shrink-0", priority.class)}>
            {priority.label}
          </Badge>
          {task.subject && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
              <span
                className="mr-1 h-1.5 w-1.5 rounded-full inline-block"
                style={{ backgroundColor: task.subject.color }}
              />
              {task.subject.name}
            </Badge>
          )}
        </div>

        {task.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{task.description}</p>
        )}

        {task.dueDate && (
          <div className={cn("mt-2 flex items-center gap-1 text-xs", isOverdue ? "text-destructive" : "text-muted-foreground")}>
            <Calendar className="h-3 w-3" />
            <span>{format(parseISO(task.dueDate), "MMM d, yyyy")}</span>
            {isOverdue && !isCompleted && <span className="font-medium">(Overdue)</span>}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(task)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(task)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}
