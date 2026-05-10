import type { Metadata } from "next";
import { PublicTripClient } from "@/components/product/public-trip";
import { prisma } from "@/lib/db";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const share = await prisma.sharedItinerary.findUnique({
    where: { slug },
    select: {
      slug: true,
      trip: { select: { title: true, description: true, coverImageUrl: true } },
      owner: { select: { name: true } },
    },
  });

  if (!share) {
    return { title: "Public Trip" };
  }

  const title = `${share.trip.title} by ${share.owner.name ?? "Traveloop"}`;
  const description = share.trip.description ?? "A public Traveloop itinerary with stops, activities, budget context, and copy-ready planning.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: share.trip.coverImageUrl ? [{ url: share.trip.coverImageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: share.trip.coverImageUrl ? [share.trip.coverImageUrl] : undefined,
    },
  };
}

export default async function PublicTripPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicTripClient slug={slug} />;
}
