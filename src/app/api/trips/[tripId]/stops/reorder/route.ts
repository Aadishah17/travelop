import { fail, ok, serverError, validationError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stopReorderSchema } from "@/lib/validators";
import { Params, readJson, userOwnsTrip } from "@/app/api/_utils";

export async function PATCH(request: Request, context: Params<{ tripId: string }>) {
  const userId = await requireUserId();

  if (!userId) return fail("Unauthorized.", { status: 401 });

  try {
    const { tripId } = await context.params;
    if (!(await userOwnsTrip(userId, tripId))) return fail("Trip not found.", { status: 404 });

    const data = stopReorderSchema.parse(await readJson(request));
    const stopIds = data.stops.map((stop) => stop.id);
    const ownedStops = await prisma.stop.findMany({
      where: { tripId, id: { in: stopIds } },
      select: { id: true },
    });

    if (ownedStops.length !== stopIds.length) {
      return fail("One or more stops were not found.", { status: 404 });
    }

    await prisma.$transaction(
      data.stops.map((stop) =>
        prisma.stop.update({
          where: { id_tripId: { id: stop.id, tripId } },
          data: { position: stop.position },
        }),
      ),
    );

    const stops = await prisma.stop.findMany({
      where: { tripId },
      orderBy: { position: "asc" },
      include: {
        activities: { orderBy: [{ startsAt: "asc" }, { position: "asc" }] },
      },
    });

    return ok(stops);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") return validationError(error);
    return serverError(error);
  }
}
