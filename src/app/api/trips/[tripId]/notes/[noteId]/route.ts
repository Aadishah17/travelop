import { fail, noContent, ok, serverError, validationError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { noteUpdateSchema } from "@/lib/validators";
import { Params, readJson, userOwnsTrip } from "@/app/api/_utils";

export async function PATCH(request: Request, context: Params<{ tripId: string; noteId: string }>) {
  const userId = await requireUserId();

  if (!userId) return fail("Unauthorized.", { status: 401 });

  try {
    const { tripId, noteId } = await context.params;
    if (!(await userOwnsTrip(userId, tripId))) return fail("Trip not found.", { status: 404 });

    const data = noteUpdateSchema.parse(await readJson(request));
    const note = await prisma.note.update({ where: { id_tripId: { id: noteId, tripId } }, data });

    return ok(note);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") return validationError(error);
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: Params<{ tripId: string; noteId: string }>) {
  const userId = await requireUserId();

  if (!userId) return fail("Unauthorized.", { status: 401 });

  const { tripId, noteId } = await context.params;
  if (!(await userOwnsTrip(userId, tripId))) return fail("Trip not found.", { status: 404 });

  await prisma.note.delete({ where: { id_tripId: { id: noteId, tripId } } });
  return noContent();
}
