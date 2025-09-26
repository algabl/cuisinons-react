import type { recipes } from "@cuisinons/db/schema";
import type { SchemaOrgRecipe } from "@cuisinons/validators";
import { schemaOrgToRecipe } from "@cuisinons/validators";

import type {
  ExtractorInput,
  ExtractorResult,
  RecipeExtractor,
} from "../../../types/import";

export class SchemaOrgExtractor implements RecipeExtractor {
  readonly name = "schema-org";
  readonly priority = 1;

  canHandle(input: ExtractorInput): boolean {
    return !!input.html?.includes("application/ld+json");
  }

  async extract(input: ExtractorInput): Promise<ExtractorResult> {
    if (!this.canHandle(input)) {
      return {
        status: "failed",
        warnings: ["Input not suitable for Schema.org extraction"],
        confidence: 0,
      };
    }

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

export async function extractFromSchemaOrg(
  html: string,
  sourceUrl: string,
): Promise<ExtractorResult> {
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
          const { recipe: converted, missingFields } =
            schemaOrgToRecipe(recipe);
          return {
            status: "success",
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

function calculateConfidence(
  recipe: Partial<typeof recipes.$inferInsert>,
): number {
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
