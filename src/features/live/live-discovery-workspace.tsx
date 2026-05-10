"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  CloudSun,
  ExternalLink,
  Loader2,
  MapIcon,
  MapPin,
  Navigation,
  Plus,
  Search,
  Star,
  Ticket,
  Utensils,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { addDestinationStopAction, saveDiscoveredActivityAction } from "@/actions/live-discovery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  ActivityDiscoveryResponse,
  DestinationResult,
  DestinationSearchResponse,
  DiscoveredActivity,
  LiveProviderStatus,
  WeatherForecast,
} from "@/types/live-data";

type Trip = {
  id: string;
  title: string;
  startsAt?: string;
  endsAt?: string;
  startDate?: string;
  endDate?: string;
  stops?: Stop[];
};

type Stop = {
  id: string;
  title: string;
  startsAt?: string | null;
  endsAt?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  position?: number;
};

type MapPoint = {
  id: string;
  title: string;
  subtitle?: string;
  latitude?: number | null;
  longitude?: number | null;
  tone?: "primary" | "emerald" | "sky";
};

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error?.message ?? body?.error ?? "Request failed");
  return (body?.data ?? body) as T;
}

function useDebouncedValue(value: string, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [delay, value]);
  return debounced;
}

function tripStart(trip?: Trip) {
  return trip?.startDate ?? trip?.startsAt ?? null;
}

function tripEnd(trip?: Trip) {
  return trip?.endDate ?? trip?.endsAt ?? tripStart(trip);
}

function formatProvider(provider: LiveProviderStatus["provider"]) {
  return provider
    .replace("google_places", "Google Places")
    .replace("openweather", "OpenWeather")
    .replace("ticketmaster", "Ticketmaster")
    .replace("mapbox", "Mapbox")
    .replace("yelp", "Yelp");
}

function stopPosition(stop: Stop) {
  return stop.position ?? 0;
}

export function LiveDiscoveryWorkspace() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("Lisbon");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [destinationType, setDestinationType] = useState("city");
  const [activityQuery, setActivityQuery] = useState("restaurants attractions");
  const [selectedDestination, setSelectedDestination] = useState<DestinationResult | null>(null);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [selectedStopId, setSelectedStopId] = useState("");
  const debouncedQuery = useDebouncedValue(query);

  const tripsQuery = useQuery({
    queryKey: ["trips"],
    queryFn: () => fetchJson<Trip[]>("/api/trips"),
    refetchInterval: 45_000,
  });
  const trips = useMemo(() => tripsQuery.data ?? [], [tripsQuery.data]);
  const selectedTrip = trips.find((trip) => trip.id === selectedTripId) ?? trips[0];
  const stops = useMemo(() => (selectedTrip?.stops ?? []).toSorted((a, b) => stopPosition(a) - stopPosition(b)), [selectedTrip?.stops]);

  useEffect(() => {
    if (!selectedTripId && trips[0]) setSelectedTripId(trips[0].id);
  }, [selectedTripId, trips]);

  useEffect(() => {
    if (!selectedStopId && stops[0]) setSelectedStopId(stops[0].id);
  }, [selectedStopId, stops]);

  const destinationsQuery = useQuery({
    queryKey: ["live-destinations", debouncedQuery, country, region, destinationType],
    queryFn: () => {
      const params = new URLSearchParams({
        q: debouncedQuery,
        limit: "8",
        type: destinationType,
      });
      if (country.trim()) params.set("country", country.trim());
      if (region.trim()) params.set("region", region.trim());
      return fetchJson<DestinationSearchResponse>(`/api/live/destinations?${params}`);
    },
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    const first = destinationsQuery.data?.items[0];
    if (!selectedDestination && first) setSelectedDestination(first);
  }, [destinationsQuery.data?.items, selectedDestination]);

  const weatherQuery = useQuery({
    queryKey: ["live-weather", selectedDestination?.id],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedDestination?.latitude !== undefined && selectedDestination.longitude !== undefined) {
        params.set("lat", String(selectedDestination.latitude));
        params.set("lon", String(selectedDestination.longitude));
      } else if (selectedDestination) {
        params.set("location", selectedDestination.fullName);
      }
      return fetchJson<WeatherForecast | null>(`/api/live/weather?${params}`);
    },
    enabled: Boolean(selectedDestination),
    staleTime: 1000 * 60 * 30,
  });

  const activitiesQuery = useQuery({
    queryKey: ["live-activities", selectedDestination?.id, activityQuery],
    queryFn: () => {
      const params = new URLSearchParams({
        location: selectedDestination?.fullName ?? debouncedQuery,
        query: activityQuery || "things to do",
        limit: "18",
      });
      if (selectedDestination?.latitude !== undefined && selectedDestination.longitude !== undefined) {
        params.set("lat", String(selectedDestination.latitude));
        params.set("lon", String(selectedDestination.longitude));
      }
      return fetchJson<ActivityDiscoveryResponse>(`/api/live/activities?${params}`);
    },
    enabled: Boolean(selectedDestination),
    staleTime: 1000 * 60 * 20,
  });

  const mapConfigQuery = useQuery({
    queryKey: ["mapbox-config"],
    queryFn: () => fetchJson<{ mapboxToken: string | null; configured: boolean }>("/api/live/map/config"),
    staleTime: Infinity,
  });

  const addStop = useMutation({
    mutationFn: (destination: DestinationResult) =>
      addDestinationStopAction({
        tripId: selectedTrip.id,
        title: destination.name,
        address: destination.fullName,
        latitude: destination.latitude,
        longitude: destination.longitude,
        startsAt: tripStart(selectedTrip),
        endsAt: tripEnd(selectedTrip),
        position: stops.length,
      }),
    onSuccess: () => {
      toast.success("Destination added to trip");
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const saveActivity = useMutation({
    mutationFn: (activity: DiscoveredActivity) =>
      saveDiscoveredActivityAction({
        tripId: selectedTrip.id,
        stopId: selectedStopId || null,
        title: activity.title,
        category: activity.category,
        description: activity.description,
        address: activity.address,
        externalId: activity.providerId ?? activity.id,
        bookingUrl: activity.url,
        startsAt: activity.startsAt ?? null,
        cost: null,
      }),
    onSuccess: () => {
      toast.success("Activity saved to itinerary");
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const mapPoints = useMemo<MapPoint[]>(() => {
    const destinationPoints: MapPoint[] = selectedDestination
      ? [
          {
            id: selectedDestination.id,
            title: selectedDestination.name,
            subtitle: selectedDestination.fullName,
            latitude: selectedDestination.latitude,
            longitude: selectedDestination.longitude,
            tone: "emerald",
          },
        ]
      : [];
    const stopPoints = stops.map((stop) => ({
      id: stop.id,
      title: stop.title,
      subtitle: "Trip stop",
      latitude: stop.latitude,
      longitude: stop.longitude,
      tone: "primary" as const,
    }));
    const activityPoints = (activitiesQuery.data?.items ?? []).slice(0, 8).map((activity) => ({
      id: activity.id,
      title: activity.title,
      subtitle: formatProvider(activity.source),
      latitude: activity.latitude,
      longitude: activity.longitude,
      tone: "sky" as const,
    }));
    return [...stopPoints, ...destinationPoints, ...activityPoints].filter((point) => point.latitude !== undefined && point.longitude !== undefined);
  }, [activitiesQuery.data?.items, selectedDestination, stops]);

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 rounded-lg border border-white/60 bg-white/85 p-4 shadow-soft backdrop-blur-xl xl:grid-cols-[1fr_auto] xl:items-end">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_120px_180px_150px]">
          <Field label="Destination search">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cities, countries, regions..." />
            </div>
          </Field>
          <Field label="Country">
            <Input value={country} onChange={(event) => setCountry(event.target.value.toUpperCase())} maxLength={2} placeholder="US" />
          </Field>
          <Field label="Region">
            <Input value={region} onChange={(event) => setRegion(event.target.value)} placeholder="California" />
          </Field>
          <Field label="Type">
            <select
              className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={destinationType}
              onChange={(event) => setDestinationType(event.target.value)}
            >
              <option value="city">Cities</option>
              <option value="region">Regions</option>
              <option value="country">Countries</option>
              <option value="locality">Localities</option>
              <option value="place">Places</option>
            </select>
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:w-[420px]">
          <Field label="Trip">
            <select
              className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={selectedTrip?.id ?? ""}
              onChange={(event) => {
                setSelectedTripId(event.target.value);
                setSelectedStopId("");
              }}
            >
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Itinerary stop">
            <select
              className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={selectedStopId}
              onChange={(event) => setSelectedStopId(event.target.value)}
            >
              {stops.length ? stops.map((stop) => <option key={stop.id} value={stop.id}>{stop.title}</option>) : <option value="">No stops yet</option>}
            </select>
          </Field>
        </div>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="grid gap-6">
          <LiveMapCard
            token={mapConfigQuery.data?.mapboxToken ?? null}
            configured={Boolean(mapConfigQuery.data?.configured)}
            points={mapPoints}
            routePoints={stops.map((stop) => ({ latitude: stop.latitude, longitude: stop.longitude })).filter((point) => point.latitude && point.longitude)}
          />

          <DestinationResults
            destinations={destinationsQuery.data?.items ?? []}
            isLoading={destinationsQuery.isLoading}
            selectedId={selectedDestination?.id}
            providers={destinationsQuery.data?.providers ?? []}
            onSelect={setSelectedDestination}
            onAdd={(destination) => addStop.mutate(destination)}
            adding={addStop.isPending}
            hasTrip={Boolean(selectedTrip)}
          />

          <ActivityDiscovery
            activityQuery={activityQuery}
            onActivityQuery={setActivityQuery}
            activities={activitiesQuery.data?.items ?? []}
            providers={activitiesQuery.data?.providers ?? []}
            isLoading={activitiesQuery.isLoading}
            onSave={(activity) => saveActivity.mutate(activity)}
            saving={saveActivity.isPending}
            hasStop={Boolean(selectedStopId)}
          />
        </div>

        <aside className="grid gap-6 content-start">
          <WeatherPanel forecast={weatherQuery.data ?? null} isLoading={weatherQuery.isLoading} destination={selectedDestination} />
          <ProviderPanel providers={[...(destinationsQuery.data?.providers ?? []), ...(activitiesQuery.data?.providers ?? [])]} />
          <TripRoutePanel trip={selectedTrip} stops={stops} />
        </aside>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function DestinationResults({
  destinations,
  isLoading,
  selectedId,
  providers,
  onSelect,
  onAdd,
  adding,
  hasTrip,
}: {
  destinations: DestinationResult[];
  isLoading: boolean;
  selectedId?: string;
  providers: LiveProviderStatus[];
  onSelect: (destination: DestinationResult) => void;
  onAdd: (destination: DestinationResult) => void;
  adding: boolean;
  hasTrip: boolean;
}) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="size-5 text-primary" />
          Destination autocomplete
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => <Skeleton className="h-36" key={index} />)}
          </div>
        ) : destinations.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {destinations.map((destination) => (
              <motion.button
                type="button"
                key={destination.id}
                whileHover={{ y: -3 }}
                className={`rounded-lg border bg-white p-4 text-left shadow-sm transition ${selectedId === destination.id ? "border-primary ring-2 ring-primary/15" : "hover:border-sky"}`}
                onClick={() => onSelect(destination)}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-md bg-travel-gradient text-white">
                    <MapPin className="size-5" />
                  </span>
                  <Badge variant="sky">{destination.type ?? "city"}</Badge>
                </div>
                <h3 className="mt-4 font-bold">{destination.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{destination.fullName}</p>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">{[destination.region, destination.countryCode].filter(Boolean).join(", ") || "Mapbox"}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!hasTrip || adding}
                    onClick={(event) => {
                      event.stopPropagation();
                      onAdd(destination);
                    }}
                  >
                    {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                    Add
                  </Button>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <EmptyBlock title="No destinations found" description={providers[0]?.message ?? "Try another city, country, or region filter."} />
        )}
      </CardContent>
    </Card>
  );
}

function ActivityDiscovery({
  activityQuery,
  onActivityQuery,
  activities,
  providers,
  isLoading,
  onSave,
  saving,
  hasStop,
}: {
  activityQuery: string;
  onActivityQuery: (value: string) => void;
  activities: DiscoveredActivity[];
  providers: LiveProviderStatus[];
  isLoading: boolean;
  onSave: (activity: DiscoveredActivity) => void;
  saving: boolean;
  hasStop: boolean;
}) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Ticket className="size-5 text-emerald" />
            Restaurants, attractions, and events
          </CardTitle>
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" value={activityQuery} onChange={(event) => onActivityQuery(event.target.value)} placeholder="Restaurants, museums, concerts..." />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => <Skeleton className="h-64" key={index} />)}
          </div>
        ) : activities.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence initial={false}>
              {activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} onSave={onSave} saving={saving} hasStop={hasStop} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyBlock title="No live activities yet" description={providers.find((provider) => provider.configured)?.message ?? "Select a destination and search for restaurants, attractions, or events."} />
        )}
      </CardContent>
    </Card>
  );
}

function ActivityCard({
  activity,
  onSave,
  saving,
  hasStop,
}: {
  activity: DiscoveredActivity;
  onSave: (activity: DiscoveredActivity) => void;
  saving: boolean;
  hasStop: boolean;
}) {
  const SourceIcon = activity.source === "yelp" ? Utensils : activity.source === "ticketmaster" ? Ticket : MapPin;
  return (
    <motion.article layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <div
        className="h-36 bg-navy-radial"
        style={activity.imageUrl ? { backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.05), rgba(15,23,42,0.62)), url("${activity.imageUrl}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      />
      <div className="grid gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-2 font-bold">{activity.title}</h3>
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{activity.address ?? formatProvider(activity.source)}</p>
          </div>
          <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <SourceIcon className="size-4" />
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{activity.category}</Badge>
          {activity.rating ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
              <Star className="size-3 fill-current" />
              {activity.rating}
              {activity.reviewCount ? ` (${activity.reviewCount})` : null}
            </span>
          ) : null}
          {activity.price ? <Badge variant="emerald">{activity.price}</Badge> : null}
        </div>
        {activity.startsAt ? <p className="text-xs text-muted-foreground">{format(new Date(activity.startsAt), "MMM d, h:mm a")}</p> : null}
        <div className="flex items-center justify-between gap-2 pt-1">
          {activity.url ? (
            <Button asChild size="sm" variant="outline">
              <a href={activity.url} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                Details
              </a>
            </Button>
          ) : <span />}
          <Button type="button" size="sm" variant="gradient" disabled={!hasStop || saving} onClick={() => onSave(activity)}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Save
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

function WeatherPanel({ forecast, isLoading, destination }: { forecast: WeatherForecast | null; isLoading: boolean; destination: DestinationResult | null }) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudSun className="size-5 text-sky" />
          Live weather
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-44" />
        ) : forecast ? (
          <div className="grid gap-3">
            <div>
              <p className="text-sm text-muted-foreground">{forecast.location}</p>
              <p className="mt-2 text-4xl font-bold">{Math.round(forecast.days[0]?.maxCelsius ?? 0)} C</p>
              <p className="mt-1 text-sm capitalize text-muted-foreground">{forecast.days[0]?.description ?? "Forecast unavailable"}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {forecast.days.slice(0, 3).map((day) => (
                <div key={day.date} className="rounded-lg border bg-white p-3">
                  <p className="text-xs font-semibold text-muted-foreground">{format(new Date(day.date), "EEE")}</p>
                  <p className="mt-1 font-bold">{Math.round(day.maxCelsius)} C</p>
                  <p className="mt-1 line-clamp-2 text-xs capitalize text-muted-foreground">{day.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyBlock title="Weather unavailable" description={destination ? "Add an OpenWeather API key to show live forecasts." : "Select a destination to load a forecast."} />
        )}
      </CardContent>
    </Card>
  );
}

function ProviderPanel({ providers }: { providers: LiveProviderStatus[] }) {
  const unique = Array.from(new Map(providers.map((provider) => [provider.provider, provider])).values());
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Provider health</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {unique.length ? unique.map((provider) => (
          <div key={provider.provider} className="flex items-center justify-between gap-3 rounded-lg border bg-white p-3">
            <span className="text-sm font-semibold">{formatProvider(provider.provider)}</span>
            <Badge variant={provider.ok ? "emerald" : provider.configured ? "secondary" : "outline"}>{provider.ok ? "live" : provider.configured ? "check key" : "missing"}</Badge>
          </div>
        )) : <p className="text-sm text-muted-foreground">Search to check provider status.</p>}
      </CardContent>
    </Card>
  );
}

function TripRoutePanel({ trip, stops }: { trip?: Trip; stops: Stop[] }) {
  return (
    <Card className="navy-panel rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Navigation className="size-5 text-mint" />
          Trip route
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {trip ? (
          <>
            <p className="text-sm leading-6 text-white/65">{trip.title}</p>
            {stops.length ? stops.map((stop, index) => (
              <div key={stop.id} className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-md bg-white text-sm font-bold text-primary">{index + 1}</span>
                <div>
                  <p className="font-semibold text-white">{stop.title}</p>
                  <p className="text-xs text-white/55">{stop.latitude && stop.longitude ? "Mapped stop" : "Coordinates pending"}</p>
                </div>
              </div>
            )) : <p className="text-sm text-white/60">Add a destination to begin route visualization.</p>}
          </>
        ) : (
          <p className="text-sm text-white/60">Create a trip to save destinations and activities.</p>
        )}
      </CardContent>
    </Card>
  );
}

function LiveMapCard({
  token,
  configured,
  points,
  routePoints,
}: {
  token: string | null;
  configured: boolean;
  points: MapPoint[];
  routePoints: Array<{ latitude?: number | null; longitude?: number | null }>;
}) {
  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="border-b border-white/70">
        <CardTitle className="flex items-center gap-2">
          <MapIcon className="size-5 text-primary" />
          Interactive travel map
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <MapboxLiveMap token={token} configured={configured} points={points} routePoints={routePoints} />
      </CardContent>
    </Card>
  );
}

function MapboxLiveMap({
  token,
  configured,
  points,
  routePoints,
}: {
  token: string | null;
  configured: boolean;
  points: MapPoint[];
  routePoints: Array<{ latitude?: number | null; longitude?: number | null }>;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const mapPoints = useMemo(() => points.filter((point) => point.latitude !== undefined && point.longitude !== undefined), [points]);
  const route = useMemo(() => routePoints.filter((point) => point.latitude !== undefined && point.longitude !== undefined), [routePoints]);

  useEffect(() => {
    if (!token || !containerRef.current || !mapPoints.length) return;
    let cleanup = () => {};
    setReady(false);

    void import("mapbox-gl").then((mapboxModule) => {
      const mapboxgl = mapboxModule.default;
      mapboxgl.accessToken = token;
      const center = mapPoints[0];
      const map = new mapboxgl.Map({
        container: containerRef.current as HTMLDivElement,
        style: "mapbox://styles/mapbox/light-v11",
        center: [center.longitude!, center.latitude!],
        zoom: mapPoints.length > 1 ? 5 : 10,
        attributionControl: false,
      });

      mapPoints.forEach((point) => {
        const color = point.tone === "emerald" ? "#10B981" : point.tone === "sky" ? "#0EA5E9" : "#2563EB";
        new mapboxgl.Marker({ color })
          .setLngLat([point.longitude!, point.latitude!])
          .setPopup(new mapboxgl.Popup({ offset: 18 }).setHTML(`<strong>${point.title}</strong><br/>${point.subtitle ?? ""}`))
          .addTo(map);
      });

      map.on("load", () => {
        if (route.length > 1) {
          map.addSource("traveloop-route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: route.map((point) => [point.longitude!, point.latitude!]),
              },
            },
          });
          map.addLayer({
            id: "traveloop-route",
            type: "line",
            source: "traveloop-route",
            paint: {
              "line-color": "#2563EB",
              "line-width": 4,
              "line-opacity": 0.75,
            },
          });
        }

        const bounds = new mapboxgl.LngLatBounds();
        mapPoints.forEach((point) => bounds.extend([point.longitude!, point.latitude!]));
        if (mapPoints.length > 1) map.fitBounds(bounds, { padding: 70, maxZoom: 11 });
        setReady(true);
      });

      cleanup = () => map.remove();
    });

    return () => cleanup();
  }, [mapPoints, route, token]);

  if (!configured || !token) {
    return <MapFallback title="Mapbox token missing" description="Set MAPBOX_TOKEN or NEXT_PUBLIC_MAPBOX_TOKEN to enable interactive maps." />;
  }

  if (!mapPoints.length) {
    return <MapFallback title="No mapped places yet" description="Search a destination or save trip stops with coordinates to render pins and routes." />;
  }

  return (
    <div className="relative h-[480px] bg-slate-100">
      <div ref={containerRef} className="h-full w-full" />
      {!ready ? <div className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur"><Loader2 className="size-6 animate-spin text-primary" /></div> : null}
    </div>
  );
}

function MapFallback({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid h-[480px] place-items-center bg-navy-radial p-8 text-center">
      <div className="grid justify-items-center gap-4">
        <span className="flex size-12 items-center justify-center rounded-lg bg-white text-primary shadow-soft">
          <MapPin className="size-6" />
        </span>
        <div>
          <h3 className="font-bold">{title}</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid min-h-36 place-items-center rounded-lg border border-dashed bg-white p-5 text-center">
      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
