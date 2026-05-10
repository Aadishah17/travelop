import { cn } from "./utils";

export interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export function LoadingSkeletons({ count = 3, className }: LoadingSkeletonProps) {
  return (
    <div className={cn("grid gap-3", className)} aria-label="Loading content">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-32 animate-pulse rounded-lg bg-slate-100" />
          <div className="mt-4 h-3 w-2/3 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}
