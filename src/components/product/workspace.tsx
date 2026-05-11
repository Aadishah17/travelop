"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, differenceInCalendarDays } from "date-fns";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Camera,
  CalendarDays,
  CloudSun,
  DollarSign,
  Edit3,
  ImageIcon,
  Loader2,
  MapPinned,
  PackageCheck,
  PlaneTakeoff,
  Plus,
  Search,
  Trash2,
  WalletCards
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { getDestinationImageUrl } from "@/lib/destination-photos";

const BudgetWorkspace = dynamic(() => import("@/features/budget/budget-workspace").then((mod) => mod.BudgetWorkspace), {
  loading: () => <LoadingGrid />,
});
const ItineraryBuilder = dynamic(() => import("@/features/itinerary/itinerary-builder").then((mod) => mod.ItineraryBuilder), {
  loading: () => <LoadingGrid />,
});
const LiveDiscoveryWorkspace = dynamic(() => import("@/features/live/live-discovery-workspace").then((mod) => mod.LiveDiscoveryWorkspace), {
  loading: () => <LoadingGrid />,
});
const NotesWorkspace = dynamic(() => import("@/features/productivity/productivity-workspace").then((mod) => mod.NotesWorkspace), {
  loading: () => <LoadingGrid />,
});
const PackingWorkspace = dynamic(() => import("@/features/productivity/productivity-workspace").then((mod) => mod.PackingWorkspace), {
  loading: () => <LoadingGrid />,
});
const SharingWorkspace = dynamic(() => import("@/features/sharing/sharing-workspace").then((mod) => mod.SharingWorkspace), {
  loading: () => <LoadingGrid />,
});

type ApiTrip = {
  id: string;
  title: string;
  destination?: string | null;
  description?: string | null;
  startDate?: string;
  endDate?: string;
  startsAt?: string;
  endsAt?: string;
  budget?: number | string | null;
  visibility?: "PRIVATE" | "PUBLIC" | string;
  status?: string;
  coverImage?: string | null;
  coverImageUrl?: string | null;
  stops?: ApiStop[];
  activities?: ApiActivity[];
  expenses?: ApiExpense[];
  packingItems?: ApiPackingItem[];
  notes?: ApiNote[];
  sharedItinerary?: { publicSlug: string } | null;
  sharedItineraries?: { slug: string; permission?: string }[];
};

type ApiStop = {
  id: string;
  title?: string;
  city?: string;
  country?: string;
  arrivalDate?: string;
  departureDate?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  orderIndex?: number;
  position?: number;
  activities?: ApiActivity[];
};

type ApiActivity = {
  id: string;
  stopId?: string | null;
  title: string;
  category: string;
  cost?: number | string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  duration?: number | null;
  description?: string | null;
  notes?: string | null;
};

type ApiExpense = {
  id: string;
  title?: string;
  category: string;
  amount: number | string;
  createdAt?: string;
  incurredAt?: string;
};

type ApiPackingItem = {
  id: string;
  item?: string;
  label?: string;
  category: string;
  packed: boolean;
};

type ApiNote = {
  id: string;
  content?: string;
  body?: string;
  createdAt: string;
};

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error?.message ?? body?.error ?? "Request failed");
  }
  return (body?.data ?? body) as T;
}

function tripStart(trip: ApiTrip) {
  return trip.startDate ?? trip.startsAt ?? new Date().toISOString();
}

function tripEnd(trip: ApiTrip) {
  return trip.endDate ?? trip.endsAt ?? tripStart(trip);
}

function stopTitle(stop: ApiStop) {
  if (stop.city && stop.country) return `${stop.city}, ${stop.country}`;
  return stop.title ?? "Untitled stop";
}

function stopLocation(stop: ApiStop) {
  const title = stopTitle(stop);
  const [city, country] = title.split(",").map((part) => part.trim());
  return { city: stop.city ?? city, country: stop.country ?? country };
}

function isPublicTrip(trip: ApiTrip) {
  return trip.visibility === "PUBLIC" || Boolean(trip.sharedItinerary) || Boolean(trip.sharedItineraries?.length);
}

function useTrips() {
  return useQuery({
    queryKey: ["trips"],
    queryFn: () => fetchJson<ApiTrip[]>("/api/trips"),
    refetchInterval: 45_000
  });
}

const tripFormSchema = z
  .object({
    title: z.string().trim().min(2, "Trip title must be at least 2 characters.").max(140),
    destination: z.string().trim().max(180).optional(),
    description: z.string().trim().max(2000).optional(),
    budget: z.coerce.number().min(0, "Budget cannot be negative."),
    startDate: z.string().min(1, "Choose a start date."),
    endDate: z.string().min(1, "Choose an end date."),
    coverImage: z.union([z.string().url("Enter a valid image URL."), z.literal("")]).optional(),
  })
  .refine((value) => new Date(value.endDate) >= new Date(value.startDate), {
    message: "End date must be after the start date.",
    path: ["endDate"],
  });

type TripFormValues = z.infer<typeof tripFormSchema>;

const defaultTripValues: TripFormValues = {
  title: "",
  destination: "",
  description: "",
  budget: 2500,
  startDate: "",
  endDate: "",
  coverImage: "",
};

function toDateInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : format(date, "yyyy-MM-dd");
}

function tripCover(trip: ApiTrip) {
  return trip.coverImageUrl ?? trip.coverImage ?? "";
}

function tripToFormValues(trip: ApiTrip): TripFormValues {
  return {
    title: trip.title,
    destination: trip.destination ?? "",
    description: trip.description ?? "",
    budget: Number(trip.budget ?? 0),
    startDate: toDateInput(tripStart(trip)),
    endDate: toDateInput(tripEnd(trip)),
    coverImage: tripCover(trip),
  };
}

function dateInputToIso(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

function tripPayload(values: TripFormValues) {
  return {
    title: values.title,
    destination: values.destination?.trim() || values.title,
    description: values.description?.trim() || null,
    budget: Number(values.budget ?? 0),
    startDate: dateInputToIso(values.startDate),
    endDate: dateInputToIso(values.endDate),
    coverImage: values.coverImage?.trim() || null,
    status: "PLANNED",
  };
}

function optimisticTrip(values: TripFormValues): ApiTrip {
  return {
    id: `optimistic-${crypto.randomUUID()}`,
    title: values.title,
    destination: values.title,
    description: values.description?.trim() || null,
    startsAt: dateInputToIso(values.startDate),
    endsAt: dateInputToIso(values.endDate),
    budget: Number(values.budget ?? 0),
    status: "PLANNED",
    coverImageUrl: values.coverImage?.trim() || null,
    stops: [],
    activities: [],
    expenses: [],
    packingItems: [],
    notes: [],
    sharedItineraries: [],
  };
}

function mergeTripForm(trip: ApiTrip, values: TripFormValues): ApiTrip {
  return {
    ...trip,
    title: values.title,
    description: values.description?.trim() || null,
    startsAt: dateInputToIso(values.startDate),
    endsAt: dateInputToIso(values.endDate),
    budget: Number(values.budget ?? 0),
    coverImageUrl: values.coverImage?.trim() || null,
  };
}

function EmptyState({ title, description, href, action }: { title: string; description: string; href?: string; action?: string }) {
  return (
    <Card className="glass-card">
      <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MapPinned className="size-6" />
        </span>
        <div>
          <h3 className="font-bold">{title}</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {href && action ? (
          <Button asChild variant="gradient">
            <Link href={href}>{action}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton className="h-36" key={index} />
      ))}
    </div>
  );
}

function metric(label: string, value: string, detail: string, icon: React.ElementType) {
  const Icon = icon;
  return (
    <Card className="glass-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
          </div>
          <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardClient() {
  const { data, isLoading, error } = useTrips();
  const trips = data ?? [];
  const upcoming = trips
    .filter((trip) => new Date(tripEnd(trip)) >= new Date())
    .sort((a, b) => +new Date(tripStart(a)) - +new Date(tripStart(b)));
  const totalBudget = trips.reduce((sum, trip) => sum + Number(trip.budget ?? 0), 0);
  const expenses = trips.flatMap((trip) => trip.expenses ?? []);
  const spent = expenses.reduce((sum, expense) => sum + Number(expense.amount ?? 0), 0);
  const packedItems = trips.flatMap((trip) => trip.packingItems ?? []);
  const packedPercent = packedItems.length ? Math.round((packedItems.filter((item) => item.packed).length / packedItems.length) * 100) : 0;
  const firstStop = upcoming[0]?.stops?.[0];
  const firstLocation = firstStop ? stopLocation(firstStop) : undefined;

  const chartData = useMemo(() => {
    const grouped = new Map<string, number>();
    expenses.forEach((expense) => grouped.set(expense.category, (grouped.get(expense.category) ?? 0) + Number(expense.amount)));
    return Array.from(grouped, ([name, value]) => ({ name, value }));
  }, [expenses]);

  if (isLoading) return <LoadingGrid />;
  if (error) return <EmptyState title="Connect your backend" description={(error as Error).message} />;
  if (!trips.length) {
    return (
      <EmptyState
        title="No trips yet"
        description="Create your first multi-city itinerary and Traveloop will populate dashboards, budgets, packing progress, and weather from live data."
        href="/trips/new"
        action="Create Trip"
      />
    );
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metric("Upcoming trips", String(upcoming.length), "Trips with future end dates", CalendarDays)}
        {metric("Planned budget", formatCurrency(totalBudget), "Across all active itineraries", WalletCards)}
        {metric("Tracked spend", formatCurrency(spent), "From database expenses", DollarSign)}
        {metric("Packing progress", `${packedPercent}%`, "Packed items across trips", PackageCheck)}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Upcoming itinerary timeline</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {upcoming.slice(0, 4).map((trip) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold">{trip.title}</h3>
                    <Badge variant={isPublicTrip(trip) ? "emerald" : "secondary"}>{isPublicTrip(trip) ? "public" : "private"}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{trip.description ?? "No description yet"}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(trip.stops ?? []).slice(0, 4).map((stop) => (
                      <Badge variant="outline" key={stop.id}>
                        {stopLocation(stop).city}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground md:text-right">
                  <p>{format(new Date(tripStart(trip)), "MMM d")} - {format(new Date(tripEnd(trip)), "MMM d")}</p>
                  <p>{Math.max(1, differenceInCalendarDays(new Date(tripEnd(trip)), new Date(tripStart(trip))) + 1)} days</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <WeatherCard city={firstLocation?.city} country={firstLocation?.country} />
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Budget mix</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              {chartData.length ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={86}>
                      {chartData.map((entry, index) => (
                        <Cell key={entry.name} fill={["#2563EB", "#0EA5E9", "#10B981", "#34D399", "#0F172A"][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">Add expenses to generate analytics.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function WeatherCard({ city, country }: { city?: string; country?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["weather", city, country],
    queryFn: () =>
      fetchJson<{ location?: string; days?: { maxCelsius: number; description: string }[] }>(
        `/api/live/weather?location=${encodeURIComponent([city, country].filter(Boolean).join(", "))}`
      ),
    enabled: Boolean(city)
  });

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudSun className="size-5 text-sky" />
          Weather
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!city ? (
          <p className="text-sm text-muted-foreground">Add a stop to see live destination weather.</p>
        ) : isLoading ? (
          <Skeleton className="h-20" />
        ) : (
          <div>
            <p className="text-3xl font-bold">{typeof data?.days?.[0]?.maxCelsius === "number" ? `${Math.round(data.days[0].maxCelsius)} C` : "--"}</p>
            <p className="mt-1 text-sm text-muted-foreground">{data?.days?.[0]?.description ?? data?.location ?? `${city}, ${country ?? ""}`}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TripsClient() {
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<ApiTrip | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiTrip | null>(null);
  const { data, isLoading, error } = useTrips();
  const queryClient = useQueryClient();

  const createTrip = useMutation({
    mutationFn: (values: TripFormValues) =>
      fetchJson<ApiTrip>("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripPayload(values)),
      }),
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: ["trips"] });
      const previousTrips = queryClient.getQueryData<ApiTrip[]>(["trips"]) ?? [];
      const optimistic = optimisticTrip(values);
      queryClient.setQueryData<ApiTrip[]>(["trips"], sortTrips([...previousTrips, optimistic]));
      return { previousTrips, optimisticId: optimistic.id };
    },
    onSuccess: (trip, _values, context) => {
      queryClient.setQueryData<ApiTrip[]>(["trips"], (current = []) =>
        sortTrips(current.map((item) => (item.id === context?.optimisticId ? trip : item))),
      );
      toast.success("Trip created");
      setCreateOpen(false);
    },
    onError: (error, _values, context) => {
      queryClient.setQueryData(["trips"], context?.previousTrips ?? []);
      toast.error(error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["trips"] }),
  });

  const updateTrip = useMutation({
    mutationFn: ({ tripId, values }: { tripId: string; values: TripFormValues }) =>
      fetchJson<ApiTrip>(`/api/trips/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripPayload(values)),
      }),
    onMutate: async ({ tripId, values }) => {
      await queryClient.cancelQueries({ queryKey: ["trips"] });
      const previousTrips = queryClient.getQueryData<ApiTrip[]>(["trips"]) ?? [];
      queryClient.setQueryData<ApiTrip[]>(["trips"], (current = []) =>
        sortTrips(current.map((trip) => (trip.id === tripId ? mergeTripForm(trip, values) : trip))),
      );
      return { previousTrips };
    },
    onSuccess: (trip) => {
      queryClient.setQueryData<ApiTrip[]>(["trips"], (current = []) =>
        sortTrips(current.map((item) => (item.id === trip.id ? trip : item))),
      );
      toast.success("Trip updated");
      setEditingTrip(null);
    },
    onError: (error, _values, context) => {
      queryClient.setQueryData(["trips"], context?.previousTrips ?? []);
      toast.error(error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["trips"] }),
  });

  const deleteTrip = useMutation({
    mutationFn: (tripId: string) => fetchJson<null>(`/api/trips/${tripId}`, { method: "DELETE" }),
    onMutate: async (tripId) => {
      await queryClient.cancelQueries({ queryKey: ["trips"] });
      const previousTrips = queryClient.getQueryData<ApiTrip[]>(["trips"]) ?? [];
      queryClient.setQueryData<ApiTrip[]>(["trips"], previousTrips.filter((trip) => trip.id !== tripId));
      return { previousTrips };
    },
    onSuccess: () => {
      toast.success("Trip deleted");
      setDeleteTarget(null);
    },
    onError: (error, _tripId, context) => {
      queryClient.setQueryData(["trips"], context?.previousTrips ?? []);
      toast.error(error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["trips"] }),
  });

  const trips = (data ?? []).filter((trip) => trip.title.toLowerCase().includes(query.toLowerCase()));
  if (isLoading) return <LoadingGrid />;
  if (error) return <EmptyState title="Unable to load trips" description={(error as Error).message} />;

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 rounded-lg border border-white/50 bg-white/80 p-4 shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search trips..." />
        </div>
        <Button type="button" variant="gradient" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Create Trip
        </Button>
      </div>
      {!trips.length ? (
        <Card className="glass-card">
          <CardContent className="flex min-h-72 flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PlaneTakeoff className="size-6" />
            </span>
            <div>
              <h3 className="font-bold">{query ? "No matching trips" : "No trips yet"}</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {query ? "Try another search, or create a new itinerary from scratch." : "Create your first itinerary and Traveloop will save it to PostgreSQL instantly."}
              </p>
            </div>
            <Button type="button" variant="gradient" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Create Trip
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              isDeleting={deleteTrip.isPending && deleteTarget?.id === trip.id}
              onEdit={() => setEditingTrip(trip)}
              onDelete={() => setDeleteTarget(trip)}
            />
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create trip</DialogTitle>
            <DialogDescription>Add the core details. Stops, activities, packing, notes, and expenses can be planned next.</DialogDescription>
          </DialogHeader>
          <TripForm
            submitLabel="Create Trip"
            isSubmitting={createTrip.isPending}
            resetOnSuccess
            onCancel={() => setCreateOpen(false)}
            onSubmit={(values) => createTrip.mutateAsync(values)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingTrip)} onOpenChange={(open) => !open && setEditingTrip(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit trip</DialogTitle>
            <DialogDescription>Update trip details with owner-scoped persistence through Prisma.</DialogDescription>
          </DialogHeader>
          {editingTrip ? (
            <TripForm
              trip={editingTrip}
              submitLabel="Save Changes"
              isSubmitting={updateTrip.isPending}
              onCancel={() => setEditingTrip(null)}
              onSubmit={(values) => updateTrip.mutateAsync({ tripId: editingTrip.id, values })}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <span className="flex size-11 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </span>
            <DialogTitle>Delete trip?</DialogTitle>
            <DialogDescription>
              This removes {deleteTarget?.title ? `"${deleteTarget.title}"` : "this trip"} and its related stops, activities, expenses, notes, and packing items.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={deleteTrip.isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={!deleteTarget || deleteTrip.isPending}
              onClick={() => deleteTarget && deleteTrip.mutate(deleteTarget.id)}
            >
              {deleteTrip.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Delete Trip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TripCard({
  trip,
  isDeleting,
  onEdit,
  onDelete,
}: {
  trip: ApiTrip;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const explicitCover = tripCover(trip);
  const autoCover = !explicitCover && trip.destination ? getDestinationImageUrl(trip.destination) : null;
  const cover = explicitCover || autoCover || "";
  const start = new Date(tripStart(trip));
  const end = new Date(tripEnd(trip));
  const stopCount = trip.stops?.length ?? 0;

  return (
    <Card className="glass-card overflow-hidden">
      <div
        className="relative flex h-36 items-end bg-navy-radial p-4 text-white"
        style={
          cover
            ? {
                backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.08), rgba(15,23,42,0.7)), url("${cover}")`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }
            : undefined
        }
      >
        {!cover ? (
          <span className="flex size-10 items-center justify-center rounded-md bg-white/15 text-mint">
            <ImageIcon className="size-5" />
          </span>
        ) : null}
        <Badge className="ml-auto border-white/30 bg-white/20 text-white" variant={isPublicTrip(trip) ? "emerald" : "secondary"}>
          {isPublicTrip(trip) ? "public" : "private"}
        </Badge>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-bold">{trip.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {format(start, "MMM d")} - {format(end, "MMM d, yyyy")}
            </p>
          </div>
          <span className="whitespace-nowrap text-sm font-bold">{formatCurrency(Number(trip.budget ?? 0))}</span>
        </div>
        <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground">{trip.description ?? "No description yet."}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{stopCount} {stopCount === 1 ? "stop" : "stops"}</Badge>
            <Badge variant="sky">{Math.max(1, differenceInCalendarDays(end, start) + 1)} days</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" aria-label={`Edit ${trip.title}`} onClick={onEdit} disabled={isDeleting}>
              <Edit3 className="size-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label={`Delete ${trip.title}`} onClick={onDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function sortTrips(trips: ApiTrip[]) {
  return trips.toSorted((a, b) => +new Date(tripStart(a)) - +new Date(tripStart(b)));
}

export function CreateTripClient() {
  const queryClient = useQueryClient();
  const createTrip = useMutation({
    mutationFn: (values: TripFormValues) =>
      fetchJson<ApiTrip>("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripPayload(values)),
      }),
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: ["trips"] });
      const previousTrips = queryClient.getQueryData<ApiTrip[]>(["trips"]) ?? [];
      const optimistic = optimisticTrip(values);
      queryClient.setQueryData<ApiTrip[]>(["trips"], sortTrips([...previousTrips, optimistic]));
      return { previousTrips, optimisticId: optimistic.id };
    },
    onSuccess: (trip, _values, context) => {
      queryClient.setQueryData<ApiTrip[]>(["trips"], (current = []) =>
        sortTrips(current.map((item) => (item.id === context?.optimisticId ? trip : item))),
      );
      toast.success("Trip created");
    },
    onError: (error, _values, context) => {
      queryClient.setQueryData(["trips"], context?.previousTrips ?? []);
      toast.error(error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["trips"] }),
  });

  return (
    <Card className="glass-card max-w-4xl">
      <CardHeader>
        <CardTitle>Trip details</CardTitle>
      </CardHeader>
      <CardContent>
        <TripForm
          submitLabel="Create Trip"
          isSubmitting={createTrip.isPending}
          resetOnSuccess
          onSubmit={(values) => createTrip.mutateAsync(values)}
        />
      </CardContent>
    </Card>
  );
}

function TripForm({
  trip,
  submitLabel,
  isSubmitting,
  resetOnSuccess,
  onCancel,
  onSubmit,
}: {
  trip?: ApiTrip;
  submitLabel: string;
  isSubmitting: boolean;
  resetOnSuccess?: boolean;
  onCancel?: () => void;
  onSubmit: (values: TripFormValues) => Promise<unknown>;
}) {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isResolvingPhoto, setIsResolvingPhoto] = useState(false);
  const [resolvedLandmark, setResolvedLandmark] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: trip ? tripToFormValues(trip) : defaultTripValues,
  });
  const coverPreview = form.watch("coverImage");
  const destinationValue = form.watch("destination");

  const fetchDestinationPhoto = useCallback(
    async (dest: string) => {
      if (!dest || dest.length < 2) {
        setResolvedLandmark(null);
        return;
      }
      setIsResolvingPhoto(true);
      try {
        const res = await fetch(`/api/destination-photo?q=${encodeURIComponent(dest)}`);
        const json = await res.json();
        if (json?.data?.imageUrl) {
          const currentCover = form.getValues("coverImage");
          if (!currentCover || !coverFile) {
            form.setValue("coverImage", json.data.imageUrl, { shouldDirty: true });
          }
          setResolvedLandmark(`${json.data.landmark}, ${json.data.city}`);
        } else {
          setResolvedLandmark(null);
        }
      } catch {
        setResolvedLandmark(null);
      } finally {
        setIsResolvingPhoto(false);
      }
    },
    [form, coverFile]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (destinationValue) fetchDestinationPhoto(destinationValue);
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [destinationValue, fetchDestinationPhoto]);

  async function handleSubmit(values: TripFormValues) {
    let nextValues = values;

    if (coverFile) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", coverFile);
      const upload = await fetchJson<{ secureUrl: string }>("/api/uploads", {
        method: "POST",
        body: formData,
      }).catch((error) => {
        toast.warning(`${error.message} Saving trip without the uploaded cover.`);
        return null;
      });
      setIsUploading(false);
      nextValues = { ...values, coverImage: upload?.secureUrl ?? values.coverImage };
    }

    await onSubmit(nextValues);
    setCoverFile(null);
    if (resetOnSuccess) {
      form.reset(defaultTripValues);
    }
  }

  const pending = isSubmitting || isUploading;

  return (
    <form className="grid gap-5" method="post" onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Trip title" htmlFor="trip-title" error={form.formState.errors.title?.message}>
          <Input id="trip-title" placeholder="Summer city loop" {...form.register("title")} />
        </Field>
        <Field label="Destination" htmlFor="trip-destination" error={form.formState.errors.destination?.message}>
          <div className="relative">
            <Input id="trip-destination" placeholder="e.g. Paris, Tokyo, London..." {...form.register("destination")} />
            {isResolvingPhoto ? (
              <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            ) : resolvedLandmark ? (
              <Camera className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-emerald-500" />
            ) : null}
          </div>
          {resolvedLandmark ? (
            <p className="text-xs text-emerald-600">📸 Auto-attached: {resolvedLandmark}</p>
          ) : null}
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Budget" htmlFor="trip-budget" error={form.formState.errors.budget?.message}>
          <Input id="trip-budget" type="number" min="0" step="1" {...form.register("budget")} />
        </Field>
        <Field label="Start date" htmlFor="trip-start-date" error={form.formState.errors.startDate?.message}>
          <Input
            id="trip-start-date"
            type="date"
            {...form.register("startDate")}
            onInput={(event) => {
              form.setValue("startDate", event.currentTarget.value, { shouldDirty: true, shouldValidate: true });
            }}
          />
        </Field>
        <Field label="End date" htmlFor="trip-end-date" error={form.formState.errors.endDate?.message}>
          <Input
            id="trip-end-date"
            type="date"
            {...form.register("endDate")}
            onInput={(event) => {
              form.setValue("endDate", event.currentTarget.value, { shouldDirty: true, shouldValidate: true });
            }}
          />
        </Field>
      </div>
      <Field label="Description" htmlFor="trip-description" error={form.formState.errors.description?.message}>
        <Textarea id="trip-description" placeholder="What kind of journey are you planning?" {...form.register("description")} />
      </Field>
      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <div className="grid gap-4">
          <Field label="Cover image URL" htmlFor="trip-cover-image" error={form.formState.errors.coverImage?.message}>
            <Input id="trip-cover-image" placeholder="https://images.example.com/trip-cover.jpg" {...form.register("coverImage")} />
          </Field>
          <Field label="Cover photo upload" htmlFor="trip-cover-upload">
            <Input id="trip-cover-upload" type="file" accept="image/*" onChange={(event) => setCoverFile(event.target.files?.[0] ?? null)} />
          </Field>
        </div>
        <div
          className="grid min-h-40 place-items-center rounded-lg border bg-navy-radial text-center text-sm font-semibold text-white"
          style={
            coverPreview
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.08), rgba(15,23,42,0.72)), url("${coverPreview}")`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }
              : undefined
          }
        >
          {!coverPreview ? (
            <span className="flex flex-col items-center gap-2 text-white/75">
              <ImageIcon className="size-6 text-mint" />
              Cover preview
            </span>
          ) : null}
        </div>
      </div>
      <DialogFooter>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
        ) : null}
        <Button disabled={pending} type="submit" variant="gradient">
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending ? "Saving..." : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

function Field({ label, htmlFor, error, children }: { label: string; htmlFor?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function ItineraryClient() {
  return <ItineraryBuilder />;
}

export function BudgetClient() {
  return <BudgetWorkspace />;
}

export function ActivitiesClient() {
  return <LiveDiscoveryWorkspace />;
}

export function PackingClient() {
  return <PackingWorkspace />;
}

export function NotesClient() {
  return <NotesWorkspace />;
}

export function SharedTripsClient() {
  return <SharingWorkspace />;
}

export function SettingsClient() {
  return (
    <Tabs defaultValue="profile" className="max-w-4xl">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
        <TabsTrigger value="preferences">Preferences</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Profile editing</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Name">
              <Input placeholder="Traveloop user" />
            </Field>
            <Field label="Avatar upload">
              <Input type="file" accept="image/*" />
            </Field>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="privacy">
        <Card className="glass-card">
          <CardContent className="grid gap-3 p-5">
            <label className="flex items-center justify-between rounded-lg border bg-white p-3">
              <span className="font-medium">Default trips to private</span>
              <Checkbox defaultChecked />
            </label>
            <label className="flex items-center justify-between rounded-lg border bg-white p-3">
              <span className="font-medium">Allow itinerary copy</span>
              <Checkbox />
            </label>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="preferences">
        <Card className="glass-card">
          <CardContent className="grid gap-4 p-5">
            <Field label="Language">
              <Input placeholder="English" />
            </Field>
            <Field label="Theme">
              <Input placeholder="System" />
            </Field>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
