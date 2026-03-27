import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const totalUsers = await prisma.user.count();
  const totalProjects = await prisma.project.count();
  const totalMessages = await prisma.message.count();

  const usage = await prisma.apiUsage.aggregate({
    _sum: {
      tokensInput: true,
      tokensOutput: true,
    },
  });

  const recentUsage = await prisma.apiUsage.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
      project: { select: { name: true } },
    },
  });

  return NextResponse.json({
    totalUsers,
    totalProjects,
    totalMessages,
    totalTokensInput: usage._sum.tokensInput || 0,
    totalTokensOutput: usage._sum.tokensOutput || 0,
    recentUsage,
  });
}
