"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { BudgetDatum } from "@/features/traveloop";

import { cn } from "./utils";

export interface BudgetAnalyticsProps {
  data: BudgetDatum[];
  currency?: string;
  className?: string;
}

export function BudgetAnalytics({ data, currency = "USD", className }: BudgetAnalyticsProps) {
  const formatter = new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  });

  return (
    <section className={cn("rounded-lg border border-slate-200 bg-white p-4 shadow-sm", className)} aria-label="Budget analytics">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-950">Budget analytics</h2>
        <p className="mt-1 text-sm text-slate-500">Planned and actual spend by category.</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} tickFormatter={(value) => formatter.format(Number(value))} />
            <Tooltip formatter={(value) => formatter.format(Number(value))} cursor={{ fill: "#F8FAFC" }} />
            <Legend />
            <Bar dataKey="planned" name="Planned" fill="#93C5FD" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actual" name="Actual" fill="#2563EB" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
