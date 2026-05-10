"use client";

import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Bold,
  CheckCircle2,
  Circle,
  ImagePlus,
  Italic,
  List,
  Loader2,
  NotebookPen,
  PackageCheck,
  Pin,
  Plus,
  RefreshCcw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateNote,
  useCreatePackingItem,
  useDeleteNote,
  useDeletePackingItem,
  useNotes,
  usePackingItems,
  useTrips,
  useUpdateNote,
  traveloopApi,
  traveloopKeys,
} from "@/features/traveloop";
import type { NoteEntry, PackingItem, Trip } from "@/features/traveloop";

const PACKING_CATEGORIES = [
  { value: "CLOTHING", label: "Clothing" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "DOCUMENTS", label: "Documents" },
  { value: "TOILETRIES", label: "Toiletries" },
  { value: "ACCESSORIES", label: "Accessories" },
  { value: "MEDICAL", label: "Medical" },
  { value: "CUSTOM", label: "Custom" },
  { value: "OTHER", label: "Other" },
] as const;

const packingSchema = z.object({
  label: z.string().trim().min(1, "Name the item.").max(160),
  category: z.string().min(1),
  customCategory: z.string().trim().max(80).optional(),
  quantity: z.coerce.number().int().min(1).max(999),
}).superRefine((value, ctx) => {
  if (value.category === "CUSTOM" && !value.customCategory?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["customCategory"], message: "Name the custom category." });
  }
});

const noteSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(160),
  body: z.string().trim().min(1, "Write a note first.").max(10000),
  journalDate: z.string().optional(),
  imageUrl: z.union([z.string().url("Use a valid image URL."), z.literal("")]).optional(),
  pinned: z.boolean(),
});

type PackingFormValues = z.infer<typeof packingSchema>;
type NoteFormValues = z.infer<typeof noteSchema>;

function packedValue(item: PackingItem) {
  return item.packed ?? item.isPacked ?? false;
}

function categoryLabel(item: Pick<PackingItem, "category" | "customCategory">) {
  if (item.category === "CUSTOM" && item.customCategory) return item.customCategory;
  return PACKING_CATEGORIES.find((category) => category.value === item.category)?.label ?? item.category ?? "Other";
}

function selectTripLabel(trip: Trip) {
  const start = trip.startsAt ?? trip.startDate;
  return start ? `${trip.title} · ${format(new Date(start), "MMM d, yyyy")}` : trip.title;
}

function firstTripId(trips?: Trip[]) {
  return trips?.[0]?.id ?? "";
}

function tripDayLabel(trip: Trip | undefined, value?: string | null) {
  if (!trip || !value) return "Unscheduled";
  const start = trip.startsAt ?? trip.startDate;
  if (!start) return format(new Date(value), "MMM d, yyyy");
  const day = Math.max(1, Math.round((new Date(value).getTime() - new Date(start).getTime()) / 86_400_000) + 1);
  return `Day ${day} · ${format(new Date(value), "MMM d")}`;
}

function TripSelect({
  trips,
  value,
  onChange,
  label,
}: {
  trips: Trip[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={`${label}-trip`}>{label}</Label>
      <select
        id={`${label}-trip`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-input bg-white px-3 text-sm font-semibold outline-none transition focus:ring-2 focus:ring-ring"
      >
        {trips.map((trip) => (
          <option value={trip.id} key={trip.id}>
            {selectTripLabel(trip)}
          </option>
        ))}
      </select>
    </div>
  );
}

function LoadingPanels() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton className="h-72 rounded-lg" key={index} />
      ))}
    </div>
  );
}

export function PackingWorkspace() {
  const queryClient = useQueryClient();
  const { data: trips, isLoading: tripsLoading, error: tripsError } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState("");
  const activeTripId = selectedTripId || firstTripId(trips);
  const { data: items = [], isLoading: itemsLoading, error: itemsError } = usePackingItems(activeTripId);
  const createItem = useCreatePackingItem(activeTripId);
  const deleteItem = useDeletePackingItem(activeTripId);
  const updatePackingItem = useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: Partial<PackingItem> }) =>
      traveloopApi.packing.update(activeTripId, itemId, input),
    onMutate: async ({ itemId, input }) => {
      await queryClient.cancelQueries({ queryKey: traveloopKeys.packing(activeTripId) });
      const previous = queryClient.getQueryData<PackingItem[]>(traveloopKeys.packing(activeTripId));

      queryClient.setQueryData<PackingItem[]>(traveloopKeys.packing(activeTripId), (current) =>
        current?.map((item) => (item.id === itemId ? { ...item, ...input } : item)),
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(traveloopKeys.packing(activeTripId), context?.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: traveloopKeys.packing(activeTripId) });
    },
  });

  const form = useForm<PackingFormValues>({
    resolver: zodResolver(packingSchema),
    defaultValues: {
      label: "",
      category: "CLOTHING",
      customCategory: "",
      quantity: 1,
    },
  });

  useEffect(() => {
    if (!selectedTripId && trips?.[0]?.id) setSelectedTripId(trips[0].id);
  }, [selectedTripId, trips]);

  const stats = useMemo(() => {
    const total = items.length;
    const packed = items.filter(packedValue).length;
    const percent = total ? Math.round((packed / total) * 100) : 0;
    const byCategory = PACKING_CATEGORIES.map((category) => {
      const categoryItems = items.filter((item) => item.category === category.value);
      const categoryPacked = categoryItems.filter(packedValue).length;
      return {
        ...category,
        total: categoryItems.length,
        packed: categoryPacked,
        percent: categoryItems.length ? Math.round((categoryPacked / categoryItems.length) * 100) : 0,
      };
    }).filter((category) => category.total > 0);

    return { total, packed, percent, byCategory };
  }, [items]);

  const groupedItems = useMemo(() => {
    return items.reduce<Record<string, PackingItem[]>>((groups, item) => {
      const key = categoryLabel(item);
      groups[key] = [...(groups[key] ?? []), item];
      return groups;
    }, {});
  }, [items]);

  const onSubmit = form.handleSubmit((values) => {
    if (!activeTripId) return;

    createItem.mutate(
      {
        ...values,
        customCategory: values.category === "CUSTOM" ? values.customCategory : null,
        packed: false,
      },
      {
        onSuccess: () => {
          toast.success("Packing item added.");
          form.reset({ label: "", category: values.category, customCategory: values.customCategory ?? "", quantity: 1 });
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Could not add item."),
      },
    );
  });

  const toggleItem = (item: PackingItem) => {
    updatePackingItem.mutate(
      { itemId: item.id, input: { packed: !packedValue(item) } },
      {
        onError: (error) => toast.error(error instanceof Error ? error.message : "Could not update packing item."),
      },
    );
  };

  const resetPackedItems = () => {
    items.filter(packedValue).forEach((item) => {
      updatePackingItem.mutate({ itemId: item.id, input: { packed: false } });
    });
    toast.success("Packed states reset.");
  };

  if (tripsLoading) return <LoadingPanels />;
  if (tripsError) return <Card className="glass-card p-6 text-destructive">{(tripsError as Error).message}</Card>;
  if (!trips?.length) {
    return (
      <Card className="glass-card p-8 text-center">
        <PackageCheck className="mx-auto size-10 text-primary" />
        <h2 className="mt-4 text-lg font-bold text-navy">Create a trip first</h2>
        <p className="mt-2 text-sm text-muted-foreground">Packing lists are connected to individual trips.</p>
        <Button asChild className="mt-5" variant="gradient">
          <Link href="/trips/new">Create trip</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageCheck className="size-5 text-primary" />
              Trip readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            <TripSelect trips={trips} value={activeTripId} onChange={setSelectedTripId} label="Packing trip" />
            <div className="rounded-lg bg-navy-radial p-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Prepared items</p>
                  <p className="mt-1 text-3xl font-bold text-navy">
                    {stats.packed}/{stats.total}
                  </p>
                </div>
                <span className="text-4xl font-bold text-emerald">{stats.percent}%</span>
              </div>
              <Progress className="mt-4" value={stats.percent} />
            </div>
            <div className="grid gap-3">
              {stats.byCategory.map((category) => (
                <div className="rounded-lg border bg-white p-3" key={category.value}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-navy">{category.label}</span>
                    <span className="text-muted-foreground">
                      {category.packed}/{category.total}
                    </span>
                  </div>
                  <Progress className="mt-2 h-2" value={category.percent} />
                </div>
              ))}
              {!stats.byCategory.length ? <p className="text-sm text-muted-foreground">Add items to see category readiness.</p> : null}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="size-5 text-emerald" />
              Add packing item
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="packing-label">Item</Label>
                <Input id="packing-label" placeholder="Passport, rain jacket, charger..." {...form.register("label")} />
                {form.formState.errors.label ? <p className="text-xs text-destructive">{form.formState.errors.label.message}</p> : null}
              </div>
              <div className="grid gap-4 md:grid-cols-[1fr_140px]">
                <div className="grid gap-2">
                  <Label htmlFor="packing-category">Category</Label>
                  <select
                    id="packing-category"
                    className="h-10 rounded-md border border-input bg-white px-3 text-sm font-semibold outline-none transition focus:ring-2 focus:ring-ring"
                    {...form.register("category")}
                  >
                    {PACKING_CATEGORIES.map((category) => (
                      <option value={category.value} key={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="packing-quantity">Quantity</Label>
                  <Input id="packing-quantity" type="number" min="1" {...form.register("quantity")} />
                </div>
              </div>
              {form.watch("category") === "CUSTOM" ? (
                <div className="grid gap-2">
                  <Label htmlFor="packing-custom">Custom category</Label>
                  <Input id="packing-custom" placeholder="Beach gear" {...form.register("customCategory")} />
                  {form.formState.errors.customCategory ? <p className="text-xs text-destructive">{form.formState.errors.customCategory.message}</p> : null}
                </div>
              ) : null}
              <Button type="submit" variant="gradient" disabled={createItem.isPending}>
                {createItem.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Add item
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-normal text-navy">Checklist</h2>
            <p className="text-sm text-muted-foreground">Packed/unpacked state saves instantly to PostgreSQL.</p>
          </div>
          <Button variant="outline" onClick={resetPackedItems} disabled={!stats.packed}>
            <RefreshCcw className="size-4" />
            Reset packed
          </Button>
        </div>

        {itemsLoading ? (
          <LoadingPanels />
        ) : itemsError ? (
          <Card className="glass-card p-6 text-destructive">{(itemsError as Error).message}</Card>
        ) : items.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <Card className="glass-card" key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-3 text-lg">
                    {category}
                    <Badge variant="secondary">{categoryItems.filter(packedValue).length}/{categoryItems.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {categoryItems.map((item) => {
                    const packed = packedValue(item);
                    const Icon = packed ? CheckCircle2 : Circle;

                    return (
                      <motion.div layout className="flex items-center gap-3 rounded-lg border bg-white p-3" key={item.id}>
                        <Checkbox checked={packed} onCheckedChange={() => toggleItem(item)} aria-label={`Toggle ${item.label}`} />
                        <Icon className={`size-4 ${packed ? "text-emerald" : "text-muted-foreground"}`} />
                        <div className="min-w-0 flex-1">
                          <p className={`truncate font-semibold ${packed ? "text-muted-foreground line-through" : "text-navy"}`}>{item.label}</p>
                          <p className="text-xs text-muted-foreground">Quantity {item.quantity ?? 1}</p>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            deleteItem.mutate(item.id, {
                              onSuccess: () => toast.success("Packing item removed."),
                              onError: (error) => toast.error(error instanceof Error ? error.message : "Could not delete item."),
                            })
                          }
                          aria-label={`Delete ${item.label}`}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-card p-8 text-center">
            <PackageCheck className="mx-auto size-10 text-primary" />
            <h3 className="mt-4 text-lg font-bold text-navy">No packing items yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Add essentials, then track preparation by category.</p>
          </Card>
        )}
      </section>
    </div>
  );
}

function NoteEditorToolbar({ onInsert }: { onInsert: (prefix: string, suffix?: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Rich note controls">
      <Button type="button" variant="outline" size="sm" onClick={() => onInsert("**", "**")}>
        <Bold className="size-4" />
        Bold
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => onInsert("_", "_")}>
        <Italic className="size-4" />
        Italic
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => onInsert("\n- ")}>
        <List className="size-4" />
        List
      </Button>
    </div>
  );
}

export function NotesWorkspace() {
  const { data: trips, isLoading: tripsLoading, error: tripsError } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState("");
  const [editingNote, setEditingNote] = useState<NoteEntry | null>(null);
  const [draft, setDraft] = useState<NoteFormValues>({ title: "", body: "", journalDate: "", imageUrl: "", pinned: false });
  const [isDirty, setIsDirty] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const activeTripId = selectedTripId || firstTripId(trips);
  const activeTrip = trips?.find((trip) => trip.id === activeTripId);
  const { data: notes = [], isLoading: notesLoading, error: notesError } = useNotes(activeTripId);
  const createNote = useCreateNote(activeTripId);
  const deleteNote = useDeleteNote(activeTripId);
  const updateNote = useUpdateNote(activeTripId, editingNote?.id ?? "");

  const createForm = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: "",
      body: "",
      journalDate: "",
      imageUrl: "",
      pinned: false,
    },
  });

  useEffect(() => {
    if (!selectedTripId && trips?.[0]?.id) setSelectedTripId(trips[0].id);
  }, [selectedTripId, trips]);

  useEffect(() => {
    if (!editingNote) return;
    setDraft({
      title: editingNote.title ?? "",
      body: editingNote.body,
      journalDate: editingNote.journalDate ? format(new Date(editingNote.journalDate), "yyyy-MM-dd") : "",
      imageUrl: editingNote.imageUrl ?? "",
      pinned: editingNote.pinned ?? false,
    });
    setIsDirty(false);
  }, [editingNote]);

  useEffect(() => {
    if (!editingNote || !isDirty) return;
    const timeout = window.setTimeout(() => {
      updateNote.mutate(
        {
          title: draft.title,
          body: draft.body,
          journalDate: draft.journalDate || null,
          imageUrl: draft.imageUrl || null,
          pinned: draft.pinned,
        },
        {
          onSuccess: (note) => {
            setEditingNote(note);
            setIsDirty(false);
            toast.success("Journal autosaved.");
          },
        },
      );
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [draft, editingNote, isDirty, updateNote]);

  const groupedNotes = useMemo(() => {
    return notes.reduce<Record<string, NoteEntry[]>>((groups, note) => {
      const key = note.journalDate ? format(new Date(note.journalDate), "yyyy-MM-dd") : "unscheduled";
      groups[key] = [...(groups[key] ?? []), note];
      return groups;
    }, {});
  }, [notes]);

  const uploadImage = async (file: File, mode: "create" | "edit") => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/uploads", { method: "POST", body: formData });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(body?.error?.message ?? "Image upload failed.");
    }

    const url = body?.data?.secureUrl as string;
    if (mode === "create") createForm.setValue("imageUrl", url, { shouldValidate: true });
    else {
      setDraft((current) => ({ ...current, imageUrl: url }));
      setIsDirty(true);
    }
    toast.success("Image attached.");
  };

  const insertRichText = (prefix: string, suffix = "") => {
    const textarea = bodyRef.current;
    const start = textarea?.selectionStart ?? draft.body.length;
    const end = textarea?.selectionEnd ?? draft.body.length;
    const selected = draft.body.slice(start, end);
    const body = `${draft.body.slice(0, start)}${prefix}${selected}${suffix}${draft.body.slice(end)}`;
    setDraft((current) => ({ ...current, body }));
    setIsDirty(true);
  };

  const createJournalEntry = createForm.handleSubmit((values) => {
    if (!activeTripId) return;
    createNote.mutate(
      {
        title: values.title,
        body: values.body,
        journalDate: values.journalDate || null,
        imageUrl: values.imageUrl || null,
        pinned: values.pinned,
      },
      {
        onSuccess: (note) => {
          toast.success("Journal entry saved.");
          createForm.reset({ title: "", body: "", journalDate: "", imageUrl: "", pinned: false });
          setEditingNote(note);
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save note."),
      },
    );
  });

  if (tripsLoading) return <LoadingPanels />;
  if (tripsError) return <Card className="glass-card p-6 text-destructive">{(tripsError as Error).message}</Card>;
  if (!trips?.length) {
    return (
      <Card className="glass-card p-8 text-center">
        <NotebookPen className="mx-auto size-10 text-primary" />
        <h2 className="mt-4 text-lg font-bold text-navy">Create a trip first</h2>
        <p className="mt-2 text-sm text-muted-foreground">Notes and travel memories are connected to individual trips.</p>
        <Button asChild className="mt-5" variant="gradient">
          <Link href="/trips/new">Create trip</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="glass-card h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-emerald" />
              Journal setup
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <TripSelect trips={trips} value={activeTripId} onChange={setSelectedTripId} label="Notes trip" />
            <form className="grid gap-3" onSubmit={createJournalEntry}>
              <div className="grid gap-2">
                <Label htmlFor="new-note-title">Title</Label>
                <Input id="new-note-title" placeholder="Hotel check-in, day one memory..." {...createForm.register("title")} />
                {createForm.formState.errors.title ? <p className="text-xs text-destructive">{createForm.formState.errors.title.message}</p> : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-note-date">Travel day</Label>
                <Input id="new-note-date" type="date" {...createForm.register("journalDate")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-note-body">Rich note</Label>
                <Textarea id="new-note-body" className="min-h-32" placeholder="Use markdown-style formatting for rich notes." {...createForm.register("body")} />
                {createForm.formState.errors.body ? <p className="text-xs text-destructive">{createForm.formState.errors.body.message}</p> : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-note-image">Image URL</Label>
                <Input id="new-note-image" placeholder="https://..." {...createForm.register("imageUrl")} />
                <Input
                  type="file"
                  accept="image/*"
                  aria-label="Upload note image"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    void uploadImage(file, "create").catch((error) => toast.error(error instanceof Error ? error.message : "Upload failed."));
                  }}
                />
              </div>
              <label className="flex items-center gap-2 rounded-lg border bg-white p-3 text-sm font-semibold">
                <Checkbox checked={createForm.watch("pinned")} onCheckedChange={(checked) => createForm.setValue("pinned", Boolean(checked))} />
                Pin this note
              </label>
              <Button type="submit" variant="gradient" disabled={createNote.isPending}>
                {createNote.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save note
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <NotebookPen className="size-5 text-primary" />
              Autosave editor
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingNote ? (
              <div className="grid gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Badge variant={draft.pinned ? "emerald" : "secondary"}>
                    {draft.pinned ? <Pin className="mr-1 size-3" /> : null}
                    {isDirty ? "Autosaving..." : "Saved"}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDraft((current) => ({ ...current, pinned: !current.pinned }));
                      setIsDirty(true);
                    }}
                  >
                    <Pin className="size-4" />
                    {draft.pinned ? "Unpin" : "Pin"}
                  </Button>
                </div>
                <Input
                  value={draft.title}
                  onChange={(event) => {
                    setDraft((current) => ({ ...current, title: event.target.value }));
                    setIsDirty(true);
                  }}
                  aria-label="Edit note title"
                />
                <Input
                  type="date"
                  value={draft.journalDate ?? ""}
                  onChange={(event) => {
                    setDraft((current) => ({ ...current, journalDate: event.target.value }));
                    setIsDirty(true);
                  }}
                  aria-label="Edit journal date"
                />
                <NoteEditorToolbar onInsert={insertRichText} />
                <Textarea
                  ref={bodyRef}
                  className="min-h-64"
                  value={draft.body}
                  onChange={(event) => {
                    setDraft((current) => ({ ...current, body: event.target.value }));
                    setIsDirty(true);
                  }}
                  aria-label="Edit rich note body"
                />
                <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                  <Input
                    value={draft.imageUrl ?? ""}
                    onChange={(event) => {
                      setDraft((current) => ({ ...current, imageUrl: event.target.value }));
                      setIsDirty(true);
                    }}
                    placeholder="Image attachment URL"
                    aria-label="Image attachment URL"
                  />
                  <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-white px-4 text-sm font-semibold hover:bg-accent/10">
                    <ImagePlus className="size-4" />
                    Upload image
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        void uploadImage(file, "edit").catch((error) => toast.error(error instanceof Error ? error.message : "Upload failed."));
                      }}
                    />
                  </label>
                </div>
                {draft.imageUrl ? (
                  <div className="relative aspect-[16/8] overflow-hidden rounded-lg border bg-white">
                    <Image src={draft.imageUrl} alt={draft.title} fill className="object-cover" sizes="(min-width: 1024px) 720px, 100vw" unoptimized />
                  </div>
                ) : null}
                <div className="rounded-lg border bg-white p-4">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Preview</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-navy">{draft.body}</p>
                </div>
              </div>
            ) : (
              <div className="grid min-h-80 place-items-center rounded-lg border border-dashed bg-white p-8 text-center">
                <div>
                  <NotebookPen className="mx-auto size-10 text-primary" />
                  <h3 className="mt-4 text-lg font-bold text-navy">Select a note to edit</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Existing entries autosave after you pause typing.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-normal text-navy">Day-wise journal</h2>
          <p className="text-sm text-muted-foreground">Notes are grouped by trip day and sorted by pinned status and recency.</p>
        </div>
        {notesLoading ? (
          <LoadingPanels />
        ) : notesError ? (
          <Card className="glass-card p-6 text-destructive">{(notesError as Error).message}</Card>
        ) : notes.length ? (
          <div className="grid gap-4">
            {Object.entries(groupedNotes).map(([date, dayNotes]) => (
              <Card className="glass-card" key={date}>
                <CardHeader>
                  <CardTitle className="text-lg">{date === "unscheduled" ? "Unscheduled" : tripDayLabel(activeTrip, date)}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {dayNotes.map((note) => (
                    <motion.article layout className="rounded-lg border bg-white p-4" key={note.id}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <button type="button" className="text-left" onClick={() => setEditingNote(note)}>
                          <div className="flex flex-wrap items-center gap-2">
                            {note.pinned ? <Badge variant="emerald">Pinned</Badge> : null}
                            {note.journalDate && activeTrip ? <Badge variant="secondary">{tripDayLabel(activeTrip, note.journalDate)}</Badge> : null}
                          </div>
                          <h3 className="mt-2 text-lg font-bold text-navy">{note.title}</h3>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{note.body}</p>
                        </button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            deleteNote.mutate(note.id, {
                              onSuccess: () => {
                                toast.success("Journal entry deleted.");
                                if (editingNote?.id === note.id) setEditingNote(null);
                              },
                              onError: (error) => toast.error(error instanceof Error ? error.message : "Could not delete note."),
                            })
                          }
                          aria-label={`Delete ${note.title ?? "note"}`}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                      {note.imageUrl ? (
                        <div className="relative mt-4 aspect-[16/7] overflow-hidden rounded-lg border bg-slate-100">
                          <Image src={note.imageUrl} alt={note.title ?? "Journal attachment"} fill className="object-cover" sizes="(min-width: 1024px) 720px, 100vw" unoptimized />
                        </div>
                      ) : null}
                    </motion.article>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-card p-8 text-center">
            <NotebookPen className="mx-auto size-10 text-primary" />
            <h3 className="mt-4 text-lg font-bold text-navy">No journal entries yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Capture reminders, day notes, and memories as the trip takes shape.</p>
          </Card>
        )}
      </section>
    </div>
  );
}
