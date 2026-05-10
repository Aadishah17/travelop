import { PageHeader } from "@/components/layout/page-header";
import { SettingsClient } from "@/components/product/workspace";

export const metadata = {
  title: "Settings"
};

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Profile, theme, language, saved destinations, and privacy preferences." />
      <SettingsClient />
    </>
  );
}
