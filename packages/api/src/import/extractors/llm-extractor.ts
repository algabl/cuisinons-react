import type { RecipeApiData } from "../../schemas";
import type {
  ExtractorInput,
  ExtractorResult,
  RecipeExtractor,
} from "../../types/import";
import { ImportError } from "../../types/import";

export class LLMExtractor implements RecipeExtractor {
  readonly name = "llm";
  readonly priority = 3;

  canHandle(input: ExtractorInput): boolean {
    return !!(input.html || input.content);
  }

  async extract(input: ExtractorInput): Promise<ExtractorResult> {
    const content =
      input.content || (input.html ? prepareContentForLLM(input.html) : "");

    if (!content.trim()) {
      return {
        status: "failed",
        warnings: ["No content available for LLM extraction"],
        confidence: 0,
      };
    }

    try {
      const recipe = await extractWithLLM({
        content,
        url: input.url,
        maxTokens: input.options?.maxTokens,
        temperature: input.options?.temperature,
      });

      return {
        status: "success",
        recipe,
        confidence: 70,
      };
    } catch (error) {
      return {
        status: "failed",
        warnings: [
          error instanceof Error ? error.message : "LLM extraction failed",
        ],
        confidence: 0,
      };
    }
  }
}

interface LLMExtractorOptions {
  content: string;
  url?: string;
  maxTokens?: number;
  temperature?: number;
}

// This would integrate with your preferred LLM provider (OpenAI, Anthropic, etc.)
// For now, this is a placeholder structure
export async function extractWithLLM(
  options: LLMExtractorOptions,
): Promise<Partial<RecipeApiData>> {
  const { content, url, maxTokens = 2000, temperature = 0.1 } = options;

  if (!content.trim()) {
    throw new ImportError(
      "No content provided for LLM extraction",
      "NO_RECIPE_FOUND",
    );
  }

  const prompt = buildExtractionPrompt(content, url);

  try {
    // Placeholder for LLM API call
    // In production, this would call your LLM service:
    // const response = await openai.chat.completions.create({
    //   model: "gpt-4",
    //   messages: [{ role: "user", content: prompt }],
    //   max_tokens: maxTokens,
    //   temperature: temperature,
    // });

    // For now, throw an error indicating LLM extraction is not implemented
    throw new ImportError(
      "LLM extraction not yet implemented",
      "NO_RECIPE_FOUND",
    );

    // Expected implementation would parse LLM response:
    // const result = parseMarkdownResponse(response.choices[0]?.message?.content || '');
    // return validateAndCleanResult(result, url);
  } catch (error) {
    if (error instanceof ImportError) {
      throw error;
    }
    throw new ImportError(
      `LLM extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      "NO_RECIPE_FOUND",
    );
  }
}

function buildExtractionPrompt(content: string, url?: string): string {
  return `Please extract recipe information from the following content and format it as JSON.

${url ? `Source URL: ${url}\n` : ""}

Content to analyze:
${content.slice(0, 8000)} ${content.length > 8000 ? "..." : ""}

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

JSON:`;
}

function parseMarkdownResponse(response: string): Partial<RecipeApiData> {
  try {
    // Extract JSON from response (LLM might include markdown formatting)
    const jsonMatch =
      response.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) ||
      response.match(/(\{[\s\S]*\})/);

    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    // const parsed = JSON.parse(jsonMatch[1]);

    // if (parsed.error) {
    //   throw new ImportError(parsed.error, "NO_RECIPE_FOUND");
    // }

    return {};
  } catch (error) {
    throw new ImportError(
      `Failed to parse LLM response: ${error instanceof Error ? error.message : "Invalid format"}`,
      "NO_RECIPE_FOUND",
    );
  }
}

function validateAndCleanResult(
  result: any,
  sourceUrl?: string,
): Partial<RecipeApiData> {
  if (!result.title || !result.ingredients || !result.instructions) {
    throw new ImportError(
      "LLM extraction missing required fields",
      "VALIDATION_FAILED",
    );
  }

  return {
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
    // image: result.imageUrl ? String(result.imageUrl).trim() : undefined,
    isPrivate: true,
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
