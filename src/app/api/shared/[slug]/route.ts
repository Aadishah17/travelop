import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { Params, tripInclude } from "@/app/api/_utils";

export async function GET(_request: Request, context: Params<{ slug: string }>) {
  const { slug } = await context.params;
  const share = await prisma.sharedItinerary.findUnique({
    where: { slug },
    include: {
      trip: {
        include: tripInclude,
      },
      owner: {
        select: { name: true, image: true },
      },
    },
  });

  if (!share || (share.expiresAt && share.expiresAt < new Date())) {
    return fail("Shared itinerary not found.", { status: 404 });
  }

  return ok({
    slug: share.slug,
    permission: share.permission,
    owner: share.owner,
    trip: share.trip,
  });
}
