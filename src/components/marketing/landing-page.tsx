"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  CloudSun,
  Compass,
  MapPinned,
  Route,
  Share2,
  Sparkles,
  WalletCards,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/layout/logo";

const features = [
  { title: "Multi-city itinerary builder", icon: Route, copy: "Plan routes, stops, and day-by-day timelines in one workspace." },
  { title: "Budget tracking", icon: WalletCards, copy: "Track expenses, alerts, and category analytics as plans change." },
  { title: "Activity discovery", icon: Compass, copy: "Find live attractions, restaurants, events, and saved favorites." },
  { title: "Shared itineraries", icon: Share2, copy: "Publish read-only trip pages and invite collaborators by email." },
  { title: "Smart travel planner", icon: Sparkles, copy: "Blend weather, maps, search, and trip data into clear next steps." },
  { title: "Packing checklist", icon: CheckSquare, copy: "Organize packing by category and watch progress update instantly." }
];

const destinations = [
  {
    city: "Kyoto",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80",
    tag: "$1,850 avg"
  },
  {
    city: "Santorini",
    country: "Greece",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=80",
    tag: "$2,400 avg"
  },
  {
    city: "Paris",
    country: "France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80",
    tag: "$1,950 avg"
  }
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f5f8fc] text-navy">
      <header className="sticky top-0 z-50 border-b bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features">Features</a>
            <a href="#destinations">Destinations</a>
            <a href="#community">Community</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="gradient" size="sm">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-navy text-white">
          <Image
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=90"
            alt="Mountain lake travel landscape"
            fill
            priority
            className="object-cover opacity-60"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/25 via-navy/20 to-[#f5f8fc]" />
          <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-10 px-4 py-20 md:px-6 lg:grid-cols-[1fr_560px]">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-normal md:text-7xl">
                Plan smarter journeys with Traveloop
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/82 md:text-lg">
                Build multi-city trips, map every stop, forecast the weather, track budgets, and publish polished itinerary pages from a single live workspace.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" variant="gradient">
                  <Link href="/signup">Create Account</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/shared">Explore Trips</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                  <a href="/download/android">
                    <Smartphone className="mr-2 size-4" />
                    Android App
                  </a>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="glass-card relative hidden overflow-hidden rounded-lg p-4 text-navy lg:block"
            >
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Tokyo Loop</p>
                    <h2 className="text-xl font-bold">14-day itinerary</h2>
                  </div>
                  <Badge variant="emerald">Live</Badge>
                </div>
                <div className="grid grid-cols-[1.2fr_0.8fr] gap-3">
                  <div className="rounded-lg border bg-white p-3">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <MapPinned className="size-4 text-primary" />
                      Route preview
                    </div>
                    <div className="relative h-48 overflow-hidden rounded-md bg-[linear-gradient(135deg,#e0f2fe_0%,#f0fdfa_48%,#dbeafe_100%)]">
                      <div className="absolute left-8 top-8 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_0_6px_rgba(37,99,235,0.12)]" />
                      <div className="absolute right-10 top-16 h-2.5 w-2.5 rounded-full bg-emerald shadow-[0_0_0_6px_rgba(16,185,129,0.14)]" />
                      <div className="absolute bottom-10 left-24 h-2.5 w-2.5 rounded-full bg-sky shadow-[0_0_0_6px_rgba(14,165,233,0.14)]" />
                      <div className="absolute left-10 right-12 top-12 h-24 rounded-[45%] border-2 border-dashed border-primary/45 border-b-transparent border-l-transparent" />
                      <div className="absolute bottom-5 left-5 right-5 grid grid-cols-3 gap-2 text-[10px] font-bold text-navy/70">
                        <span>Tokyo</span>
                        <span className="text-center">Kyoto</span>
                        <span className="text-right">Osaka</span>
                      </div>
                      <div className="absolute inset-x-4 bottom-9 h-px bg-white/70" />
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <CloudSun className="size-4 text-sky" />
                          Weather
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-3xl font-bold">24°C</p>
                        <p className="text-xs text-muted-foreground">Light rain in Kyoto</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <WalletCards className="size-4 text-emerald" />
                          Budget
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-3xl font-bold">$3,450</p>
                        <Progress value={68} className="mt-3" />
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <div className="grid gap-2 rounded-lg border bg-white p-3">
                  {["Shinjuku food walk", "Bullet train to Kyoto", "Fushimi Inari sunrise"].map((item, index) => (
                    <div className="flex items-center gap-3 rounded-md bg-slate-50 p-2 text-sm" key={item}>
                      <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                      <span className="font-medium">{item}</span>
                      <span className="ml-auto text-xs text-muted-foreground">Day {index + 2}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-20 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-normal md:text-4xl">A suite for limitless exploration</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Everything needed to plan, organize, and execute the perfect trip, housed in a premium, intelligent interface.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card className="glass-card transition hover:-translate-y-1 hover:shadow-glass" key={feature.title}>
                  <CardHeader>
                    <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">{feature.copy}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="destinations" className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-normal">Popular destinations</h2>
                <p className="mt-3 text-sm text-muted-foreground">Connected to live search APIs when your keys are configured.</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/activities">Explore live data</Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {destinations.map((destination) => (
                <Card className="group overflow-hidden" key={destination.city}>
                  <div className="relative h-56">
                    <Image
                      src={destination.image}
                      alt={`${destination.city}, ${destination.country}`}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="font-bold">{destination.city}</h3>
                      <p className="text-sm text-muted-foreground">{destination.country}</p>
                    </div>
                    <Badge variant="sky">{destination.tag}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-20 md:px-6 lg:grid-cols-[1fr_420px]">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CalendarDays className="size-5 text-primary" />
                Itinerary Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {["Arrive in Lisbon", "Tile workshop in Alfama", "Train to Porto", "Douro valley dinner"].map((item, index) => (
                <div className="grid grid-cols-[72px_1fr_auto] items-center gap-4 rounded-lg border bg-white p-3" key={item}>
                  <span className="text-xs font-bold text-muted-foreground">Day {index + 1}</span>
                  <span className="font-semibold">{item}</span>
                  <Badge variant={index % 2 ? "emerald" : "secondary"}>{index % 2 ? "$84" : "Booked"}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="navy-panel rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="size-5 text-mint" />
                Budget Analytics Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {["Flights", "Hotels", "Food", "Transit"].map((label, index) => (
                  <div className="rounded-lg bg-white/10 p-3" key={label}>
                    <p className="text-xs text-white/60">{label}</p>
                    <p className="mt-1 text-2xl font-bold">${[840, 1260, 540, 210][index]}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="community" className="bg-navy py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <h2 className="text-3xl font-bold tracking-normal">Community trips</h2>
                <p className="mt-4 text-sm leading-6 text-white/65">
                  Share itineraries publicly, copy inspiration into your workspace, and invite travel partners with Resend-powered emails.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {["Nordic aurora loop", "Japan rail sprint", "Andes slow travel"].map((trip) => (
                  <div className="rounded-lg border border-white/10 bg-white/10 p-4" key={trip}>
                    <p className="font-semibold">{trip}</p>
                    <p className="mt-2 text-xs leading-5 text-white/55">Public itinerary with day plans, budgets, notes, and route map.</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-16 rounded-lg border border-white/10 bg-white/10 p-8 text-center">
              <h2 className="text-3xl font-bold tracking-normal">Start planning unforgettable journeys today.</h2>
              <div className="mt-6 flex justify-center gap-3">
                <Button asChild variant="gradient">
                  <Link href="/signup">Create Account</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/shared">Explore Trips</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-navy px-4 py-10 text-white md:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
          <div>
            <Logo className="text-white" />
            <p className="mt-4 text-sm leading-6 text-white/55">Plan smarter journeys with live data and beautiful collaborative tools.</p>
          </div>
          {["Explore", "Company", "Legal"].map((group) => (
            <div key={group}>
              <h3 className="text-sm font-semibold">{group}</h3>
              <div className="mt-3 grid gap-2 text-sm text-white/55">
                <a href="#">Destinations</a>
                <a href="#">Community</a>
                <a href="#">Support</a>
              </div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
