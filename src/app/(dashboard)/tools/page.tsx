// src/app/(dashboard)/tools/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus, BookMarked, Layers, Trash2,
  PlayCircle, Loader2, Search,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FlashcardStudyMode } from "@/components/tools/FlashcardStudyMode";
import {
  useDecks, useCreateDeck, useDeleteDeck,
  useDeck, useAddCard, useDeleteCard,
} from "@/lib/hooks/useFlashcards";
import { useSubjects } from "@/lib/hooks/useSubjects";
import { FlashcardDeck } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

const COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#f43f5e",
  "#f97316","#eab308","#22c55e","#14b8a6","#3b82f6",
];

export default function ToolsPage() {
  const { data: decks = [], isLoading } = useDecks();
  const { data: subjects = [] }         = useSubjects();
  const createDeck  = useCreateDeck();
  const deleteDeck  = useDeleteDeck();

  // Create deck form
  const [showCreate, setShowCreate] = useState(false);
  const [deckTitle, setDeckTitle]   = useState("");
  const [deckDesc,  setDeckDesc]    = useState("");
  const [deckColor, setDeckColor]   = useState(COLORS[0]);
  const [deckSub,   setDeckSub]     = useState("");

  // Study uses ID — full deck (with cards) is fetched in StudyModeLoader
  const [studyDeckId,  setStudyDeckId]  = useState<string | null>(null);
  const [manageDeckId, setManageDeckId] = useState<string | null>(null);
  const [search, setSearch]             = useState("");

  const filtered = decks.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate() {
    if (!deckTitle.trim()) return;
    try {
      await createDeck.mutateAsync({
        title:       deckTitle.trim(),
        description: deckDesc.trim() || undefined,
        color:       deckColor,
        subjectId:   deckSub || null,
      });
      toast.success("Deck created!");
      setShowCreate(false);
      setDeckTitle(""); setDeckDesc(""); setDeckColor(COLORS[0]); setDeckSub("");
    } catch { toast.error("Failed to create deck"); }
  }

  async function handleDelete(id: string) {
    try {
      await deleteDeck.mutateAsync(id);
      toast.success("Deck deleted");
    } catch { toast.error("Failed to delete deck"); }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Study mode: fetch full deck (with cards) before rendering ──
  if (studyDeckId) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <StudyModeLoader deckId={studyDeckId} onExit={() => setStudyDeckId(null)} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <PageHeader
        title="Study Tools"
        description="Flashcard decks to master your subjects"
        action={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Deck
          </Button>
        }
      />

      {/* Search */}
      {decks.length > 0 && (
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search decks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Decks grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="No flashcard decks yet"
          description="Create your first deck to start memorising your subject material."
          action={<Button onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" />Create Deck</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((deck, i) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              index={i}
              onStudy={() => setStudyDeckId(deck.id)}
              onManage={() => setManageDeckId(deck.id)}
              onDelete={() => handleDelete(deck.id)}
            />
          ))}
        </div>
      )}

      {/* Create Deck Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <h2 className="text-lg font-semibold mb-4">New Flashcard Deck</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                value={deckTitle}
                onChange={(e) => setDeckTitle(e.target.value)}
                placeholder="e.g. Chapter 5 Vocabulary"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={deckDesc}
                onChange={(e) => setDeckDesc(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <select
                value={deckSub}
                onChange={(e) => setDeckSub(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">No subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setDeckColor(c)}
                    style={{ background: c }}
                    className={cn(
                      "h-7 w-7 rounded-full transition-all",
                      deckColor === c ? "ring-2 ring-offset-2 ring-primary scale-110" : "opacity-70 hover:opacity-100"
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button
                className="flex-1"
                onClick={handleCreate}
                disabled={!deckTitle.trim() || createDeck.isPending}
              >
                {createDeck.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Cards Dialog */}
      {manageDeckId && (
        <ManageCardsDialog
          deckId={manageDeckId}
          onClose={() => setManageDeckId(null)}
        />
      )}
    </div>
  );
}

// ── StudyModeLoader: fetches full deck with cards, then renders study mode ──

function StudyModeLoader({ deckId, onExit }: { deckId: string; onExit: () => void }) {
  const { data: deck, isLoading, isError } = useDeck(deckId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading cards…</p>
      </div>
    );
  }

  if (isError || !deck) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <p className="text-muted-foreground">Could not load deck. Please try again.</p>
        <Button variant="outline" onClick={onExit}>Go Back</Button>
      </div>
    );
  }

  const cards = deck.flashcards ?? [];

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <p className="font-medium">{deck.title}</p>
        <p className="text-sm text-muted-foreground">This deck has no cards yet. Add some cards first.</p>
        <Button variant="outline" onClick={onExit}>Go Back</Button>
      </div>
    );
  }

  return (
    <FlashcardStudyMode
      cards={cards}
      deckTitle={deck.title}
      onExit={onExit}
    />
  );
}

// ── Deck Card ─────────────────────────────────────────────────

function DeckCard({
  deck, index, onStudy, onManage, onDelete,
}: {
  deck: FlashcardDeck; index: number;
  onStudy: () => void; onManage: () => void; onDelete: () => void;
}) {
  // _count.flashcards is always present from the list API
  const count = deck._count?.flashcards ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative rounded-2xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Color stripe */}
      <div className="h-1.5 w-full" style={{ background: deck.color }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{deck.title}</h3>
            {deck.description && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{deck.description}</p>
            )}
          </div>
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="text-xs gap-1">
            <Layers className="h-3 w-3" /> {count} card{count !== 1 ? "s" : ""}
          </Badge>
          {deck.subject && (
            <Badge variant="outline" className="text-xs" style={{ borderColor: deck.subject.color + "60" }}>
              {deck.subject.name}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 gap-1.5"
            disabled={count === 0}
            onClick={onStudy}
            title={count === 0 ? "Add cards before studying" : undefined}
          >
            <PlayCircle className="h-3.5 w-3.5" /> Study
          </Button>
          <Button size="sm" variant="outline" onClick={onManage}>
            Edit
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Manage Cards Dialog ───────────────────────────────────────

async function ManageCardsDialog({ deckId, onClose }: { deckId: string; onClose: () => void }) {
  const { data: deck, isLoading } = useDeck(deckId);
  const addCard    = useAddCard();
  const deleteCard = useDeleteCard();

  const [front, setFront] = useState("");
  const [back,  setBack]  = useState("");

 if (!front.trim() || !back.trim()) return;

try {
  await addCard.mutateAsync({
    deckId,
    front: front.trim(),
    back: back.trim(),
    difficulty: "UNRATED"
  });

  setFront("");
  setBack("");

  toast.success("Card added!");
} catch {
  toast.error("Failed to add card");
}

  async function handleAdd(event: React.MouseEvent<HTMLButtonElement>) {
  event.preventDefault();

  if (!front.trim() || !back.trim()) return;

  try {
    await addCard.mutateAsync({
      deckId,
      front: front.trim(),
      back: back.trim(),
      difficulty: "UNRATED"
    });

    setFront("");
    setBack("");
  } catch (error) {
    console.error("Failed to add card", error);
  }
}

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-1">{deck?.title ?? "Manage Cards"}</h2>
        <p className="text-sm text-muted-foreground mb-4">{deck?.flashcards?.length ?? 0} cards</p>

        {/* Add card form */}
        <div className="rounded-xl border bg-muted/30 p-4 space-y-3 mb-4">
          <p className="text-sm font-medium">Add new card</p>
          <div className="space-y-2">
            <Label className="text-xs">Front (Question)</Label>
            <Input value={front} onChange={(e) => setFront(e.target.value)} placeholder="e.g. What is photosynthesis?" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Back (Answer)</Label>
            <Input value={back} onChange={(e) => setBack(e.target.value)} placeholder="e.g. Process by which plants convert light…" />
          </div>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!front.trim() || !back.trim() || addCard.isPending}
          >
            {addCard.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            Add Card
          </Button>
        </div>

        {/* Cards list */}
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : deck?.flashcards?.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">No cards yet. Add your first one above.</p>
        ) : (
          <div className="space-y-2">
            {deck?.flashcards?.map((card) => (
              <div key={card.id} className="flex items-start gap-3 rounded-lg border bg-card p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{card.front}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{card.back}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] shrink-0",
                    card.difficulty === "EASY"   && "border-green-300  text-green-600",
                    card.difficulty === "MEDIUM" && "border-yellow-300 text-yellow-600",
                    card.difficulty === "HARD"   && "border-red-300    text-red-600",
                  )}
                >
                  {card.difficulty}
                </Badge>
                <button
                  onClick={() => deleteCard.mutate({ cardId: card.id, deckId })}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


