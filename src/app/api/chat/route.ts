import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { env } from "~/env";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const openRouter = createOpenRouter({
    apiKey: env.OPENROUTER_API_KEY,
  });

  const result = streamText({
    model: openRouter.chat("google/gemma-3n-e4b-it:free"),
    messages,
  });

  return result.toDataStreamResponse();
}
