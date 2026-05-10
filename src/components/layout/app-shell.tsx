"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  CalendarDays,
  Compass,
  Home,
  LogOut,
  Menu,
  NotebookPen,
  PackageCheck,
  Plane,
  Plus,
  Route,
  Search,
  Settings,
  Share2,
  Sparkles,
  WalletCards
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/trips", label: "My Trips", icon: Plane },
  { href: "/trips/new", label: "Create Trip", icon: Plus },
  { href: "/itinerary", label: "Itinerary Builder", icon: Route },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/budget", label: "Budget", icon: WalletCards },
  { href: "/activities", label: "Activities", icon: Compass },
  { href: "/packing", label: "Packing", icon: PackageCheck },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/shared", label: "Shared Trips", icon: Share2 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const userName = session?.user?.name ?? session?.user?.email ?? "Traveler";
  const initials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-navy">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-navy text-white lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary">
            <Plane className="size-4" />
          </span>
          <div>
            <p className="font-bold">Traveloop</p>
            <p className="text-xs text-white/55">Live trip workspace</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                href={item.href}
                key={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white",
                  active && "bg-white text-navy shadow-sm hover:bg-white hover:text-navy"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3">
          <div className="rounded-lg border border-white/10 bg-white/10 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-mint" />
              Smart planner
            </div>
            <p className="mt-2 text-xs leading-5 text-white/60">Weather, activities, and budgets refresh from your live trip data.</p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/85 px-4 backdrop-blur-xl lg:px-8">
          <div className="flex items-center gap-3">
            <Button className="lg:hidden" variant="ghost" size="icon" aria-label="Open navigation">
              <Menu className="size-5" />
            </Button>
            <div className="relative hidden w-[360px] md:block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search trips, cities, activities..." />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="gradient" size="sm">
              <Link href="/trips/new">
                <Plus className="size-4" />
                New trip
              </Link>
            </Button>
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold">{status === "loading" ? "Loading..." : userName}</p>
              <p className="text-xs text-muted-foreground">Signed in</p>
            </div>
            <Avatar>
              <AvatarFallback>{initials || "TL"}</AvatarFallback>
            </Avatar>
            <Button
              aria-label="Log out"
              size="icon"
              variant="ghost"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>
        <main className="min-h-[calc(100vh-4rem)] px-4 py-6 pb-24 lg:px-8">{children}</main>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-lg border bg-white/95 p-1 shadow-glass backdrop-blur-xl lg:hidden">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              href={item.href}
              key={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] font-semibold text-muted-foreground",
                active && "bg-primary text-primary-foreground"
              )}
            >
              <Icon className="size-4" />
              <span className="truncate">{item.label.replace(" Builder", "")}</span>
            </Link>
          );
        })}
      </nav>
      <Button asChild className="fixed bottom-24 right-4 z-50 shadow-glass lg:hidden" size="icon" variant="gradient">
        <Link href="/trips/new" aria-label="Create trip">
          <Plus className="size-5" />
        </Link>
      </Button>
    </div>
  );
}
