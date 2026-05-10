import { prisma } from "@/lib/db";

export type Params<T extends Record<string, string>> = {
  params: Promise<T>;
};

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function userOwnsTrip(userId: string, tripId: string) {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, ownerId: userId },
    select: { id: true, title: true, startsAt: true, endsAt: true },
  });

  return trip;
}

export const tripInclude = {
  stops: {
    orderBy: { position: "asc" as const },
    include: {
      activities: { orderBy: [{ startsAt: "asc" as const }, { position: "asc" as const }] },
    },
  },
  activities: { orderBy: [{ startsAt: "asc" as const }, { position: "asc" as const }] },
  expenses: { orderBy: { incurredAt: "desc" as const } },
  packingItems: { orderBy: [{ packed: "asc" as const }, { createdAt: "asc" as const }] },
  notes: { orderBy: [{ pinned: "desc" as const }, { updatedAt: "desc" as const }] },
  sharedItineraries: true,
};

export function slugify(value: string) {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);

  return `${base || "itinerary"}-${crypto.randomUUID().slice(0, 8)}`;
}
