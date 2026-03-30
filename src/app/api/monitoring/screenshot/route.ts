import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const formData = await req.formData();
    const file = formData.get("screenshot") as File | null;
    const activeWindowTitle = formData.get("activeWindowTitle") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No screenshot file provided" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const fileName = `${timestamp}.png`;
    const dirPath = path.join(
      process.cwd(),
      "public",
      "screenshots",
      userId
    );
    const filePath = path.join(dirPath, fileName);

    await mkdir(dirPath, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const screenshot = await prisma.screenshot.create({
      data: {
        userId,
        fileName,
        filePath: `/screenshots/${userId}/${fileName}`,
        fileSize: buffer.length,
        activeWindowTitle: activeWindowTitle ?? undefined,
        capturedAt: new Date(),
      },
    });

    return NextResponse.json({ screenshot });
  } catch (error) {
    console.error("Screenshot upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
