"use client";

import { CalendarClock, ExternalLink, MapPin, Star } from "lucide-react";

import type { Activity } from "@/features/traveloop";

import { cn, formatMoney } from "./utils";

export interface ActivityCardProps {
  activity: Activity;
  onToggleBooked?: (activity: Activity) => void;
  className?: string;
}

export function ActivityCard({ activity, onToggleBooked, className }: ActivityCardProps) {
  const price =
    activity.price ??
    (activity.cost !== undefined && activity.cost !== null
      ? { amount: Number(activity.cost), currency: activity.currency ?? "USD" }
      : undefined);
  const isBooked = activity.isBooked ?? activity.completed ?? false;

  return (
    <article className={cn("rounded-lg border border-slate-200 bg-white p-3 shadow-sm", className)}>
      <div className="flex gap-3">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {activity.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={activity.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-slate-950">{activity.title}</h3>
            {activity.rating ? (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600">
                <Star aria-hidden="true" className="h-4 w-4 fill-current" />
                {activity.rating.toFixed(1)}
              </span>
            ) : null}
          </div>
          {activity.description ? <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{activity.description}</p> : null}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin aria-hidden="true" className="h-4 w-4" />
              {activity.locationName ?? "Location pending"}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarClock aria-hidden="true" className="h-4 w-4" />
              {activity.durationMinutes ? `${activity.durationMinutes} min` : "Flexible"}
            </span>
            {price ? <span className="font-medium text-slate-900">{formatMoney(price.amount, price.currency)}</span> : null}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => onToggleBooked?.(activity)}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500",
            isBooked ? "bg-emerald-50 text-emerald-700" : "bg-blue-600 text-white"
          )}
        >
          {isBooked ? "Booked" : "Add to trip"}
        </button>
        {activity.bookingUrl ? (
          <a href={activity.bookingUrl} className="inline-flex items-center gap-1 text-sm font-medium text-blue-700">
            Details
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </article>
  );
}
