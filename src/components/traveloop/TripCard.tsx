"use client";

import { CalendarDays, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";

import type { Trip } from "@/features/traveloop";

import { cn, formatDateRange, formatMoney } from "./utils";

export interface TripCardProps {
  trip: Trip;
  onOpen?: (trip: Trip) => void;
  className?: string;
}

export function TripCard({ trip, onOpen, className }: TripCardProps) {
  const budget =
    typeof trip.budget === "number" || typeof trip.budget === "string"
      ? formatMoney(Number(trip.budget), trip.currency)
      : trip.budget
        ? formatMoney(trip.budget.amount, trip.budget.currency)
        : undefined;
  const destination =
    trip.destinationName ??
    (typeof trip.destination === "string" ? trip.destination : trip.destination?.name) ??
    "Destination pending";
  const startDate = trip.startDate ?? trip.startsAt;
  const endDate = trip.endDate ?? trip.endsAt;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm", className)}
    >
      <button type="button" onClick={() => onOpen?.(trip)} className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500">
        <div className="aspect-[16/9] bg-slate-100">
          {trip.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={trip.coverImageUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">{trip.title}</h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <MapPin aria-hidden="true" className="h-4 w-4" />
                {destination}
              </p>
            </div>
            {trip.status ? <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium capitalize text-slate-700">{trip.status}</span> : null}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <CalendarDays aria-hidden="true" className="h-4 w-4 text-blue-600" />
              {formatDateRange(startDate, endDate)}
            </span>
            <span className="flex items-center gap-1">
              <Users aria-hidden="true" className="h-4 w-4 text-emerald-600" />
              {trip.travelers ?? 1}
            </span>
            <span className="text-right font-medium text-slate-950">{budget ?? `${trip.stopsCount ?? 0} stops`}</span>
          </div>
        </div>
      </button>
    </motion.article>
  );
}
