import Image from "next/image";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <main className="grid min-h-screen bg-[#f5f8fc] lg:grid-cols-[1fr_0.9fr]">
      <section className="flex items-center justify-center px-4 py-12">{children}</section>
      <section className="relative hidden overflow-hidden bg-navy lg:block">
        <Image
          src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=90"
          alt="Coastal travel landscape"
          fill
          priority
          sizes="(min-width: 1024px) 47vw, 0vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/20 to-transparent" />
        <div className="absolute bottom-10 left-10 max-w-sm rounded-lg border border-white/15 bg-navy/55 p-6 text-white backdrop-blur-xl">
          <p className="text-xs font-semibold text-mint">Traveloop</p>
          <h1 className="mt-3 text-3xl font-bold tracking-normal">Your limitless journey begins here.</h1>
          <p className="mt-4 text-sm leading-6 text-white/65">
            Plan routes, budgets, weather, activities, packing, and shared memories in one premium workspace.
          </p>
        </div>
      </section>
    </main>
  );
}
