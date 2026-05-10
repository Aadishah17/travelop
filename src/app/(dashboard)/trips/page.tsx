import { PageHeader } from "@/components/layout/page-header";
import { TripsClient } from "@/components/product/workspace";

export const metadata = {
  title: "My Trips"
};

export default function TripsPage() {
  return (
    <>
      <PageHeader title="My Trips" description="Search, filter, sort, edit, and share the trips stored in PostgreSQL." action={{ label: "Create Trip", href: "/trips/new" }} />
      <TripsClient />
    </>
  );
}
