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

  const role = (session.user as { role?: string }).role;
  if (role !== "super_admin" && role !== "hr") {
    redirect("/login?error=no_access");
  }

  return (
    <div className="h-[100dvh] flex">
      <Sidebar
        userRole={role}
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <main className="flex-1 min-w-0 md:ml-[260px] h-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
