import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: "super_admin" | "hr" | "user";
};

async function loadSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as SessionUser["role"],
  };
}

export async function requireSuperAdmin(): Promise<SessionUser | null> {
  const user = await loadSessionUser();
  if (!user || user.role !== "super_admin") return null;
  return user;
}

export async function requireHrOrAdmin(): Promise<SessionUser | null> {
  const user = await loadSessionUser();
  if (!user || (user.role !== "super_admin" && user.role !== "hr")) return null;
  return user;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  return loadSessionUser();
}
