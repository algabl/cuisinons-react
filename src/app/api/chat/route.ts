/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, tool, type ToolSet } from "ai";
import { z } from "zod";
import { env } from "~/env";
import { api } from "~/trpc/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages: userMessages } = await req.json();

  const openRouter = createOpenRouter({
    apiKey: env.OPENROUTER_API_KEY,
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const result = streamText({
    model,
    messages,
    tools,
    maxSteps: 5,
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return result.toDataStreamResponse();
}
