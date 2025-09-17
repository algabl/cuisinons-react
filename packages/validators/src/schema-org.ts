import type {
  recipes,
  ingredients,
} from "@cuisinons/db/schema";

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

// Helper to generate the JSON-LD script tag
export function generateRecipeJsonLd(schemaRecipe: SchemaOrgRecipe): string {
  return `<script type="application/ld+json">${JSON.stringify(schemaRecipe, null, 2)}</script>`;
}
