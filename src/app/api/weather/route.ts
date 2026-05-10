import { ok, serverError, validationError } from "@/lib/api-response";
import { getWeatherForecast } from "@/lib/live-data";
import { weatherQuerySchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = weatherQuerySchema.parse(Object.fromEntries(url.searchParams));
    const forecast = await getWeatherForecast(query);

    return ok(forecast);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") return validationError(error);
    return serverError(error);
  }
}
