---
tags:
  - database
  - schema
  - prisma
---

# Database Models

**Project:** [[Traveloop Project]]

The database is built on **PostgreSQL** and managed via **Prisma**. Below is the entity breakdown.

## 🗺️ Core Models

### 1. User & Auth
- **User:** Primary user account.
- **Account / Session / VerificationToken:** Managed by NextAuth for authentication.

### 2. Trip Planning
- **Trip:** The root entity. Has a destination, dates, budget, and currency. Connects to the User (owner).
- **Stop:** Distinct locations/points within a trip. Includes geospatial data (`latitude`, `longitude`, `placeId`). Can be a city, lodging, or transit stop.
- **Activity:** specific events (e.g., a museum tour, dinner reservation). Can be linked to a specific `Stop` or just the `Trip`. Has costs, times, and categories.

### 3. Finances
- **Expense:** Tracks costs. Has categories like `FLIGHT`, `FOOD`, `LODGING`. Linked to the `Trip`.

### 4. Logistics
- **PackingItem:** Granular checklist items categorized by type (e.g., `CLOTHING`, `ELECTRONICS`). Tracks whether the item is `packed`.
- **Note:** Freeform text notes for the trip, which can be pinned.

### 5. Social / Sharing
- **SharedItinerary:** Allows generating unique slugs to share a trip publicly or with specific permissions (`VIEW`, `COPY`).
