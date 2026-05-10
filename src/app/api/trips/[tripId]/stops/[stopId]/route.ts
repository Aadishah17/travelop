import { fail, noContent, ok, serverError, validationError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stopUpdateSchema } from "@/lib/validators";
import { Params, readJson, userOwnsTrip } from "@/app/api/_utils";

export async function PATCH(request: Request, context: Params<{ tripId: string; stopId: string }>) {
  const userId = await requireUserId();

  if (!userId) return fail("Unauthorized.", { status: 401 });

  try {
    const { tripId, stopId } = await context.params;
    if (!(await userOwnsTrip(userId, tripId))) return fail("Trip not found.", { status: 404 });

    const data = stopUpdateSchema.parse(await readJson(request));
    const stop = await prisma.stop.update({
      where: { id_tripId: { id: stopId, tripId } },
      data,
      include: {
        activities: { orderBy: [{ startsAt: "asc" }, { position: "asc" }] },
      },
    });

    return ok(stop);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") return validationError(error);
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: Params<{ tripId: string; stopId: string }>) {
  const userId = await requireUserId();

  if (!userId) return fail("Unauthorized.", { status: 401 });

  const { tripId, stopId } = await context.params;
  if (!(await userOwnsTrip(userId, tripId))) return fail("Trip not found.", { status: 404 });

  await prisma.stop.delete({ where: { id_tripId: { id: stopId, tripId } } });
  return noContent();
}
