// src/lib/hooks/useSubjects.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Subject, ApiResponse } from "@/lib/types";
import { SubjectInput, UpdateSubjectInput } from "@/lib/validations/subject.schema";

const QUERY_KEY = ["subjects"] as const;

async function fetchSubjects(): Promise<Subject[]> {
  const res = await fetch("/api/subjects");
  if (!res.ok) throw new Error("Failed to fetch subjects");
  const json: ApiResponse<Subject[]> = await res.json();
  return json.data;
}

async function createSubject(data: SubjectInput): Promise<Subject> {
  const res = await fetch("/api/subjects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Failed to create subject");
  }
  const json: ApiResponse<Subject> = await res.json();
  return json.data;
}

async function updateSubject({ id, ...data }: UpdateSubjectInput & { id: string }): Promise<Subject> {
  const res = await fetch(`/api/subjects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update subject");
  const json: ApiResponse<Subject> = await res.json();
  return json.data;
}

async function deleteSubject(id: string): Promise<void> {
  const res = await fetch(`/api/subjects/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete subject");
}

export function useSubjects() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: fetchSubjects });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSubject,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateSubject,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}
