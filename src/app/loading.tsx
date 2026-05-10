import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto grid max-w-6xl gap-4">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-72 rounded-lg" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
        </div>
      </div>
    </main>
  );
}
