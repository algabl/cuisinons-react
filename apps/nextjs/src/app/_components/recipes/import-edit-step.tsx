"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { Button } from "~/components/ui/button";
import RecipeForm from "./form";

// Import the extracted recipe type from preview step
interface ExtractedRecipe {
  name: string;
  description?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  servings?: string;
  difficulty?: string;
  ingredients: string[];
  instructions: string[];
  tags?: string[];
  nutrition?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
  sourceUrl?: string;
}

interface ImportEditStepProps {
  onBack: () => void;
  onComplete: (recipeId: string) => void;
  extractedRecipe: ExtractedRecipe;
}

// Helper function to convert extracted recipe to form data
function convertToRecipeFormData(extracted: ExtractedRecipe) {
  // Parse time strings (e.g., "PT30M" or "30 minutes") to minutes
  const parseTime = (timeStr?: string): number | undefined => {
    if (!timeStr) return undefined;

    // Handle ISO 8601 duration format (PT30M, PT1H30M)
    const isoMatch = timeStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (isoMatch) {
      const hours = parseInt(isoMatch[1] || "0", 10);
      const minutes = parseInt(isoMatch[2] || "0", 10);
      return hours * 60 + minutes;
    }

    // Handle simple minute formats ("30 minutes", "30 mins", "30")
    const minuteMatch = timeStr.match(/(\d+)(?:\s*(?:minutes?|mins?|min))?/i);
    if (minuteMatch) {
      return parseInt(minuteMatch[1], 10);
    }

    return undefined;
  };

  // Parse servings (e.g., "4 servings", "serves 4", "4")
  const parseServings = (servingStr?: string): number | undefined => {
    if (!servingStr) return undefined;

    const match = servingStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : undefined;
  };

  // Convert ingredients to the expected format
  // For now, we'll create basic ingredient entries without linking to existing ingredients
  const recipeIngredients = extracted.ingredients.map((ingredient, index) => ({
    ingredientId: `temp-${index}`, // Temporary ID - will be handled by the form
    name: ingredient, // Use the full ingredient text as name for now
    quantity: 1, // Default quantity
    unit: undefined, // No unit specified
  }));

  return {
    name: extracted.name,
    description: extracted.description || "",
    prepTime: parseTime(extracted.prepTime),
    cookTime: parseTime(extracted.cookTime),
    totalTime: parseTime(extracted.totalTime),
    servings: parseServings(extracted.servings),
    difficulty: extracted.difficulty || "medium",
    instructions: extracted.instructions,
    recipeIngredients,
    keywords: extracted.tags || [],
    suitableForDiet: [], // Extract from tags if needed
    recipeEquipment: [], // Not typically extracted
    isPrivate: false,
    // Optional fields
    recipeYield: undefined,
    recipeCategory: undefined,
    recipeCuisine: undefined,
    aggregateRating: undefined,
    ratingCount: undefined,
    calories: extracted.nutrition?.calories
      ? parseInt(extracted.nutrition.calories, 10)
      : undefined,
    fatContent: extracted.nutrition?.fat,
    carbohydrateContent: extracted.nutrition?.carbs,
    proteinContent: extracted.nutrition?.protein,
    fiberContent: undefined,
    sugarContent: undefined,
    sodiumContent: undefined,
    source: extracted.sourceUrl,
    stageId: crypto.randomUUID(),
  };
}

export function ImportEditStep({
  onBack,
  onComplete,
  extractedRecipe,
}: ImportEditStepProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Convert extracted recipe to form format
  const initialFormData = convertToRecipeFormData(extractedRecipe);

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      // Here we would typically call the recipe creation API
      // For now, we'll simulate success
      const result = { id: "new-recipe-id" };
      onComplete(result.id);
    } catch (error) {
      console.error("Failed to save recipe:", error);
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Edit Recipe</h3>
            <p className="text-muted-foreground text-sm">
              Review and edit the extracted recipe data before saving.
            </p>
          </div>
          <Button variant="outline" onClick={onBack} disabled={isLoading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Use the existing RecipeForm component */}
      <RecipeForm
        recipe={initialFormData} // Type casting for now
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
