import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setBaseUrl } from "@workspace/api-client-react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ApiKeyProvider } from "@/context/ApiKeyContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { RecipeFlowProvider } from "@/context/RecipeFlowContext";
import { ShoppingListProvider } from "@/context/ShoppingListContext";

SplashScreen.preventAutoHideAsync();

if (Platform.OS === "web") {
  setBaseUrl(typeof window !== "undefined" ? window.location.origin : "");
} else {
  setBaseUrl(`https://${process.env["EXPO_PUBLIC_DOMAIN"]}`);
}

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="preferences" />
      <Stack.Screen name="results" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="shopping-list" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  const inner = (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <ApiKeyProvider>
                <FavoritesProvider>
                  <ShoppingListProvider>
                    <RecipeFlowProvider>
                      <RootLayoutNav />
                    </RecipeFlowProvider>
                  </ShoppingListProvider>
                </FavoritesProvider>
              </ApiKeyProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );

  if (Platform.OS === "web") {
    return (
      <View style={styles.webRoot}>
        <View style={styles.webContainer}>{inner}</View>
      </View>
    );
  }

  return inner;
}

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F8F7F4",
  },
  webContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
    overflow: "hidden",
  },
});
