import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Traveloop - Plan smarter journeys",
    template: "%s | Traveloop"
  },
  description:
    "Traveloop is a premium travel planning SaaS for multi-city itineraries, live maps, budgets, packing, journals, and public trip sharing.",
  keywords: ["travel planner", "itinerary builder", "budget tracker", "trip planner", "Traveloop"],
  openGraph: {
    title: "Traveloop",
    description: "Plan smarter journeys with live travel data and collaborative itinerary tools.",
    type: "website",
    url: appUrl,
    siteName: "Traveloop"
  },
  twitter: {
    card: "summary_large_image",
    title: "Traveloop",
    description: "Plan smarter journeys with live travel data and collaborative itinerary tools."
  },
  alternates: {
    canonical: appUrl
  },
  robots: {
    index: true,
    follow: true
  },
  applicationName: "Traveloop",
  category: "travel"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Traveloop",
    applicationCategory: "TravelApplication",
    operatingSystem: "Web",
    url: appUrl,
    description:
      "A premium travel planning SaaS for multi-city itineraries, live maps, budgets, packing, journals, and public trip sharing.",
  };

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
