import { PageHeader } from "@/components/layout/page-header";
import { NotesClient } from "@/components/product/workspace";

export const metadata = {
  title: "Notes"
};

export default function NotesPage() {
  return (
    <>
      <PageHeader title="Notes & Journal" description="Timeline journaling and day-wise memories persisted to the database." />
      <NotesClient />
    </>
  );
}
