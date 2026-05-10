---
tags:
  - project
  - web-dev
  - nextjs
  - react
aliases:
  - Traveloop
---

# Traveloop Project Overview

**Traveloop** is a full-stack web application designed for comprehensive travel planning. It allows users to build itineraries, manage budgets, pack efficiently, and share their trips with others.

## 🔗 Quick Links
- [[Architecture & Stack]]
- [[Database Models]]
- [[Core Features]]
- [[API & Integrations]]

---

## 🛠️ Stack Overview
This project is built using modern web development standards.

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn UI (Radix Primitives)
- **State Management:** Zustand (Client State), React Query (Server State)
- **Database:** PostgreSQL (Hosted on Neon)
- **ORM:** Prisma
- **Authentication:** NextAuth.js

---

## 🗃️ Database Schema
*Refer to `prisma/schema.prisma` for the exact definitions.*

The application revolves around the `Trip` model. A user can own many trips.
- **Trip:** The core entity (destination, dates, budget).
- **Stop:** Locations visited during the trip (cities, transit, lodging).
- **Activity:** Events planned within a trip or stop (tours, meals).
- **Expense:** Financial tracking for the trip budget.
- **PackingItem:** Checklist items for the trip.
- **Note:** General pinned or unpinned notes.
- **SharedItinerary:** Read/Copy links for sharing plans with others.

---

## 🚀 Key Features

### 1. Itinerary Planning
Uses `@fullcalendar` packages for calendar views and `@dnd-kit` for drag-and-drop organization of stops and activities. 

### 2. Interactive Mapping
Integrates `mapbox-gl` to render interactive maps. Users can visually track their stops and activities.

### 3. Financial Tracking
Users can log expenses (flights, lodging, food) and track them against their total defined `Trip` budget.

### 4. Collaboration & Sharing
Users can generate shareable links (`SharedItinerary`) with specific permissions (VIEW or COPY) so friends or family can see the travel plans.

---

## 🌍 Environment & Integrations
The application expects several environment variables (see `.env` file) to function fully:

- `DATABASE_URL` & `DIRECT_URL`: Connection strings for the Neon PostgreSQL database.
- `NEXTAUTH_SECRET` & `NEXTAUTH_URL`: Authentication setup.
- **Optional External APIs:**
  - `MAPBOX_TOKEN`: For rendering maps.
  - `OPENWEATHER_API_KEY`: For weather forecasts.
  - `YELP_API_KEY`: For finding food/activities.
  - `TICKETMASTER_API_KEY`: For event discovery.
  - `CLOUDINARY_URL`: For uploading/storing trip cover images.
  - `RESEND_API_KEY`: For transactional emails.

---
## 📝 Tasks & TODOs
- [ ] Set up Mapbox token
- [ ] Configure Cloudinary for image uploads
- [ ] Build out core map interface
