import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "@/components/Header";
import { useColors } from "@/hooks/useColors";
import { useApiKey } from "@/context/ApiKeyContext";

export default function SettingsScreen() {
  const colors = useColors();
  const { apiKey, setApiKey, hasKey } = useApiKey();
  const [input, setInput] = useState(apiKey ?? "");
  const [revealed, setRevealed] = useState(false);

  const handleSave = () => {
    const trimmed = input.trim();
    setApiKey(trimmed || null);
    Alert.alert(trimmed ? "API key saved" : "API key removed", trimmed
      ? "Your key will be used for all AI requests."
      : "The app will fall back to its default API key if available.");
  };

  const handleGetKey = () => {
    Linking.openURL("https://aistudio.google.com/app/apikey");
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <Header title="Settings" showBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.heading, { color: colors.foreground }]}>AI API Key</Text>
        <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
          You can use your own free Gemini API key to avoid shared quota limits. Get one from Google AI Studio below.
        </Text>

        <Pressable onPress={handleGetKey} style={styles.getKeyRow}>
          <Feather name="external-link" size={14} color={colors.primary} />
          <Text style={[styles.getKeyText, { color: colors.primary }]}>
            Get a free Gemini API key
          </Text>
        </Pressable>

        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            Your Gemini API Key
          </Text>
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Paste your key here"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!revealed}
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, { color: colors.foreground }]}
            />
            <Pressable onPress={() => setRevealed((p) => !p)} hitSlop={8}>
              <Feather
                name={revealed ? "eye-off" : "eye"}
                size={18}
                color={colors.mutedForeground}
              />
            </Pressable>
          </View>

          {hasKey && (
            <View style={styles.badge}>
              <Feather name="check-circle" size={13} color={colors.success} />
              <Text style={[styles.badgeText, { color: colors.success }]}>Key active</Text>
            </View>
          )}

          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Feather name="key" size={18} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save Key</Text>
          </Pressable>

          {hasKey && (
            <Pressable
              onPress={() => {
                setInput("");
                setApiKey(null);
              }}
              style={styles.removeLink}
            >
              <Text style={[styles.removeText, { color: colors.destructive }]}>
                Remove my key
              </Text>
            </Pressable>
          )}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="info" size={16} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            Your key is stored only on this device and sent directly to Gemini for each request. We never log or share it.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "web" ? 34 : 24,
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
    lineHeight: 22,
  },
  getKeyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    marginBottom: 24,
  },
  getKeyText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  inputSection: {
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 4,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  badgeText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    borderRadius: 18,
    marginTop: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  removeLink: {
    alignItems: "center",
    paddingVertical: 10,
  },
  removeText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 20,
  },
  infoText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
    flex: 1,
  },
});
