// src/app/(dashboard)/notes/page.tsx
"use client";

import { useState } from "react";
import { Plus, FileText, Pin, Trash2, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatRelative } from "@/lib/utils/date";
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from "@/lib/hooks/useNotes";
import { useSubjects } from "@/lib/hooks/useSubjects";
import { Note, NoteFilters } from "@/lib/types";
import { NoteInput, noteSchema } from "@/lib/validations/note.schema";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils/cn";

function NoteCard({ note, onEdit, onDelete }: { note: Note; onEdit: (n: Note) => void; onDelete: (n: Note) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="group relative rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={() => onEdit(note)}
    >
      {note.isPinned && (
        <Pin className="absolute right-3 top-3 h-3.5 w-3.5 text-primary" />
      )}
      <h3 className="font-semibold leading-snug pr-6 mb-2">{note.title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>

      {note.subject && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: note.subject.color }} />
          <span className="text-xs text-muted-foreground">{note.subject.name}</span>
        </div>
      )}

      {note.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{formatRelative(note.updatedAt)}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(note)}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => onDelete(note)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function NoteFormDialog({
  open,
  onOpenChange,
  defaultValues,
  subjects,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultValues?: Note;
  subjects?: any[];
  onSubmit: (data: NoteInput) => void;
  isPending?: boolean;
}) {
  const form = useForm<NoteInput>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      content: defaultValues?.content ?? "",
      tags: defaultValues?.tags ?? [],
      isPinned: defaultValues?.isPinned ?? false,
      subjectId: defaultValues?.subjectId ?? undefined,
    },
  });

  const [tagInput, setTagInput] = useState("");
  const tags = form.watch("tags");

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      form.setValue("tags", [...tags, t]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    form.setValue("tags", tags.filter((t) => t !== tag));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{defaultValues ? "Edit Note" : "New Note"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Note title..." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject (optional)</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v === "none" ? undefined : v)} defaultValue={field.value ?? "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="No subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No subject</SelectItem>
                      {subjects?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write your notes here..." rows={6} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Tags */}
            <div>
              <FormLabel>Tags</FormLabel>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addTag}>Add</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-destructive/10 hover:text-destructive" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {defaultValues ? "Update Note" : "Create Note"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function NotesPage() {
  const [filters, setFilters] = useState<NoteFilters>({});
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const activeFilters: NoteFilters = { ...filters, ...(search && { search }) };
  const { data: notes, isLoading } = useNotes(activeFilters);
  const { data: subjects } = useSubjects();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  async function handleCreate(data: NoteInput) {
    await createNote.mutateAsync(data);
    toast.success("Note created!");
    setIsCreateOpen(false);
  }

  async function handleUpdate(data: NoteInput) {
    if (!editingNote) return;
    await updateNote.mutateAsync({ id: editingNote.id, ...data });
    toast.success("Note updated!");
    setEditingNote(null);
  }

  if (isLoading) return <PageLoader />;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <PageHeader
        title="Notes"
        description="Your study notes and summaries"
        action={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Note
          </Button>
        }
      />

      <div className="flex gap-3">
        <Input
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={filters.subjectId ?? "none"}
          onValueChange={(v) => setFilters((p) => ({ ...p, subjectId: v === "none" ? undefined : v }))}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">All subjects</SelectItem>
            {subjects?.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {notes?.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No notes yet"
          description="Start capturing your study notes and key insights."
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Note
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {notes?.map((note) => (
              <NoteCard key={note.id} note={note} onEdit={setEditingNote} onDelete={(n) => deleteNote.mutate(n.id)} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <NoteFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        subjects={subjects}
        onSubmit={handleCreate}
        isPending={createNote.isPending}
      />

      <NoteFormDialog
        open={!!editingNote}
        onOpenChange={(v) => !v && setEditingNote(null)}
        defaultValues={editingNote ?? undefined}
        key={editingNote?.id ?? "create-note"}
        subjects={subjects}
        onSubmit={handleUpdate}
        isPending={updateNote.isPending}
      />
    </div>
  );
}
