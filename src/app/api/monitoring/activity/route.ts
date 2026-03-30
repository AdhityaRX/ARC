import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const {
      periodStart,
      periodEnd,
      mouseClicks,
      mouseDistance,
      keystrokes,
      scrollEvents,
      activeWindowTitle,
      activeAppName,
      isIdle,
    } = body as {
      periodStart: string;
      periodEnd: string;
      mouseClicks: number;
      mouseDistance: number;
      keystrokes: number;
      scrollEvents: number;
      activeWindowTitle?: string;
      activeAppName?: string;
      isIdle: boolean;
    };

    const activityLog = await prisma.activityLog.create({
      data: {
        userId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        mouseClicks,
        mouseDistance,
        keystrokes,
        scrollEvents,
        activeWindowTitle,
        activeAppName,
        isIdle,
      },
    });

    return NextResponse.json({ success: true, activityLog });
  } catch (error) {
    console.error("Activity log error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
