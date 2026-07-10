import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "@/components/Header";
import { RecipeCard } from "@/components/RecipeCard";
import { useColors } from "@/hooks/useColors";
import { useFavorites } from "@/context/FavoritesContext";

const RECIPE_IMAGES = [
  require("@/assets/images/recipe-pasta.png"),
  require("@/assets/images/recipe-tacos.png"),
  require("@/assets/images/recipe-curry.png"),
  require("@/assets/images/recipe-salad.png"),
];

export default function FavoritesScreen() {
  const colors = useColors();
  const { savedRecipes } = useFavorites();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <Header title="Saved Recipes" showBack />

      {savedRecipes.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.accent }]}>
            <Feather name="bookmark" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            No saved recipes yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            Tap the heart on any recipe to save it here for later.
          </Text>
          <Pressable
            onPress={() => router.replace("/")}
            style={({ pressed }) => [
              styles.ctaButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Feather name="camera" size={18} color="#FFFFFF" />
            <Text style={styles.ctaButtonText}>Scan Ingredients</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Platform.OS === "web" ? 34 : 24 },
          ]}
        >
          <View style={styles.countRow}>
            <View style={[styles.countBadge, { backgroundColor: colors.accent }]}>
              <Feather name="heart" size={13} color={colors.primary} />
              <Text style={[styles.countText, { color: colors.primary }]}>
                {savedRecipes.length} saved
              </Text>
            </View>
          </View>

          {savedRecipes.map((recipe, i) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              image={RECIPE_IMAGES[i % RECIPE_IMAGES.length]}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 28,
    height: 52,
    borderRadius: 18,
    marginTop: 12,
  },
  ctaButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  list: {
    paddingHorizontal: 24,
    gap: 18,
  },
  countRow: {
    alignItems: "flex-start",
    marginBottom: 4,
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  countText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
