import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(16),
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),
  MAPBOX_TOKEN: z.string().optional(),
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),
  OPENWEATHER_API_KEY: z.string().optional(),
  GOOGLE_PLACES_API_KEY: z.string().optional(),
  YELP_API_KEY: z.string().optional(),
  TICKETMASTER_API_KEY: z.string().optional(),
  CLOUDINARY_URL: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
});

export type TraveloopEnv = z.infer<typeof envSchema>;

export function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const missing = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid Traveloop environment: ${missing}`);
  }

  return parsed.data;
}

export function envSummary() {
  return {
    database: Boolean(process.env.DATABASE_URL),
    directDatabase: Boolean(process.env.DIRECT_URL),
    auth: Boolean(process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_URL),
    mapbox: Boolean(process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN),
    weather: Boolean(process.env.OPENWEATHER_API_KEY),
    places: Boolean(process.env.GOOGLE_PLACES_API_KEY || process.env.YELP_API_KEY || process.env.TICKETMASTER_API_KEY),
    cloudinary: Boolean(process.env.CLOUDINARY_URL),
    resend: Boolean(process.env.RESEND_API_KEY),
  };
}
