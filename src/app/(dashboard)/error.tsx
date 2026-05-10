"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Something went wrong
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          We ran into an issue loading this page. This could be a temporary
          problem with the server or your connection.
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-muted-foreground/60">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <button
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <RotateCcw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
