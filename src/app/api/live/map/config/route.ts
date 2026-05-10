import { ok } from "@/lib/api-response";

export async function GET() {
  return ok({
    mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? process.env.MAPBOX_TOKEN ?? null,
    configured: Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? process.env.MAPBOX_TOKEN),
  });
}
