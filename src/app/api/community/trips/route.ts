import { ok, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 24), 48);
    const now = new Date();

    const shares = await prisma.sharedItinerary.findMany({
      where: {
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        trip: { visibility: "PUBLIC" },
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        owner: { select: { id: true, name: true, image: true, createdAt: true } },
        trip: {
          include: {
            stops: {
              orderBy: { position: "asc" },
              include: {
                activities: { orderBy: [{ startsAt: "asc" }, { position: "asc" }] },
              },
            },
            activities: { orderBy: [{ startsAt: "asc" }, { position: "asc" }] },
            expenses: { orderBy: { incurredAt: "desc" } },
            _count: {
              select: {
                stops: true,
                activities: true,
                expenses: true,
              },
            },
          },
        },
      },
    });

    const destinationCounts = new Map<string, { destination: string; trips: number; activities: number }>();
    shares.forEach((share) => {
      const destination = share.trip.destination || share.trip.stops[0]?.title || "Open itinerary";
      const current = destinationCounts.get(destination) ?? { destination, trips: 0, activities: 0 };
      current.trips += 1;
      current.activities += share.trip._count.activities;
      destinationCounts.set(destination, current);
    });

    return ok({
      trips: shares.map((share, index) => ({
        id: share.id,
        slug: share.slug,
        permission: share.permission,
        featured: index < 6,
        owner: share.owner,
        trip: share.trip,
        shareUrl: `/trips/${share.slug}`,
      })),
      trendingDestinations: Array.from(destinationCounts.values())
        .sort((a, b) => b.trips - a.trips || b.activities - a.activities)
        .slice(0, 8),
    });
  } catch (error) {
    return serverError(error);
  }
}
