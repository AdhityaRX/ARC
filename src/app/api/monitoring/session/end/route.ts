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
    const { endedAt } = body as { endedAt?: string };

    // Find and close the user's active session
    const activeSession = await prisma.monitoringSession.findFirst({
      where: {
        userId,
        endedAt: null,
      },
      orderBy: { startedAt: "desc" },
    });

    if (activeSession) {
      await prisma.monitoringSession.update({
        where: { id: activeSession.id },
        data: {
          endedAt: endedAt ? new Date(endedAt) : new Date(),
          status: "offline",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session end error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
