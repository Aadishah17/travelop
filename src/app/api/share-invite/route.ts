import { created, fail, serverError, validationError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendShareInvite } from "@/lib/email";
import { shareCreateSchema } from "@/lib/validators";
import { readJson, slugify, userOwnsTrip } from "@/app/api/_utils";

export async function POST(request: Request) {
  const userId = await requireUserId();

  if (!userId) {
    return fail("Unauthorized.", { status: 401 });
  }

  try {
    const data = shareCreateSchema.parse(await readJson(request));
    const trip = await userOwnsTrip(userId, data.tripId);

    if (!trip) {
      return fail("Trip not found.", { status: 404 });
    }

    const share = await prisma.$transaction(async (tx) => {
      await tx.trip.update({ where: { id: data.tripId }, data: { visibility: "PUBLIC" } });

      return tx.sharedItinerary.create({
        data: {
          tripId: data.tripId,
          ownerId: userId,
          slug: slugify(trip.title),
          permission: data.permission,
          expiresAt: data.expiresAt,
        },
      });
    });

    const origin = request.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "";
    const shareUrl = `${origin}/trips/${share.slug}`;
    const email = data.email
      ? await sendShareInvite({
          to: data.email,
          tripTitle: trip.title,
          shareUrl,
        })
      : { sent: false, reason: "No recipient email provided." };

    return created({ share, shareUrl, email });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") return validationError(error);
    return serverError(error);
  }
}
