import type {
  ImportOptions,
  ImportResult,
  RecipeExtractor,
  TextImportOptions,
} from "../../types/import";
import { createRecipe } from "..";
import { recipeApiSchema } from "../../schemas";
import {
  CONFIDENCE_THRESHOLD,
  IMPORT_TIMEOUT_MS,
  MAX_CONTENT_LENGTH,
  USER_AGENT,
} from "../../types/import";
import { HtmlScraperExtractor } from "./extractors/html-scraper-extractor";
import { LLMExtractor } from "./extractors/llm-extractor";
import { SchemaOrgExtractor } from "./extractors/schema-org-extractor";

/**
 * Main recipe import function - orchestrates the multi-tier extraction strategy
 */
export async function importRecipeFromUrl(
  options: ImportOptions,
): Promise<ImportResult> {
  const { url, ctx, skipDirectFetch = false } = options;

  try {
    if (skipDirectFetch) {
      // For testing or when user provides content directly
      return {
        status: "manual_required",
        sourceUrl: url,
        warnings: ["Direct fetch skipped - manual import required"],
      };
    }

    // Fetch webpage content

    const html = await fetchWebpageContent(url);
    // console.log(html);
    // Try extraction methods in order of preference
    const result = await tryExtractionMethods(html, url);

    if (result.status === "success" && result.recipe) {
      const parsed = recipeApiSchema.parse(result.recipe);
      // Save the recipe to database
      // const savedRecipe = await createRecipe(parsed, ctx);
      return {
        ...result,
        recipe: parsed,
      };
    }
  } catch (error) {
    return {
      status: "failed",
      warnings: [
        `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      ],
      sourceUrl: url,
    };
  }
  // If all else fails, require manual input
  return {
    status: "manual_required",
    sourceUrl: url,
    warnings: [
      "All automatic extraction methods failed. Please try manual import.",
    ],
  };
}

/**
 * Import recipe from provided text content (manual input or paste)
 */
export async function importRecipeFromText(
  options: TextImportOptions,
): Promise<ImportResult> {
  const { content, sourceUrl, ctx } = options;

  if (!content?.trim()) {
    throw new Error("No content provided");
  }

  const extractors: RecipeExtractor[] = [new LLMExtractor()];
  const { recipe } = await tryExtractionMethods(
    "",
    content,
    sourceUrl || "text-input",
    extractors,
  );
  const parsed = recipeApiSchema.parse(recipe);
  // const savedRecipe = await createRecipe(parsed, ctx);

  return {
    status: "success",
    sourceUrl,
    recipe: parsed,
  };
}

/**
 * Try different extraction methods in order of preference
 */
async function tryExtractionMethods(
  html: string,
  url: string,
  content?: string,
  extractors: RecipeExtractor[] = [
    new SchemaOrgExtractor(),
    new HtmlScraperExtractor(),
    new LLMExtractor(),
  ],
): Promise<ImportResult> {
  const warnings: string[] = [];

  const input = {
    html,
    url,
    options: {
      maxTokens: 2000,
      temperatur: 0.3,
    },
  };

  // console.log(input);

  for (const extractor of extractors) {
    console.log("extractor name", extractor.name);
    if (!extractor.canHandle(input)) {
      warnings.push(`${extractor.name} extractor cannot handle this input`);
      continue;
    }
    const result = await extractor.extract(input);
    // console.log(result);
    if (
      result.status === "success" &&
      result.recipe &&
      result.confidence >= CONFIDENCE_THRESHOLD
    ) {
      return {
        status: "success",
        recipe: result.recipe,
        sourceUrl: url,
        warnings: [...warnings, ...(result.warnings ?? [])],
      };
    }
    if (result.warnings) {
      warnings.push(...result.warnings);
    }
  }

  // All methods failed
  return {
    status: "manual_required",
    warnings: [
      ...warnings,
      "All automatic extraction methods failed. Please try manual import.",
    ],
    sourceUrl: url,
  };
}

/**
 * Fetch webpage content with proper headers and error handling
 */
async function fetchWebpageContent(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), IMPORT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    if (!response.ok) {
      if (response.status === 403 || response.status === 429) {
        throw new Error("Website blocks automated access");
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentLength = response.headers.get("content-length");
    // console.log("Content length: ", contentLength);
    if (contentLength && parseInt(contentLength) > MAX_CONTENT_LENGTH) {
      throw new Error("Content too large to process");
    }

    const html = await response.text();
    // console.log("HTML Length", html.length);
    if (html.length > MAX_CONTENT_LENGTH) {
      throw new Error("Content too large to process");
    }

    return html;
  } finally {
    clearTimeout(timeoutId);
  }
}
