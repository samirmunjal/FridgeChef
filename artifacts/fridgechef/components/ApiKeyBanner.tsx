import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export function ApiKeyBanner() {
  const colors = useColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.warning + "18", borderColor: colors.warning + "40" },
      ]}
    >
      <Feather name="alert-triangle" size={18} color={colors.warning} />
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          API key needed
        </Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>
          Add your free Google AI key in Settings to scan ingredients and find recipes.
        </Text>
      </View>
      <Pressable
        onPress={() => router.push("/settings")}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.warning, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={[styles.buttonText, { color: colors.warningForeground }]}>
          Settings
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  body: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
