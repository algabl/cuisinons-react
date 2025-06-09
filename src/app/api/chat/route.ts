import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  generateText,
  streamText,
  tool,
  type CoreMessage,
  type LanguageModel,
  type ToolSet,
} from "ai";
import { z } from "zod";
import { env } from "~/env";
import { api } from "~/trpc/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages: rawMessages } = await req.json();

  // Coerce rawMessages into the correct format
  const userMessages: CoreMessage[] = Array.isArray(rawMessages)
    ? rawMessages
        .filter(
          (msg) =>
            msg &&
            typeof msg === "object" &&
            typeof msg.role === "string" &&
            typeof msg.content === "string",
        )
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))
    : [];

  if (userMessages.length === 0) {
    return new Response("Invalid messages format", { status: 400 });
  }
  const openRouter = createOpenRouter({
    apiKey: env.OPENROUTER_API_KEY as string,
  });

  const systemPrompt = {
    role: "system",
    content: `You are a helpful AI assistant specialized in managing and responding to user queries about their personal recipes.
  Your primary goal is to assist users in finding, understanding, and managing their recipes within their app.

  **Key Guidelines:**
  - Always return a response in markdown format, using appropriate markdown syntax for links and images.
  - Do not use HTML tags in your responses.
  - When including images, always use Markdown image syntax: ![alt text](image-url).
  - Always be polite, friendly, and encouraging.
  - When a user asks about their recipes, try to use the 'recipes' tool to fetch their list of recipes.
  - If you use the 'recipes' tool, summarize the findings for the user.
  - If the user asks for a recipe that is not found, state that you cannot find it but can try to help them find others or answer general cooking questions.
  - Do not provide external recipe ideas or instructions unless explicitly asked and after checking the user's recipes first.
  - If a user asks to add or modify a recipe, inform them that you can currently only view recipes, but they can use the app's interface to make changes.
  - Stay strictly on topic regarding the user's recipes and related cooking queries.
  - Do not make up information about recipes. Only use information from the 'recipes' tool.
  - If the user asks for a specific recipe, you *must* use the tool first to see if it exists.
  - If you have just used the tool and the user asks a follow-up question related to the *already fetched* recipes, try to answer without re-calling the tool if the information is already available from the previous tool output.
  - If the user asks about the nutritional information or ingredients of a recipe, inform them you can only provide the list of recipes you have access to, and suggest they check the app for detailed recipe information.
  - If you decide to suggest a recipe, provide a hyperlink to the recipe in markdown, with the displayed text as the name of the recipe. If the recipe also has an image, include it in the response.
  `,
  };

  const model = openRouter.chat("google/gemini-2.0-flash-001");
  const messages = [systemPrompt, ...userMessages];

  const tools = {
    recipes: tool({
      description: "Get a list of all of the user's recipes",
      parameters: z.object({}),
      execute: async () => {
        const recipes = await api.recipe.getAll();
        return {
          recipes: recipes.map((r) => ({
            link: `/app/recipes/${r.id}`,
            name: r.name,
            description: r.description,
            image: r.image,
          })),
        };
      },
    }),
  } as ToolSet;

  try {
    const result = await streamText({
      model,
      messages,
      tools,
      maxSteps: 5,
    });
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("AI API Error:", error);
    return new Response(JSON.stringify({ error: error.message || error }), {
      status: 500,
    });
  }
}
