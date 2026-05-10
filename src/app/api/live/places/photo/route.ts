import { NextResponse } from "next/server";
import { fail } from "@/lib/api-response";

export async function GET(request: Request) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const reference = new URL(request.url).searchParams.get("reference");

  if (!key || !reference) {
    return fail("Google Places photo is unavailable.", { status: 404 });
  }

  const params = new URLSearchParams({
    key,
    maxwidth: "900",
    photo_reference: reference,
  });

  return NextResponse.redirect(`https://maps.googleapis.com/maps/api/place/photo?${params}`);
}
