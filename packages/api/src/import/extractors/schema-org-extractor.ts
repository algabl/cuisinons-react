import type { RecipeApiData } from "../../schemas";
import type {
  ExtractorInput,
  ExtractorResult,
  RecipeExtractor,
} from "../../types/import";

interface SchemaOrgRecipe {
  "@type": "Recipe";
  name?: string;
  description?: string;
  image?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeYield?: string | number;
  recipeCategory?: string;
  recipeCuisine?: string;
  keywords?: string[];
  suitableForDiet?: string[];
  recipeInstructions?: string[] | { text: string }[];
  nutrition?: {
    calories?: string;
    fatContent?: string;
    proteinContent?: string;
    carbohydrateContent?: string;
    fiberContent?: string;
    sugarContent?: string;
    sodiumContent?: string;
  };
  tool?: string[];
  estimatedCost?: { value: number };
}

export class SchemaOrgExtractor implements RecipeExtractor {
  readonly name = "schema-org";
  readonly priority = 1;

  canHandle(input: ExtractorInput): boolean {
    return !!input.html?.includes("application/ld+json");
  }

  async extract(input: ExtractorInput): Promise<ExtractorResult> {
    if (!input.html) {
      return {
        status: "failed",
        warnings: ["No HTML content provided"],
        confidence: 0,
      };
    }

    return extractFromSchemaOrg(input.html, input.url);
  }
}

export function extractFromSchemaOrg(
  html: string,
  sourceUrl: string,
): ExtractorResult {
  try {
    // Extract all JSON-LD script tags
    const jsonLdMatches = html.match(
      /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gis,
    );

    if (!jsonLdMatches) {
      return {
        status: "failed",
        warnings: ["No JSON-LD data found"],
        confidence: 0,
      };
    }

    for (const match of jsonLdMatches) {
      const jsonContent = match
        .replace(/<script[^>]*>|<\/script>/gi, "")
        .trim();

      try {
        const data = JSON.parse(jsonContent);
        const recipe = findRecipeInJsonLd(data);

        if (recipe) {
          const converted = convertSchemaOrgToRecipeApi(recipe);
          const missingFields = findMissingFields(converted);

          return {
            status: "failed",
            recipe: converted,
            confidence: calculateConfidence(converted),
            missingFields,
            warnings:
              missingFields.length > 0
                ? [`Missing optional fields: ${missingFields.join(", ")}`]
                : [],
          };
        }
      } catch (parseError) {
        console.warn("Failed to parse JSON-LD block:", parseError);
        continue; // Try next JSON-LD block
      }
    }

    return {
      status: "failed",
      warnings: ["No recipe found in JSON-LD data"],
      confidence: 0,
    };
  } catch (error) {
    console.error("Schema.org extraction failed:", error);
    return {
      status: "failed",
      warnings: [
        `Schema.org extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      ],
      confidence: 0,
    };
  }
}

function findRecipeInJsonLd(data: any): SchemaOrgRecipe | null {
  // Handle single object
  if (data?.["@type"] === "Recipe") {
    return data as SchemaOrgRecipe;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    for (const item of data) {
      if (item?.["@type"] === "Recipe") {
        return item as SchemaOrgRecipe;
      }
    }
  }

  // Handle nested structures (graph, etc.)
  if (data?.["@graph"]) {
    return findRecipeInJsonLd(data["@graph"]);
  }

  // Handle objects with nested recipes
  if (typeof data === "object" && data !== null) {
    for (const value of Object.values(data)) {
      if (
        Array.isArray(value) ||
        (typeof value === "object" && value !== null)
      ) {
        const result = findRecipeInJsonLd(value);
        if (result) return result;
      }
    }
  }

  return null;
}

function convertSchemaOrgToRecipeApi(
  schema: SchemaOrgRecipe,
): Partial<RecipeApiData> {
  const recipe: Partial<RecipeApiData> = {
    name: schema.name || "",
    description: schema.description || undefined,
    imageId: schema.image || undefined, // Note: This would need to be processed to upload and get an imageId
    isPrivate: true, // Force all imports to be private
  };

  // Convert time fields from ISO 8601 duration to minutes
  if (schema.prepTime) {
    recipe.preparationTime = parseDurationToMinutes(schema.prepTime);
  }

  if (schema.cookTime) {
    recipe.cookingTime = parseDurationToMinutes(schema.cookTime);
  }

  if (schema.totalTime) {
    recipe.totalTime = parseDurationToMinutes(schema.totalTime);
  }

  // Handle yield/servings
  if (schema.recipeYield) {
    if (typeof schema.recipeYield === "number") {
      recipe.servings = schema.recipeYield;
    } else if (typeof schema.recipeYield === "string") {
      const servings = parseInt(schema.recipeYield.replace(/\D/g, ""), 10);
      if (!isNaN(servings) && servings > 0) {
        recipe.servings = servings;
      }
    }
  }

  // Categories and cuisine
  if (schema.recipeCategory) {
    recipe.recipeCategory = schema.recipeCategory;
  }

  if (schema.recipeCuisine) {
    recipe.recipeCuisine = schema.recipeCuisine;
  }

  // Keywords and dietary info
  if (schema.keywords && Array.isArray(schema.keywords)) {
    recipe.keywords = schema.keywords;
  }

  if (schema.suitableForDiet && Array.isArray(schema.suitableForDiet)) {
    recipe.suitableForDiet = schema.suitableForDiet;
  }

  // Instructions
  if (schema.recipeInstructions && Array.isArray(schema.recipeInstructions)) {
    recipe.instructions = schema.recipeInstructions
      .map((instruction) => {
        if (typeof instruction === "string") {
          return instruction;
        }
        if (typeof instruction === "object" && instruction?.text) {
          return instruction.text;
        }
        return "";
      })
      .filter(Boolean);
  }

  // Nutrition information
  if (schema.nutrition) {
    const nutrition = schema.nutrition;

    if (nutrition.calories) {
      const calories = parseInt(nutrition.calories.replace(/\D/g, ""), 10);
      if (!isNaN(calories)) {
        recipe.calories = calories;
      }
    }

    if (nutrition.fatContent) {
      const fat = parseFloat(nutrition.fatContent.replace(/[^\d.]/g, ""));
      if (!isNaN(fat)) {
        recipe.fat = fat;
      }
    }

    if (nutrition.proteinContent) {
      const protein = parseFloat(
        nutrition.proteinContent.replace(/[^\d.]/g, ""),
      );
      if (!isNaN(protein)) {
        recipe.protein = protein;
      }
    }

    if (nutrition.carbohydrateContent) {
      const carbs = parseFloat(
        nutrition.carbohydrateContent.replace(/[^\d.]/g, ""),
      );
      if (!isNaN(carbs)) {
        recipe.carbohydrates = carbs;
      }
    }

    if (nutrition.fiberContent) {
      const fiber = parseFloat(nutrition.fiberContent.replace(/[^\d.]/g, ""));
      if (!isNaN(fiber)) {
        recipe.fiber = fiber;
      }
    }

    if (nutrition.sugarContent) {
      const sugar = parseFloat(nutrition.sugarContent.replace(/[^\d.]/g, ""));
      if (!isNaN(sugar)) {
        recipe.sugar = sugar;
      }
    }

    if (nutrition.sodiumContent) {
      const sodium = parseFloat(nutrition.sodiumContent.replace(/[^\d.]/g, ""));
      if (!isNaN(sodium)) {
        recipe.sodium = sodium;
      }
    }
  }

  // Equipment
  if (schema.tool && Array.isArray(schema.tool)) {
    recipe.recipeEquipment = schema.tool;
  }

  // Cost
  if (schema.estimatedCost?.value) {
    recipe.estimatedCost = schema.estimatedCost.value;
  }

  return recipe;
}

function parseDurationToMinutes(duration: string): number | undefined {
  try {
    // Handle ISO 8601 duration format (PT30M, PT1H30M, etc.)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (match) {
      const hours = parseInt(match[1] || "0", 10);
      const minutes = parseInt(match[2] || "0", 10);
      return hours * 60 + minutes;
    }

    // Handle simple number (assume minutes)
    const simpleNumber = parseInt(duration.replace(/\D/g, ""), 10);
    if (!isNaN(simpleNumber) && simpleNumber > 0) {
      return simpleNumber;
    }
  } catch {
    // Fall through to undefined
  }

  return undefined;
}

function calculateConfidence(recipe: Partial<RecipeApiData>): number {
  let score = 0;
  let maxScore = 0;

  // Essential fields (higher weight)
  const essentialFields = [
    { field: "name", weight: 30 },
    { field: "instructions", weight: 25 },
  ];

  // Important fields
  const importantFields = [
    { field: "description", weight: 10 },
    { field: "cookingTime", weight: 8 },
    { field: "preparationTime", weight: 8 },
    { field: "servings", weight: 7 },
    { field: "image", weight: 5 },
  ];

  // Nice to have fields
  const optionalFields = [
    { field: "recipeCategory", weight: 2 },
    { field: "recipeCuisine", weight: 2 },
    { field: "calories", weight: 3 },
  ];

  const allFields = [...essentialFields, ...importantFields, ...optionalFields];

  for (const { field, weight } of allFields) {
    maxScore += weight;
    const value = recipe[field as keyof typeof recipe];

    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value) && value.length > 0) {
        score += weight;
      } else if (!Array.isArray(value)) {
        score += weight;
      }
    }
  }

  return Math.round((score / maxScore) * 100);
}

function findMissingFields(recipe: Partial<RecipeApiData>): string[] {
  const missing: string[] = [];

  const optionalFieldsToCheck = [
    "description",
    "image",
    "cookingTime",
    "preparationTime",
    "servings",
    "recipeCategory",
    "recipeCuisine",
    "calories",
  ];

  for (const field of optionalFieldsToCheck) {
    const value = recipe[field as keyof typeof recipe];
    if (value === undefined || value === null || value === "") {
      missing.push(field);
    }
  }

  return missing;
}
