import { NextRequest, NextResponse } from "next/server";
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { userId } = await params;
    const searchParams = req.nextUrl.searchParams;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const from = searchParams.get("from")
      ? new Date(searchParams.get("from")!)
      : todayStart;
    const to = searchParams.get("to")
      ? new Date(searchParams.get("to")!)
      : todayEnd;

    const activityLogs = await prisma.activityLog.findMany({
      where: {
        userId,
        periodStart: { gte: from },
        periodEnd: { lte: to },
      },
      orderBy: { periodStart: "asc" },
    });

    // Aggregated stats
    const aggregated = await prisma.activityLog.aggregate({
      where: {
        userId,
        periodStart: { gte: from },
        periodEnd: { lte: to },
      },
      _sum: {
        keystrokes: true,
        mouseClicks: true,
        mouseDistance: true,
      },
    });

    // Active vs idle time
    const activeLogs = activityLogs.filter((log) => !log.isIdle);
    const idleLogs = activityLogs.filter((log) => log.isIdle);

    const calculateTotalMs = (
      logs: { periodStart: Date; periodEnd: Date }[]
    ) =>
      logs.reduce(
        (sum, log) =>
          sum +
          (new Date(log.periodEnd).getTime() -
            new Date(log.periodStart).getTime()),
        0
      );

    const activeTimeMs = calculateTotalMs(activeLogs);
    const idleTimeMs = calculateTotalMs(idleLogs);

    // Most used apps
    const appUsage: Record<string, number> = {};
    for (const log of activityLogs) {
      if (log.activeAppName) {
        appUsage[log.activeAppName] = (appUsage[log.activeAppName] || 0) + 1;
      }
    }
    const mostUsedApps = Object.entries(appUsage)
      .sort(([, a], [, b]) => b - a)
      .map(([app, count]) => ({ app, count }));

    return NextResponse.json({
      activityLogs,
      stats: {
        totalKeystrokes: aggregated._sum.keystrokes ?? 0,
        totalClicks: aggregated._sum.mouseClicks ?? 0,
        totalMouseDistance: aggregated._sum.mouseDistance ?? 0,
        activeTimeMs,
        idleTimeMs,
        mostUsedApps,
      },
    });
  } catch (error) {
    console.error("Activity logs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
