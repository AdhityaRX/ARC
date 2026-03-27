import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="h-screen flex">
      <Sidebar userRole={(session.user as { role?: string }).role} />
      <main className="flex-1 ml-0 md:ml-[260px] h-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}
