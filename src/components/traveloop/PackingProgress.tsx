"use client";

import { CheckCircle2, Circle } from "lucide-react";

import type { PackingItem } from "@/features/traveloop";

import { cn } from "./utils";

export interface PackingProgressProps {
  items: PackingItem[];
  onToggle?: (item: PackingItem) => void;
  className?: string;
}

export function PackingProgress({ items, onToggle, className }: PackingProgressProps) {
  const packed = items.filter((item) => item.packed ?? item.isPacked).length;
  const percent = items.length ? Math.round((packed / items.length) * 100) : 0;

  return (
    <section className={cn("rounded-lg border border-slate-200 bg-white p-4 shadow-sm", className)} aria-label="Packing progress">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Packing</h2>
          <p className="text-sm text-slate-500">
            {packed} of {items.length} packed
          </p>
        </div>
        <span className="text-2xl font-semibold text-emerald-600">{percent}%</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
      </div>
      <ul className="mt-4 space-y-2">
        {items.slice(0, 6).map((item) => {
          const isPacked = item.packed ?? item.isPacked;
          const Icon = isPacked ? CheckCircle2 : Circle;

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onToggle?.(item)}
                className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-800">
                  <Icon aria-hidden="true" className={cn("h-4 w-4", isPacked ? "text-emerald-600" : "text-slate-400")} />
                  {item.label}
                </span>
                {item.quantity ? <span className="text-sm text-slate-500">x{item.quantity}</span> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
