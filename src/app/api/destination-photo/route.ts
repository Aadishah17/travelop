import { NextRequest, NextResponse } from "next/server";
import { resolveDestinationPhoto } from "@/lib/destination-photos";

/**
 * GET /api/destination-photo?q=Paris
 * Returns a landmark photo URL for the given destination.
 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required (min 2 characters)." },
      { status: 400 }
    );
  }

  const result = resolveDestinationPhoto(query);

  if (!result) {
    return NextResponse.json(
      { data: null, message: `No landmark photo found for "${query}".` },
      { status: 200 }
    );
  }

  return NextResponse.json({
    data: {
      city: result.city,
      country: result.country,
      landmark: result.landmark,
      imageUrl: result.imageUrl,
    },
  });
}
