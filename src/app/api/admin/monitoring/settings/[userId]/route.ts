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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { userId } = await params;

    let config = await prisma.monitoringConfig.findFirst({
      where: { userId },
    });

    if (!config) {
      config = await prisma.monitoringConfig.findFirst({
        where: { userId: null },
      });
    }

    return NextResponse.json({ config, isGlobalFallback: !config?.userId });
  } catch (error) {
    console.error("User monitoring settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { userId } = await params;
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

    const config = await prisma.monitoringConfig.upsert({
      where: { userId },
      update: {
        screenshotIntervalMin,
        trackMouseClicks,
        trackKeystrokes,
        trackMouseMovement,
        trackActiveWindow,
        trackScreenshots,
        idleTimeoutMin,
        isEnabled,
      },
      create: {
        userId,
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

    return NextResponse.json({ config });
  } catch (error) {
    console.error("User monitoring settings update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
