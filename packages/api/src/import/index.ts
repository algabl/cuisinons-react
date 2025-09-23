import { recipeIngredients, recipes } from "@cuisinons/db/schema";

import type { RecipeApiData } from "../schemas";
import type {
  ImportContext,
  ImportOptions,
  ImportResult,
  TextImportOptions,
} from "./types";
// Import the extractors (some may be placeholder implementations)
// import { extractFromSchemaOrg } from "./extractors/schema-org-extractor";
// import { extractFromHtml } from "./extractors/html-scraper-extractor";
import {
  extractWithLLM,
  prepareContentForLLM,
} from "./extractors/llm-extractor";
import { IMPORT_TIMEOUT, MAX_CONTENT_LENGTH, USER_AGENT } from "./types";

/**
 * Main recipe import function - orchestrates the multi-tier extraction strategy
 */
export async function importRecipeFromUrl(
  options: ImportOptions,
): Promise<ImportResult> {
  const { url, userId, db, skipDirectFetch = false } = options;

  try {
    let html: string;

    if (skipDirectFetch) {
      // For testing or when user provides content directly
      return {
        status: "manual_required",
        sourceUrl: url,
        warnings: ["Direct fetch skipped - manual import required"],
      };
    }

    // Fetch webpage content

    html = await fetchWebpageContent(url);

    const context: ImportContext = { userId, db };

    // Try extraction methods in order of preference
    const result = await tryExtractionMethods(html, url, context);

    if (result.status === "success" && result.recipe) {
      // Save the recipe to database
      const savedRecipe = await saveImportedRecipe(result.recipe, context);
      return {
        ...result,
        recipeId: savedRecipe.id,
      };
    }

    return result;
  } catch (error) {
    if (error instanceof ImportError) {
      return {
        status: "failed",
        warnings: [error.message],
        sourceUrl: url,
      };
    }

    return {
      status: "failed",
      warnings: [
        `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      ],
      sourceUrl: url,
    };
  }
}

/**
 * Import recipe from provided text content (manual input or paste)
 */
export async function importRecipeFromText(
  options: TextImportOptions,
): Promise<ImportResult> {
  const { content, sourceUrl, userId, db } = options;

  if (!content.trim()) {
    throw new ImportError("No content provided", "VALIDATION_FAILED");
  }

  const context: ImportContext = { userId, db };

  try {
    // Use LLM extraction for text content
    const cleanContent = prepareContentForLLM(content);
    const recipe = await extractWithLLM({
      content: cleanContent,
      url: sourceUrl,
    });

    if (recipe) {
      const savedRecipe = await saveImportedRecipe(recipe, context);
      return {
        status: "success",
        recipe,
        extractionMethod: "llm",
        confidence: 75, // Lower confidence for text-only import
        sourceUrl,
        recipeId: savedRecipe.id,
      };
    }

    return {
      status: "manual_required",
      warnings: ["Could not extract recipe from provided text"],
      sourceUrl,
    };
  } catch (error) {
    if (error instanceof ImportError) {
      return {
        status: "failed",
        warnings: [error.message],
        sourceUrl,
      };
    }

    return {
      status: "failed",
      warnings: [
        `Text import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      ],
      sourceUrl,
    };
  }
}

/**
 * Try different extraction methods in order of preference
 */
async function tryExtractionMethods(
  html: string,
  url: string,
  context: ImportContext,
): Promise<ImportResult> {
  const warnings: string[] = [];
  let lastError: Error | null = null;

  // Tier 1: Try Schema.org JSON-LD extraction
  try {
    const recipe = await extractFromSchemaOrg(html, url);
    if (recipe) {
      return {
        status: "success",
        recipe,
        extractionMethod: "schema_org",
        confidence: 95,
        sourceUrl: url,
      };
    }
  } catch (error) {
    lastError =
      error instanceof Error
        ? error
        : new Error("Schema.org extraction failed");
    warnings.push("Schema.org extraction failed");
  }

  // Tier 2: Try HTML scraping
  try {
    // Skip HTML scraping since user has their own library
    // const recipe = await extractFromHtml(html, url);
    // if (recipe) {
    //   return {
    //     status: "success",
    //     recipe,
    //     extractionMethod: "html_scraping",
    //     confidence: 80,
    //     sourceUrl: url,
    //     warnings: warnings.length > 0 ? warnings : undefined
    //   };
    // }
  } catch (error) {
    lastError =
      error instanceof Error ? error : new Error("HTML scraping failed");
    warnings.push("HTML scraping failed");
  }

  // Tier 3: Try LLM extraction
  try {
    const cleanContent = prepareContentForLLM(html);
    const recipe = await extractWithLLM({
      content: cleanContent,
      url,
    });

    if (recipe) {
      return {
        status: "success",
        recipe,
        extractionMethod: "llm",
        confidence: 70,
        sourceUrl: url,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    }
  } catch (error) {
    lastError =
      error instanceof Error ? error : new Error("LLM extraction failed");
    warnings.push("LLM extraction failed");
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
  const timeoutId = setTimeout(() => controller.abort(), IMPORT_TIMEOUT);

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
    if (contentLength && parseInt(contentLength) > MAX_CONTENT_LENGTH) {
      throw new Error("Content too large to process");
    }

    const html = await response.text();

    if (html.length > MAX_CONTENT_LENGTH) {
      throw new Error("Content too large to process");
    }

    return html;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Save imported recipe to database
 */
async function saveImportedRecipe(
  recipe: RecipeApiData,
  context: ImportContext,
): Promise<{ success: boolean; id: string }> {
  const { db, userId } = context;

  const created = await db
    .insert(recipes)
    .values({
      name: recipe.name,
      description: recipe.description,
      image: recipe.image,
      createdById: userId,

      cookingTime: recipe.cookingTime,
      preparationTime: recipe.preparationTime,
      totalTime: recipe.totalTime,

      servings: recipe.servings,

      calories: recipe.calories,
      fat: recipe.fat,
      protein: recipe.protein,
      carbohydrates: recipe.carbohydrates,
      fiber: recipe.fiber,
      sugar: recipe.sugar,
      sodium: recipe.sodium,

      recipeCategory: recipe.recipeCategory,
      recipeCuisine: recipe.recipeCuisine,
      keywords: recipe.keywords,

      // Difficulty
      difficulty: recipe.difficulty,
      skillLevel: recipe.skillLevel,

      // Dietary
      suitableForDiet: recipe.suitableForDiet,

      // Equipment
      recipeEquipment: recipe.recipeEquipment,

      // Cost
      estimatedCost: recipe.estimatedCost,

      // Existing fields
      instructions: recipe.instructions,
      isPrivate: true,
    })
    .returning();

  if (!created[0]) {
    throw new Error("Failed to save imported recipe");
  }

  const recipeId = created[0].id;

  if (recipe.recipeIngredients && recipeId) {
    await Promise.all(
      recipe.recipeIngredients.map((ing) =>
        db.insert(recipeIngredients).values({
          recipeId,
          ingredientId: ing.ingredientId,
          quantity: ing.quantity,
          unit: ing.unit,
          userId,
        }),
      ),
    );
  }
  return {
    success: true,
    id: created[0].id,
  };
}
