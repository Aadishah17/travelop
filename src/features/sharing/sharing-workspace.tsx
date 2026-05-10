"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNowStrict } from "date-fns";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Copy,
  Globe2,
  HeartHandshake,
  Loader2,
  LockKeyhole,
  MapPinned,
  Send,
  Share2,
  Sparkles,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { copySharedTripAction } from "@/actions/sharing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { traveloopKeys, useTrips } from "@/features/traveloop";
import type { Trip } from "@/features/traveloop";
import { formatCurrency } from "@/lib/utils";

type SharePermission = "VIEW" | "COPY";

type CommunityTrip = {
  id: string;
  slug: string;
  permission: SharePermission;
  featured: boolean;
  shareUrl: string;
  owner: {
    id: string;
    name: string | null;
    image: string | null;
    createdAt?: string;
  };
  trip: Trip & {
    _count?: {
      stops: number;
      activities: number;
      expenses: number;
    };
  };
};

type CommunityResponse = {
  trips: CommunityTrip[];
  trendingDestinations: Array<{ destination: string; trips: number; activities: number }>;
};

type ShareSettings = {
  tripId: string;
  visibility: "PRIVATE" | "PUBLIC";
  permission?: SharePermission;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.error?.message ?? "Traveloop request failed");
  }

  return (body?.data ?? body) as T;
}

function initial(value?: string | null) {
  return (value?.trim().charAt(0) || "T").toUpperCase();
}

function absoluteShareUrl(slug: string) {
  if (typeof window === "undefined") return `/trips/${slug}`;
  return `${window.location.origin}/trips/${slug}`;
}

function tripDates(trip: Trip) {
  const start = trip.startsAt ?? trip.startDate;

  if (!start) return "Dates pending";

  const end = trip.endsAt ?? trip.endDate ?? start;
  return `${format(new Date(start), "MMM d")} - ${format(new Date(end), "MMM d, yyyy")}`;
}

function tripBudget(trip: Trip) {
  if (trip.budget && typeof trip.budget === "object" && "amount" in trip.budget) {
    return formatCurrency(Number(trip.budget.amount), trip.budget.currency);
  }

  return formatCurrency(Number(trip.budget ?? 0), trip.currency ?? "USD");
}

function shareSlug(trip: Trip) {
  return trip.sharedItineraries?.[0]?.slug;
}

function sharePermission(trip: Trip): SharePermission {
  return (trip.sharedItineraries?.[0]?.permission as SharePermission | undefined) ?? "COPY";
}

function isPublicTrip(trip: Trip) {
  return trip.visibility === "PUBLIC" && Boolean(shareSlug(trip));
}

function stopsLabel(trip: Trip) {
  const stops = trip.stops?.length ?? trip.stopsCount ?? 0;
  const activities = trip.activities?.length ?? trip.activitiesCount ?? 0;
  return `${stops} stops · ${activities} activities`;
}

function destinationLabel(destination: Trip["destination"]) {
  if (!destination) return "Multi-city itinerary";
  if (typeof destination === "string") return destination;
  return [destination.name, destination.country].filter(Boolean).join(", ");
}

async function copyToClipboard(value: string) {
  await navigator.clipboard.writeText(value);
  toast.success("Share link copied.");
}

function SocialButtons({ slug, title }: { slug: string; title: string }) {
  const url = absoluteShareUrl(slug);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(`Explore ${title} on Traveloop`);

  return (
    <div className="flex flex-wrap gap-2" aria-label="Social sharing actions">
      <Button type="button" variant="outline" size="sm" onClick={() => copyToClipboard(url)} aria-label="Copy public itinerary link">
        <Copy className="size-4" />
        Copy link
      </Button>
      <Button asChild variant="outline" size="sm">
        <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noreferrer">
          <Send className="size-4" />
          X
        </a>
      </Button>
      <Button asChild variant="outline" size="sm">
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noreferrer">
          <Share2 className="size-4" />
          Facebook
        </a>
      </Button>
    </div>
  );
}

function CommunitySkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton className="h-80 rounded-lg" key={index} />
      ))}
    </div>
  );
}

function CommunityTripCard({ item }: { item: CommunityTrip }) {
  const [isPending, startTransition] = useTransition();
  const { status } = useSession();

  const copyTrip = () => {
    startTransition(async () => {
      const result = await copySharedTripAction(item.slug);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="group overflow-hidden rounded-lg border border-white/70 bg-white/85 shadow-soft backdrop-blur-xl"
    >
      <div className="relative min-h-40 bg-navy-radial p-5 text-white">
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-navy/80 to-transparent" />
        <div className="relative z-10 flex items-start justify-between gap-3">
          <Badge variant={item.featured ? "emerald" : "secondary"}>{item.featured ? "Featured" : "Community"}</Badge>
          <span className="rounded-md bg-white/15 px-2 py-1 text-xs font-semibold backdrop-blur">{item.permission === "COPY" ? "Copy-ready" : "Read-only"}</span>
        </div>
        <div className="relative z-10 mt-14">
          <h3 className="line-clamp-2 text-2xl font-bold tracking-normal">{item.trip.title}</h3>
          <p className="mt-2 text-sm text-white/75">{destinationLabel(item.trip.destination)}</p>
        </div>
      </div>

      <div className="grid gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 ring-2 ring-sky/20">
              <AvatarImage src={item.owner.image ?? undefined} alt={item.owner.name ?? "Traveler"} />
              <AvatarFallback>{initial(item.owner.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-bold text-navy">{item.owner.name ?? "Traveloop traveler"}</p>
              <p className="text-xs text-muted-foreground">
                {item.owner.createdAt ? `Member for ${formatDistanceToNowStrict(new Date(item.owner.createdAt))}` : "Public traveler"}
              </p>
            </div>
          </div>
          <Button asChild variant="ghost" size="icon" aria-label={`Open ${item.trip.title}`}>
            <Link href={`/trips/${item.slug}`}>
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{item.trip.description ?? "A public Traveloop plan shared for inspiration."}</p>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-sky/10 p-3">
            <p className="text-lg font-bold text-navy">{item.trip._count?.stops ?? item.trip.stops?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Stops</p>
          </div>
          <div className="rounded-md bg-emerald/10 p-3">
            <p className="text-lg font-bold text-navy">{item.trip._count?.activities ?? item.trip.activities?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Activities</p>
          </div>
          <div className="rounded-md bg-mint/20 p-3">
            <p className="text-lg font-bold text-navy">{tripBudget(item.trip)}</p>
            <p className="text-xs text-muted-foreground">Budget</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="gradient" size="sm">
            <Link href={`/trips/${item.slug}`}>
              <Globe2 className="size-4" />
              View
            </Link>
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={copyTrip} disabled={isPending || item.permission !== "COPY" || status === "loading"}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Copy className="size-4" />}
            Copy trip
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

function OwnTripShareCard({
  trip,
  onUpdate,
  updating,
}: {
  trip: Trip;
  onUpdate: (settings: ShareSettings) => void;
  updating: boolean;
}) {
  const slug = shareSlug(trip);
  const isPublic = isPublicTrip(trip);
  const url = slug ? absoluteShareUrl(slug) : null;

  return (
    <Card className="glass-card">
      <CardContent className="grid gap-4 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={isPublic ? "emerald" : "secondary"}>
                {isPublic ? <Globe2 className="mr-1 size-3" /> : <LockKeyhole className="mr-1 size-3" />}
                {isPublic ? "Public" : "Private"}
              </Badge>
              <Badge variant="outline">{sharePermission(trip) === "COPY" ? "Copy allowed" : "View only"}</Badge>
            </div>
            <h3 className="mt-3 text-xl font-bold tracking-normal text-navy">{trip.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{stopsLabel(trip)}</p>
            <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <CalendarDays className="size-4" />
              {tripDates(trip)}
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-lg border bg-white p-3">
            <span className="text-sm font-semibold text-navy">Publish</span>
            <Switch
              checked={isPublic}
              disabled={updating}
              onCheckedChange={(checked) =>
                onUpdate({
                  tripId: trip.id,
                  visibility: checked ? "PUBLIC" : "PRIVATE",
                  permission: sharePermission(trip),
                })
              }
              aria-label={`Toggle public sharing for ${trip.title}`}
            />
          </div>
        </div>

        {isPublic && slug ? (
          <div className="rounded-lg border bg-white p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase text-muted-foreground">Shareable URL</p>
                <p className="mt-1 truncate text-sm font-semibold text-navy">{url}</p>
              </div>
              <SocialButtons slug={slug} title={trip.title} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["VIEW", "COPY"] as SharePermission[]).map((permission) => (
                <Button
                  key={permission}
                  type="button"
                  size="sm"
                  variant={sharePermission(trip) === permission ? "gradient" : "outline"}
                  disabled={updating}
                  onClick={() => onUpdate({ tripId: trip.id, visibility: "PUBLIC", permission })}
                >
                  {permission === "COPY" ? <Copy className="size-4" /> : <CheckCircle2 className="size-4" />}
                  {permission === "COPY" ? "Allow copies" : "View only"}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed bg-white/70 p-4 text-sm text-muted-foreground">
            Publish this trip to generate a public Traveloop URL and make it eligible for the community inspiration feed.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SharingWorkspace() {
  const queryClient = useQueryClient();
  const { data: trips, isLoading: tripsLoading, error: tripsError } = useTrips();

  const community = useQuery({
    queryKey: [...traveloopKeys.all, "community-trips"],
    queryFn: () => request<CommunityResponse>("/api/community/trips?limit=24"),
    staleTime: 60_000,
  });

  const updateShare = useMutation({
    mutationFn: (settings: ShareSettings) =>
      request<{ visibility: "PRIVATE" | "PUBLIC"; share: { slug: string; permission: SharePermission } | null; shareUrl: string | null }>(
        `/api/trips/${settings.tripId}/share`,
        {
          method: "PATCH",
          body: JSON.stringify({
            visibility: settings.visibility,
            permission: settings.permission ?? "COPY",
          }),
        },
      ),
    onMutate: async (settings) => {
      await queryClient.cancelQueries({ queryKey: traveloopKeys.trips() });
      const previous = queryClient.getQueriesData<Trip[]>({ queryKey: traveloopKeys.trips() });

      queryClient.setQueriesData<Trip[]>({ queryKey: traveloopKeys.trips() }, (current) =>
        current?.map((trip) =>
          trip.id === settings.tripId
            ? {
                ...trip,
                visibility: settings.visibility,
                sharedItineraries:
                  settings.visibility === "PUBLIC"
                    ? trip.sharedItineraries?.length
                      ? trip.sharedItineraries.map((share, index) =>
                          index === 0 ? { ...share, permission: settings.permission ?? share.permission } : share,
                        )
                      : [{ slug: "publishing", permission: settings.permission ?? "COPY" }]
                    : [],
              }
            : trip,
        ),
      );

      return { previous };
    },
    onError: (error, _settings, context) => {
      context?.previous.forEach(([queryKey, value]) => queryClient.setQueryData(queryKey, value));
      toast.error(error instanceof Error ? error.message : "Could not update sharing.");
    },
    onSuccess: (result) => {
      toast.success(result.visibility === "PUBLIC" ? "Trip published." : "Trip is private again.");
      void queryClient.invalidateQueries({ queryKey: traveloopKeys.trips() });
      void queryClient.invalidateQueries({ queryKey: [...traveloopKeys.all, "community-trips"] });
    },
  });

  const publicTrips = (trips ?? []).filter(isPublicTrip);

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="glass-card overflow-hidden">
          <CardContent className="relative p-6">
            <div className="absolute inset-0 bg-navy-radial opacity-80" aria-hidden="true" />
            <div className="relative z-10 max-w-2xl">
              <Badge variant="emerald">
                <HeartHandshake className="mr-1 size-3" />
                Travel discovery network
              </Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-normal text-navy md:text-4xl">Publish polished itineraries and let travelers remix the route.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Public trips get share URLs, traveler previews, copy controls, and social-ready cards while private plans stay locked to your account.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="gradient">
                  <Link href="#community-feed">
                    <Sparkles className="size-4" />
                    Explore community
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/trips">
                    <MapPinned className="size-4" />
                    Manage trips
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-emerald" />
              Trending destinations
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {community.isLoading ? (
              Array.from({ length: 4 }).map((_, index) => <Skeleton className="h-12" key={index} />)
            ) : community.data?.trendingDestinations.length ? (
              community.data.trendingDestinations.map((destination, index) => (
                <div className="flex items-center justify-between rounded-lg border bg-white p-3" key={destination.destination}>
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-md bg-sky/10 text-sm font-bold text-sky">{index + 1}</span>
                    <div>
                      <p className="font-semibold text-navy">{destination.destination}</p>
                      <p className="text-xs text-muted-foreground">{destination.activities} planned activities</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{destination.trips} trips</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Publish the first public itinerary to start the feed.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-normal text-navy">Your shared itineraries</h2>
            <p className="text-sm text-muted-foreground">{publicTrips.length} public plans from your workspace.</p>
          </div>
        </div>

        {tripsLoading ? (
          <CommunitySkeleton />
        ) : tripsError ? (
          <Card className="glass-card p-6 text-sm text-destructive">{(tripsError as Error).message}</Card>
        ) : trips?.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {trips.map((trip) => (
              <OwnTripShareCard
                key={trip.id}
                trip={trip}
                onUpdate={(settings) => updateShare.mutate(settings)}
                updating={updateShare.isPending}
              />
            ))}
          </div>
        ) : (
          <Card className="glass-card p-8 text-center">
            <UsersRound className="mx-auto size-10 text-sky" />
            <h3 className="mt-4 text-lg font-bold text-navy">No trips yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Create a trip before publishing a public itinerary.</p>
            <Button asChild className="mt-5" variant="gradient">
              <Link href="/trips/new">Create trip</Link>
            </Button>
          </Card>
        )}
      </section>

      <section className="grid gap-4" id="community-feed">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-normal text-navy">Community trips feed</h2>
            <p className="text-sm text-muted-foreground">Featured public itineraries, destination inspiration, and copy-ready routes.</p>
          </div>
          <Badge variant="outline">{community.data?.trips.length ?? 0} public trips</Badge>
        </div>

        {community.isLoading ? (
          <CommunitySkeleton />
        ) : community.error ? (
          <Card className="glass-card p-6 text-sm text-destructive">{(community.error as Error).message}</Card>
        ) : community.data?.trips.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {community.data.trips.map((item) => (
              <CommunityTripCard item={item} key={item.id} />
            ))}
          </div>
        ) : (
          <Card className="glass-card p-8 text-center">
            <Globe2 className="mx-auto size-10 text-emerald" />
            <h3 className="mt-4 text-lg font-bold text-navy">No community trips yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Publish a trip to make it discoverable here.</p>
          </Card>
        )}
      </section>
    </div>
  );
}
