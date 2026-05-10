import type { ReactNode } from "react";
import { LucideIcon, MapPinned } from "lucide-react";

import { cn } from "./utils";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export function EmptyState({ title, description, action, icon: Icon = MapPinned, className }: EmptyStateProps) {
  return (
    <section className={cn("rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center", className)}>
      <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        <Icon aria-hidden="true" className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-slate-950">{title}</h2>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}
