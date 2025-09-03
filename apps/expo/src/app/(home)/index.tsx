import { FlatList, Pressable, Text, View } from "react-native";
import { Link } from "expo-router";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { trpc } from "~/utils/api";
import SignOutButton from "../components/SignOutButton";

export default function Page() {
  const { user } = useUser();

  const queryClient = useQueryClient();
  const recipeQuery = useQuery(trpc.recipe.getAll.queryOptions());

  return (
    <View>
      <Text>Hello</Text>
      <SignedIn>
        <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
        <FlatList
          data={recipeQuery.data}
          renderItem={({ item }) => (
            <Pressable onPress={() => console.log(item.id)}>
              <Text>{item.name}</Text>
            </Pressable>
          )}
          keyExtractor={(item) => item.id}
        />
        <SignOutButton />
      </SignedIn>
      <SignedOut>
        <Link href="/(auth)/sign-in">
          <Text>Sign in</Text>
        </Link>
        <Link href="/(auth)/sign-up">
          <Text>Sign up</Text>
        </Link>
      </SignedOut>
    </View>
  );
}
