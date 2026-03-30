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
    let config = await prisma.monitoringConfig.findFirst({
      where: { userId: null },
    });

    if (!config) {
      config = await prisma.monitoringConfig.create({
        data: {
          userId: null,
          screenshotIntervalMin: 5,
          trackMouseClicks: true,
          trackKeystrokes: true,
          trackMouseMovement: true,
          trackActiveWindow: true,
          trackScreenshots: true,
          idleTimeoutMin: 5,
          isEnabled: true,
        },
      });
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Monitoring settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      screenshotIntervalMin,
      trackMouseClicks,
      trackKeystrokes,
      trackMouseMovement,
      trackActiveWindow,
      trackScreenshots,
      idleTimeoutMin,
      isEnabled,
    } = body as {
      screenshotIntervalMin?: number;
      trackMouseClicks?: boolean;
      trackKeystrokes?: boolean;
      trackMouseMovement?: boolean;
      trackActiveWindow?: boolean;
      trackScreenshots?: boolean;
      idleTimeoutMin?: number;
      isEnabled?: boolean;
    };

    let config = await prisma.monitoringConfig.findFirst({
      where: { userId: null },
    });

    if (config) {
      config = await prisma.monitoringConfig.update({
        where: { id: config.id },
        data: {
          screenshotIntervalMin,
          trackMouseClicks,
          trackKeystrokes,
          trackMouseMovement,
          trackActiveWindow,
          trackScreenshots,
          idleTimeoutMin,
          isEnabled,
        },
      });
    } else {
      config = await prisma.monitoringConfig.create({
        data: {
          userId: null,
          screenshotIntervalMin: screenshotIntervalMin ?? 5,
          trackMouseClicks: trackMouseClicks ?? true,
          trackKeystrokes: trackKeystrokes ?? true,
          trackMouseMovement: trackMouseMovement ?? true,
          trackActiveWindow: trackActiveWindow ?? true,
          trackScreenshots: trackScreenshots ?? true,
          idleTimeoutMin: idleTimeoutMin ?? 5,
          isEnabled: isEnabled ?? true,
        },
      });
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Monitoring settings update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
