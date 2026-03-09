// src/app/(dashboard)/tasks/page.tsx
"use client";

import { useState } from "react";
import { Plus, CheckSquare } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  useTasks, useCreateTask, useUpdateTask,
  useToggleTask, useDeleteTask,
} from "@/lib/hooks/useTasks";
import { useSubjects } from "@/lib/hooks/useSubjects";
import { Task, TaskFilters, TaskStatus } from "@/lib/types";
import { TaskItem } from "@/components/tasks/TaskItem";
import { TaskForm } from "@/components/tasks/TaskForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TaskInput } from "@/lib/validations/task.schema";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

const STATUS_TABS: { value: TaskStatus | "ALL"; label: string }[] = [
  { value: "ALL",        label: "All" },
  { value: "PENDING",    label: "Pending" },
  { value: "IN_PROGRESS",label: "In Progress" },
  { value: "COMPLETED",  label: "Done" },
];

export default function TasksPage() {
  const [filters, setFilters] = useState<TaskFilters>({});
  const [statusTab, setStatusTab] = useState<TaskStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const activeFilters: TaskFilters = {
    ...filters,
    ...(statusTab !== "ALL" && { status: statusTab }),
    ...(search && { search }),
  };

  const { data: tasks, isLoading } = useTasks(activeFilters);
  const { data: subjects } = useSubjects();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();

  async function handleCreate(data: TaskInput) {
    await createTask.mutateAsync(data);
    toast.success("Task created!");
    setIsCreateOpen(false);
  }

  async function handleUpdate(data: TaskInput) {
    if (!editingTask) return;
    await updateTask.mutateAsync({ id: editingTask.id, ...data });
    toast.success("Task updated!");
    setEditingTask(null);
  }

  async function handleToggle(task: Task) {
    const newStatus: TaskStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    toggleTask.mutate({ id: task.id, status: newStatus });
  }

  async function handleDelete() {
    if (!deletingTask) return;
    await deleteTask.mutateAsync(deletingTask.id);
    toast.success("Task deleted.");
    setDeletingTask(null);
  }

  if (isLoading) return <PageLoader />;

  return (
    <div className="p-4 lg:p-8 space-y-6 animate-fade-in">
      <PageHeader
        title="Tasks"
        description="Track and manage your study tasks"
        action={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Task
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3">
        {/* Status Tabs */}
        <div className="flex items-center rounded-lg border border-border bg-muted/30 p-1 gap-1 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusTab(tab.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                statusTab === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[140px]"
          />

          <Select
            value={filters.subjectId ?? "none"}
            onValueChange={(v) => setFilters((p) => ({ ...p, subjectId: v === "none" ? undefined : v }))}
          >
            <SelectTrigger className="w-36 shrink-0">
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All subjects</SelectItem>
              {subjects?.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.priority ?? "none"}
            onValueChange={(v) => setFilters((p) => ({ ...p, priority: (v === "none" ? undefined : v) as any }))}
          >
            <SelectTrigger className="w-32 shrink-0">
              <SelectValue placeholder="Any priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Any priority</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task List */}
      {tasks?.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description="Create a task to start tracking your study work."
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Task
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {tasks?.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onEdit={setEditingTask}
                onDelete={setDeletingTask}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
          </DialogHeader>
          <TaskForm subjects={subjects} onSubmit={handleCreate} isPending={createTask.isPending} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <TaskForm
              key={editingTask.id}
              defaultValues={editingTask}
              subjects={subjects}
              onSubmit={handleUpdate}
              isPending={updateTask.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!deletingTask} onOpenChange={() => setDeletingTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deletingTask?.title}&quot; will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
