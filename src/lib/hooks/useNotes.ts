// src/lib/hooks/useNotes.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Note, NoteFilters, ApiResponse } from "@/lib/types";
import { NoteInput, UpdateNoteInput } from "@/lib/validations/note.schema";

const QUERY_KEY = (filters?: NoteFilters) =>
  filters ? (["notes", filters] as const) : (["notes"] as const);

async function fetchNotes(filters?: NoteFilters): Promise<Note[]> {
  const params = new URLSearchParams();
  if (filters?.subjectId) params.set("subjectId", filters.subjectId);
  if (filters?.search) params.set("search", filters.search);
  if (filters?.pinned) params.set("pinned", "true");

  const res = await fetch(`/api/notes?${params}`);
  if (!res.ok) throw new Error("Failed to fetch notes");
  const json: ApiResponse<Note[]> = await res.json();
  return json.data;
}

async function createNote(data: NoteInput): Promise<Note> {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create note");
  const json: ApiResponse<Note> = await res.json();
  return json.data;
}

async function updateNote({ id, ...data }: UpdateNoteInput & { id: string }): Promise<Note> {
  const res = await fetch(`/api/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update note");
  const json: ApiResponse<Note> = await res.json();
  return json.data;
}

async function deleteNote(id: string): Promise<void> {
  const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete note");
}

export function useNotes(filters?: NoteFilters) {
  return useQuery({
    queryKey: QUERY_KEY(filters),
    queryFn: () => fetchNotes(filters),
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createNote,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateNote,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}
