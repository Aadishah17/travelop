import { PageHeader } from "@/components/layout/page-header";
import { PackingClient } from "@/components/product/workspace";

export const metadata = {
  title: "Packing"
};

export default function PackingPage() {
  return (
    <>
      <PageHeader title="Packing Checklist" description="Track packed and unpacked items by category with live progress indicators." />
      <PackingClient />
    </>
  );
}
