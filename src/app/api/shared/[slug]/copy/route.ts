import { created, fail, serverError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { copySharedTrip } from "@/lib/sharing";
import { Params } from "@/app/api/_utils";

export async function POST(_request: Request, context: Params<{ slug: string }>) {
  const userId = await requireUserId();

  if (!userId) {
    return fail("Unauthorized.", { status: 401 });
  }

  try {
    const { slug } = await context.params;
    const trip = await copySharedTrip(slug, userId);

    if (!trip) return fail("Shared itinerary is not available to copy.", { status: 404 });

    return created(trip);
  } catch (error) {
    return serverError(error);
  }
}
