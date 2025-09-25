import type { Href } from "expo-router";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
// import { useQuery } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import {
  ChefHat,
  Clock,
  Heart,
  LucideIcon,
  Plus,
  Search,
  Star,
  TrendingUp,
  Users,
} from "lucide-react-native";

import { Recipe } from "@cuisinons/api/types";

import { trpc } from "~/utils/api";
import SignOutButton from "../components/SignOutButton";

export default function Page() {
  const router = useRouter();
  const { user, isSignedIn } = useUser();

  const recipeQuery = useQuery({
    ...trpc.recipe.getAll.queryOptions(),
    enabled: isSignedIn,
  });

  const quickActions: {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    link: Href;
    className: string;
  }[] = [
    {
      title: "Add Recipe",
      subtitle: "Create new recipe",
      icon: Plus,
      link: "/(home)/recipes/create",
      className: "bg-rose-500",
    },
    {
      title: "Browse",
      subtitle: "Explore recipes",
      icon: Search,
      link: "/recipes",
      className: "bg-indigo-500",
    },
    {
      title: "Recent",
      subtitle: "Latest recipes",
      icon: Clock,
      link: "/recipes/recent",
      className: "bg-emerald-500",
    },
    {
      title: "Favorites",
      subtitle: "Saved recipes",
      icon: Heart,
      link: "/recipes/favorites",
      className: "bg-orange-500",
    },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-zinc-900">
      <SignedIn>
        {/* Header Section */}
        <View className="px-6 pb-6 pt-12">
          <Text className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">
            {/*Welcome back, {user?.firstName || "Chef"}! 👋*/}
          </Text>
          <Text className="text-lg text-zinc-600 dark:text-zinc-300">
            Ready to create something delicious?
          </Text>
        </View>

        {/* Stats Section */}
        {recipeQuery.data && recipeQuery.data.length > 0 && (
          <View className="mx-6 mb-8 rounded-2xl bg-blue-700 p-6 shadow-lg">
            <View className="mb-4 flex-row items-center">
              <TrendingUp size={24} color="white" />
              <Text className="ml-2 text-xl font-bold text-white">
                Your Kitchen Stats
              </Text>
            </View>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-3xl font-bold text-white">
                  {recipeQuery.data.length}
                </Text>
                <Text className="text-sm text-white/90">Total Recipes</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-white">
                  {recipeQuery.data.filter((r) => r.totalTime).length}
                </Text>
                <Text className="text-sm text-white/90">With Timing</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-white">
                  {recipeQuery.data.filter((r) => r.description).length}
                </Text>
                <Text className="text-sm text-white/90">Detailed</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions Grid */}
        <View className="mb-8 px-6">
          <Text className="mb-4 text-xl font-semibold text-zinc-900 dark:text-white">
            Quick Actions
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {quickActions.map((action, index) => (
              <Link href={action.link} asChild key={index}>
                <Pressable
                  className="mb-4 w-[48%] active:scale-95"
                  style={{ transform: [{ scale: 1 }] }}
                >
                  <View
                    className={`${action.className} rounded-2xl p-5 shadow-lg`}
                  >
                    <action.icon size={28} color="white" className="mb-3" />
                    <Text className="mb-1 text-base font-bold text-white">
                      {action.title}
                    </Text>
                    <Text className="text-sm text-white/90">
                      {action.subtitle}
                    </Text>
                  </View>
                </Pressable>
              </Link>
            ))}
          </View>
        </View>

        {/* Recent Recipes Section */}
        <View className="mb-6 px-6">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <ChefHat
                size={24}
                className="mr-2 text-zinc-700 dark:text-zinc-300"
              />
              <Text className="text-xl font-semibold text-zinc-900 dark:text-white">
                Your Latest Creations
              </Text>
            </View>
            <Link href="/recipes" asChild>
              <Pressable className="flex-row items-center rounded-lg bg-pink-100 px-3 py-1 dark:bg-pink-900/30">
                <Text className="mr-1 font-medium text-pink-600 dark:text-pink-400">
                  View All
                </Text>
                <Search
                  size={14}
                  className="text-pink-600 dark:text-pink-400"
                />
              </Pressable>
            </Link>
          </View>

          {recipeQuery.isLoading && (
            <View className="items-center rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-800">
              <View className="mb-4">
                <ChefHat
                  size={48}
                  className="text-zinc-300 dark:text-zinc-600"
                />
              </View>
              <Text className="text-center text-zinc-600 dark:text-zinc-300">
                Loading your delicious recipes...
              </Text>
            </View>
          )}

          {recipeQuery.error && (
            <View className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm dark:border-red-800 dark:bg-red-900/20">
              <Text className="mb-2 font-semibold text-red-600 dark:text-red-400">
                Oops! Something went wrong 😔
              </Text>
              <Text className="text-sm leading-5 text-red-500 dark:text-red-300">
                {recipeQuery.error.message}
              </Text>
            </View>
          )}

          {recipeQuery.data && recipeQuery.data.length === 0 && (
            <View className="items-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-8 shadow-sm dark:from-zinc-800 dark:to-zinc-800/50">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/30">
                <ChefHat size={32} className="text-pink-500" />
              </View>
              <Text className="mb-2 text-xl font-bold text-zinc-700 dark:text-zinc-300">
                Ready to start cooking?
              </Text>
              <Text className="mb-6 max-w-sm text-center leading-6 text-zinc-500 dark:text-zinc-400">
                Your recipe collection is empty, but that's about to change! Add
                your first recipe and begin your culinary adventure.
              </Text>
              <Pressable
                onPress={() => router.push("/recipes/create")}
                className="flex-row items-center rounded-xl bg-pink-500 px-8 py-4 shadow-lg active:scale-95"
                style={{ transform: [{ scale: 1 }] }}
              >
                <Plus size={20} color="white" />
                <Text className="ml-2 text-lg font-semibold text-white">
                  Add Your First Recipe
                </Text>
              </Pressable>
            </View>
          )}

          {recipeQuery.data && recipeQuery.data.length > 0 && (
            <FlatList
              data={recipeQuery.data.slice(0, 5)}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }: { item: Recipe }) => (
                <Link
                  href={{
                    pathname: "/recipes/[recipeId]",
                    params: { recipeId: item.id },
                  }}
                  className="mr-4 active:scale-95"
                  style={{ transform: [{ scale: 1 }] }}
                  asChild
                >
                  <View className="w-80 overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-zinc-800">
                    {/* Recipe Image Placeholder */}
                    <View className="h-48 items-center justify-center bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200 dark:from-zinc-700 dark:to-zinc-600">
                      {item.stagedFile?.url ? (
                        <Image
                          source={{ uri: item.stagedFile.url }}
                          contentFit="cover"
                          transition={1000}
                          style={{ width: 300, height: 300 }}
                        />
                      ) : (
                        <ChefHat
                          size={48}
                          className="text-orange-600 dark:text-zinc-400"
                        />
                      )}
                    </View>

                    {/* Recipe Content */}
                    <View className="p-5">
                      <Text
                        className="mb-2 text-xl font-bold text-zinc-900 dark:text-white"
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>

                      {item.description && (
                        <Text
                          className="mb-4 leading-5 text-zinc-600 dark:text-zinc-400"
                          numberOfLines={2}
                        >
                          {item.description}
                        </Text>
                      )}

                      {/* Recipe Meta */}
                      <View className="flex-row items-center justify-between">
                        {item.totalTime && (
                          <View className="flex-row items-center rounded-full bg-green-100 px-3 py-1 dark:bg-green-900/30">
                            <Clock
                              size={14}
                              className="mr-1 text-green-600 dark:text-green-400"
                            />
                            <Text className="text-sm font-medium text-green-700 dark:text-green-300">
                              {item.totalTime} min
                            </Text>
                          </View>
                        )}

                        {item.servings && (
                          <View className="flex-row items-center rounded-full bg-blue-100 px-3 py-1 dark:bg-blue-900/30">
                            <Users
                              size={14}
                              className="mr-1 text-blue-600 dark:text-blue-400"
                            />
                            <Text className="text-sm font-medium text-blue-700 dark:text-blue-300">
                              {item.servings} servings what
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </Link>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingLeft: 0 }}
            />
          )}
        </View>

        {/* Profile Section */}
        <View className="px-6 pb-8">
          <View className="rounded-2xl bg-orange-500 p-6 shadow-xl">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="mb-1 text-xl font-bold text-white">
                  Chef{" "}
                  {user?.firstName ||
                    user?.emailAddresses[0]?.emailAddress?.split("@")[0] ||
                    "Anonymous"}
                </Text>
                <Text className="text-sm text-white/90">
                  {/*{user?.emailAddresses[0]?.emailAddress}*/}
                </Text>
              </View>
              <SignOutButton />
            </View>
          </View>
        </View>
      </SignedIn>

      <SignedOut>
        <View className="flex-1 items-center justify-center px-6 py-12">
          <View className="mb-8 h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-500 shadow-xl">
            <ChefHat size={48} color="white" />
          </View>

          <Text className="mb-4 text-center text-4xl font-bold text-zinc-900 dark:text-white">
            Welcome to Cuisinons
          </Text>

          <Text>What is your problem?</Text>

          <Text className="mb-12 max-w-sm text-center text-lg leading-7 text-zinc-600 dark:text-zinc-300">
            Your personal cooking companion. Discover, create, and share amazing
            recipes with friends and family.
          </Text>

          <View className="w-full max-w-sm">
            <Link href="/(auth)/sign-up" asChild>
              <Pressable className="mb-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-5 shadow-lg active:scale-95">
                <Text className="text-center text-lg font-bold text-white">
                  Start Cooking Today
                </Text>
              </Pressable>
            </Link>

            <Link href="/(auth)/sign-in" asChild>
              <Pressable className="rounded-2xl border-2 border-pink-500 px-8 py-5 active:scale-95">
                <Text className="text-center text-lg font-semibold text-pink-500">
                  I Already Have an Account
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </SignedOut>
    </ScrollView>
  );
}
