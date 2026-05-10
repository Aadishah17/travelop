"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { logger } from "@/lib/logger";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logger.error("Global app error boundary", error, { digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="grid min-h-screen place-items-center bg-background px-4">
          <Card className="glass-card max-w-md">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="mx-auto size-10 text-destructive" />
              <h1 className="mt-4 text-2xl font-bold tracking-normal text-navy">Traveloop hit a detour</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">The page failed to render. Try again, and the app will reload this route cleanly.</p>
              <Button className="mt-6" variant="gradient" onClick={reset}>
                <RefreshCcw className="size-4" />
                Try again
              </Button>
            </CardContent>
          </Card>
        </main>
      </body>
    </html>
  );
}
