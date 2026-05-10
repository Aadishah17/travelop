import { created, fail, ok, serverError, validationError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { expenseCreateSchema } from "@/lib/validators";
import { Params, readJson, userOwnsTrip } from "@/app/api/_utils";

export async function GET(_request: Request, context: Params<{ tripId: string }>) {
  const userId = await requireUserId();

  if (!userId) return fail("Unauthorized.", { status: 401 });

  const { tripId } = await context.params;
  if (!(await userOwnsTrip(userId, tripId))) return fail("Trip not found.", { status: 404 });

  const expenses = await prisma.expense.findMany({ where: { tripId }, orderBy: { incurredAt: "desc" } });
  return ok(expenses);
}

export async function POST(request: Request, context: Params<{ tripId: string }>) {
  const userId = await requireUserId();

  if (!userId) return fail("Unauthorized.", { status: 401 });

  try {
    const { tripId } = await context.params;
    if (!(await userOwnsTrip(userId, tripId))) return fail("Trip not found.", { status: 404 });

    const data = expenseCreateSchema.parse(await readJson(request));
    const expense = await prisma.expense.create({ data: { ...data, tripId } });

    return created(expense);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") return validationError(error);
    return serverError(error);
  }
}
