import { ok, serverError, validationError } from "@/lib/api-response";
import { discoverActivities } from "@/lib/live-data";
import { activityDiscoverySchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = activityDiscoverySchema.parse(Object.fromEntries(url.searchParams));
    const activities = await discoverActivities(query);

    return ok(activities);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") return validationError(error);
    return serverError(error);
  }
}
