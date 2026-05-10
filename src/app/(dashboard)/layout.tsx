import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { requireAuthSession } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuthSession();

  if (!session) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
