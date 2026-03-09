// src/app/(dashboard)/subjects/page.tsx
"use client";

import { useState } from "react";
import { Plus, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject } from "@/lib/hooks/useSubjects";
import { Subject } from "@/lib/types";
import { SubjectCard } from "@/components/subjects/SubjectCard";
import { SubjectForm } from "@/components/subjects/SubjectForm";
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
import { toast } from "sonner";
import { SubjectInput } from "@/lib/validations/subject.schema";

export default function SubjectsPage() {
  const { data: subjects, isLoading } = useSubjects();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

  async function handleCreate(data: SubjectInput) {
    await createSubject.mutateAsync(data);
    toast.success("Subject created!");
    setIsCreateOpen(false);
  }

  async function handleUpdate(data: SubjectInput) {
    if (!editingSubject) return;
    await updateSubject.mutateAsync({ id: editingSubject.id, ...data });
    toast.success("Subject updated!");
    setEditingSubject(null);
  }

  async function handleDelete() {
    if (!deletingSubject) return;
    await deleteSubject.mutateAsync(deletingSubject.id);
    toast.success("Subject deleted.");
    setDeletingSubject(null);
  }

  if (isLoading) return <PageLoader />;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <PageHeader
        title="Subjects"
        description="Organize your studies by subject"
        action={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Subject
          </Button>
        }
      />

      {subjects?.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No subjects yet"
          description="Create your first subject to start organizing your study sessions."
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Subject
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {subjects?.map((subject, i) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                index={i}
                onEdit={setEditingSubject}
                onDelete={setDeletingSubject}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Subject</DialogTitle>
          </DialogHeader>
          <SubjectForm
            onSubmit={handleCreate}
            isPending={createSubject.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingSubject} onOpenChange={() => setEditingSubject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
          </DialogHeader>
          {editingSubject && (
            <SubjectForm
              key={editingSubject.id}
              defaultValues={editingSubject}
              onSubmit={handleUpdate}
              isPending={updateSubject.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deletingSubject} onOpenChange={() => setDeletingSubject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deletingSubject?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subject. Tasks and notes linked to this subject will be unlinked but not deleted.
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
