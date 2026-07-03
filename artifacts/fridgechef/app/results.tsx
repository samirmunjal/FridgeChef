import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "@/components/Header";
import { RecipeCard } from "@/components/RecipeCard";
import { useColors } from "@/hooks/useColors";
import { useRecipeFlow } from "@/context/RecipeFlowContext";

const RECIPE_IMAGES = [
  require("@/assets/images/recipe-pasta.png"),
  require("@/assets/images/recipe-tacos.png"),
  require("@/assets/images/recipe-curry.png"),
  require("@/assets/images/recipe-salad.png"),
];

export default function ResultsScreen() {
  const colors = useColors();
  const flow = useRecipeFlow();
  const perfectCount = flow.recipes.filter((r) => r.matchPercent >= 100).length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <Header title="Tonight's Menu" showBack />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 34 : 24 },
        ]}
      >
        <View style={[styles.badge, { backgroundColor: "#DCFCE7" }]}>
          <Feather name="zap" size={14} color="#166534" />
          <Text style={styles.badgeText}>Based on your {flow.ingredients.length} ingredients</Text>
        </View>

        <Text style={[styles.heading, { color: colors.foreground }]}>
          {flow.recipes.length === 0
            ? "No recipes found"
            : perfectCount > 0
              ? `We found ${perfectCount} perfect match${perfectCount === 1 ? "" : "es"}`
              : `We found ${flow.recipes.length} recipe${flow.recipes.length === 1 ? "" : "s"} for you`}
        </Text>

        {flow.recipes.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="frown" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Try adjusting your ingredients or preferences.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {flow.recipes.map((recipe, i) => (
              <RecipeCard key={recipe.id} recipe={recipe} image={RECIPE_IMAGES[i % RECIPE_IMAGES.length]} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#166534",
  },
  heading: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    lineHeight: 32,
    marginBottom: 20,
  },
  list: {
    gap: 18,
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
