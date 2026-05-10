import { fail, ok, serverError, validationError } from "@/lib/api-response";
import { searchDestinations } from "@/lib/live-data";
import { destinationSearchSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = destinationSearchSchema.parse(Object.fromEntries(url.searchParams));
    const results = await searchDestinations(query);

    return ok(results);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") return validationError(error);
    return serverError(error);
  }
}

export async function POST() {
  return fail("Use GET for destination search.", { status: 405 });
}
