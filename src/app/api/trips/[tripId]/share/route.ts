import { fail, noContent, ok, serverError, validationError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { shareSettingsSchema } from "@/lib/validators";
import { Params, readJson, slugify, userOwnsTrip } from "@/app/api/_utils";

function publicTripUrl(request: Request, slug: string) {
  const origin = request.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return `${origin}/trips/${slug}`;
}

export async function GET(request: Request, context: Params<{ tripId: string }>) {
  const userId = await requireUserId();

  if (!userId) return fail("Unauthorized.", { status: 401 });

  const { tripId } = await context.params;
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, ownerId: userId },
    select: {
      id: true,
      title: true,
      visibility: true,
      sharedItineraries: { orderBy: { updatedAt: "desc" }, take: 1 },
    },
  });

  if (!trip) return fail("Trip not found.", { status: 404 });

  const share = trip.sharedItineraries[0] ?? null;
  return ok({
    visibility: trip.visibility,
    share,
    shareUrl: share ? publicTripUrl(request, share.slug) : null,
  });
}

export async function PATCH(request: Request, context: Params<{ tripId: string }>) {
  const userId = await requireUserId();

  if (!userId) return fail("Unauthorized.", { status: 401 });

  try {
    const { tripId } = await context.params;
    const trip = await userOwnsTrip(userId, tripId);

    if (!trip) return fail("Trip not found.", { status: 404 });

    const data = shareSettingsSchema.parse(await readJson(request));

    if (data.visibility === "PRIVATE") {
      await prisma.$transaction([
        prisma.trip.update({ where: { id: tripId }, data: { visibility: "PRIVATE" } }),
        prisma.sharedItinerary.deleteMany({ where: { tripId, ownerId: userId } }),
      ]);

      return ok({ visibility: "PRIVATE", share: null, shareUrl: null });
    }

    const share = await prisma.$transaction(async (tx) => {
      await tx.trip.update({ where: { id: tripId }, data: { visibility: "PUBLIC" } });

      const existingShare = await tx.sharedItinerary.findFirst({
        where: { tripId, ownerId: userId },
        orderBy: { updatedAt: "desc" },
      });

      if (existingShare) {
        return tx.sharedItinerary.update({
          where: { id: existingShare.id },
          data: {
            permission: data.permission,
            expiresAt: data.expiresAt ?? null,
          },
        });
      }

      return tx.sharedItinerary.create({
        data: {
          tripId,
          ownerId: userId,
          slug: slugify(trip.title),
          permission: data.permission,
          expiresAt: data.expiresAt ?? null,
        },
      });
    });

    return ok({
      visibility: "PUBLIC",
      share,
      shareUrl: publicTripUrl(request, share.slug),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") return validationError(error);
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: Params<{ tripId: string }>) {
  const userId = await requireUserId();

  if (!userId) return fail("Unauthorized.", { status: 401 });

  const { tripId } = await context.params;
  if (!(await userOwnsTrip(userId, tripId))) return fail("Trip not found.", { status: 404 });

  await prisma.$transaction([
    prisma.trip.update({ where: { id: tripId }, data: { visibility: "PRIVATE" } }),
    prisma.sharedItinerary.deleteMany({ where: { tripId, ownerId: userId } }),
  ]);

  return noContent();
}
