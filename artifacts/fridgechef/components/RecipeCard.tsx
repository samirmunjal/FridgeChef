import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from "react-native";
import type { Recipe } from "@workspace/api-client-react";

import { useColors } from "@/hooks/useColors";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function RecipeCard({ recipe, image }: { recipe: Recipe; image: number }) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const perfectMatch = recipe.matchPercent >= 100;

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
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
        <Image source={image} style={styles.image} contentFit="cover" />
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            setFavorited((prev) => !prev);
          }}
          hitSlop={8}
          testID={`favorite-button-${recipe.id}`}
          style={styles.favoriteButton}
        >
          <Feather
            name="heart"
            size={18}
            color={favorited ? colors.destructive : colors.mutedForeground}
            style={favorited ? styles.favoriteFilled : undefined}
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
              <View key={tag} style={[styles.missingTag, { backgroundColor: colors.muted }]}>
                <Text style={[styles.missingTagText, { color: colors.foreground }]}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {expanded && (
          <View style={[styles.expandedSection, { borderTopColor: colors.border }]}>
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              {recipe.description}
            </Text>
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
  favoriteFilled: {
    opacity: 1,
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
  },
  description: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
});
