import { Stack, Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { Hamburger, House } from "lucide-react-native";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Recipes", headerShown: false }}
      />
      <Stack.Screen
        name="[recipeId]"
        options={{
          title: "Recipe",
          // tabBarButton: () => null,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: "Create Recipe",
          // tabBarButton: () => null,
          headerShown: false,
        }}
      />
    </Stack>
  );
}
