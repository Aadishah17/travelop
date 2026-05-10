import { PageHeader } from "@/components/layout/page-header";
import { ItineraryClient } from "@/components/product/workspace";

export const metadata = {
  title: "Itinerary Builder"
};

export default function ItineraryPage() {
  return (
    <>
      <PageHeader title="Itinerary Builder" description="Plan multi-city stops, day-wise schedules, activity cards, and route previews." />
      <ItineraryClient />
    </>
  );
}
