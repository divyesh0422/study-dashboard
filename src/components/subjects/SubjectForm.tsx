// src/components/subjects/SubjectForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subjectSchema, SubjectInput } from "@/lib/validations/subject.schema";
import { Subject } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#06b6d4", "#64748b", "#6b7280",
];

interface SubjectFormProps {
  defaultValues?: Subject;
  onSubmit: (data: SubjectInput) => void;
  isPending?: boolean;
}

export function SubjectForm({ defaultValues, onSubmit, isPending }: SubjectFormProps) {
  const form = useForm<SubjectInput>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      color: defaultValues?.color ?? "#6366f1",
      icon: defaultValues?.icon ?? "BookOpen",
    },
  });

  const selectedColor = form.watch("color");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Mathematics, Physics..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What topics does this subject cover?"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <div className="flex flex-wrap gap-2 mt-1">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => field.onChange(color)}
                    className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor: selectedColor === color ? color : "transparent",
                      outline: selectedColor === color ? `2px solid ${color}` : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {defaultValues ? "Update Subject" : "Create Subject"}
        </Button>
      </form>
    </Form>
  );
}
