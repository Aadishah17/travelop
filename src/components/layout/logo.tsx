import Link from "next/link";
import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 font-bold tracking-normal text-primary", className)}>
      <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Plane className="size-4" />
      </span>
      <span>Traveloop</span>
    </Link>
  );
}
