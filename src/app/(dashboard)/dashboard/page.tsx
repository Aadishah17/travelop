import { DashboardClient } from "@/components/product/workspace";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = {
  title: "Dashboard"
};

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Live trip analytics, weather, budget progress, and itinerary momentum." action={{ label: "Create Trip", href: "/trips/new" }} />
      <DashboardClient />
    </>
  );
}
