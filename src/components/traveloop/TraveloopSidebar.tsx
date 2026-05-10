"use client";

import { LucideIcon } from "lucide-react";

import { cn } from "./utils";

export interface TraveloopSidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
}

export interface TraveloopSidebarProps {
  items: TraveloopSidebarItem[];
  collapsed?: boolean;
  onSelect?: (item: TraveloopSidebarItem) => void;
  className?: string;
}

export function TraveloopSidebar({ items, collapsed = false, onSelect, className }: TraveloopSidebarProps) {
  return (
    <aside className={cn("h-full bg-navy px-3 py-4 text-white", collapsed ? "w-20" : "w-64", className)} aria-label="Traveloop navigation">
      <div className="mb-6 px-2">
        <span className="text-lg font-semibold tracking-normal">{collapsed ? "T" : "Traveloop"}</span>
      </div>
      <nav className="space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-300",
              item.isActive ? "bg-white text-navy" : "text-slate-300 hover:bg-white/10 hover:text-white",
              collapsed && "justify-center"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon aria-hidden="true" className="h-5 w-5 shrink-0" />
            {!collapsed ? <span>{item.label}</span> : null}
          </button>
        ))}
      </nav>
    </aside>
  );
}
