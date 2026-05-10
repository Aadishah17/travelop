---
tags:
  - api
  - integrations
  - environment
---

# API & Integrations

**Project:** [[Traveloop Project]]

Traveloop is designed to connect with several external services to enrich the travel planning experience.

## 🗺️ Mapbox
- **Purpose:** Rendering interactive maps and potentially geocoding locations.
- **Env Var:** `MAPBOX_TOKEN`

## 🌤️ OpenWeather
- **Purpose:** Providing weather forecasts for upcoming trip destinations or stops.
- **Env Var:** `OPENWEATHER_API_KEY`

## 🍔 Yelp
- **Purpose:** Fetching data for restaurants, attractions, and activities.
- **Env Var:** `YELP_API_KEY`

## 🎫 Ticketmaster
- **Purpose:** Discovering live events, concerts, or sports occurring during the trip dates at the destination.
- **Env Var:** `TICKETMASTER_API_KEY`

## ☁️ Cloudinary
- **Purpose:** Image hosting. Likely used for `coverImageUrl` on the `Trip` model or user avatars.
- **Env Var:** `CLOUDINARY_URL`

## 📧 Resend
- **Purpose:** Transactional emails (e.g., NextAuth magic links, itinerary sharing notifications).
- **Env Var:** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
