"use server";

import type { ActivityCategory } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { destinationStopSaveSchema, discoveredActivitySaveSchema } from "@/lib/validators";

const activityCategories = new Set([
  "FOOD",
  "TOUR",
  "OUTDOOR",
  "CULTURE",
  "SHOPPING",
  "NIGHTLIFE",
  "TRANSPORT",
  "LODGING",
  "OTHER",
]);

function normalizeActivityCategory(value?: string | null): ActivityCategory {
  const normalized = value?.toUpperCase().replace(/[^A-Z]+/g, "_") ?? "OTHER";
  if (normalized.includes("RESTAURANT") || normalized.includes("FOOD") || normalized.includes("CAFE")) return "FOOD";
  if (normalized.includes("MUSEUM") || normalized.includes("ART") || normalized.includes("CULTURE")) return "CULTURE";
  if (normalized.includes("PARK") || normalized.includes("OUTDOOR") || normalized.includes("ADVENTURE")) return "OUTDOOR";
  if (normalized.includes("NIGHT")) return "NIGHTLIFE";
  if (normalized.includes("SHOP")) return "SHOPPING";
  if (normalized.includes("HOTEL") || normalized.includes("LODGING")) return "LODGING";
  if (normalized.includes("TRANSIT") || normalized.includes("TRANSPORT")) return "TRANSPORT";
  if (normalized.includes("TOUR") || normalized.includes("ATTRACTION") || normalized.includes("EVENT")) return "TOUR";
  return (activityCategories.has(normalized) ? normalized : "OTHER") as ActivityCategory;
}

function serializeStop(stop: {
  id: string;
  title: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  position: number;
}) {
  return {
    ...stop,
    startsAt: stop.startsAt?.toISOString() ?? null,
    endsAt: stop.endsAt?.toISOString() ?? null,
  };
}

function serializeActivity(activity: {
  id: string;
  title: string;
  category: string;
  description: string | null;
  address: string | null;
  bookingUrl: string | null;
  externalId: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  stopId: string | null;
  cost: unknown;
  currency: string;
}) {
  return {
    ...activity,
    startsAt: activity.startsAt?.toISOString() ?? null,
    endsAt: activity.endsAt?.toISOString() ?? null,
    cost: activity.cost === null ? null : Number(activity.cost),
  };
}

export async function addDestinationStopAction(input: unknown) {
  const userId = await requireUserId();
  if (!userId) throw new Error("Unauthorized.");

  const data = destinationStopSaveSchema.parse(input);
  const trip = await prisma.trip.findFirst({
    where: { id: data.tripId, ownerId: userId },
    select: { id: true },
  });

  if (!trip) throw new Error("Trip not found.");

  const stop = await prisma.stop.create({
    data: {
      tripId: data.tripId,
      title: data.title,
      kind: "CITY",
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      position: data.position,
    },
    select: {
      id: true,
      title: true,
      address: true,
      latitude: true,
      longitude: true,
      startsAt: true,
      endsAt: true,
      position: true,
    },
  });

  return serializeStop(stop);
}

export async function saveDiscoveredActivityAction(input: unknown) {
  const userId = await requireUserId();
  if (!userId) throw new Error("Unauthorized.");

  const data = discoveredActivitySaveSchema.parse(input);
  const trip = await prisma.trip.findFirst({
    where: { id: data.tripId, ownerId: userId },
    select: { id: true },
  });

  if (!trip) throw new Error("Trip not found.");

  if (data.stopId) {
    const stop = await prisma.stop.findFirst({
      where: { id: data.stopId, tripId: data.tripId },
      select: { id: true },
    });
    if (!stop) throw new Error("Stop not found.");
  }

  const activity = await prisma.activity.create({
    data: {
      tripId: data.tripId,
      stopId: data.stopId,
      title: data.title,
      category: normalizeActivityCategory(data.category),
      description: data.description,
      address: data.address,
      externalId: data.externalId,
      bookingUrl: data.bookingUrl,
      startsAt: data.startsAt,
      cost: data.cost,
      currency: "USD",
      position: 0,
    },
    select: {
      id: true,
      title: true,
      category: true,
      description: true,
      address: true,
      bookingUrl: true,
      externalId: true,
      startsAt: true,
      endsAt: true,
      stopId: true,
      cost: true,
      currency: true,
    },
  });

  return serializeActivity(activity);
}
