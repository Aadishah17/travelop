"use client";

import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "./utils";

const toneClasses = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-200"
};

export interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: number;
  helperText?: string;
  icon?: LucideIcon;
  tone?: keyof typeof toneClasses;
  className?: string;
}

export function MetricCard({ label, value, delta, helperText, icon: Icon, tone = "blue", className }: MetricCardProps) {
  const DeltaIcon = delta !== undefined && delta < 0 ? ArrowDownRight : ArrowUpRight;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-lg border border-slate-200 bg-white p-4 shadow-sm", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{value}</p>
        </div>
        {Icon ? (
          <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-lg ring-1", toneClasses[tone])}>
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm">
        {delta !== undefined ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 font-medium",
              delta >= 0 ? "text-emerald-600" : "text-rose-600"
            )}
          >
            <DeltaIcon aria-hidden="true" className="h-4 w-4" />
            {Math.abs(delta)}%
          </span>
        ) : null}
        {helperText ? <span className="text-slate-500">{helperText}</span> : null}
      </div>
    </motion.article>
  );
}
