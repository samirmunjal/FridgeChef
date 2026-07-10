import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export function Header({
  title,
  showBack = false,
  rightElement,
}: {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: topPadding + 12,
          backgroundColor: colors.background,
        },
      ]}
    >
      <Pressable
        onPress={() => (showBack ? router.back() : router.push("/settings"))}
        hitSlop={8}
        style={({ pressed }) => [
          styles.iconButton,
          { backgroundColor: colors.accent, opacity: pressed ? 0.7 : 1 },
        ]}
        testID="header-back-button"
      >
        <Feather
          name={showBack ? "chevron-left" : "settings"}
          size={20}
          color={colors.accentForeground}
        />
      </Pressable>

      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>

      {rightElement ? (
        <View style={styles.rightSlot}>{rightElement}</View>
      ) : (
        <View style={styles.iconButton} />
      )}
    </View>
  );
}

export function FavoritesHeaderButton() {
  const colors = useColors();
  return (
    <Pressable
      onPress={() => router.push("/favorites")}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: colors.accent, opacity: pressed ? 0.7 : 1 },
      ]}
      testID="favorites-header-button"
    >
      <Feather name="bookmark" size={20} color={colors.accentForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  rightSlot: {
    alignItems: "flex-end",
  },
});
