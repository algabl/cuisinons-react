import type { RecipeApiData } from "../../schemas";
import { ImportError } from "../types";

interface HtmlSelectorConfig {
  title: string[];
  description: string[];
  prepTime: string[];
  cookTime: string[];
  totalTime: string[];
  servings: string[];
  ingredients: string[];
  instructions: string[];
  image: string[];
}

const COMMON_SELECTORS: HtmlSelectorConfig = {
  title: [
    '[itemProp="name"]',
    ".recipe-title",
    ".entry-title",
    "h1.recipe-name",
    "h1",
    ".recipe-header h1",
    '[data-testid="recipe-title"]',
  ],
  description: [
    '[itemProp="description"]',
    ".recipe-description",
    ".recipe-summary",
    '[data-testid="recipe-description"]',
  ],
  prepTime: [
    '[itemProp="prepTime"]',
    ".prep-time",
    ".recipe-prep-time",
    '[data-testid="prep-time"]',
  ],
  cookTime: [
    '[itemProp="cookTime"]',
    ".cook-time",
    ".recipe-cook-time",
    '[data-testid="cook-time"]',
  ],
  totalTime: [
    '[itemProp="totalTime"]',
    ".total-time",
    ".recipe-total-time",
    '[data-testid="total-time"]',
  ],
  servings: [
    '[itemProp="recipeYield"]',
    ".recipe-yield",
    ".servings",
    ".recipe-servings",
    '[data-testid="servings"]',
  ],
  ingredients: [
    '[itemProp="recipeIngredient"]',
    ".recipe-ingredient",
    ".ingredients li",
    ".recipe-ingredients li",
    '[data-testid="recipe-ingredient"]',
  ],
  instructions: [
    '[itemProp="recipeInstruction"]',
    ".recipe-instruction",
    ".instructions li",
    ".recipe-instructions li",
    ".directions li",
    ".recipe-directions li",
    '[data-testid="recipe-instruction"]',
  ],
  image: [
    '[itemProp="image"]',
    ".recipe-image img",
    ".recipe-photo img",
    ".hero-image img",
    '[data-testid="recipe-image"]',
  ],
};

function extractTextFromSelector(
  doc: Document,
  selectors: string[],
): string | null {
  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (element?.textContent?.trim()) {
      return element.textContent.trim();
    }
  }
  return null;
}

function extractTextArrayFromSelector(
  doc: Document,
  selectors: string[],
): string[] {
  for (const selector of selectors) {
    const elements = doc.querySelectorAll(selector);
    if (elements.length > 0) {
      return Array.from(elements)
        .map((el) => el.textContent?.trim())
        .filter((text): text is string => !!text);
    }
  }
  return [];
}

function extractImageFromSelector(
  doc: Document,
  selectors: string[],
): string | null {
  for (const selector of selectors) {
    const element = doc.querySelector(selector) as HTMLImageElement;
    if (element?.src) {
      return element.src;
    }
    if (element?.getAttribute("data-src")) {
      return element.getAttribute("data-src");
    }
  }
  return null;
}

function parseTimeString(timeStr: string): number | null {
  if (!timeStr) return null;

  // Remove common prefixes
  const cleaned = timeStr.replace(/^(prep|cook|total)[\s:]+/i, "").trim();

  // Parse common time formats
  const patterns = [
    // "30 minutes", "1 hour", "2 hours 30 minutes"
    /(\d+)\s*hour[s]?\s*(\d+)?\s*min/i,
    /(\d+)\s*hr[s]?\s*(\d+)?\s*min/i,
    /(\d+)\s*h\s*(\d+)?\s*m/i,
    // "30 min", "90 minutes"
    /(\d+)\s*min/i,
    // "1 hour", "2 hours"
    /(\d+)\s*hour[s]?/i,
    /(\d+)\s*hr[s]?/i,
    /(\d+)\s*h$/i,
    // Just numbers (assume minutes)
    /^(\d+)$/,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      const hours = parseInt(match[1] || "0");
      const minutes = parseInt(match[2] || "0");

      if (pattern.source.includes("hour|hr|h")) {
        return hours * 60 + minutes;
      } else {
        return hours; // minutes
      }
    }
  }

  return null;
}

function parseServings(servingsStr: string): number | null {
  if (!servingsStr) return null;

  const cleaned = servingsStr.replace(/[^\d]/g, "");
  const num = parseInt(cleaned);
  return isNaN(num) ? null : num;
}

export async function extractFromHtml(
  html: string,
  url: string,
): Promise<ImportedRecipe> {
  try {
    // Use DOMParser if available (browser), otherwise we'd need a server-side parser
    let doc: Document;

    if (typeof DOMParser !== "undefined") {
      doc = new DOMParser().parseFromString(html, "text/html");
    } else {
      // For server-side, we'd need to use a library like jsdom or cheerio
      throw new ImportError(
        "HTML parsing not available in server environment",
        "PARSING_ERROR",
      );
    }

    const title = extractTextFromSelector(doc, COMMON_SELECTORS.title);
    if (!title) {
      throw new ImportError("Could not find recipe title", "EXTRACTION_ERROR");
    }

    const description = extractTextFromSelector(
      doc,
      COMMON_SELECTORS.description,
    );
    const prepTimeStr = extractTextFromSelector(doc, COMMON_SELECTORS.prepTime);
    const cookTimeStr = extractTextFromSelector(doc, COMMON_SELECTORS.cookTime);
    const totalTimeStr = extractTextFromSelector(
      doc,
      COMMON_SELECTORS.totalTime,
    );
    const servingsStr = extractTextFromSelector(doc, COMMON_SELECTORS.servings);
    const ingredients = extractTextArrayFromSelector(
      doc,
      COMMON_SELECTORS.ingredients,
    );
    const instructions = extractTextArrayFromSelector(
      doc,
      COMMON_SELECTORS.instructions,
    );
    const imageUrl = extractImageFromSelector(doc, COMMON_SELECTORS.image);

    if (ingredients.length === 0) {
      throw new ImportError(
        "Could not find recipe ingredients",
        "EXTRACTION_ERROR",
      );
    }

    if (instructions.length === 0) {
      throw new ImportError(
        "Could not find recipe instructions",
        "EXTRACTION_ERROR",
      );
    }

    const prepTime = parseTimeString(prepTimeStr || "");
    const cookTime = parseTimeString(cookTimeStr || "");
    const totalTime = parseTimeString(totalTimeStr || "");
    const servings = parseServings(servingsStr || "");

    return {
      title,
      description: description || undefined,
      prepTime: prepTime || undefined,
      cookTime: cookTime || undefined,
      totalTime: totalTime || undefined,
      servings: servings || undefined,
      ingredients,
      instructions,
      imageUrl: imageUrl || undefined,
      sourceUrl: url,
      isPrivate: true,
    };
  } catch (error) {
    if (error instanceof ImportError) {
      throw error;
    }
    throw new ImportError(
      `Failed to extract recipe from HTML: ${error instanceof Error ? error.message : "Unknown error"}`,
      "EXTRACTION_ERROR",
    );
  }
}
