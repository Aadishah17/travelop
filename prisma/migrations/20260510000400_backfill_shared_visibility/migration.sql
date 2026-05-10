UPDATE "Trip"
SET "visibility" = 'PUBLIC'
WHERE "id" IN (
  SELECT "tripId"
  FROM "SharedItinerary"
  WHERE "expiresAt" IS NULL OR "expiresAt" > CURRENT_TIMESTAMP
);
