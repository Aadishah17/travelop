import { PageHeader } from "@/components/layout/page-header";
import { BudgetClient } from "@/components/product/workspace";

export const metadata = {
  title: "Budget"
};

export default function BudgetPage() {
  return (
    <>
      <PageHeader title="Budget Analytics" description="Dynamic charts and budget alerts generated from PostgreSQL expense records." />
      <BudgetClient />
    </>
  );
}
