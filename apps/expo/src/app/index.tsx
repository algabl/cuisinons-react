// import React, { useState } from "react";
// import {
//   Button,
//   FlatList,
//   Pressable,
//   ScrollView,
//   StatusBar,
//   Text,
//   TextInput,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Link, Stack } from "expo-router";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// import type { RouterOutputs } from "~/utils/api";
// import { trpc } from "~/utils/api";
// import { authClient } from "~/utils/auth";

// function MobileAuth() {
//   const { data: session } = authClient.useSession();

//   return (
//     <>
//       <Text className="pb-2 text-center text-xl font-semibold text-zinc-900">
//         {session?.user.name ? `Hello, ${session.user.name}` : "Not logged in"}
//       </Text>
//       <Button
//         onPress={() =>
//           session
//             ? authClient.signOut()
//             : authClient.signIn.social({
//                 provider: "discord",
//                 callbackURL: "/",
//               })
//         }
//         title={session ? "Sign Out" : "Sign In With Discord"}
//         color={"#5B65E9"}
//       />
//     </>
//   );
// }

// export default function Index() {
//   const queryClient = useQueryClient();
//   const recipeQuery = useQuery(trpc.recipe.getAll.queryOptions());

//   return (
//     <SafeAreaView className="bg-background">
//       {/* Changes page title visible on the header */}
//       <Stack.Screen options={{ title: "Home Page" }} />
// <FlatList
//   data={recipeQuery.data}
//   renderItem={({ item }) => (
//     <Pressable onPress={() => console.log(item.id)}>
//       <Text>{item.name}</Text>
//     </Pressable>
//   )}
//   keyExtractor={(item) => item.id}
// />
//       <View>
//         <Text>Cuisinons Mobile App</Text>
//         <Text>Connected to tRPC API!</Text>
//       </View>
//       <MobileAuth />
//       <StatusBar />
//     </SafeAreaView>
//   );
// }
