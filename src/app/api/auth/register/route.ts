import { NextResponse } from "next/server";

// Public self-registration is disabled. HR accounts are created by the Super Admin
// from Admin → Users. This endpoint is kept as a 403 to prevent accidental access.
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Self-registration is disabled. Contact your Super Admin to be added.",
    },
    { status: 403 }
  );
}
