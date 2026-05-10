import { fail, noContent, ok, serverError, validationError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { expenseUpdateSchema } from "@/lib/validators";
import { Params, readJson, userOwnsTrip } from "@/app/api/_utils";

export async function PATCH(request: Request, context: Params<{ tripId: string; expenseId: string }>) {
  const userId = await requireUserId();

  if (!userId) return fail("Unauthorized.", { status: 401 });

  try {
    const { tripId, expenseId } = await context.params;
    if (!(await userOwnsTrip(userId, tripId))) return fail("Trip not found.", { status: 404 });

    const data = expenseUpdateSchema.parse(await readJson(request));
    const expense = await prisma.expense.update({ where: { id_tripId: { id: expenseId, tripId } }, data });

    return ok(expense);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") return validationError(error);
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: Params<{ tripId: string; expenseId: string }>) {
  const userId = await requireUserId();

  if (!userId) return fail("Unauthorized.", { status: 401 });

  const { tripId, expenseId } = await context.params;
  if (!(await userOwnsTrip(userId, tripId))) return fail("Trip not found.", { status: 404 });

  await prisma.expense.delete({ where: { id_tripId: { id: expenseId, tripId } } });
  return noContent();
}
