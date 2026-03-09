// src/lib/hooks/useAnalytics.ts
import { useQuery } from "@tanstack/react-query";
import { Analytics, ApiResponse } from "@/lib/types";

async function fetchAnalytics(days = 30): Promise<Analytics> {
  const res = await fetch(`/api/analytics?days=${days}`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  const json: ApiResponse<Analytics> = await res.json();
  return json.data;
}

export function useAnalytics(days = 30) {
  return useQuery({
    queryKey: ["analytics", days],
    queryFn:  () => fetchAnalytics(days),
    staleTime: 0, // always refetch when invalidated (e.g. after session ends)
  });
}
