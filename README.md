# 🌍 Traveloop

Traveloop is a production-oriented travel planning SaaS built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, PostgreSQL, NextAuth, TanStack Query, Framer Motion, and Recharts.

It helps users organize their trips by building daily itineraries, managing budgets, tracking packing lists, and easily sharing their plans with friends or family.

## ✨ Core Features

- **Authentication:** Credentials auth with bcrypt password hashing, Prisma Adapter, JWT sessions, protected dashboard routes, signup, login, forgot-password UI, and logout.
- **Trip Dashboard:** PostgreSQL-backed trips, multi-city stops, activities, expenses, packing items, notes, and shared itineraries.
- **Visual Itineraries:** Calendar integration with monthly, weekly, and daily views powered by FullCalendar.
- **Interactive Builder:** Interactive itinerary builder with stop/activity CRUD, drag-and-drop stop ordering, cost sidebar, timeline cards, and persisted updates.
- **Live Discovery:** Live destination, weather, map, and activity discovery routes for Mapbox, OpenWeather, Google Places, Yelp, and Ticketmaster.
- **Budget Tracking:** Budget analytics engine with expenses CRUD, activity costs, remaining budget calculations, alerts, and Recharts visualizations.
- **Smart Packing Lists:** Packing checklist and journal systems with category progress, packed toggles, rich notes, autosave, and image attachments.
- **Social Sharing:** Public itinerary sharing, community feed, share URLs, copy-ready itineraries, traveler previews, and social sharing.

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, shadcn-style UI primitives, Framer Motion.
- **Backend:** Next.js Route Handlers, Server Actions, NextAuth, Prisma ORM.
- **Database:** Neon PostgreSQL with pooled runtime URL and direct migration URL.
- **Data/State:** TanStack Query, React Hook Form, Zod, Zustand-ready architecture.
- **Integrations:** Mapbox, OpenWeather, Google Places, Yelp, Ticketmaster, Cloudinary, Resend.

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install the dependencies (Node.js 24 LTS recommended):
```bash
pnpm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your confidential API keys and database strings.

*Note: Use the pooled Neon URL for `DATABASE_URL` at runtime and the direct Neon URL for `DIRECT_URL` during Prisma migrations.*

### 3. Database Setup & Seeding

```bash
pnpm prisma:generate
pnpm prisma:migrate
pnpm db:seed
```

**Demo User Login:**
- **Email:** `demo@traveloop.app`
- **Password:** `Traveloop123!`

### 4. Run the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## ✅ Verification & Health Checks

Verify your types and build:
```bash
pnpm typecheck
pnpm build
```

Health checks routes are available:
- `/api/health/db` verifies PostgreSQL connectivity.
- `/api/health/env` reports whether production integration groups are configured.

## 🚢 Deployment

Traveloop is ready for Vercel + Neon:
1. Create a Neon database and copy pooled/direct URLs.
2. Add every variable from `.env.example` in Vercel Project Settings.
3. Run Prisma migrations against Neon before the first production release.
4. Deploy with Vercel using the included `vercel.json`.
5. Configure production API keys for Mapbox, OpenWeather, activity providers, Cloudinary, and Resend.

## 📄 License
This project is licensed under the MIT License.
