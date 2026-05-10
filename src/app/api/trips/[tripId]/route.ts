import { fail, noContent, ok, serverError, validationError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { tripUpdateSchema } from "@/lib/validators";
import { Params, readJson, tripInclude, userOwnsTrip } from "@/app/api/_utils";

export async function GET(_request: Request, context: Params<{ tripId: string }>) {
  const userId = await requireUserId();

  if (!userId) {
    return fail("Unauthorized.", { status: 401 });
  }

  const { tripId } = await context.params;
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, ownerId: userId },
    include: tripInclude,
  });

  if (!trip) {
    return fail("Trip not found.", { status: 404 });
  }

  return ok(trip);
}

export async function PATCH(request: Request, context: Params<{ tripId: string }>) {
  const userId = await requireUserId();

  if (!userId) {
    return fail("Unauthorized.", { status: 401 });
  }

  try {
    const { tripId } = await context.params;

    const existingTrip = await userOwnsTrip(userId, tripId);

    if (!existingTrip) {
      return fail("Trip not found.", { status: 404 });
    }

    const data = tripUpdateSchema.parse(await readJson(request));
    const nextStartsAt = data.startsAt ?? existingTrip.startsAt;
    const nextEndsAt = data.endsAt ?? existingTrip.endsAt;

    if (nextEndsAt < nextStartsAt) {
      return fail("Trip end date must be after start date.", { status: 422 });
    }

    const trip = await prisma.trip.update({
      where: { id: tripId },
      data,
      include: tripInclude,
    });

    return ok(trip);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return validationError(error);
    }

    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: Params<{ tripId: string }>) {
  const userId = await requireUserId();

  if (!userId) {
    return fail("Unauthorized.", { status: 401 });
  }

  const { tripId } = await context.params;

  if (!(await userOwnsTrip(userId, tripId))) {
    return fail("Trip not found.", { status: 404 });
  }

  await prisma.trip.delete({ where: { id: tripId } });
  return noContent();
}
