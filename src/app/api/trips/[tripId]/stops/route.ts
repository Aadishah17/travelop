import { created, fail, ok, serverError, validationError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stopCreateSchema } from "@/lib/validators";
import { Params, readJson, userOwnsTrip } from "@/app/api/_utils";

export async function GET(_request: Request, context: Params<{ tripId: string }>) {
  const userId = await requireUserId();

  if (!userId) return fail("Unauthorized.", { status: 401 });

  const { tripId } = await context.params;
  if (!(await userOwnsTrip(userId, tripId))) return fail("Trip not found.", { status: 404 });

  const stops = await prisma.stop.findMany({
    where: { tripId },
    orderBy: { position: "asc" },
    include: {
      activities: { orderBy: [{ startsAt: "asc" }, { position: "asc" }] },
    },
  });
  return ok(stops);
}

export async function POST(request: Request, context: Params<{ tripId: string }>) {
  const userId = await requireUserId();

  if (!userId) return fail("Unauthorized.", { status: 401 });

  try {
    const { tripId } = await context.params;
    if (!(await userOwnsTrip(userId, tripId))) return fail("Trip not found.", { status: 404 });

    const data = stopCreateSchema.parse(await readJson(request));
    const stop = await prisma.stop.create({
      data: { ...data, tripId },
      include: {
        activities: { orderBy: [{ startsAt: "asc" }, { position: "asc" }] },
      },
    });

    return created(stop);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") return validationError(error);
    return serverError(error);
  }
}
