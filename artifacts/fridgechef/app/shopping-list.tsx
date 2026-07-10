import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "@/components/Header";
import { useColors } from "@/hooks/useColors";
import { useFavorites } from "@/context/FavoritesContext";
import { useShoppingList } from "@/context/ShoppingListContext";

export default function ShoppingListScreen() {
  const colors = useColors();
  const { savedRecipes } = useFavorites();
  const { checkedItems, toggleItem, clearChecked } = useShoppingList();

  const { items, recipeMap } = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const recipe of savedRecipes) {
      for (const ingredient of recipe.missingIngredients) {
        const key = ingredient.toLowerCase();
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(recipe.title);
      }
    }
    const items = [...map.entries()].map(([key, recipes]) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      recipes,
    }));
    items.sort((a, b) => {
      const aChecked = checkedItems.has(a.key);
      const bChecked = checkedItems.has(b.key);
      if (aChecked !== bChecked) return aChecked ? 1 : -1;
      return a.label.localeCompare(b.label);
    });
    return { items, recipeMap: map };
  }, [savedRecipes, checkedItems]);

  const uncheckedCount = items.filter((i) => !checkedItems.has(i.key)).length;
  const hasChecked = checkedItems.size > 0;

  const handleClearChecked = () => {
    Alert.alert(
      "Clear checked items?",
      "This will uncheck all items from your list.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: clearChecked,
        },
      ],
    );
  };

  const handleToggle = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleItem(key);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <Header title="Shopping List" showBack />

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.accent }]}>
            <Feather name="shopping-cart" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Your list is empty
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            Save recipes with missing ingredients and they&apos;ll appear here automatically.
          </Text>
          <Pressable
            onPress={() => router.replace("/favorites")}
            style={({ pressed }) => [
              styles.ctaButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Feather name="heart" size={18} color="#FFFFFF" />
            <Text style={styles.ctaButtonText}>View Saved Recipes</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={[styles.summaryBar, { backgroundColor: colors.accent }]}>
            <View style={styles.summaryLeft}>
              <Feather name="shopping-cart" size={16} color={colors.primary} />
              <Text style={[styles.summaryText, { color: colors.primary }]}>
                {uncheckedCount} item{uncheckedCount === 1 ? "" : "s"} to get
                {hasChecked ? ` · ${checkedItems.size} checked` : ""}
              </Text>
            </View>
            {hasChecked && (
              <Pressable onPress={handleClearChecked} hitSlop={8}>
                <Text style={[styles.clearText, { color: colors.mutedForeground }]}>
                  Clear checked
                </Text>
              </Pressable>
            )}
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.list,
              { paddingBottom: Platform.OS === "web" ? 34 : 24 },
            ]}
          >
            {items.map(({ key, label, recipes }) => {
              const checked = checkedItems.has(key);
              return (
                <Pressable
                  key={key}
                  onPress={() => handleToggle(key)}
                  style={[
                    styles.row,
                    {
                      backgroundColor: colors.card,
                      borderColor: checked ? colors.border : colors.border,
                      opacity: checked ? 0.6 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: checked ? colors.success : colors.border,
                        backgroundColor: checked ? colors.success : "transparent",
                      },
                    ]}
                  >
                    {checked && <Feather name="check" size={13} color="#FFFFFF" />}
                  </View>
                  <View style={styles.rowContent}>
                    <Text
                      style={[
                        styles.itemLabel,
                        { color: colors.foreground },
                        checked && styles.itemLabelChecked,
                      ]}
                    >
                      {label}
                    </Text>
                    <Text style={[styles.itemMeta, { color: colors.mutedForeground }]}>
                      For: {recipes.join(", ")}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => void Linking.openURL(`https://www.amazon.com/s?k=${encodeURIComponent(label)}`)}
                    hitSlop={8}
                    style={styles.shopButton}
                  >
                    <Feather name="shopping-bag" size={16} color={colors.primary} />
                  </Pressable>
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
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
  summaryBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 4,
  },
  summaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  clearText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  list: {
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowContent: { flex: 1 },
  shopButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7ED",
  },
  itemLabel: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    marginBottom: 2,
  },
  itemLabelChecked: {
    textDecorationLine: "line-through",
  },
  itemMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
