---
tags:
  - features
  - product
---

# Core Features

**Project:** [[Traveloop Project]]

These are the primary user-facing features of the application inferred from the dependencies and schema.

## 1. 📅 Interactive Scheduling
The application utilizes `@fullcalendar` packages (daygrid, timegrid, list, interaction). This allows users to view their trip visually and schedule activities on a calendar. Combined with `@dnd-kit`, users can likely drag and drop activities to reschedule them.

## 2. 🗺️ Map Integrations
With `mapbox-gl`, the app can render the geographic coordinates stored in the `Stop` model. This allows for:
- Plotting all stops on a visual map.
- Calculating routes.
- Pinpointing activities and lodging.

## 3. 💰 Budget Management
The `Expense` model indicates a robust budgeting tool. Users can set a total budget on the `Trip` and log individual expenses against it, categorized by type (flights, food, etc.).

## 4. 🧳 Packing Lists
A built-in checklist feature for packing (`PackingItem`). Items can be grouped by category and marked as packed.

## 5. 🤝 Itinerary Sharing
The `SharedItinerary` feature enables users to generate a secure link (`slug`) to let friends or family view the itinerary. The `COPY` permission suggests users might be able to duplicate someone else's itinerary as a template.
