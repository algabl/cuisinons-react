import { Text, View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { trpc } from "~/utils/api";

export default function Page() {
  const id = useLocalSearchParams().recipeId as string;
  const recipe = useQuery(trpc.recipe.getById.queryOptions({ id }));

  return (
    <View>
      <Text>{recipe.data?.name}</Text>
      <Image
        source={{ uri: recipe.data?.stagedFile?.url }}
        contentFit="cover"
        transition={1000}
        style={{ width: 300, height: 300 }}
      />
    </View>
  );
}
