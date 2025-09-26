import recipeScraper from "recipe-scraper";

import type {
  ExtractorInput,
  ExtractorResult,
  RecipeExtractor,
} from "../../../types/import";

export class HtmlScraperExtractor implements RecipeExtractor {
  readonly name = "html-scraper";
  readonly priority = 2;

  canHandle(input: ExtractorInput): boolean {
    return !!input.html;
  }

  async extract(input: ExtractorInput): Promise<ExtractorResult> {
    // TODO: Implement HTML scraping logic with jsdom or similar
    const recipe = await recipeScraper(input.url);
    console.log(recipe);
    return {
      status: "failed",
      warnings: ["HTML scraper implementation pending"],
      confidence: 0,
    };
  }
}
