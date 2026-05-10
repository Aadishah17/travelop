"use client";

import { Clock, MapPin } from "lucide-react";

import type { Activity, Stop } from "@/features/traveloop";

import { cn, formatDateRange } from "./utils";

export interface ItineraryTimelineItem {
  stop: Stop;
  activities?: Activity[];
}

export interface ItineraryTimelineProps {
  items: ItineraryTimelineItem[];
  onSelectActivity?: (activity: Activity) => void;
  className?: string;
}

export function ItineraryTimeline({ items, onSelectActivity, className }: ItineraryTimelineProps) {
  return (
    <ol className={cn("space-y-4", className)} aria-label="Trip itinerary">
      {items.map(({ stop, activities = [] }) => (
        <li key={stop.id} className="relative rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-blue-600">Stop {(stop.position ?? stop.order ?? 0) + 1}</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-950">{stop.title}</h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <MapPin aria-hidden="true" className="h-4 w-4" />
                {[stop.city, stop.country].filter(Boolean).join(", ") || stop.address || "Location pending"}
              </p>
            </div>
            <span className="rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              {formatDateRange(stop.startsAt, stop.endsAt)}
            </span>
          </div>
          {activities.length ? (
            <ul className="mt-4 border-l border-slate-200 pl-4">
              {activities.map((activity) => (
                <li key={activity.id} className="py-3">
                  <button
                    type="button"
                    onClick={() => onSelectActivity?.(activity)}
                    className="group flex w-full items-start gap-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-slate-900 group-hover:text-blue-700">{activity.title}</span>
                      <span className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                        <Clock aria-hidden="true" className="h-4 w-4" />
                        {formatDateRange(activity.startsAt, activity.endsAt)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
