// src/lib/hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task, TaskFilters, ApiResponse, TaskStatus } from "@/lib/types";
import { TaskInput, UpdateTaskInput } from "@/lib/validations/task.schema";

const QUERY_KEY = (filters?: TaskFilters) =>
  filters ? (["tasks", filters] as const) : (["tasks"] as const);

async function fetchTasks(filters?: TaskFilters): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.priority) params.set("priority", filters.priority);
  if (filters?.subjectId) params.set("subjectId", filters.subjectId);
  if (filters?.search) params.set("search", filters.search);

  const res = await fetch(`/api/tasks?${params}`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  const json: ApiResponse<Task[]> = await res.json();
  return json.data;
}

async function createTask(data: TaskInput): Promise<Task> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Failed to create task");
  }
  const json: ApiResponse<Task> = await res.json();
  return json.data;
}

async function updateTask({ id, ...data }: UpdateTaskInput & { id: string }): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update task");
  const json: ApiResponse<Task> = await res.json();
  return json.data;
}

async function toggleTask({ id, status }: { id: string; status: TaskStatus }): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to toggle task");
  const json: ApiResponse<Task> = await res.json();
  return json.data;
}

async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete task");
}

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: QUERY_KEY(filters),
    queryFn: () => fetchTasks(filters),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleTask,
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });
      const previous = qc.getQueriesData({ queryKey: ["tasks"] });
      qc.setQueriesData({ queryKey: ["tasks"] }, (old: Task[] | undefined) =>
        old?.map((t) =>
          t.id === id ? { ...t, status, completedAt: status === "COMPLETED" ? new Date().toISOString() : null } : t
        )
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        ctx.previous.forEach(([key, data]) => qc.setQueryData(key, data));
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
