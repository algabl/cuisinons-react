import type { CoreMessage, ToolSet } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, tool } from "ai";

import type {
  ExtractorInput,
  ExtractorResult,
  RecipeExtractor,
} from "../../../types/import";
import { env } from "../../../env";

export const maxDuration = 30;

export class LLMExtractor implements RecipeExtractor {
  readonly name = "llm";
  readonly priority = 3;

  canHandle(input: ExtractorInput): boolean {
    return !!(input.html ?? input.content);
  }

  async extract(input: ExtractorInput): Promise<ExtractorResult> {
    const content =
      input.content ?? (input.html ? prepareContentForLLM(input.html) : "");

    if (!content.trim()) {
      return {
        status: "failed",
        warnings: ["No content available for LLM extraction"],
        confidence: 0,
      };
    }
    return await extractWithLLM(input);
  }
}

// This would integrate with your preferred LLM provider (OpenAI, Anthropic, etc.)
// For now, this is a placeholder structure
export async function extractWithLLM(
  input: ExtractorInput,
): Promise<ExtractorResult> {
  const { content, url, options } = input;

  if (!content?.trim()) {
    return {
      status: "failed",
      warnings: ["No content available for LLM extraction"],
      confidence: 0,
    };
  }

  const openRouter = createOpenRouter({
    apiKey: env.OPENROUTER_API_KEY,
  });

  const systemPrompt: CoreMessage = {
    role: "system",
    content: `Please extract recipe information from content provided and format it as JSON.
    Please extract the following information and return it as valid JSON:

    {
      "title": "Recipe title",
      "description": "Brief description (optional)",
      "prepTime": 30, // in minutes
      "cookTime": 45, // in minutes
      "totalTime": 75, // in minutes (optional if prep + cook provided)
      "servings": 4, // number of servings
      "ingredients": [
        "1 cup flour",
        "2 eggs",
        "1/2 cup milk"
      ],
      "instructions": [
        "Mix dry ingredients",
        "Add wet ingredients",
        "Bake for 30 minutes"
      ],
      "imageUrl": "https://example.com/image.jpg" // if found in content (optional)
    }

    Rules:
    1. Only include fields where you found clear information
    2. Convert all time values to minutes (e.g., "1 hour 30 min" becomes 90)
    3. List ingredients exactly as written, preserving measurements
    4. Break instructions into clear, numbered steps
    5. If no clear recipe is found, return: {"error": "No recipe found"}
    6. Do not guess or make up information
    7. Return only valid JSON, no additional text
    `,
  };
  const prompt = buildExtractionPrompt(content, url);

  const model = openRouter.chat("google/gemini-2.0-flash-001");
  const messages = [systemPrompt, prompt];

  const result = await generateText({
    model,
    messages,
    maxSteps: 1,
    maxTokens: options?.maxTokens ?? 1500,
    temperature: options?.temperature ?? 0.7,
  });
  return validateAndCleanResult(parseMarkdownResponse(result.text), url);
  // try {
  // Placeholder for LLM API call
  // In production, this would call your LLM service:
  // const response = await openai.chat.completions.create({
  //   model: "gpt-4",
  //   messages: [{ role: "user", content: prompt }],
  //   max_tokens: maxTokens,
  //   temperature: temperature,
  // });
  // For now, throw an error indicating LLM extraction is not implemented
  // throw new ImportError(
  //   "LLM extraction not yet implemented",
  //   "NO_RECIPE_FOUND",
  // );
  // Expected implementation would parse LLM response:
  // const result = parseMarkdownResponse(response.choices[0]?.message?.content || '');
  // return validateAndCleanResult(result, url);
  // } catch (error) {
  // if (error instanceof ImportError) {
  //   throw error;
  // }
  // throw new ImportError(
  //   `LLM extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`,
  //   "NO_RECIPE_FOUND",
  // );
  // }
  // return {};
}

function buildExtractionPrompt(content: string, url?: string) {
  return {
    role: "user",
    content: `${url ? `Source URL: ${url}\n` : ""}
  Content to analyze:
  ${content.slice(0, 8000)} ${content.length > 8000 ? "..." : ""}
  `,
  } as CoreMessage;
}

function parseMarkdownResponse(response: string) {
  try {
    // Extract JSON from response (LLM might include markdown formatting)
    const jsonMatch =
      /```(?:json)?\s*(\{[\s\S]*\})\s*```/.exec(response) ??
      /(\{[\s\S]*\})/.exec(response);

    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    const match = jsonMatch[0];
    console.log(jsonMatch);
    const parsed = JSON.parse(match);

    if (!parsed) {
      throw new Error("LLM indicated no recipe found");
    }

    return parsed;
  } catch (error) {
    throw new Error(
      `Failed to parse LLM response: ${error instanceof Error ? error.message : "Invalid format"}`,
    );
  }
}

function validateAndCleanResult(
  result: any,
  sourceUrl?: string,
): ExtractorResult {
  if (!result.title || !result.ingredients || !result.instructions) {
    throw new Error("LLM extraction missing required fields");
  }

  const recipe = {
    name: String(result.title).trim(),
    description: result.description
      ? String(result.description).trim()
      : undefined,
    preparationTime:
      typeof result.prepTime === "number" ? result.prepTime : undefined,
    cookingTime:
      typeof result.cookTime === "number" ? result.cookTime : undefined,
    totalTime:
      typeof result.totalTime === "number" ? result.totalTime : undefined,
    servings: typeof result.servings === "number" ? result.servings : undefined,
    instructions: Array.isArray(result.instructions)
      ? result.instructions.map((i: any) => String(i).trim()).filter(Boolean)
      : [],
    // imageId: result.imageUrl ? String(result.imageUrl).trim() : undefined,
    isPrivate: true,
  };

  return {
    status: "success",
    recipe: recipe,
    confidence: 0.8,
    extractionMethod: "llm",
    sourceUrl,
  };
}

// Utility to clean and prepare content for LLM processing
export function prepareContentForLLM(html: string): string {
  // Remove script tags, style tags, and other non-content elements
  let cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // Remove HTML tags but preserve structure
  cleaned = cleaned
    .replace(/<br[^>]*>/gi, "\n")
    .replace(/<\/?(p|div|h[1-6]|li)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');

  // Clean up whitespace
  cleaned = cleaned
    .replace(/\n\s*\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  return cleaned;
}
