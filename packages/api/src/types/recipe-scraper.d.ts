declare module "recipe-scraper" {
  interface Recipe {
    name: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    tags: string[];
    time: {
      prep?: number;
      cook?: number;
      active?: number;
      inactive?: number;
      ready?: number;
      total?: number;
    };
    servings: number | string;
    image?: string;
  }

  function recipeScraper(url: string): Promise<Recipe>;
  export default recipeScraper;
}
