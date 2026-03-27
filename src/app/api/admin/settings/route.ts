import { NextResponse } from "next/server";
import { type Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user || user.role !== "super_admin") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const settings = await prisma.systemSetting.findMany();
  const result: Record<string, unknown> = {};
  for (const s of settings) {
    // Don't expose the raw API key
    if (s.key === "anthropic_api_key") {
      const val = s.value as { value: string };
      result[s.key] = val.value ? "sk-...configured" : null;
    } else {
      result[s.key] = (s.value as { value: unknown }).value;
    }
  }

  return NextResponse.json(result);
}

export async function PUT(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  for (const [key, value] of Object.entries(body)) {
    const jsonValue = { value } as Prisma.InputJsonValue;
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: jsonValue, updatedBy: session.user.id },
      create: { key, value: jsonValue, updatedBy: session.user.id },
    });
  }

  return NextResponse.json({ success: true });
}
