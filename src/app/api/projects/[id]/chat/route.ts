import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ARC_SYSTEM_PROMPT, DEFAULT_MODEL, DEFAULT_MAX_TOKENS } from "@/lib/constants";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!project) {
    return new Response(JSON.stringify({ error: "Project not found" }), {
      status: 404,
    });
  }

  const { message } = await req.json();
  if (!message || typeof message !== "string") {
    return new Response(JSON.stringify({ error: "Message required" }), {
      status: 400,
    });
  }

  // Save user message
  await prisma.message.create({
    data: {
      projectId: id,
      role: "user",
      content: message,
    },
  });

  // Load settings
  const apiKeySetting = await prisma.systemSetting.findUnique({
    where: { key: "anthropic_api_key" },
  });
  const modelSetting = await prisma.systemSetting.findUnique({
    where: { key: "model" },
  });
  const maxTokensSetting = await prisma.systemSetting.findUnique({
    where: { key: "max_tokens" },
  });
  const systemPromptSetting = await prisma.systemSetting.findUnique({
    where: { key: "system_prompt" },
  });

  const apiKey = apiKeySetting?.value
    ? (apiKeySetting.value as { value: string }).value
    : process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Anthropic API key not configured" }),
      { status: 500 }
    );
  }

  const model = modelSetting?.value
    ? (modelSetting.value as { value: string }).value
    : DEFAULT_MODEL;
  const maxTokens = maxTokensSetting?.value
    ? (maxTokensSetting.value as { value: number }).value
    : DEFAULT_MAX_TOKENS;
  const systemPrompt = systemPromptSetting?.value
    ? (systemPromptSetting.value as { value: string }).value
    : ARC_SYSTEM_PROMPT;

  // Load conversation history
  const history = await prisma.message.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "asc" },
  });

  const messages = history.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const client = new Anthropic({ apiKey });

  const encoder = new TextEncoder();
  let fullResponse = "";
  let inputTokens = 0;
  let outputTokens = 0;

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = await client.messages.stream({
          model,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages,
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            fullResponse += event.delta.text;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "text", text: event.delta.text })}\n\n`
              )
            );
          } else if (event.type === "message_delta") {
            if (event.usage) {
              outputTokens = event.usage.output_tokens;
            }
          } else if (event.type === "message_start") {
            if (event.message.usage) {
              inputTokens = event.message.usage.input_tokens;
            }
          }
        }

        // Save assistant message
        await prisma.message.create({
          data: {
            projectId: id,
            role: "assistant",
            content: fullResponse,
            tokensInput: inputTokens,
            tokensOutput: outputTokens,
            model,
          },
        });

        // Track usage
        await prisma.apiUsage.create({
          data: {
            userId: session.user.id,
            projectId: id,
            model,
            tokensInput: inputTokens,
            tokensOutput: outputTokens,
          },
        });

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Stream failed";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", error: errorMessage })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
