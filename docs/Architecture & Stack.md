---
tags:
  - architecture
  - stack
  - tech
---

# Architecture & Stack

**Project:** [[Traveloop Project]]

The Traveloop application is a modern Next.js application leveraging the App Router. It separates client-side interactivity and server-side data fetching effectively.

## 🧱 Core Stack
- **Next.js 15:** Core framework utilizing React Server Components (RSC) and server actions.
- **React 19:** UI library.
- **TypeScript:** Strict typing across both client and server code.

## 🎨 Styling & UI
- **Tailwind CSS:** Utility-first CSS framework.
- **Shadcn UI:** Reusable components built on top of Radix UI primitives for accessibility.
- **Framer Motion:** For smooth, physics-based animations (configured in package.json).

## 🗄️ State & Data Fetching
- **Zustand:** Lightweight global state management for the client (e.g., UI toggles, drag-and-drop state).
- **TanStack React Query:** Used for fetching, caching, synchronizing, and updating server state.
- **Prisma ORM:** Typesafe database client for PostgreSQL.

## 🔒 Authentication
- **NextAuth.js:** Handles sessions, OAuth providers, and email magic links, utilizing the `@next-auth/prisma-adapter`.
