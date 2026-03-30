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

interface DailyReport {
  date: string;
  totalKeystrokes: number;
  totalClicks: number;
  mouseDistance: number;
  activeTimeMs: number;
  idleTimeMs: number;
  screenshotCount: number;
  topApps: { app: string; count: number }[];
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const format = searchParams.get("format") ?? "json";

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

    const where = {
      ...(userId ? { userId } : {}),
      periodStart: { gte: from },
      periodEnd: { lte: to },
    };

    const activityLogs = await prisma.activityLog.findMany({
      where,
      orderBy: { periodStart: "asc" },
    });

    // Group by date
    const dailyMap = new Map<string, typeof activityLogs>();
    for (const log of activityLogs) {
      const dateKey = new Date(log.periodStart).toISOString().split("T")[0];
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, []);
      }
      dailyMap.get(dateKey)!.push(log);
    }

    // Build daily reports
    const reports: DailyReport[] = [];
    for (const [date, logs] of dailyMap) {
      const totalKeystrokes = logs.reduce((s, l) => s + l.keystrokes, 0);
      const totalClicks = logs.reduce((s, l) => s + l.mouseClicks, 0);
      const mouseDistance = logs.reduce((s, l) => s + l.mouseDistance, 0);

      const activeLogs = logs.filter((l) => !l.isIdle);
      const idleLogs = logs.filter((l) => l.isIdle);

      const calcMs = (arr: { periodStart: Date; periodEnd: Date }[]) =>
        arr.reduce(
          (s, l) =>
            s +
            (new Date(l.periodEnd).getTime() -
              new Date(l.periodStart).getTime()),
          0
        );

      const activeTimeMs = calcMs(activeLogs);
      const idleTimeMs = calcMs(idleLogs);

      // Screenshot count for this date
      const dayStart = new Date(date + "T00:00:00.000Z");
      const dayEnd = new Date(date + "T23:59:59.999Z");
      const screenshotCount = await prisma.screenshot.count({
        where: {
          ...(userId ? { userId } : {}),
          capturedAt: { gte: dayStart, lte: dayEnd },
        },
      });

      // Top apps
      const appUsage: Record<string, number> = {};
      for (const log of logs) {
        if (log.activeAppName) {
          appUsage[log.activeAppName] =
            (appUsage[log.activeAppName] || 0) + 1;
        }
      }
      const topApps = Object.entries(appUsage)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([app, count]) => ({ app, count }));

      reports.push({
        date,
        totalKeystrokes,
        totalClicks,
        mouseDistance,
        activeTimeMs,
        idleTimeMs,
        screenshotCount,
        topApps,
      });
    }

    if (format === "csv") {
      const header =
        "date,totalKeystrokes,totalClicks,mouseDistance,activeTimeMs,idleTimeMs,screenshotCount,topApps";
      const rows = reports.map(
        (r) =>
          `${r.date},${r.totalKeystrokes},${r.totalClicks},${r.mouseDistance},${r.activeTimeMs},${r.idleTimeMs},${r.screenshotCount},"${r.topApps.map((a) => a.app).join("; ")}"`
      );
      const csv = [header, ...rows].join("\n");

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="monitoring-report.csv"`,
        },
      });
    }

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Monitoring report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
