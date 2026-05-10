"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { tripCreateSchema } from "@/lib/validators";

export async function createTripAction(input: unknown) {
  const userId = await requireUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const data = tripCreateSchema.parse(input);
  const trip = await prisma.trip.create({
    data: {
      ...data,
      ownerId: userId,
    },
  });

  revalidatePath("/trips");
  return trip;
}
