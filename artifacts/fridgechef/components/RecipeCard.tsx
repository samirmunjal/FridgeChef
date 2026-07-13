import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { LayoutAnimation, Linking, Platform, Pressable, StyleSheet, Text, UIManager, View } from "react-native";
import type { Recipe } from "@workspace/api-client-react";

import { useColors } from "@/hooks/useColors";
import { useFavorites } from "@/context/FavoritesContext";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CUISINE_IMAGES: Record<string, any> = {
  Italian: require("@/assets/images/recipe-pasta.png"),
  Mexican: require("@/assets/images/recipe-tacos.png"),
  Asian: require("@/assets/images/recipe-curry.png"),
  Indian: require("@/assets/images/recipe-curry.png"),
  Mediterranean: require("@/assets/images/recipe-salad.png"),
  American: require("@/assets/images/recipe-salad.png"),
  MiddleEastern: require("@/assets/images/recipe-curry.png"),
};

function getCuisineImage(cuisine?: string) {
  if (!cuisine) return require("@/assets/images/recipe-salad.png");
  const normalized = cuisine.replace(/\s+/g, "").replace(/[-_]/g, "");
  return CUISINE_IMAGES[normalized] || require("@/assets/images/recipe-salad.png");
}

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const colors = useColors();
  const { isFavorited, toggleFavorite } = useFavorites();
  const [expanded, setExpanded] = useState(false);
  const favorited = isFavorited(recipe.id);
  const perfectMatch = recipe.matchPercent >= 100;

  const imageSource = recipe.imageUrl
    ? { uri: recipe.imageUrl }
    : recipe.imageBase64
      ? { uri: `data:image/jpeg;base64,${recipe.imageBase64}` }
      : getCuisineImage(recipe.cuisine);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  const handleFavorite = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleFavorite(recipe);
  };

  return (
    <Pressable
      onPress={toggleExpanded}
      testID={`recipe-card-${recipe.id}`}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: expanded ? colors.primary : colors.border,
        },
      ]}
    >
      <View style={styles.imageWrap}>
        {imageSource ? (
          <Image source={imageSource} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.imageFallback, { backgroundColor: colors.muted }]}>
            <Feather name="image" size={40} color={colors.mutedForeground} />
          </View>
        )}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            handleFavorite();
          }}
          hitSlop={8}
          testID={`favorite-button-${recipe.id}`}
          style={[
            styles.favoriteButton,
            favorited && { backgroundColor: "#FFF0F0" },
          ]}
        >
          <Feather
            name="heart"
            size={18}
            color={favorited ? colors.destructive : colors.mutedForeground}
          />
        </Pressable>
        <View
          style={[
            styles.matchBadge,
            { backgroundColor: perfectMatch ? colors.success : colors.warning },
          ]}
        >
          <Feather
            name={perfectMatch ? "check-circle" : "circle"}
            size={12}
            color="#FFFFFF"
          />
          <Text style={styles.matchBadgeText}>
            {perfectMatch ? "Perfect Match" : `${recipe.matchPercent}% Match`}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>{recipe.title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="clock" size={14} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{recipe.time}</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="award" size={14} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{recipe.difficulty}</Text>
          </View>
        </View>

        {recipe.missingIngredients.length > 0 && (
          <View style={styles.missingRow}>
            <Text style={[styles.missingLabel, { color: colors.mutedForeground }]}>Need:</Text>
            {recipe.missingIngredients.map((tag: string) => (
              <Pressable
                key={tag}
                onPress={(e) => {
                  e.stopPropagation();
                  void Linking.openURL(`https://www.amazon.com/s?k=${encodeURIComponent(tag)}&tag=samirmunjal-20`);
                }}
                hitSlop={4}
                style={[styles.missingTag, { backgroundColor: colors.muted }]}
              >
                <Feather name="external-link" size={10} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.missingTagText, { color: colors.foreground }]}>{tag}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {expanded && (
          <View style={[styles.expandedSection, { borderTopColor: colors.border }]}>
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              {recipe.description}
            </Text>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Ingredients</Text>
              {recipe.ingredients?.map((ing: string) => (
                <View key={ing} style={styles.ingredientRow}>
                  <Feather name="circle" size={6} color={colors.primary} style={styles.bullet} />
                  <Text style={[styles.ingredientText, { color: colors.foreground }]}>{ing}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Instructions</Text>
              {recipe.steps?.map((step: string, i: number) => (
                <View key={i} style={styles.stepRow}>
                  <View style={[styles.stepNumber, { backgroundColor: colors.accent }]}>
                    <Text style={[styles.stepNumberText, { color: colors.primary }]}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.foreground }]}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  imageWrap: {
    height: 180,
    width: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  matchBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  matchBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  content: {
    padding: 18,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  missingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  missingLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  missingTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  missingTagText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  expandedSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 16,
  },
  description: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 2,
  },
  bullet: {
    marginTop: 2,
  },
  ingredientText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  stepText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    flex: 1,
  },
});
