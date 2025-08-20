import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { TRPCProvider } from "./src/utils/trpc-provider";
import { RecipeList } from "./src/components/RecipeList";

export default function App() {
  return (
    <TRPCProvider>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Cuisinons Mobile App</Text>
          <Text style={styles.subtitle}>Connected to tRPC API!</Text>
          <RecipeList />
        </View>
        <StatusBar style="auto" />
      </ScrollView>
    </TRPCProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
});
