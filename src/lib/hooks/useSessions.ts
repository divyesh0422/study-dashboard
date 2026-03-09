// src/lib/hooks/useSessions.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StudySession, ApiResponse } from "@/lib/types";
import { StartSessionInput } from "@/lib/validations/session.schema";

async function fetchSessions(limit = 20): Promise<StudySession[]> {
  const res = await fetch(`/api/sessions?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch sessions");
  const json: ApiResponse<StudySession[]> = await res.json();
  return json.data;
}

async function startSession(data: StartSessionInput): Promise<StudySession> {
  const res = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to start session");
  const json: ApiResponse<StudySession> = await res.json();
  return json.data;
}

async function endSession({ id, completed }: { id: string; completed: boolean }): Promise<StudySession> {
  const res = await fetch(`/api/sessions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) throw new Error("Failed to end session");
  const json: ApiResponse<StudySession> = await res.json();
  return json.data;
}

export function useSessions(limit = 20) {
  return useQuery({
    queryKey: ["sessions", limit],
    queryFn: () => fetchSessions(limit),
  });
}

export function useStartSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: startSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function useEndSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: endSession,
    onSuccess: () => {
      // Invalidate all queries that start with these keys (partial match)
      qc.invalidateQueries({ queryKey: ["sessions"] });
      qc.invalidateQueries({ queryKey: ["analytics"] }); // matches ["analytics", 30] etc.
    },
  });
}
