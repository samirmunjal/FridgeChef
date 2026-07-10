import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useDetectIngredients } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ApiKeyBanner } from "@/components/ApiKeyBanner";
import { FavoritesHeaderButton, Header } from "@/components/Header";
import { useColors } from "@/hooks/useColors";
import { useRecipeFlow } from "@/context/RecipeFlowContext";
import { useApiKey } from "@/context/ApiKeyContext";

export default function CaptureScreen() {
  const colors = useColors();
  const flow = useRecipeFlow();
  const { apiKey, hasKey } = useApiKey();
  const [scanned, setScanned] = useState(flow.ingredients.length > 0);
  const [newIngredient, setNewIngredient] = useState("");
  const detectIngredients = useDetectIngredients();

  const handleScan = async (fromCamera: boolean) => {
    try {
      const permission = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission needed",
          fromCamera
            ? "Camera access is needed to scan your ingredients. You can enable it in your device Settings."
            : "Photo library access is needed to pick a photo. You can enable it in your device Settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => void Linking.openSettings() },
          ],
        );
        return;
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            quality: 0.6,
            base64: true,
            allowsEditing: false,
          })
        : await ImagePicker.launchImageLibraryAsync({
            quality: 0.6,
            base64: true,
            allowsEditing: false,
          });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      flow.setPhotoUri(asset.uri);

      if (!asset.base64) {
        Alert.alert("Something went wrong", "Could not read the photo. Please try again.");
        return;
      }

      const data = await detectIngredients.mutateAsync({
        data: { imageBase64: asset.base64, apiKey: apiKey ?? undefined },
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      flow.setIngredients(data.ingredients);
      setScanned(true);
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e !== null && "response" in e && (e as { response?: { data?: { error?: string } } }).response?.data?.error
          ? (e as { response?: { data?: { error?: string } } }).response!.data!.error!
          : "We couldn't analyze that photo. Please try again.";
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
        Alert.alert("Scan failed", msg, [{ text: "OK" }]);
      }
    }
  };

  const handleAddIngredient = () => {
    if (!newIngredient.trim()) return;
    flow.addIngredient(newIngredient);
    setNewIngredient("");
  };

  const handleRescan = () => {
    flow.setIngredients([]);
    flow.setPhotoUri(null);
    setScanned(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <Header title="FridgeChef" rightElement={<FavoritesHeaderButton />} />

      {!scanned ? (
        <View style={styles.captureContainer}>
          {!hasKey && <ApiKeyBanner />}
          <View style={styles.heroText}>
            <Text style={[styles.heading, { color: colors.foreground }]}>
              What&apos;s in the kitchen?
            </Text>
            <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
              Snap a photo and we&apos;ll figure out what you can cook tonight.
            </Text>
          </View>

          <Pressable
            onPress={() => handleScan(Platform.OS !== "web")}
            disabled={detectIngredients.isPending}
            testID="photo-preview"
            style={[styles.photoFrame, { backgroundColor: colors.muted, borderColor: colors.border }]}
          >
            <Image
              source={flow.photoUri ? { uri: flow.photoUri } : require("@/assets/images/fridge-inside.png")}
              style={styles.photoImage}
              contentFit="cover"
            />
            <View style={styles.photoOverlay} />
            {detectIngredients.isPending ? (
              <View style={styles.scanningOverlay}>
                <ActivityIndicator color="#FFFFFF" size="large" />
                <Text style={styles.scanningText}>Scanning ingredients...</Text>
              </View>
            ) : (
              <View style={styles.scanFrame} />
            )}
          </Pressable>

          <Pressable
            onPress={() => handleScan(Platform.OS !== "web")}
            disabled={detectIngredients.isPending}
            testID="scan-button"
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary, opacity: pressed || detectIngredients.isPending ? 0.85 : 1 },
            ]}
          >
            <Feather name="camera" size={20} color={colors.primaryForeground} />
            <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
              {detectIngredients.isPending ? "Analyzing..." : "Scan Ingredients"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleScan(false)}
            disabled={detectIngredients.isPending}
            style={styles.secondaryLink}
          >
            <Text style={[styles.secondaryLinkText, { color: colors.mutedForeground }]}>
              Choose a photo instead
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          <View style={styles.foundHeader}>
            <View style={[styles.checkCircle, { backgroundColor: "#DCFCE7" }]}>
              <Feather name="check" size={28} color={colors.success} />
            </View>
            <Text style={[styles.heading, { color: colors.foreground }]}>
              Found {flow.ingredients.length} item{flow.ingredients.length === 1 ? "" : "s"}
            </Text>
            <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
              Here&apos;s what we spotted. Add or remove anything we missed.
            </Text>
          </View>

          <View style={styles.chipsWrap}>
            {flow.ingredients.map((item) => (
              <Pressable
                key={item}
                onPress={() => flow.removeIngredient(item)}
                style={[styles.ingredientChip, { backgroundColor: colors.accent }]}
              >
                <Text style={[styles.ingredientChipText, { color: colors.accentForeground }]}>{item}</Text>
                <Feather name="x" size={14} color={colors.accentForeground} />
              </Pressable>
            ))}
          </View>

          <View style={styles.addRow}>
            <TextInput
              value={newIngredient}
              onChangeText={setNewIngredient}
              placeholder="Add an ingredient"
              placeholderTextColor={colors.mutedForeground}
              onSubmitEditing={handleAddIngredient}
              returnKeyType="done"
              testID="add-ingredient-input"
              style={[
                styles.addInput,
                { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground },
              ]}
            />
            <Pressable
              onPress={handleAddIngredient}
              style={[styles.addButton, { backgroundColor: colors.secondary }]}
            >
              <Feather name="plus" size={18} color={colors.secondaryForeground} />
            </Pressable>
          </View>

          <View style={styles.footerActions}>
            <Pressable
              onPress={() => router.push("/preferences")}
              disabled={flow.ingredients.length === 0}
              testID="next-preferences-button"
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed || flow.ingredients.length === 0 ? 0.6 : 1,
                },
              ]}
            >
              <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
                Next: Preferences
              </Text>
              <Feather name="chevron-right" size={20} color={colors.primaryForeground} />
            </Pressable>
            <Pressable onPress={handleRescan} style={styles.rescanButton}>
              <Feather name="refresh-cw" size={16} color={colors.mutedForeground} />
              <Text style={[styles.rescanText, { color: colors.mutedForeground }]}>Rescan</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  captureContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "web" ? 34 : 16,
  },
  heroText: {
    alignItems: "center",
    marginBottom: 20,
  },
  heading: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    lineHeight: 32,
  },
  subheading: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 21,
  },
  photoFrame: {
    flex: 1,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 20,
    position: "relative",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  scanFrame: {
    position: "absolute",
    top: "25%",
    left: "15%",
    right: "15%",
    bottom: "25%",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: 24,
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    gap: 12,
  },
  scanningText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_500Medium",
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
  secondaryLink: {
    alignItems: "center",
    paddingVertical: 14,
  },
  secondaryLinkText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "web" ? 34 : 16,
  },
  foundHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ingredientChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  ingredientChipText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  addRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  addInput: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  footerActions: {
    marginTop: "auto",
    gap: 8,
    paddingTop: 16,
  },
  rescanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
  },
  rescanText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
