"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  Copy,
  Globe2,
  Loader2,
  MapPinned,
  Route,
  Send,
  Share2,
  UserRound,
  WalletCards,
} from "lucide-react";
import { copySharedTripAction } from "@/actions/sharing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

type PublicTrip = {
  id: string;
  title: string;
  destination?: string | null;
  description?: string | null;
  startDate?: string;
  endDate?: string;
  startsAt?: string;
  endsAt?: string;
  budget?: number | string | null;
  currency?: string;
  stops?: {
    id: string;
    title?: string;
    city?: string;
    country?: string;
    startsAt?: string | null;
    endsAt?: string | null;
    activities?: { id: string; title: string; category: string; cost?: number | string | null }[];
  }[];
};

type PublicTripResponse = {
  slug: string;
  permission: "VIEW" | "COPY";
  owner: {
    name: string | null;
    image: string | null;
  };
  trip: PublicTrip;
};

async function fetchPublicTrip(slug: string) {
  const response = await fetch(`/api/shared/${slug}`);
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error("This itinerary is private or unavailable.");
  return (body?.data ?? body) as PublicTripResponse;
}

function tripStart(trip: PublicTrip) {
  return trip.startDate ?? trip.startsAt ?? new Date().toISOString();
}

function tripEnd(trip: PublicTrip) {
  return trip.endDate ?? trip.endsAt ?? tripStart(trip);
}

function stopTitle(stop: NonNullable<PublicTrip["stops"]>[number]) {
  if (stop.city && stop.country) return `${stop.city}, ${stop.country}`;
  return stop.title ?? "Untitled stop";
}

function initial(value?: string | null) {
  return (value?.trim().charAt(0) || "T").toUpperCase();
}

function shareUrl(slug: string) {
  if (typeof window === "undefined") return `/trips/${slug}`;
  return `${window.location.origin}/trips/${slug}`;
}

async function copyLink(slug: string) {
  await navigator.clipboard.writeText(shareUrl(slug));
  toast.success("Public itinerary link copied.");
}

export function PublicTripClient({ slug }: { slug: string }) {
  const [isCopying, startCopyTransition] = useTransition();
  const { data, isLoading, error } = useQuery({
    queryKey: ["public-trip", slug],
    queryFn: () => fetchPublicTrip(slug),
  });

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-5xl gap-4 px-4 py-10">
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f8fc] px-4">
        <Card className="glass-card max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-xl font-bold">Trip unavailable</h1>
            <p className="mt-3 text-sm text-muted-foreground">{(error as Error)?.message ?? "Unable to load itinerary."}</p>
            <Button asChild className="mt-5" variant="gradient">
              <Link href="/">Back to Traveloop</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const trip = data.trip;
  const encodedUrl = encodeURIComponent(shareUrl(data.slug));
  const encodedTitle = encodeURIComponent(`Explore ${trip.title} on Traveloop`);

  const copyTrip = () => {
    startCopyTransition(async () => {
      const result = await copySharedTripAction(data.slug);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  };

  return (
    <main className="min-h-screen bg-[#f5f8fc]">
      <section className="bg-navy px-4 py-16 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <Badge variant="emerald">
              <Globe2 className="mr-1 size-3" />
              Public itinerary
            </Badge>
            <h1 className="mt-5 text-4xl font-bold tracking-normal md:text-6xl">{trip.title}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-white/65">{trip.description ?? "A shared Traveloop itinerary."}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Badge variant="secondary">
                <CalendarDays className="mr-1 size-3" />
                {format(new Date(tripStart(trip)), "MMM d")} - {format(new Date(tripEnd(trip)), "MMM d, yyyy")}
              </Badge>
              <Badge variant="secondary">
                <WalletCards className="mr-1 size-3" />
                {formatCurrency(Number(trip.budget ?? 0), trip.currency ?? "USD")}
              </Badge>
              <Badge variant="secondary">{data.permission === "COPY" ? "Copy-ready" : "Read-only"}</Badge>
            </div>
          </div>

          <Card className="border-white/15 bg-white/10 text-white shadow-glass backdrop-blur-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Avatar className="size-12 ring-2 ring-white/20">
                  <AvatarImage src={data.owner.image ?? undefined} alt={data.owner.name ?? "Traveler"} />
                  <AvatarFallback className="bg-white/20 text-white">{initial(data.owner.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs uppercase text-white/55">Shared by</p>
                  <p className="font-bold">{data.owner.name ?? "Traveloop traveler"}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2 text-center text-navy">
                <div className="rounded-md bg-white p-3">
                  <p className="text-xl font-bold">{trip.stops?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Stops</p>
                </div>
                <div className="rounded-md bg-white p-3">
                  <p className="text-xl font-bold">{trip.stops?.reduce((sum, stop) => sum + (stop.activities?.length ?? 0), 0) ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Activities</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {(trip.stops ?? []).map((stop, index) => (
            <Card className="glass-card" key={stop.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">{index + 1}</span>
                  {stopTitle(stop)}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {(stop.activities ?? []).length ? (
                  stop.activities?.map((activity) => (
                    <div className="rounded-lg border bg-white p-3" key={activity.id}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">{activity.title}</p>
                        <span className="text-sm font-bold">{formatCurrency(Number(activity.cost ?? 0), trip.currency ?? "USD")}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{activity.category}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg border border-dashed bg-white p-4 text-sm text-muted-foreground">No public activities for this stop yet.</p>
                )}
              </CardContent>
            </Card>
          ))}

          {!(trip.stops ?? []).length ? (
            <Card className="glass-card p-8 text-center">
              <MapPinned className="mx-auto size-10 text-primary" />
              <h2 className="mt-4 text-lg font-bold">No stops published yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">This traveler shared the trip shell before adding itinerary stops.</p>
            </Card>
          ) : null}
        </div>

        <div className="grid h-fit gap-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="size-5 text-primary" />
                Route preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-white p-4">
                {(trip.stops ?? []).map((stop, index) => (
                  <div className="grid grid-cols-[24px_1fr] gap-3" key={stop.id}>
                    <div className="flex flex-col items-center">
                      <span className="flex size-6 items-center justify-center rounded-full bg-travel-gradient text-xs font-bold text-white">{index + 1}</span>
                      {index < (trip.stops?.length ?? 0) - 1 ? <span className="h-10 w-px bg-sky/30" /> : null}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-bold text-navy">{stopTitle(stop)}</p>
                      <p className="text-xs text-muted-foreground">{stop.activities?.length ?? 0} activities</p>
                    </div>
                  </div>
                ))}
                {!(trip.stops ?? []).length ? (
                  <div className="grid min-h-48 place-items-center text-center">
                    <div>
                      <MapPinned className="mx-auto size-8 text-primary" />
                      <p className="mt-3 text-sm text-muted-foreground">Route details will appear when stops are added.</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="size-5 text-emerald" />
                Share and copy
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button className="w-full" variant="gradient" onClick={copyTrip} disabled={isCopying || data.permission !== "COPY"}>
                {isCopying ? <Loader2 className="size-4 animate-spin" /> : <Copy className="size-4" />}
                Copy Trip
              </Button>
              <Button className="w-full" variant="outline" onClick={() => copyLink(data.slug)}>
                <Copy className="size-4" />
                Copy link
              </Button>
              <div className="grid grid-cols-2 gap-2">
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
              {data.permission !== "COPY" ? <p className="text-xs text-muted-foreground">The owner has made this itinerary view-only.</p> : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
