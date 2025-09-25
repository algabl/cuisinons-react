import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import RecipeListItem from "~/app/components/recipes/RecipeListItem";
import { trpc } from "~/utils/api";

export default function Page() {
  const recipeQuery = useQuery(trpc.recipe.getAll.queryOptions());
  return (
    <SafeAreaView>
      <FlatList
        data={recipeQuery.data ?? []}
        renderItem={({ item }) => <RecipeListItem recipe={item} />}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
}
