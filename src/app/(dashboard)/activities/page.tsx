import { PageHeader } from "@/components/layout/page-header";
import { ActivitiesClient } from "@/components/product/workspace";

export const metadata = {
  title: "Activities"
};

export default function ActivitiesPage() {
  return (
    <>
      <PageHeader title="Activity Discovery" description="Search live attractions, restaurants, events, ratings, and pricing through configured provider APIs." />
      <ActivitiesClient />
    </>
  );
}
