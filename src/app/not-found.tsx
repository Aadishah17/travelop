import Link from "next/link";
import { MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <Card className="glass-card max-w-md">
        <CardContent className="p-8 text-center">
          <MapPinned className="mx-auto size-10 text-primary" />
          <h1 className="mt-4 text-2xl font-bold tracking-normal text-navy">This trip route is missing</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">The itinerary may be private, expired, or moved.</p>
          <Button asChild className="mt-6" variant="gradient">
            <Link href="/">Back to Traveloop</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
