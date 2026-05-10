import { z } from "zod";

const dateFromInput = (value: unknown, ctx: z.RefinementCtx) => {
  if (typeof value !== "string" || !value.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Date is required." });
    return z.NEVER;
  }

  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00.000Z` : value;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Date must be valid." });
    return z.NEVER;
  }

  return date;
};

const optionalDate = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value, ctx) => (value ? dateFromInput(value, ctx) : null));

const requiredDate = z.string().transform(dateFromInput);

const currency = z.string().trim().length(3).toUpperCase().default("USD");

export const signUpSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
});

const nullableText = (max = 2000) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => (value === undefined ? undefined : value ? value : null));

const optionalImageUrl = z
  .union([z.string().url(), z.literal(""), z.null(), z.undefined()])
  .optional()
  .nullable()
  .transform((value) => (value === undefined ? undefined : value ? value : null));

const tripStatus = z.enum(["DRAFT", "PLANNED", "ACTIVE", "COMPLETED", "ARCHIVED"]);
const tripVisibility = z.enum(["PRIVATE", "PUBLIC"]);

const tripInputSchema = z
  .object({
    title: z.string().trim().min(1).max(140),
    destination: z.string().trim().min(1).max(180).optional(),
    description: nullableText(),
    coverImageUrl: optionalImageUrl,
    coverImage: optionalImageUrl,
    startsAt: requiredDate.optional(),
    endsAt: requiredDate.optional(),
    startDate: requiredDate.optional(),
    endDate: requiredDate.optional(),
    budget: z.coerce.number().nonnegative().optional().nullable(),
    currency,
    status: tripStatus.default("DRAFT"),
    visibility: tripVisibility.default("PRIVATE"),
  })
  .superRefine((value, ctx) => {
    const startsAt = value.startsAt ?? value.startDate;
    const endsAt = value.endsAt ?? value.endDate;

    if (!startsAt) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Trip start date is required.", path: ["startDate"] });
    }

    if (!endsAt) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Trip end date is required.", path: ["endDate"] });
    }

    if (startsAt && endsAt && endsAt < startsAt) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Trip end date must be after start date.", path: ["endDate"] });
    }
  })
  .transform((value) => {
    const startsAt = value.startsAt ?? value.startDate;
    const endsAt = value.endsAt ?? value.endDate;

    return {
      title: value.title,
      destination: value.destination ?? value.title,
      description: value.description,
      coverImageUrl: value.coverImageUrl ?? value.coverImage,
      startsAt: startsAt!,
      endsAt: endsAt!,
      budget: value.budget ?? null,
      currency: value.currency,
      status: value.status,
      visibility: value.visibility,
    };
  });

export const tripCreateSchema = tripInputSchema;

export const tripUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(140).optional(),
    destination: z.string().trim().min(1).max(180).optional(),
    description: nullableText(),
    coverImageUrl: optionalImageUrl,
    coverImage: optionalImageUrl,
    startsAt: requiredDate.optional(),
    endsAt: requiredDate.optional(),
    startDate: requiredDate.optional(),
    endDate: requiredDate.optional(),
    budget: z.coerce.number().nonnegative().optional().nullable(),
    currency: currency.optional(),
    status: tripStatus.optional(),
    visibility: tripVisibility.optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: "At least one trip field is required.",
  })
  .superRefine((value, ctx) => {
    const startsAt = value.startsAt ?? value.startDate;
    const endsAt = value.endsAt ?? value.endDate;

    if (startsAt && endsAt && endsAt < startsAt) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Trip end date must be after start date.", path: ["endDate"] });
    }
  })
  .transform((value) => {
    const data: {
      title?: string;
      destination?: string;
      description?: string | null;
      coverImageUrl?: string | null;
      startsAt?: Date;
      endsAt?: Date;
      budget?: number | null;
      currency?: string;
      status?: z.infer<typeof tripStatus>;
      visibility?: z.infer<typeof tripVisibility>;
    } = {};

    if (value.title !== undefined) data.title = value.title;
    if (value.destination !== undefined) data.destination = value.destination;
    if (value.description !== undefined) data.description = value.description;
    if (value.coverImageUrl !== undefined || value.coverImage !== undefined) data.coverImageUrl = value.coverImageUrl ?? value.coverImage;
    if (value.startsAt !== undefined || value.startDate !== undefined) data.startsAt = value.startsAt ?? value.startDate;
    if (value.endsAt !== undefined || value.endDate !== undefined) data.endsAt = value.endsAt ?? value.endDate;
    if (value.budget !== undefined) data.budget = value.budget;
    if (value.currency !== undefined) data.currency = value.currency;
    if (value.status !== undefined) data.status = value.status;
    if (value.visibility !== undefined) data.visibility = value.visibility;

    return data;
  });

const dateRangeRefinement = (value: { startsAt?: Date | null; endsAt?: Date | null }, ctx: z.RefinementCtx) => {
  if (value.startsAt && value.endsAt && value.endsAt < value.startsAt) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End date must be after start date.", path: ["endsAt"] });
  }
};

const stopFields = {
  title: z.string().trim().min(1).max(140),
  kind: z.enum(["CITY", "REGION", "LODGING", "TRANSIT", "CUSTOM"]).default("CITY"),
  address: z.string().trim().max(300).optional().nullable(),
  placeId: z.string().trim().max(200).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  startsAt: optionalDate,
  endsAt: optionalDate,
  position: z.number().int().min(0).default(0),
};

export const stopCreateSchema = z.object(stopFields).superRefine(dateRangeRefinement);

export const stopUpdateSchema = z.object(stopFields).partial().superRefine(dateRangeRefinement);

export const stopReorderSchema = z.object({
  stops: z
    .array(
      z.object({
        id: z.string().cuid(),
        position: z.number().int().min(0),
      }),
    )
    .min(1),
});

const activityFields = {
  stopId: z.string().cuid().optional().nullable(),
  title: z.string().trim().min(1).max(160),
  category: z
    .enum(["FOOD", "TOUR", "OUTDOOR", "CULTURE", "SHOPPING", "NIGHTLIFE", "TRANSPORT", "LODGING", "OTHER"])
    .default("OTHER"),
  description: z.string().trim().max(2000).optional().nullable(),
  address: z.string().trim().max(300).optional().nullable(),
  externalId: z.string().trim().max(200).optional().nullable(),
  bookingUrl: z.string().url().optional().nullable(),
  startsAt: optionalDate,
  endsAt: optionalDate,
  cost: z.coerce.number().nonnegative().optional().nullable(),
  currency,
  position: z.number().int().min(0).default(0),
  completed: z.boolean().default(false),
};

export const activityCreateSchema = z.object(activityFields).superRefine(dateRangeRefinement);

export const activityUpdateSchema = z.object(activityFields).partial().superRefine(dateRangeRefinement);

export const activityListQuerySchema = z.object({
  stopId: z.string().cuid().optional(),
  category: z
    .enum(["FOOD", "TOUR", "OUTDOOR", "CULTURE", "SHOPPING", "NIGHTLIFE", "TRANSPORT", "LODGING", "OTHER"])
    .optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const expenseCategory = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const normalized = value.trim().toUpperCase();
  const aliases: Record<string, string> = {
    TRANSPORT: "TRANSPORT",
    TRANSPORTATION: "TRANSPORT",
    FLIGHT: "FLIGHT",
    FLIGHTS: "FLIGHT",
    HOTEL: "LODGING",
    HOTELS: "LODGING",
    STAY: "LODGING",
    STAYS: "LODGING",
    LODGING: "LODGING",
    FOOD: "FOOD",
    MEAL: "FOOD",
    MEALS: "FOOD",
    RESTAURANTS: "FOOD",
    ACTIVITY: "ACTIVITY",
    ACTIVITIES: "ACTIVITY",
    ATTRACTIONS: "ACTIVITY",
    SHOPPING: "SHOPPING",
    MISC: "OTHER",
    MISCELLANEOUS: "OTHER",
    OTHER: "OTHER",
  };

  return aliases[normalized] ?? normalized;
}, z.enum(["FLIGHT", "LODGING", "FOOD", "TRANSPORT", "ACTIVITY", "SHOPPING", "INSURANCE", "OTHER"]).default("OTHER"));

export const expenseCreateSchema = z.object({
  title: z.string().trim().min(1).max(160),
  amount: z.coerce.number().nonnegative(),
  currency,
  category: expenseCategory,
  paidBy: z.string().trim().max(120).optional().nullable(),
  incurredAt: requiredDate.optional(),
});

export const expenseUpdateSchema = expenseCreateSchema.partial().refine((value) => Object.values(value).some((item) => item !== undefined), {
  message: "At least one expense field is required.",
});

const packingCategory = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const normalized = value.trim().toUpperCase();
  const aliases: Record<string, string> = {
    CLOTHING: "CLOTHING",
    CLOTHES: "CLOTHING",
    TOILETRIES: "TOILETRIES",
    DOCUMENTS: "DOCUMENTS",
    DOCS: "DOCUMENTS",
    ELECTRONICS: "ELECTRONICS",
    ACCESSORIES: "ACCESSORIES",
    MEDICAL: "MEDICAL",
    HEALTH: "MEDICAL",
    CUSTOM: "CUSTOM",
    OTHER: "OTHER",
  };

  return aliases[normalized] ?? normalized;
}, z.enum(["CLOTHING", "TOILETRIES", "DOCUMENTS", "ELECTRONICS", "ACCESSORIES", "MEDICAL", "CUSTOM", "OTHER"]).default("OTHER"));

export const packingItemCreateSchema = z.object({
  label: z.string().trim().min(1).max(160),
  category: packingCategory,
  customCategory: z.string().trim().min(1).max(80).optional().nullable(),
  quantity: z.coerce.number().int().min(1).max(999).default(1),
  packed: z.boolean().default(false),
});

export const packingItemUpdateSchema = packingItemCreateSchema.partial();

export const noteCreateSchema = z.object({
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(10000),
  journalDate: optionalDate,
  imageUrl: optionalImageUrl,
  pinned: z.boolean().default(false),
});

export const noteUpdateSchema = noteCreateSchema.partial().refine((value) => Object.values(value).some((item) => item !== undefined), {
  message: "At least one note field is required.",
});

export const shareCreateSchema = z.object({
  tripId: z.string().cuid(),
  email: z.string().email().optional(),
  permission: z.enum(["VIEW", "COPY"]).default("VIEW"),
  expiresAt: optionalDate,
});

export const shareSettingsSchema = z.object({
  visibility: tripVisibility.default("PUBLIC"),
  permission: z.enum(["VIEW", "COPY"]).default("COPY"),
  expiresAt: optionalDate.optional(),
});

export const destinationSearchSchema = z.object({
  q: z.string().trim().min(2).max(120),
  limit: z.coerce.number().int().min(1).max(12).default(6),
  country: z.string().trim().min(2).max(2).optional(),
  region: z.string().trim().min(2).max(80).optional(),
  type: z.enum(["city", "region", "country", "locality", "place"]).default("city"),
});

export const weatherQuerySchema = z.object({
  location: z.string().trim().min(2).max(160).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
});

export const activityDiscoverySchema = z.object({
  location: z.string().trim().min(2).max(160),
  query: z.string().trim().max(120).default("things to do"),
  limit: z.coerce.number().int().min(1).max(30).default(12),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
  category: z.string().trim().max(80).optional(),
  price: z.string().trim().max(20).optional(),
});

export const discoveredActivitySaveSchema = z.object({
  tripId: z.string().cuid(),
  stopId: z.string().cuid().optional().nullable(),
  title: z.string().trim().min(1).max(160),
  category: z.string().trim().max(80).default("OTHER"),
  description: z.string().trim().max(2000).optional().nullable(),
  address: z.string().trim().max(300).optional().nullable(),
  externalId: z.string().trim().max(200).optional().nullable(),
  bookingUrl: z.string().url().optional().nullable(),
  startsAt: optionalDate,
  cost: z.coerce.number().nonnegative().optional().nullable(),
});

export const destinationStopSaveSchema = z.object({
  tripId: z.string().cuid(),
  title: z.string().trim().min(1).max(140),
  address: z.string().trim().max(300).optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  startsAt: optionalDate,
  endsAt: optionalDate,
  position: z.coerce.number().int().min(0).default(0),
});
