import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { useColors } from "@/hooks/useColors";

export function Pill({
  label,
  selected,
  onPress,
  variant = "primary",
  testID,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  variant?: "primary" | "dark";
  testID?: string;
}) {
  const colors = useColors();
  const selectedBg = variant === "dark" ? colors.secondary : colors.primary;
  const selectedFg = variant === "dark" ? colors.secondaryForeground : colors.primaryForeground;

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: selected ? selectedBg : colors.card,
          borderColor: selected ? "transparent" : colors.border,
          borderWidth: selected ? 0 : 1,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: selected ? selectedFg : colors.mutedForeground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
