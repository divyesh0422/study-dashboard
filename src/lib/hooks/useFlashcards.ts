// src/lib/hooks/useFlashcards.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FlashcardDeck, Flashcard, ApiResponse, FlashcardDifficulty } from "@/lib/types";
import { FlashcardDeckInput, FlashcardInput } from "@/lib/validations/flashcard.schema";

// ─── Deck hooks ───────────────────────────────────────────────

async function fetchDecks(): Promise<FlashcardDeck[]> {
  const res = await fetch("/api/flashcards");
  if (!res.ok) throw new Error("Failed to fetch decks");
  const json: ApiResponse<FlashcardDeck[]> = await res.json();
  return json.data;
}

async function fetchDeck(id: string): Promise<FlashcardDeck> {
  const res = await fetch(`/api/flashcards/${id}`);
  if (!res.ok) throw new Error("Failed to fetch deck");
  const json: ApiResponse<FlashcardDeck> = await res.json();
  return json.data;
}

async function createDeck(data: FlashcardDeckInput): Promise<FlashcardDeck> {
  const res = await fetch("/api/flashcards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message ?? "Failed"); }
  const json: ApiResponse<FlashcardDeck> = await res.json();
  return json.data;
}

async function deleteDeck(id: string): Promise<void> {
  const res = await fetch(`/api/flashcards/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete deck");
}

// ─── Card hooks ───────────────────────────────────────────────

async function addCard({ deckId, ...data }: FlashcardInput & { deckId: string }): Promise<Flashcard> {
  const res = await fetch(`/api/flashcards/${deckId}/cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add card");
  const json: ApiResponse<Flashcard> = await res.json();
  return json.data;
}

async function updateCardDifficulty({
  cardId, difficulty,
}: { cardId: string; difficulty: FlashcardDifficulty }): Promise<Flashcard> {
  const res = await fetch(`/api/flashcards/cards/${cardId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ difficulty }),
  });
  if (!res.ok) throw new Error("Failed to update card");
  const json: ApiResponse<Flashcard> = await res.json();
  return json.data;
}

async function deleteCard({ cardId }: { cardId: string; deckId: string }): Promise<void> {
  const res = await fetch(`/api/flashcards/cards/${cardId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete card");
}

// ─── Exports ──────────────────────────────────────────────────

export function useDecks() {
  return useQuery({ queryKey: ["flashcard-decks"], queryFn: fetchDecks });
}

export function useDeck(id: string) {
  return useQuery({ queryKey: ["flashcard-deck", id], queryFn: () => fetchDeck(id), enabled: !!id });
}

export function useCreateDeck() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createDeck, onSuccess: () => qc.invalidateQueries({ queryKey: ["flashcard-decks"] }) });
}

export function useDeleteDeck() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteDeck, onSuccess: () => qc.invalidateQueries({ queryKey: ["flashcard-decks"] }) });
}

export function useAddCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addCard,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["flashcard-deck", vars.deckId] });
      qc.invalidateQueries({ queryKey: ["flashcard-decks"] }); // refresh card count in grid
    },
  });
}

export function useUpdateCardDifficulty() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: updateCardDifficulty, onSuccess: () => qc.invalidateQueries({ queryKey: ["flashcard-deck"] }) });
}

export function useDeleteCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCard,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["flashcard-deck", vars.deckId] });
      qc.invalidateQueries({ queryKey: ["flashcard-decks"] }); // refresh count in list
    },
  });
}
