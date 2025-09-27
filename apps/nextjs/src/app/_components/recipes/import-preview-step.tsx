"use client";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";

import type { ExtractedRecipe } from "./import-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Spinner } from "~/components/ui/spinner";

interface ImportPreviewStepProps {
  onBack: () => void;
  onNext: (results: ExtractedRecipe) => void;
  extractorType: string;
  inputType: "url" | "text";
  inputValue: string;
  isLoading: boolean;
  results?: ExtractedRecipe;
  error?: string;
}

export function ImportPreviewStep({
  onBack,
  onNext,
  extractorType,
  inputType,
  inputValue,
  isLoading,
  results,
  error,
}: ImportPreviewStepProps) {
  const handleNext = () => {
    if (results) {
      onNext(results);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Extracting Recipe Data</h3>
          <p className="text-muted-foreground text-sm">
            Using {extractorType} to extract recipe information...
          </p>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="space-y-4 text-center">
            <Spinner className="mx-auto h-8 w-8" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Processing your recipe</p>
              <p className="text-muted-foreground text-xs">
                This may take a few seconds depending on the extraction method
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button disabled>Processing...</Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Extraction Failed</h3>
          <p className="text-muted-foreground text-sm">
            Unable to extract recipe data using {extractorType}.
          </p>
        </div>

        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="text-destructive h-4 w-4" />
              <CardTitle className="text-sm">Error Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{error}</p>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Try Different Method
          </Button>
          <Button variant="outline" disabled>
            Continue Anyway
          </Button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No Results</h3>
          <p className="text-muted-foreground text-sm">
            No recipe data was found using {extractorType}.
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Try Different Method
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">
            Recipe Extracted Successfully
          </h3>
        </div>
        <p className="text-muted-foreground text-sm">
          Review the extracted recipe data before continuing to edit.
        </p>
      </div>

      <div className="bg-muted rounded-md p-3">
        <p className="text-sm font-medium">
          Extracted using: <Badge variant="secondary">{extractorType}</Badge>
        </p>
        <p className="text-muted-foreground truncate text-sm">
          Source: {inputType === "url" ? inputValue : "Manual text input"}
        </p>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {/* Recipe Title and Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{results.name}</CardTitle>
              {results.description && (
                <CardDescription>{results.description}</CardDescription>
              )}
            </CardHeader>
          </Card>
          {/* Recipe Meta Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recipe Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {results.preparationTime && (
                  <div className="flex items-center space-x-2">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    <span>Prep: {results.preparationTime}</span>
                  </div>
                )}
                {results.cookingTime && (
                  <div className="flex items-center space-x-2">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    <span>Cook: {results.cookingTime}</span>
                  </div>
                )}
                {results.totalTime && (
                  <div className="flex items-center space-x-2">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    <span>Total: {results.totalTime}</span>
                  </div>
                )}
                {results.servings && (
                  <div className="flex items-center space-x-2">
                    <Users className="text-muted-foreground h-4 w-4" />
                    <span>Serves: {results.servings}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Ingredients */}
          {/*<Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Ingredients ({results.ingredients.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm">
                {results.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>*/}
          {/* Instructions */}
          {results.instructions && results.instructions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Instructions ({results.instructions.length} steps)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm">
                  {results.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-muted-foreground font-medium">
                        {index + 1}.
                      </span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
          {/* Tags */}
          {/*{results.tags && results.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {results.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}*/}
          {/* Nutrition */}
          {/*{results.nutrition && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Nutrition Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {results.nutrition.calories && (
                    <span>Calories: {results.nutrition.calories}</span>
                  )}
                  {results.nutrition.protein && (
                    <span>Protein: {results.nutrition.protein}</span>
                  )}
                  {results.nutrition.carbs && (
                    <span>Carbs: {results.nutrition.carbs}</span>
                  )}
                  {results.nutrition.fat && (
                    <span>Fat: {results.nutrition.fat}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}*/}
        </div>
      </ScrollArea>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext}>
          Edit Recipe
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
