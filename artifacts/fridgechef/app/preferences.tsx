import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSuggestRecipes } from "@workspace/api-client-react";
import React from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "@/components/Header";
import { Pill } from "@/components/Pill";
import { useColors } from "@/hooks/useColors";
import { useRecipeFlow } from "@/context/RecipeFlowContext";
import { useApiKey } from "@/context/ApiKeyContext";

const CUISINES = ["Italian", "Mexican", "Asian", "Mediterranean", "American", "Indian", "Middle Eastern", "Any"];
const DIETS = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Low-Carb", "Keto", "Paleo"];

export default function PreferencesScreen() {
  const colors = useColors();
  const flow = useRecipeFlow();
  const { apiKey } = useApiKey();
  const suggestRecipes = useSuggestRecipes();

  const handleFindRecipes = async () => {
    try {
      const data = await suggestRecipes.mutateAsync({
        data: {
          ingredients: flow.ingredients,
          cuisines: flow.cuisines,
          diets: flow.diets,
          apiKey: apiKey ?? undefined,
        },
      });
      flow.setRecipes(data.recipes);
      router.push("/results");
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e !== null && "response" in e && (e as { response?: { data?: { error?: string } } }).response?.data?.error
          ? (e as { response?: { data?: { error?: string } } }).response!.data!.error!
          : "We couldn't generate recipes. Please try again.";
      if (msg.includes("quota")) {
        Alert.alert(
          "Daily quota used up",
          "Your Google AI key hit its free daily limit. It resets every 24 hours, or you can add a different key.",
          [
            { text: "Go to Settings", onPress: () => router.push("/settings") },
            { text: "OK", style: "cancel" },
          ]
        );
      } else if (msg.includes("Invalid API key") || msg.includes("You need a Google AI API key")) {
        Alert.alert(
          "API key needed",
          msg,
          [
            { text: "Go to Settings", onPress: () => router.push("/settings") },
            { text: "Cancel", style: "cancel" },
          ]
        );
      } else {
        Alert.alert("Something went wrong", msg, [{ text: "OK" }]);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <Header title="Preferences" showBack />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.heading, { color: colors.foreground }]}>What are you craving?</Text>
        <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
          Filter recipes by cuisine and dietary needs.
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Cuisine</Text>
          <View style={styles.pillsWrap}>
            {CUISINES.map((c) => (
              <Pill
                key={c}
                label={c}
                selected={flow.cuisines.includes(c)}
                onPress={() => flow.toggleCuisine(c)}
                testID={`cuisine-${c}`}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Feather name="filter" size={16} color={colors.mutedForeground} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Dietary Restrictions</Text>
          </View>
          <View style={styles.pillsWrap}>
            {DIETS.map((d) => (
              <Pill
                key={d}
                label={d}
                variant="dark"
                selected={flow.diets.includes(d)}
                onPress={() => flow.toggleDiet(d)}
                testID={`diet-${d}`}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: Platform.OS === "web" ? 34 : 16 }]}>
        <Pressable
          onPress={handleFindRecipes}
          disabled={suggestRecipes.isPending}
          testID="find-recipes-button"
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: colors.primary, opacity: pressed || suggestRecipes.isPending ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
            {suggestRecipes.isPending ? "Finding recipes..." : "Find Recipes"}
          </Text>
          {!suggestRecipes.isPending && (
            <Feather name="chevron-right" size={20} color={colors.primaryForeground} />
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  heading: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    lineHeight: 32,
  },
  subheading: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 21,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 14,
  },
  pillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    borderRadius: 20,
  },
  primaryButtonText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
});
