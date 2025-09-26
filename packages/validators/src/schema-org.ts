import type { ingredients, recipes } from "@cuisinons/db/schema";

// Types for schema.org Recipe structured data
export interface SchemaOrgRecipe {
  "@context": "https://schema.org";
  "@type": "Recipe";
  name: string;
  description?: string;
  image?: string;
  author?: {
    "@type": "Person";
    name: string;
  };
  prepTime?: string; // ISO 8601 duration format
  cookTime?: string; // ISO 8601 duration format
  totalTime?: string; // ISO 8601 duration format
  recipeYield?: string | number;
  recipeCategory?: string;
  recipeCuisine?: string;
  keywords?: string[];
  suitableForDiet?: string[];
  recipeIngredient?: string[];
  recipeInstructions?: {
    "@type": "HowToStep";
    text: string;
  }[];
  nutrition?: {
    "@type": "NutritionInformation";
    calories?: string;
    fatContent?: string;
    proteinContent?: string;
    carbohydrateContent?: string;
    fiberContent?: string;
    sugarContent?: string;
    sodiumContent?: string;
  };
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    ratingCount: number;
  };
  tool?: string[];
  estimatedCost?: {
    "@type": "MonetaryAmount";
    currency: "USD";
    value: number;
  };
}

// Helper function to convert minutes to ISO 8601 duration
function minutesToISO8601(minutes: number): string {
  if (minutes < 60) {
    return `PT${minutes}M`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `PT${hours}H${remainingMinutes > 0 ? `${remainingMinutes}M` : ""}`;
}

function iso8601ToMinutes(duration: string): number | undefined {
  try {
    const regex = /^PT(?:(\d+)H)?(?:(\d+)M)?$/;
    const match = regex.exec(duration);
    // Handle ISO 8601 duration format (PT30M, PT1H30M, etc.)
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

// Convert your database recipe to schema.org Recipe
export function recipeToSchemaOrg(
  recipe: typeof recipes.$inferSelect,
  recipeIngredients: {
    ingredient: typeof ingredients.$inferSelect;
    quantity?: number | null;
    unit?: string | null;
  }[],
  authorName?: string,
): SchemaOrgRecipe {
  const schemaRecipe: SchemaOrgRecipe = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.name,
  };

  // Optional fields
  if (recipe.description) {
    schemaRecipe.description = recipe.description;
  }

  if (recipe.image) {
    schemaRecipe.image = recipe.image;
  }

  if (authorName) {
    schemaRecipe.author = {
      "@type": "Person",
      name: authorName,
    };
  }

  // Time fields
  if (recipe.preparationTime) {
    schemaRecipe.prepTime = minutesToISO8601(recipe.preparationTime);
  }

  if (recipe.cookingTime) {
    schemaRecipe.cookTime = minutesToISO8601(recipe.cookingTime);
  }

  if (recipe.totalTime) {
    schemaRecipe.totalTime = minutesToISO8601(recipe.totalTime);
  }

  // Yield
  if (recipe.servings) {
    schemaRecipe.recipeYield = recipe.servings;
  }

  // Categories and cuisine
  if (recipe.recipeCategory) {
    schemaRecipe.recipeCategory = recipe.recipeCategory;
  }

  if (recipe.recipeCuisine) {
    schemaRecipe.recipeCuisine = recipe.recipeCuisine;
  }

  // Keywords and dietary info
  if (recipe.keywords && recipe.keywords.length > 0) {
    schemaRecipe.keywords = recipe.keywords;
  }

  if (recipe.suitableForDiet && recipe.suitableForDiet.length > 0) {
    schemaRecipe.suitableForDiet = recipe.suitableForDiet;
  }

  // Ingredients
  if (recipeIngredients.length > 0) {
    schemaRecipe.recipeIngredient = recipeIngredients.map((ri) => {
      let ingredientText = ri.ingredient.name;
      if (ri.quantity && ri.unit) {
        ingredientText = `${ri.quantity} ${ri.unit} ${ri.ingredient.name}`;
      } else if (ri.quantity) {
        ingredientText = `${ri.quantity} ${ri.ingredient.name}`;
      }
      return ingredientText;
    });
  }

  // Instructions
  if (recipe.instructions && recipe.instructions.length > 0) {
    schemaRecipe.recipeInstructions = recipe.instructions.map(
      (instruction) => ({
        "@type": "HowToStep",
        text: instruction,
      }),
    );
  }

  // Nutrition
  const hasNutrition =
    recipe.calories ||
    recipe.fat ||
    recipe.protein ||
    recipe.carbohydrates ||
    recipe.fiber ||
    recipe.sugar ||
    recipe.sodium;

  if (hasNutrition) {
    schemaRecipe.nutrition = {
      "@type": "NutritionInformation",
    };

    if (recipe.calories) {
      schemaRecipe.nutrition.calories = `${recipe.calories} calories`;
    }
    if (recipe.fat) {
      schemaRecipe.nutrition.fatContent = `${recipe.fat} grams`;
    }
    if (recipe.protein) {
      schemaRecipe.nutrition.proteinContent = `${recipe.protein} grams`;
    }
    if (recipe.carbohydrates) {
      schemaRecipe.nutrition.carbohydrateContent = `${recipe.carbohydrates} grams`;
    }
    if (recipe.fiber) {
      schemaRecipe.nutrition.fiberContent = `${recipe.fiber} grams`;
    }
    if (recipe.sugar) {
      schemaRecipe.nutrition.sugarContent = `${recipe.sugar} grams`;
    }
    if (recipe.sodium) {
      schemaRecipe.nutrition.sodiumContent = `${recipe.sodium} grams`;
    }
  }

  // Ratings
  if (recipe.aggregateRating && recipe.ratingCount) {
    schemaRecipe.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: recipe.aggregateRating,
      ratingCount: recipe.ratingCount,
    };
  }

  // Equipment
  if (recipe.recipeEquipment && recipe.recipeEquipment.length > 0) {
    schemaRecipe.tool = recipe.recipeEquipment;
  }

  // Cost
  if (recipe.estimatedCost) {
    schemaRecipe.estimatedCost = {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: recipe.estimatedCost,
    };
  }

  return schemaRecipe;
}

export function schemaOrgToRecipe(schema: SchemaOrgRecipe): {
  recipe: Partial<typeof recipes.$inferInsert>;
  missingFields: string[];
} {
  const recipe: Partial<typeof recipes.$inferInsert> = {
    name: schema.name,
  };

  if (schema.description) {
    recipe.description = schema.description;
  }

  if (schema.image) {
    recipe.image = schema.image;
  }

  // Time fields
  if (schema.prepTime) {
    recipe.preparationTime = iso8601ToMinutes(schema.prepTime);
  }

  if (schema.cookTime) {
    recipe.cookingTime = iso8601ToMinutes(schema.cookTime);
  }

  if (schema.totalTime) {
    recipe.totalTime = iso8601ToMinutes(schema.totalTime);
  }

  // Yield
  if (schema.recipeYield) {
    if (typeof schema.recipeYield === "number") {
      recipe.servings = schema.recipeYield;
    } else if (typeof schema.recipeYield === "string") {
      const parsedYield = parseInt(schema.recipeYield.replace(/\D/g, ""), 10);
      if (!isNaN(parsedYield) && parsedYield > 0) {
        recipe.servings = parsedYield;
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
  if (schema.keywords && schema.keywords.length > 0) {
    recipe.keywords = schema.keywords;
  }

  if (schema.suitableForDiet && schema.suitableForDiet.length > 0) {
    recipe.suitableForDiet = schema.suitableForDiet;
  }

  // Instructions
  if (schema.recipeInstructions && schema.recipeInstructions.length > 0) {
    recipe.instructions = schema.recipeInstructions
      .map((instruction) => {
        return instruction.text.trim();
      })
      .filter(Boolean);
  }

  // Nutrition
  if (schema.nutrition) {
    const nutrition = schema.nutrition;

    if (nutrition.calories) {
      const calories = parseInt(nutrition.calories.replace(/\D/g, ""), 10);
      if (!isNaN(calories)) {
        recipe.calories = calories;
      }
    }

    if (nutrition.fatContent) {
      const fat = parseInt(nutrition.fatContent.replace(/\D/g, ""), 10);
      if (!isNaN(fat)) {
        recipe.fat = fat;
      }
    }

    if (nutrition.proteinContent) {
      const protein = parseInt(nutrition.proteinContent.replace(/\D/g, ""), 10);
      if (!isNaN(protein)) {
        recipe.protein = protein;
      }
    }

    if (nutrition.carbohydrateContent) {
      const carbs = parseInt(
        nutrition.carbohydrateContent.replace(/\D/g, ""),
        10,
      );
      if (!isNaN(carbs)) {
        recipe.carbohydrates = carbs;
      }
    }

    if (nutrition.fiberContent) {
      const fiber = parseInt(nutrition.fiberContent.replace(/\D/g, ""), 10);
      if (!isNaN(fiber)) {
        recipe.fiber = fiber;
      }
    }

    if (nutrition.sugarContent) {
      const sugar = parseInt(nutrition.sugarContent.replace(/\D/g, ""), 10);
      if (!isNaN(sugar)) {
        recipe.sugar = sugar;
      }
    }

    if (nutrition.sodiumContent) {
      const sodium = parseInt(nutrition.sodiumContent.replace(/\D/g, ""), 10);
      if (!isNaN(sodium)) {
        recipe.sodium = sodium;
      }
    }
  }

  // Equipment
  if (schema.tool && schema.tool.length > 0) {
    recipe.recipeEquipment = schema.tool;
  }

  // Cost
  if (schema.estimatedCost && typeof schema.estimatedCost.value === "number") {
    recipe.estimatedCost = schema.estimatedCost.value;
  }

  return {
    recipe,
    missingFields: findMissingFields(recipe),
  };
}

// Helper to generate the JSON-LD script tag
export function generateRecipeJsonLd(schemaRecipe: SchemaOrgRecipe): string {
  return `<script type="application/ld+json">${JSON.stringify(schemaRecipe, null, 2)}</script>`;
}

function findMissingFields(
  recipe: Partial<typeof recipes.$inferInsert>,
): string[] {
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
