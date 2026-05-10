"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import { copySharedTrip } from "@/lib/sharing";

export async function copySharedTripAction(slug: string) {
  const userId = await requireUserId();

  if (!userId) {
    return { ok: false as const, message: "Sign in to copy this itinerary." };
  }

  const trip = await copySharedTrip(slug, userId);

  if (!trip) {
    return { ok: false as const, message: "This itinerary cannot be copied." };
  }

  revalidatePath("/trips");
  revalidatePath("/dashboard");

  return { ok: true as const, tripId: trip.id, message: "Trip copied to your workspace." };
}
