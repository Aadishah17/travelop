import { PageHeader } from "@/components/layout/page-header";
import { SharedTripsClient } from "@/components/product/workspace";

export const metadata = {
  title: "Shared Trips"
};

export default function SharedTripsPage() {
  return (
    <>
      <PageHeader title="Shared Trips" description="Public itinerary pages, shareable URLs, and copy-ready trip inspiration." />
      <SharedTripsClient />
    </>
  );
}
