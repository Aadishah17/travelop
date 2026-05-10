"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, differenceInCalendarDays, format, isSameDay } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ChevronDown,
  Clock,
  DollarSign,
  Edit3,
  GripVertical,
  Loader2,
  MapPin,
  Plus,
  Route,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatCurrency } from "@/lib/utils";

type ItineraryTrip = {
  id: string;
  title: string;
  description?: string | null;
  startsAt?: string;
  endsAt?: string;
  startDate?: string;
  endDate?: string;
  budget?: number | string | null;
  stops?: ItineraryStop[];
  activities?: ItineraryActivity[];
};

type ItineraryStop = {
  id: string;
  tripId?: string;
  title: string;
  address?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  position?: number;
  activities?: ItineraryActivity[];
};

type ItineraryActivity = {
  id: string;
  tripId?: string;
  stopId?: string | null;
  title: string;
  category: ActivityCategory;
  description?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  cost?: number | string | null;
  currency?: string;
  position?: number;
};

type DeleteIntent =
  | { type: "stop"; id: string; title: string }
  | { type: "activity"; id: string; stopId: string; title: string };

const activityCategories = [
  "FOOD",
  "TOUR",
  "OUTDOOR",
  "CULTURE",
  "SHOPPING",
  "NIGHTLIFE",
  "TRANSPORT",
  "LODGING",
  "OTHER",
] as const;

type ActivityCategory = (typeof activityCategories)[number];

const stopFormSchema = z
  .object({
    title: z.string().trim().min(2, "City or stop name is required.").max(140),
    address: z.string().trim().max(300).optional(),
    startsAt: z.string().min(1, "Assign an arrival date."),
    endsAt: z.string().min(1, "Assign a departure date."),
  })
  .refine((value) => new Date(value.endsAt) >= new Date(value.startsAt), {
    message: "Departure date must be after arrival.",
    path: ["endsAt"],
  });

const activityFormSchema = z
  .object({
    title: z.string().trim().min(2, "Activity name is required.").max(160),
    category: z.enum(activityCategories),
    startsAt: z.string().min(1, "Schedule a start time."),
    endsAt: z.string().optional(),
    cost: z.coerce.number().min(0, "Cost cannot be negative."),
    description: z.string().trim().max(2000).optional(),
  })
  .refine((value) => !value.endsAt || new Date(value.endsAt) >= new Date(value.startsAt), {
    message: "End time must be after start time.",
    path: ["endsAt"],
  });

type StopFormValues = z.infer<typeof stopFormSchema>;
type ActivityFormValues = z.infer<typeof activityFormSchema>;

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (response.status === 204) return null as T;
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error?.message ?? body?.error ?? "Request failed");
  }
  return (body?.data ?? body) as T;
}

function tripStart(trip: ItineraryTrip) {
  return trip.startDate ?? trip.startsAt ?? new Date().toISOString();
}

function tripEnd(trip: ItineraryTrip) {
  return trip.endDate ?? trip.endsAt ?? tripStart(trip);
}

function sortStops(stops: ItineraryStop[]) {
  return stops.toSorted((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

function sortActivities(activities: ItineraryActivity[]) {
  return activities.toSorted((a, b) => {
    const first = a.startsAt ? +new Date(a.startsAt) : Number.MAX_SAFE_INTEGER;
    const second = b.startsAt ? +new Date(b.startsAt) : Number.MAX_SAFE_INTEGER;
    return first - second || (a.position ?? 0) - (b.position ?? 0);
  });
}

function toDateInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : format(date, "yyyy-MM-dd");
}

function toDateTimeInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : format(date, "yyyy-MM-dd'T'HH:mm");
}

function dateInputToIso(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

function dateTimeInputToIso(value?: string) {
  return value ? new Date(value).toISOString() : null;
}

function stopToForm(stop: ItineraryStop): StopFormValues {
  return {
    title: stop.title,
    address: stop.address ?? "",
    startsAt: toDateInput(stop.startsAt),
    endsAt: toDateInput(stop.endsAt),
  };
}

function activityToForm(activity: ItineraryActivity): ActivityFormValues {
  return {
    title: activity.title,
    category: activity.category ?? "OTHER",
    startsAt: toDateTimeInput(activity.startsAt),
    endsAt: toDateTimeInput(activity.endsAt),
    cost: Number(activity.cost ?? 0),
    description: activity.description ?? "",
  };
}

function stopPayload(values: StopFormValues, position: number) {
  return {
    title: values.title,
    address: values.address?.trim() || null,
    kind: "CITY",
    startsAt: dateInputToIso(values.startsAt),
    endsAt: dateInputToIso(values.endsAt),
    position,
  };
}

function activityPayload(values: ActivityFormValues, stopId: string, position: number) {
  return {
    stopId,
    title: values.title,
    category: values.category,
    startsAt: dateTimeInputToIso(values.startsAt),
    endsAt: dateTimeInputToIso(values.endsAt),
    cost: Number(values.cost ?? 0),
    description: values.description?.trim() || null,
    position,
  };
}

function emptyStopValues(trip?: ItineraryTrip): StopFormValues {
  return {
    title: "",
    address: "",
    startsAt: toDateInput(tripStart(trip ?? { id: "", title: "" })),
    endsAt: toDateInput(tripEnd(trip ?? { id: "", title: "" })),
  };
}

function emptyActivityValues(stop?: ItineraryStop): ActivityFormValues {
  const base = stop?.startsAt ?? new Date().toISOString();
  const start = new Date(base);
  start.setHours(9, 0, 0, 0);

  return {
    title: "",
    category: "OTHER",
    startsAt: toDateTimeInput(start.toISOString()),
    endsAt: "",
    cost: 0,
    description: "",
  };
}

function totalActivityCost(stops: ItineraryStop[]) {
  return stops.reduce(
    (sum, stop) => sum + (stop.activities ?? []).reduce((activitySum, activity) => activitySum + Number(activity.cost ?? 0), 0),
    0,
  );
}

function patchTripInCache(queryClient: ReturnType<typeof useQueryClient>, tripId: string, updater: (trip: ItineraryTrip) => ItineraryTrip) {
  queryClient.setQueryData<ItineraryTrip[]>(["trips"], (current = []) =>
    current.map((trip) => (trip.id === tripId ? updater(trip) : trip)),
  );
}

function patchStops(
  queryClient: ReturnType<typeof useQueryClient>,
  tripId: string,
  updater: (stops: ItineraryStop[]) => ItineraryStop[],
) {
  patchTripInCache(queryClient, tripId, (trip) => ({
    ...trip,
    stops: updater(sortStops(trip.stops ?? [])),
  }));
}

function patchActivity(
  queryClient: ReturnType<typeof useQueryClient>,
  tripId: string,
  updater: (activities: ItineraryActivity[]) => ItineraryActivity[],
) {
  patchTripInCache(queryClient, tripId, (trip) => {
    const stops = trip.stops ?? [];
    const sourceActivities = trip.activities?.length ? trip.activities : stops.flatMap((stop) => stop.activities ?? []);
    const nextActivities = updater(sourceActivities);

    return {
      ...trip,
      activities: nextActivities,
      stops: stops.map((stop) => ({
        ...stop,
        activities: sortActivities(nextActivities.filter((activity) => activity.stopId === stop.id)),
      })),
    };
  });
}

export function ItineraryBuilder() {
  const queryClient = useQueryClient();
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [collapsedStops, setCollapsedStops] = useState<Set<string>>(new Set());
  const [stopDialog, setStopDialog] = useState<{ mode: "create"; stop?: undefined } | { mode: "edit"; stop: ItineraryStop } | null>(null);
  const [activityDialog, setActivityDialog] = useState<
    | { mode: "create"; stop: ItineraryStop; activity?: undefined }
    | { mode: "edit"; stop: ItineraryStop; activity: ItineraryActivity }
    | null
  >(null);
  const [deleteIntent, setDeleteIntent] = useState<DeleteIntent | null>(null);

  const tripsQuery = useQuery({
    queryKey: ["trips"],
    queryFn: () => fetchJson<ItineraryTrip[]>("/api/trips"),
    refetchInterval: 45_000,
  });

  const trips = tripsQuery.data ?? [];
  const trip = trips.find((item) => item.id === selectedTripId) ?? trips[0];
  const stops = useMemo(() => sortStops(trip?.stops ?? []), [trip?.stops]);
  const routeCost = totalActivityCost(stops);
  const budget = Number(trip?.budget ?? 0);
  const budgetPercent = budget ? Math.min(100, Math.round((routeCost / budget) * 100)) : 0;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const createStop = useMutation({
    mutationFn: (values: StopFormValues) =>
      fetchJson<ItineraryStop>(`/api/trips/${trip.id}/stops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stopPayload(values, stops.length)),
      }),
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: ["trips"] });
      const previousTrips = queryClient.getQueryData<ItineraryTrip[]>(["trips"]) ?? [];
      const optimistic: ItineraryStop = {
        id: `optimistic-${crypto.randomUUID()}`,
        tripId: trip.id,
        ...stopPayload(values, stops.length),
        activities: [],
      };
      patchStops(queryClient, trip.id, (current) => [...current, optimistic]);
      return { previousTrips, optimisticId: optimistic.id };
    },
    onSuccess: (stop, _values, context) => {
      patchStops(queryClient, trip.id, (current) => current.map((item) => (item.id === context?.optimisticId ? stop : item)));
      toast.success("Stop added");
      setStopDialog(null);
    },
    onError: (error, _values, context) => {
      queryClient.setQueryData(["trips"], context?.previousTrips ?? []);
      toast.error(error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["trips"] }),
  });

  const updateStop = useMutation({
    mutationFn: ({ stop, values }: { stop: ItineraryStop; values: StopFormValues }) =>
      fetchJson<ItineraryStop>(`/api/trips/${trip.id}/stops/${stop.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stopPayload(values, stop.position ?? 0)),
      }),
    onMutate: async ({ stop, values }) => {
      await queryClient.cancelQueries({ queryKey: ["trips"] });
      const previousTrips = queryClient.getQueryData<ItineraryTrip[]>(["trips"]) ?? [];
      patchStops(queryClient, trip.id, (current) =>
        current.map((item) => (item.id === stop.id ? { ...item, ...stopPayload(values, item.position ?? 0) } : item)),
      );
      return { previousTrips };
    },
    onSuccess: (stop) => {
      patchStops(queryClient, trip.id, (current) => current.map((item) => (item.id === stop.id ? stop : item)));
      toast.success("Stop updated");
      setStopDialog(null);
    },
    onError: (error, _values, context) => {
      queryClient.setQueryData(["trips"], context?.previousTrips ?? []);
      toast.error(error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["trips"] }),
  });

  const reorderStops = useMutation({
    mutationFn: (nextStops: ItineraryStop[]) =>
      fetchJson<ItineraryStop[]>(`/api/trips/${trip.id}/stops/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stops: nextStops.map((stop, index) => ({ id: stop.id, position: index })) }),
      }),
    onMutate: async (nextStops) => {
      await queryClient.cancelQueries({ queryKey: ["trips"] });
      const previousTrips = queryClient.getQueryData<ItineraryTrip[]>(["trips"]) ?? [];
      patchStops(queryClient, trip.id, () => nextStops.map((stop, index) => ({ ...stop, position: index })));
      return { previousTrips };
    },
    onSuccess: (nextStops) => {
      patchStops(queryClient, trip.id, () => nextStops);
      toast.success("Route reordered");
    },
    onError: (error, _values, context) => {
      queryClient.setQueryData(["trips"], context?.previousTrips ?? []);
      toast.error(error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["trips"] }),
  });

  const deleteStop = useMutation({
    mutationFn: (stopId: string) => fetchJson<null>(`/api/trips/${trip.id}/stops/${stopId}`, { method: "DELETE" }),
    onMutate: async (stopId) => {
      await queryClient.cancelQueries({ queryKey: ["trips"] });
      const previousTrips = queryClient.getQueryData<ItineraryTrip[]>(["trips"]) ?? [];
      patchStops(queryClient, trip.id, (current) => current.filter((stop) => stop.id !== stopId).map((stop, index) => ({ ...stop, position: index })));
      return { previousTrips };
    },
    onSuccess: () => {
      toast.success("Stop deleted");
      setDeleteIntent(null);
    },
    onError: (error, _stopId, context) => {
      queryClient.setQueryData(["trips"], context?.previousTrips ?? []);
      toast.error(error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["trips"] }),
  });

  const createActivity = useMutation({
    mutationFn: ({ stop, values }: { stop: ItineraryStop; values: ActivityFormValues }) =>
      fetchJson<ItineraryActivity>(`/api/trips/${trip.id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activityPayload(values, stop.id, stop.activities?.length ?? 0)),
      }),
    onMutate: async ({ stop, values }) => {
      await queryClient.cancelQueries({ queryKey: ["trips"] });
      const previousTrips = queryClient.getQueryData<ItineraryTrip[]>(["trips"]) ?? [];
      const optimistic: ItineraryActivity = {
        id: `optimistic-${crypto.randomUUID()}`,
        tripId: trip.id,
        ...activityPayload(values, stop.id, stop.activities?.length ?? 0),
        currency: "USD",
      };
      patchActivity(queryClient, trip.id, (activities) => [...activities, optimistic]);
      return { previousTrips, optimisticId: optimistic.id };
    },
    onSuccess: (activity, _variables, context) => {
      patchActivity(queryClient, trip.id, (activities) => activities.map((item) => (item.id === context?.optimisticId ? activity : item)));
      toast.success("Activity added");
      setActivityDialog(null);
    },
    onError: (error, _values, context) => {
      queryClient.setQueryData(["trips"], context?.previousTrips ?? []);
      toast.error(error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["trips"] }),
  });

  const updateActivity = useMutation({
    mutationFn: ({ activity, stop, values }: { activity: ItineraryActivity; stop: ItineraryStop; values: ActivityFormValues }) =>
      fetchJson<ItineraryActivity>(`/api/trips/${trip.id}/activities/${activity.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activityPayload(values, stop.id, activity.position ?? 0)),
      }),
    onMutate: async ({ activity, stop, values }) => {
      await queryClient.cancelQueries({ queryKey: ["trips"] });
      const previousTrips = queryClient.getQueryData<ItineraryTrip[]>(["trips"]) ?? [];
      const optimistic = { ...activity, ...activityPayload(values, stop.id, activity.position ?? 0) };
      patchActivity(queryClient, trip.id, (activities) => activities.map((item) => (item.id === activity.id ? optimistic : item)));
      return { previousTrips };
    },
    onSuccess: (activity) => {
      patchActivity(queryClient, trip.id, (activities) => activities.map((item) => (item.id === activity.id ? activity : item)));
      toast.success("Activity updated");
      setActivityDialog(null);
    },
    onError: (error, _values, context) => {
      queryClient.setQueryData(["trips"], context?.previousTrips ?? []);
      toast.error(error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["trips"] }),
  });

  const deleteActivity = useMutation({
    mutationFn: (activityId: string) => fetchJson<null>(`/api/trips/${trip.id}/activities/${activityId}`, { method: "DELETE" }),
    onMutate: async (activityId) => {
      await queryClient.cancelQueries({ queryKey: ["trips"] });
      const previousTrips = queryClient.getQueryData<ItineraryTrip[]>(["trips"]) ?? [];
      patchActivity(queryClient, trip.id, (activities) => activities.filter((activity) => activity.id !== activityId));
      return { previousTrips };
    },
    onSuccess: () => {
      toast.success("Activity deleted");
      setDeleteIntent(null);
    },
    onError: (error, _activityId, context) => {
      queryClient.setQueryData(["trips"], context?.previousTrips ?? []);
      toast.error(error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["trips"] }),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = stops.findIndex((stop) => stop.id === active.id);
    const newIndex = stops.findIndex((stop) => stop.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    reorderStops.mutate(arrayMove(stops, oldIndex, newIndex));
  }

  if (tripsQuery.isLoading) return <ItinerarySkeleton />;
  if (tripsQuery.error) return <EmptyPanel title="Unable to load itinerary" description={(tripsQuery.error as Error).message} />;
  if (!trip) return <EmptyPanel title="No trip selected" description="Create a trip first, then return here to build your route and daily schedule." />;

  const days = buildTripDays(trip);

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 rounded-lg border border-white/50 bg-white/80 p-4 shadow-soft backdrop-blur xl:grid-cols-[1fr_auto_auto] xl:items-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Interactive itinerary builder</p>
          <h2 className="mt-1 text-2xl font-bold tracking-normal text-slate-950">{trip.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {format(new Date(tripStart(trip)), "MMM d")} - {format(new Date(tripEnd(trip)), "MMM d, yyyy")} · {stops.length} cities ·{" "}
            {stops.flatMap((stop) => stop.activities ?? []).length} activities
          </p>
        </div>
        <select
          aria-label="Select trip"
          className="h-10 rounded-md border border-input bg-white px-3 text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-ring"
          value={trip.id}
          onChange={(event) => setSelectedTripId(event.target.value)}
        >
          {trips.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
        <Button type="button" variant="gradient" onClick={() => setStopDialog({ mode: "create" })}>
          <Plus className="size-4" />
          Add Stop
        </Button>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="size-5 text-primary" />
              Multi-city timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {!stops.length ? (
              <EmptyPanel
                compact
                title="No stops yet"
                description="Add your first city to start building a day-wise travel route."
                action={
                  <Button type="button" variant="gradient" onClick={() => setStopDialog({ mode: "create" })}>
                    <Plus className="size-4" />
                    Add Stop
                  </Button>
                }
              />
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={stops.map((stop) => stop.id)} strategy={verticalListSortingStrategy}>
                  <div className="relative grid gap-4">
                    <div className="absolute bottom-8 left-6 top-8 hidden w-px bg-gradient-to-b from-blue-500 via-sky-400 to-emerald-400 md:block" />
                    <AnimatePresence initial={false}>
                      {stops.map((stop, index) => (
                        <SortableStopSection
                          key={stop.id}
                          stop={stop}
                          index={index}
                          trip={trip}
                          collapsed={collapsedStops.has(stop.id)}
                          onToggle={() =>
                            setCollapsedStops((current) => {
                              const next = new Set(current);
                              if (next.has(stop.id)) next.delete(stop.id);
                              else next.add(stop.id);
                              return next;
                            })
                          }
                          onEditStop={() => setStopDialog({ mode: "edit", stop })}
                          onDeleteStop={() => setDeleteIntent({ type: "stop", id: stop.id, title: stop.title })}
                          onAddActivity={() => setActivityDialog({ mode: "create", stop })}
                          onEditActivity={(activity) => setActivityDialog({ mode: "edit", stop, activity })}
                          onDeleteActivity={(activity) => setDeleteIntent({ type: "activity", id: activity.id, stopId: stop.id, title: activity.title })}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>

        <aside className="grid gap-6 content-start">
          <RoutePreview stops={stops} />
          <PlannerStats trip={trip} stops={stops} routeCost={routeCost} budgetPercent={budgetPercent} />
          <DayWiseCalendar days={days} stops={stops} />
        </aside>
      </section>

      <Dialog open={Boolean(stopDialog)} onOpenChange={(open) => !open && setStopDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{stopDialog?.mode === "edit" ? "Edit stop" : "Add city stop"}</DialogTitle>
            <DialogDescription>Assign dates and city details to keep the route timeline organized.</DialogDescription>
          </DialogHeader>
          {stopDialog ? (
            <StopForm
              trip={trip}
              stop={stopDialog.mode === "edit" ? stopDialog.stop : undefined}
              isSubmitting={createStop.isPending || updateStop.isPending}
              onCancel={() => setStopDialog(null)}
              onSubmit={(values) =>
                stopDialog.mode === "edit"
                  ? updateStop.mutateAsync({ stop: stopDialog.stop, values })
                  : createStop.mutateAsync(values)
              }
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(activityDialog)} onOpenChange={(open) => !open && setActivityDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activityDialog?.mode === "edit" ? "Edit activity" : "Add activity"}</DialogTitle>
            <DialogDescription>Schedule the experience, set a category, and track estimated cost.</DialogDescription>
          </DialogHeader>
          {activityDialog ? (
            <ActivityForm
              stop={activityDialog.stop}
              activity={activityDialog.mode === "edit" ? activityDialog.activity : undefined}
              isSubmitting={createActivity.isPending || updateActivity.isPending}
              onCancel={() => setActivityDialog(null)}
              onSubmit={(values) =>
                activityDialog.mode === "edit"
                  ? updateActivity.mutateAsync({ activity: activityDialog.activity, stop: activityDialog.stop, values })
                  : createActivity.mutateAsync({ stop: activityDialog.stop, values })
              }
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteIntent)} onOpenChange={(open) => !open && setDeleteIntent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {deleteIntent?.type === "stop" ? "stop" : "activity"}?</DialogTitle>
            <DialogDescription>
              This will permanently remove {deleteIntent?.title ? `"${deleteIntent.title}"` : "the selected item"} from the itinerary.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteStop.isPending || deleteActivity.isPending}
              onClick={() => {
                if (!deleteIntent) return;
                if (deleteIntent.type === "stop") deleteStop.mutate(deleteIntent.id);
                else deleteActivity.mutate(deleteIntent.id);
              }}
            >
              {deleteStop.isPending || deleteActivity.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SortableStopSection({
  stop,
  index,
  trip,
  collapsed,
  onToggle,
  onEditStop,
  onDeleteStop,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
}: {
  stop: ItineraryStop;
  index: number;
  trip: ItineraryTrip;
  collapsed: boolean;
  onToggle: () => void;
  onEditStop: () => void;
  onDeleteStop: () => void;
  onAddActivity: () => void;
  onEditActivity: (activity: ItineraryActivity) => void;
  onDeleteActivity: (activity: ItineraryActivity) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id });
  const activities = sortActivities(stop.activities ?? []);
  const cost = activities.reduce((sum, activity) => sum + Number(activity.cost ?? 0), 0);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: isDragging ? 0.72 : 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={cn("relative rounded-lg border border-white/60 bg-white/90 p-4 shadow-sm backdrop-blur", isDragging && "shadow-xl")}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex items-center gap-3 md:w-14 md:flex-col">
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-md border bg-white text-slate-500 shadow-sm hover:text-primary"
            aria-label={`Reorder ${stop.title}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
          <span className="flex size-10 items-center justify-center rounded-md bg-travel-gradient text-sm font-bold text-white">
            {index + 1}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <button type="button" className="min-w-0 text-left" onClick={onToggle}>
              <div className="flex min-w-0 items-center gap-2">
                <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", collapsed && "-rotate-90")} />
                <h3 className="truncate text-lg font-bold">{stop.title}</h3>
                <Badge variant="sky">{activities.length} activities</Badge>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4" />
                {format(new Date(stop.startsAt ?? tripStart(trip)), "MMM d")} - {format(new Date(stop.endsAt ?? tripEnd(trip)), "MMM d")}
                {stop.address ? (
                  <>
                    <MapPin className="size-4" />
                    {stop.address}
                  </>
                ) : null}
              </p>
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="emerald">{formatCurrency(cost)}</Badge>
              <Button type="button" size="sm" variant="outline" onClick={onAddActivity}>
                <Plus className="size-4" />
                Activity
              </Button>
              <Button type="button" size="icon" variant="outline" aria-label={`Edit ${stop.title}`} onClick={onEditStop}>
                <Edit3 className="size-4" />
              </Button>
              <Button type="button" size="icon" variant="outline" aria-label={`Delete ${stop.title}`} onClick={onDeleteStop}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {!collapsed ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 grid gap-3">
                  {activities.length ? (
                    activities.map((activity) => (
                      <ActivityRow
                        key={activity.id}
                        activity={activity}
                        onEdit={() => onEditActivity(activity)}
                        onDelete={() => onDeleteActivity(activity)}
                      />
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed bg-slate-50 p-4 text-sm text-muted-foreground">
                      No activities scheduled for this city yet.
                    </div>
                  )}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function ActivityRow({ activity, onEdit, onDelete }: { activity: ItineraryActivity; onEdit: () => void; onDelete: () => void }) {
  return (
    <motion.div layout className="rounded-lg border bg-slate-50/80 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold">{activity.title}</h4>
            <Badge variant="outline">{activity.category}</Badge>
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            {activity.startsAt ? format(new Date(activity.startsAt), "MMM d, h:mm a") : "Time pending"}
            {activity.endsAt ? ` - ${format(new Date(activity.endsAt), "h:mm a")}` : null}
          </p>
          {activity.description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{activity.description}</p> : null}
        </div>
        <div className="flex items-center gap-2 sm:justify-end">
          <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-sm font-bold text-emerald-700">
            {formatCurrency(Number(activity.cost ?? 0))}
          </span>
          <Button type="button" size="icon" variant="outline" aria-label={`Edit ${activity.title}`} onClick={onEdit}>
            <Edit3 className="size-4" />
          </Button>
          <Button type="button" size="icon" variant="outline" aria-label={`Delete ${activity.title}`} onClick={onDelete}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function StopForm({
  trip,
  stop,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  trip: ItineraryTrip;
  stop?: ItineraryStop;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: StopFormValues) => Promise<unknown>;
}) {
  const form = useForm<StopFormValues>({
    resolver: zodResolver(stopFormSchema),
    defaultValues: stop ? stopToForm(stop) : emptyStopValues(trip),
  });

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      <Field label="City or stop name" error={form.formState.errors.title?.message}>
        <Input placeholder="Barcelona" {...form.register("title")} />
      </Field>
      <Field label="Address or area" error={form.formState.errors.address?.message}>
        <Input placeholder="Gothic Quarter, Barcelona" {...form.register("address")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Arrival date" error={form.formState.errors.startsAt?.message}>
          <Input type="date" {...form.register("startsAt")} />
        </Field>
        <Field label="Departure date" error={form.formState.errors.endsAt?.message}>
          <Input type="date" {...form.register("endsAt")} />
        </Field>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="gradient" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          {stop ? "Save Stop" : "Add Stop"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ActivityForm({
  stop,
  activity,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  stop: ItineraryStop;
  activity?: ItineraryActivity;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: ActivityFormValues) => Promise<unknown>;
}) {
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: activity ? activityToForm(activity) : emptyActivityValues(stop),
  });

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      <Field label="Activity name" error={form.formState.errors.title?.message}>
        <Input placeholder="Sunrise food market walk" {...form.register("title")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" error={form.formState.errors.category?.message}>
          <select
            className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            {...form.register("category")}
          >
            {activityCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Estimated cost" error={form.formState.errors.cost?.message}>
          <Input type="number" min="0" step="1" {...form.register("cost")} />
        </Field>
        <Field label="Start time" error={form.formState.errors.startsAt?.message}>
          <Input type="datetime-local" {...form.register("startsAt")} />
        </Field>
        <Field label="End time" error={form.formState.errors.endsAt?.message}>
          <Input type="datetime-local" {...form.register("endsAt")} />
        </Field>
      </div>
      <Field label="Notes" error={form.formState.errors.description?.message}>
        <Textarea placeholder={`Details for ${stop.title}`} {...form.register("description")} />
      </Field>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="gradient" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          {activity ? "Save Activity" : "Add Activity"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function RoutePreview({ stops }: { stops: ItineraryStop[] }) {
  return (
    <Card className="navy-panel rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MapPin className="size-5 text-mint" />
          Route visualization
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stops.length ? (
          <div className="relative grid gap-3">
            <div className="absolute bottom-4 left-4 top-4 w-px bg-gradient-to-b from-sky-400 to-emerald-300" />
            {stops.map((stop, index) => (
              <div key={stop.id} className="relative flex items-center gap-3 pl-1">
                <span className="z-10 flex size-8 items-center justify-center rounded-md bg-white text-sm font-bold text-primary">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-white">{stop.title}</p>
                  <p className="text-xs text-white/60">
                    {format(new Date(stop.startsAt ?? new Date()), "MMM d")} · {(stop.activities ?? []).length} activities
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-white/60">Add city stops to generate an ordered route preview.</p>
        )}
      </CardContent>
    </Card>
  );
}

function PlannerStats({
  trip,
  stops,
  routeCost,
  budgetPercent,
}: {
  trip: ItineraryTrip;
  stops: ItineraryStop[];
  routeCost: number;
  budgetPercent: number;
}) {
  const days = Math.max(1, differenceInCalendarDays(new Date(tripEnd(trip)), new Date(tripStart(trip))) + 1);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="size-5 text-emerald-600" />
          Cost planning
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg border bg-white p-3">
            <p className="text-xs text-muted-foreground">Days</p>
            <p className="mt-1 text-xl font-bold">{days}</p>
          </div>
          <div className="rounded-lg border bg-white p-3">
            <p className="text-xs text-muted-foreground">Stops</p>
            <p className="mt-1 text-xl font-bold">{stops.length}</p>
          </div>
          <div className="rounded-lg border bg-white p-3">
            <p className="text-xs text-muted-foreground">Cost</p>
            <p className="mt-1 text-xl font-bold">{formatCurrency(routeCost)}</p>
          </div>
        </div>
        <div>
          <div className="mb-2 flex justify-between text-sm font-medium">
            <span>Activity budget usage</span>
            <span>{budgetPercent}%</span>
          </div>
          <Progress value={budgetPercent} />
        </div>
      </CardContent>
    </Card>
  );
}

function DayWiseCalendar({ days, stops }: { days: Date[]; stops: ItineraryStop[] }) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="size-5 text-primary" />
          Day-wise plan
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {days.map((day, index) => {
          const activities = stops.flatMap((stop) =>
            (stop.activities ?? [])
              .filter((activity) => activity.startsAt && isSameDay(new Date(activity.startsAt), day))
              .map((activity) => ({ ...activity, stopTitle: stop.title })),
          );

          return (
            <div className="rounded-lg border bg-white p-3" key={day.toISOString()}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">Day {index + 1}</p>
                <span className="text-xs text-muted-foreground">{format(day, "MMM d")}</span>
              </div>
              {activities.length ? (
                <div className="mt-2 grid gap-1.5 text-xs text-muted-foreground">
                  {activities.slice(0, 3).map((activity) => (
                    <p key={activity.id} className="truncate">
                      {format(new Date(activity.startsAt!), "h:mm a")} · {activity.title} · {activity.stopTitle}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">Open schedule</p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function buildTripDays(trip: ItineraryTrip) {
  const start = new Date(tripStart(trip));
  const end = new Date(tripEnd(trip));
  const total = Math.max(1, differenceInCalendarDays(end, start) + 1);
  return Array.from({ length: Math.min(total, 21) }, (_, index) => addDays(start, index));
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function EmptyPanel({
  title,
  description,
  action,
  compact,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={cn("grid place-items-center rounded-lg border border-dashed bg-white/70 p-8 text-center", compact ? "min-h-56" : "min-h-72")}>
      <div className="grid justify-items-center gap-4">
        <span className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Route className="size-6" />
        </span>
        <div>
          <h3 className="font-bold">{title}</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
    </div>
  );
}

function ItinerarySkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton className="h-40" key={index} />
        ))}
      </div>
      <div className="grid gap-4">
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}
