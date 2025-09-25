declare module "recipe-scraper" {
  interface Recipe {
    name: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    tags: string[];
    time: {
      prep: string;
      cook: string;
      active: string;
      inactive: string;
      ready: string;
      total: string;
    };
    servings: string;
    image: string;
  }

  export default function recipeScraper(url: string): Promise<Recipe>;
}
