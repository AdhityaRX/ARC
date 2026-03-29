import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      let running = true;

      const fetchAndSend = async () => {
        while (running) {
          try {
            // Fetch live score from our own API
            const scoreRes = await fetch(
              `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/ipl/live-score`,
              { cache: "no-store" }
            );
            const scoreData = await scoreRes.json();

            if (scoreData.success) {
              send({ type: "score_update", data: scoreData.data, timestamp: new Date().toISOString() });
            }

            // Fetch prediction every 30 seconds (to avoid excessive API calls)
            if (scoreData.data && scoreData.ballCount % 3 === 0) {
              try {
                const predRes = await fetch(
                  `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/ipl/predict`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ liveScore: scoreData.data }),
                    cache: "no-store",
                  }
                );
                const predData = await predRes.json();
                if (predData.success) {
                  send({ type: "prediction_update", data: predData.data, timestamp: new Date().toISOString() });
                }
              } catch {
                // Prediction failed, continue with score updates
              }
            }
          } catch {
            send({ type: "error", data: { message: "Failed to fetch updates" }, timestamp: new Date().toISOString() });
          }

          // Wait 10 seconds before next update
          await new Promise((resolve) => setTimeout(resolve, 10000));
        }
      };

      // Send initial heartbeat
      send({ type: "connected", data: { message: "Connected to IPL live stream" }, timestamp: new Date().toISOString() });

      // Start the fetch loop
      fetchAndSend().catch(() => {
        running = false;
      });

      // Cleanup on close
      const cleanup = () => {
        running = false;
      };

      // The stream will be cleaned up when the client disconnects
      controller.enqueue(encoder.encode(": heartbeat\n\n"));

      // Keep reference for cleanup
      (globalThis as Record<string, unknown>).__iplStreamCleanup = cleanup;
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
