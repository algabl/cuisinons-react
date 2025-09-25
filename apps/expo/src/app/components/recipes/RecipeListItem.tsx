import { Pressable, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";

import type { Recipe } from "@cuisinons/api/types";

export default function RecipeListItem({
  recipe,
}: {
  recipe: Partial<Recipe>;
}) {
  if (recipe.id) {
    return (
      <View>
        <Link
          href={{
            pathname: "/(home)/recipes/[recipeId]",
            params: { recipeId: recipe.id },
          }}
          asChild
        >
          <Text className="w-full flex-row items-center justify-between border-b border-gray-200 px-4 py-2">
            {recipe.name} {recipe.description ? "❤️" : ""}
          </Text>
        </Link>
      </View>
    );
  }

  return (
    <View>
      <Text>Not found</Text>
    </View>
  );
}
