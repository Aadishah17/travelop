import type { Prisma } from "@prisma/client";
import { created, fail, ok, serverError, validationError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { activityCreateSchema, activityListQuerySchema } from "@/lib/validators";
import { Params, readJson, userOwnsTrip } from "@/app/api/_utils";

function isActivityInsideStop(
  stop: { startsAt: Date | null; endsAt: Date | null },
  startsAt?: Date | null,
  endsAt?: Date | null,
) {
  if (stop.startsAt && startsAt && startsAt < stop.startsAt) return false;
  if (stop.endsAt && startsAt && startsAt > stop.endsAt) return false;
  if (stop.startsAt && endsAt && endsAt < stop.startsAt) return false;
  if (stop.endsAt && endsAt && endsAt > stop.endsAt) return false;
  return true;
}

export async function GET(request: Request, context: Params<{ tripId: string }>) {
  const userId = await requireUserId();

  if (!userId) return fail("Unauthorized.", { status: 401 });

  try {
    const { tripId } = await context.params;
    if (!(await userOwnsTrip(userId, tripId))) return fail("Trip not found.", { status: 404 });

    const searchParams = new URL(request.url).searchParams;
    const query = activityListQuerySchema.parse({
      stopId: searchParams.get("stopId") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      date: searchParams.get("date") ?? undefined,
    });
    const where: Prisma.ActivityWhereInput = { tripId };

    if (query.stopId) where.stopId = query.stopId;
    if (query.category) where.category = query.category;
    if (query.date) {
      const start = new Date(`${query.date}T00:00:00.000Z`);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      where.startsAt = { gte: start, lt: end };
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy: [{ startsAt: "asc" }, { position: "asc" }],
    });
    return ok(activities);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") return validationError(error);
    return serverError(error);
  }
}

export async function POST(request: Request, context: Params<{ tripId: string }>) {
  const userId = await requireUserId();

  if (!userId) return fail("Unauthorized.", { status: 401 });

  try {
    const { tripId } = await context.params;
    if (!(await userOwnsTrip(userId, tripId))) return fail("Trip not found.", { status: 404 });

    const data = activityCreateSchema.parse(await readJson(request));
    if (data.stopId) {
      const stop = await prisma.stop.findFirst({
        where: { id: data.stopId, tripId },
        select: { id: true, startsAt: true, endsAt: true },
      });
      if (!stop) return fail("Stop not found.", { status: 404 });
      if (!isActivityInsideStop(stop, data.startsAt, data.endsAt)) {
        return fail("Activity time must stay within the selected stop dates.", { status: 422 });
      }
    }

    const activity = await prisma.activity.create({ data: { ...data, tripId } });
    return created(activity);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") return validationError(error);
    return serverError(error);
  }
}
