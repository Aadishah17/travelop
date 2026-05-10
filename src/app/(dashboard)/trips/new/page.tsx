import { PageHeader } from "@/components/layout/page-header";
import { CreateTripClient } from "@/components/product/workspace";

export const metadata = {
  title: "Create Trip"
};

export default function CreateTripPage() {
  return (
    <>
      <PageHeader title="Create Trip" description="Use a validated multi-step-style form to persist title, dates, budget, description, and first destination." />
      <CreateTripClient />
    </>
  );
}
