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
    const { machineId, hostname, ipAddress } = body as {
      machineId: string;
      hostname: string;
      ipAddress: string;
    };

    // Find existing active session (not ended)
    const existingSession = await prisma.monitoringSession.findFirst({
      where: {
        userId,
        endedAt: null,
      },
      orderBy: { startedAt: "desc" },
    });

    let monitoringSession;

    if (existingSession) {
      monitoringSession = await prisma.monitoringSession.update({
        where: { id: existingSession.id },
        data: {
          lastHeartbeat: new Date(),
          status: "online",
          machineId,
          hostname,
          ipAddress,
        },
      });
    } else {
      monitoringSession = await prisma.monitoringSession.create({
        data: {
          userId,
          machineId,
          hostname,
          ipAddress,
          status: "online",
          lastHeartbeat: new Date(),
        },
      });
    }

    // Return the monitoring config for this user (user-specific or global fallback)
    const config = await prisma.monitoringConfig.findFirst({
      where: { userId },
    });

    const effectiveConfig = config
      ? config
      : await prisma.monitoringConfig.findFirst({
          where: { userId: null },
        });

    return NextResponse.json({
      session: monitoringSession,
      config: effectiveConfig,
    });
  } catch (error) {
    console.error("Heartbeat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
