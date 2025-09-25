import type {
  ExtractorInput,
  ExtractorResult,
  RecipeExtractor,
} from "../types/import";

export class ExtractorFactory {
  private extractors: Map<string, RecipeExtractor>;

  constructor(extractors: RecipeExtractor[] = []) {
    this.extractors = new Map();
    extractors.forEach((e) => {
      this.register(e);
    });
  }

  register(extractor: RecipeExtractor): void {
    this.extractors.set(extractor.name, extractor);
  }

  unregister(name: string): void {
    this.extractors.delete(name);
  }

  getExtractor(name: string): RecipeExtractor | undefined {
    return this.extractors.get(name);
  }

  getAvailableExtractors(input: ExtractorInput): RecipeExtractor[] {
    const available: RecipeExtractor[] = [];
    for (const [_name, extractor] of this.extractors) {
      if (extractor.canHandle(input)) {
        available.push(extractor);
      }
    }
    return available.sort((a, b) => {
      return a.priority - b.priority;
    });
  }

  createExtractionPipeline(input: ExtractorInput): RecipeExtractor[] {
    return this.getAvailableExtractors(input);
  }

  async extractWithPipeline(input: ExtractorInput): Promise<ExtractorResult> {
    const pipeline = this.createExtractionPipeline(input);
    const warnings: string[] = [];
    let lastError: Error | null = null;

    for (const extractor of pipeline) {
      try {
        const extractorInput = {
          ...input,
          options: {
            ...input.options,
            ...extractor.options,
          },
        };

        const result = await extractor.extract(extractorInput);

        if (result.status === "success") {
          return {
            ...result,
            warnings:
              warnings.length > 0
                ? [...warnings, ...(result.warnings || [])]
                : result.warnings,
          };
        }

        if (result.warnings) {
          warnings.push(...result.warnings);
        }
      } catch (error) {
        lastError =
          error instanceof Error
            ? error
            : new Error("Unknown extraction error");
        warnings.push(
          `${extractor.name} extraction failed: ${lastError.message}`,
        );
      }
    }

    return {
      status: "failed",
      warnings:
        warnings.length > 0 ? warnings : ["No suitable extractors found"],
      confidence: 0,
    };
  }
}
