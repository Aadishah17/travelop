import { fail, noContent, ok, serverError, validationError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { activityUpdateSchema } from "@/lib/validators";
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

export async function PATCH(request: Request, context: Params<{ tripId: string; activityId: string }>) {
  const userId = await requireUserId();

  if (!userId) return fail("Unauthorized.", { status: 401 });

  try {
    const { tripId, activityId } = await context.params;
    if (!(await userOwnsTrip(userId, tripId))) return fail("Trip not found.", { status: 404 });

    const data = activityUpdateSchema.parse(await readJson(request));
    const currentActivity = await prisma.activity.findUnique({
      where: { id_tripId: { id: activityId, tripId } },
      select: { stopId: true, startsAt: true, endsAt: true },
    });

    if (!currentActivity) return fail("Activity not found.", { status: 404 });

    const nextStopId = data.stopId !== undefined ? data.stopId : currentActivity.stopId;
    if (nextStopId) {
      const stop = await prisma.stop.findFirst({
        where: { id: nextStopId, tripId },
        select: { id: true, startsAt: true, endsAt: true },
      });
      if (!stop) return fail("Stop not found.", { status: 404 });
      const nextStartsAt = data.startsAt !== undefined ? data.startsAt : currentActivity.startsAt;
      const nextEndsAt = data.endsAt !== undefined ? data.endsAt : currentActivity.endsAt;
      if (!isActivityInsideStop(stop, nextStartsAt, nextEndsAt)) {
        return fail("Activity time must stay within the selected stop dates.", { status: 422 });
      }
    }

    const activity = await prisma.activity.update({ where: { id_tripId: { id: activityId, tripId } }, data });
    return ok(activity);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") return validationError(error);
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: Params<{ tripId: string; activityId: string }>) {
  const userId = await requireUserId();

  if (!userId) return fail("Unauthorized.", { status: 401 });

  const { tripId, activityId } = await context.params;
  if (!(await userOwnsTrip(userId, tripId))) return fail("Trip not found.", { status: 404 });

  await prisma.activity.delete({ where: { id_tripId: { id: activityId, tripId } } });
  return noContent();
}
