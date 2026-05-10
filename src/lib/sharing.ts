import { prisma } from "@/lib/db";

export async function copySharedTrip(slug: string, userId: string) {
  const share = await prisma.sharedItinerary.findUnique({
    where: { slug },
    include: {
      trip: {
        include: {
          stops: true,
          activities: true,
          expenses: true,
          packingItems: true,
          notes: true,
        },
      },
    },
  });

  if (!share || (share.expiresAt && share.expiresAt < new Date()) || share.permission !== "COPY") {
    return null;
  }

  return prisma.$transaction(async (tx) => {
    const copiedTrip = await tx.trip.create({
      data: {
        ownerId: userId,
        title: `${share.trip.title} Copy`,
        destination: share.trip.destination,
        description: share.trip.description,
        coverImageUrl: share.trip.coverImageUrl,
        startsAt: share.trip.startsAt,
        endsAt: share.trip.endsAt,
        budget: share.trip.budget,
        currency: share.trip.currency,
        status: "DRAFT",
        visibility: "PRIVATE",
      },
    });

    const stopIdMap = new Map<string, string>();

    for (const stop of share.trip.stops) {
      const copiedStop = await tx.stop.create({
        data: {
          tripId: copiedTrip.id,
          title: stop.title,
          kind: stop.kind,
          address: stop.address,
          placeId: stop.placeId,
          latitude: stop.latitude,
          longitude: stop.longitude,
          startsAt: stop.startsAt,
          endsAt: stop.endsAt,
          position: stop.position,
        },
      });

      stopIdMap.set(stop.id, copiedStop.id);
    }

    if (share.trip.activities.length) {
      await tx.activity.createMany({
        data: share.trip.activities.map((activity) => ({
          tripId: copiedTrip.id,
          stopId: activity.stopId ? (stopIdMap.get(activity.stopId) ?? null) : null,
          title: activity.title,
          category: activity.category,
          description: activity.description,
          address: activity.address,
          externalId: activity.externalId,
          bookingUrl: activity.bookingUrl,
          startsAt: activity.startsAt,
          endsAt: activity.endsAt,
          cost: activity.cost,
          currency: activity.currency,
          position: activity.position,
          completed: false,
        })),
      });
    }

    if (share.trip.expenses.length) {
      await tx.expense.createMany({
        data: share.trip.expenses.map((expense) => ({
          tripId: copiedTrip.id,
          title: expense.title,
          amount: expense.amount,
          currency: expense.currency,
          category: expense.category,
          paidBy: expense.paidBy,
          incurredAt: expense.incurredAt,
        })),
      });
    }

    if (share.trip.packingItems.length) {
      await tx.packingItem.createMany({
        data: share.trip.packingItems.map((item) => ({
          tripId: copiedTrip.id,
          label: item.label,
          category: item.category,
          customCategory: item.customCategory,
          quantity: item.quantity,
          packed: false,
        })),
      });
    }

    if (share.trip.notes.length) {
      await tx.note.createMany({
        data: share.trip.notes.map((note) => ({
          tripId: copiedTrip.id,
          title: note.title,
          body: note.body,
          journalDate: note.journalDate,
          imageUrl: note.imageUrl,
          pinned: note.pinned,
        })),
      });
    }

    return copiedTrip;
  });
}
