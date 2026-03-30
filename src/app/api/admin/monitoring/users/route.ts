import { NextResponse } from "next/server";
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

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const result = await Promise.all(
      users.map(async (user) => {
        const latestSession = await prisma.monitoringSession.findFirst({
          where: { userId: user.id },
          orderBy: { lastHeartbeat: "desc" },
          select: {
            status: true,
            lastHeartbeat: true,
          },
        });

        const todayActivity = await prisma.activityLog.aggregate({
          where: {
            userId: user.id,
            periodStart: { gte: todayStart },
          },
          _sum: {
            keystrokes: true,
            mouseClicks: true,
          },
        });

        const screenshotCount = await prisma.screenshot.count({
          where: { userId: user.id },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          latestSessionStatus: latestSession?.status ?? "offline",
          lastHeartbeat: latestSession?.lastHeartbeat ?? null,
          todayKeystrokes: todayActivity._sum.keystrokes ?? 0,
          todayClicks: todayActivity._sum.mouseClicks ?? 0,
          screenshotCount,
        };
      })
    );

    return NextResponse.json({ users: result });
  } catch (error) {
    console.error("Monitoring users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
