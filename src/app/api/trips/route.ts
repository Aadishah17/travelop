import { created, fail, ok, serverError, validationError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { tripCreateSchema } from "@/lib/validators";
import { readJson, tripInclude } from "@/app/api/_utils";

export async function GET() {
  const userId = await requireUserId();

  if (!userId) {
    return fail("Unauthorized.", { status: 401 });
  }

  const trips = await prisma.trip.findMany({
    where: { ownerId: userId },
    orderBy: { startsAt: "asc" },
    include: tripInclude,
  });

  return ok(trips);
}

export async function POST(request: Request) {
  const userId = await requireUserId();

  if (!userId) {
    return fail("Unauthorized.", { status: 401 });
  }

  try {
    const data = tripCreateSchema.parse(await readJson(request));
    const trip = await prisma.trip.create({
      data: {
        ...data,
        ownerId: userId,
      },
      include: tripInclude,
    });

    return created(trip);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return validationError(error);
    }

    return serverError(error);
  }
}
