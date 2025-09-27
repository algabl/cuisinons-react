"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import type { recipes } from "@cuisinons/db/schema";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import { ImportEditStep } from "./import-edit-step";
import { ImportExtractorStep } from "./import-extractor-step";
import { ImportInputStep } from "./import-input-step";
import { ImportPreviewStep } from "./import-preview-step";

type ImportStep = "input" | "extractor" | "preview" | "edit";
type InputMethod = "url" | "text";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export type ExtractedRecipe = Partial<typeof recipes.$inferInsert>;

export function ImportDialog({ isOpen, onClose }: ImportDialogProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>("input");
  const [inputMethod, setInputMethod] = useState<InputMethod>("url");
  const [inputData, setInputData] = useState<{
    url?: string;
    text?: string;
  }>({});
  const [extractorType, setExtractorType] = useState<string>("schema-org");
  const [extractedRecipe, setExtractedRecipe] =
    useState<ExtractedRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Move the hooks to the top level
  const importUrlMutation = api.recipe.importFromUrl.useMutation();
  const importTextMutation = api.recipe.importFromText.useMutation();

  const handleClose = () => {
    // Reset dialog state
    setCurrentStep("input");
    setInputMethod("url");
    setInputData({});
    setExtractorType("schema-org");
    setExtractedRecipe(null);
    setIsLoading(false);
    setError(null);
    onClose();
  };

  const handleInputSubmit = () => {
    setCurrentStep("extractor");
  };

  const handleExtractorSelect = async (extractor: string) => {
    setExtractorType(extractor);
    setCurrentStep("preview");
    setIsLoading(true);
    setError(null);

    try {
      let result;

      if (inputMethod === "url" && inputData.url) {
        result = await importUrlMutation.mutateAsync({
          url: inputData.url,
          userConsent: true,
          skipDirectFetch: false,
        });
      } else if (inputMethod === "text" && inputData.text) {
        result = await importTextMutation.mutateAsync({
          content: inputData.text,
          sourceUrl: inputData.url,
        });
      } else {
        throw new Error("Invalid input data");
      }

      // Convert the API response to our ExtractedRecipe format
      if (result.data.recipe) {
        const apiRecipe = result.data.recipe;
        const mockRecipe: ExtractedRecipe = {
          name: apiRecipe.name || "Untitled Recipe",
          description: apiRecipe.description || undefined,
          prepTime: apiRecipe.preparationTime
            ? `${apiRecipe.preparationTime} minutes`
            : undefined,
          cookTime: apiRecipe.cookingTime
            ? `${apiRecipe.cookingTime} minutes`
            : undefined,
          totalTime: apiRecipe.totalTime
            ? `${apiRecipe.totalTime} minutes`
            : undefined,
          servings: apiRecipe.servings ?? undefined,
          ingredients: [], // TODO: Extract from API response
          instructions: apiRecipe.instructions, // TODO: Extract from API response
          // tags: apiRecipe.tags || undefined,
          sourceUrl: inputData.url,
        };
        setExtractedRecipe(mockRecipe);
      } else {
        // Fallback mock data for testing
        const mockRecipe: ExtractedRecipe = {
          name: "Sample Extracted Recipe",
          description:
            "This is a sample recipe extracted from the provided source.",
          prepTime: "15 minutes",
          cookTime: "30 minutes",
          totalTime: "45 minutes",
          servings: "4",
          ingredients: [
            "2 cups flour",
            "1 cup sugar",
            "3 eggs",
            "1/2 cup butter",
          ],
          instructions: [
            "Preheat oven to 350°F",
            "Mix dry ingredients",
            "Add wet ingredients",
            "Bake for 30 minutes",
          ],
          tags: ["dessert", "baked"],
          sourceUrl: inputData.url,
        };
        setExtractedRecipe(mockRecipe);
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewNext = (recipe: ExtractedRecipe) => {
    setExtractedRecipe(recipe);
    setCurrentStep("edit");
  };

  const handleEditComplete = (recipeId: string) => {
    // Recipe has been saved successfully
    console.log("Recipe saved with ID:", recipeId);
    handleClose();
    // Could trigger a refresh of the recipes list here
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "input":
        return (
          <ImportInputStep
            inputMethod={inputMethod}
            onMethodChange={setInputMethod}
            onDataChange={(data) => {
              if (data.url) {
                setInputData({ url: data.url });
              } else if (data.content) {
                setInputData({
                  text: data.content,
                });
              }
            }}
            onNext={handleInputSubmit}
          />
        );

      case "extractor":
        return (
          <ImportExtractorStep
            onBack={() => setCurrentStep("input")}
            onNext={handleExtractorSelect}
            inputType={inputMethod}
            inputValue={inputData.url || inputData.text || ""}
          />
        );

      case "preview":
        return (
          <ImportPreviewStep
            onBack={() => setCurrentStep("extractor")}
            onNext={handlePreviewNext}
            extractorType={extractorType}
            inputType={inputMethod}
            inputValue={inputData.url || inputData.text || ""}
            isLoading={isLoading}
            results={extractedRecipe ?? undefined}
            error={error ?? undefined}
          />
        );

      case "edit":
        return extractedRecipe ? (
          <ImportEditStep
            onBack={() => setCurrentStep("preview")}
            onComplete={handleEditComplete}
            extractedRecipe={extractedRecipe}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Import Recipe</span>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">{renderCurrentStep()}</div>
      </DialogContent>
    </Dialog>
  );
}
