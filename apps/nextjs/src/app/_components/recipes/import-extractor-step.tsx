"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Brain, Code2, Globe } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface ImportExtractorStepProps {
  onBack: () => void;
  onNext: (extractor: string) => void;
  inputType: "url" | "text";
  inputValue: string;
}

const extractors = [
  {
    id: "schema-org",
    name: "Schema.org",
    description: "Structured data extraction using JSON-LD and microdata",
    icon: Globe,
    accuracy: "High",
    speed: "Fast",
    recommended: true,
  },
  {
    id: "html-scraper",
    name: "HTML Scraper",
    description: "Pattern-based extraction from common recipe sites",
    icon: Code2,
    accuracy: "Medium",
    speed: "Fast",
    recommended: false,
  },
  {
    id: "llm",
    name: "LLM Extraction",
    description: "AI-powered extraction for any text or unusual formats",
    icon: Brain,
    accuracy: "High",
    speed: "Slow",
    recommended: false,
  },
];

export function ImportExtractorStep({
  onBack,
  onNext,
  inputType,
  inputValue,
}: ImportExtractorStepProps) {
  const [selectedExtractor, setSelectedExtractor] = useState("schema-org");

  const handleNext = () => {
    onNext(selectedExtractor);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Choose Extraction Method</h3>
        <p className="text-muted-foreground text-sm">
          Select how you want to extract the recipe data from your{" "}
          {inputType === "url" ? "URL" : "text"}.
        </p>
      </div>

      <div className="bg-muted rounded-md p-3">
        <p className="text-sm font-medium">Source:</p>
        <p className="text-muted-foreground truncate text-sm">
          {inputType === "url" ? inputValue : `${inputValue.slice(0, 100)}...`}
        </p>
      </div>

      <div className="space-y-3">
        {extractors.map((extractor) => {
          const Icon = extractor.icon;
          const isSelected = selectedExtractor === extractor.id;
          return (
            <Card
              key={extractor.id}
              className={`cursor-pointer transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedExtractor(extractor.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start space-x-3">
                  <div
                    className={`mt-1 h-4 w-4 rounded-full border-2 ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <CardTitle className="text-base">
                        {extractor.name}
                      </CardTitle>
                      {extractor.recommended && (
                        <Badge variant="secondary" className="text-xs">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm">
                      {extractor.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-muted-foreground flex space-x-4 text-xs">
                  <span>
                    Accuracy: <strong>{extractor.accuracy}</strong>
                  </span>
                  <span>
                    Speed: <strong>{extractor.speed}</strong>
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext}>
          Extract Recipe
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
