"use client";

import { MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";

import type { Destination } from "@/features/traveloop";

import { cn } from "./utils";

export interface DestinationCardProps {
  destination: Destination;
  onSelect?: (destination: Destination) => void;
  className?: string;
}

export function DestinationCard({ destination, onSelect, className }: DestinationCardProps) {
  const content = (
    <>
      <div className="aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
        {destination.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={destination.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <MapPin aria-hidden="true" className="h-8 w-8" />
          </div>
        )}
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-950">{destination.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <MapPin aria-hidden="true" className="h-4 w-4" />
              {[destination.region, destination.country].filter(Boolean).join(", ") || "Explore"}
            </p>
          </div>
          {destination.averageRating ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700">
              <Star aria-hidden="true" className="h-4 w-4 fill-current" />
              {destination.averageRating.toFixed(1)}
            </span>
          ) : null}
        </div>
        {destination.description ? <p className="line-clamp-2 text-sm leading-6 text-slate-600">{destination.description}</p> : null}
      </div>
    </>
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-lg border border-slate-200 bg-white p-3 shadow-sm", className)}
    >
      {onSelect ? (
        <button type="button" onClick={() => onSelect(destination)} className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500">
          {content}
        </button>
      ) : (
        content
      )}
    </motion.article>
  );
}
