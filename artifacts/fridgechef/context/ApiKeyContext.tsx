import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "@fridgechef/user-api-key";

interface ApiKeyState {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  hasKey: boolean;
}

const ApiKeyContext = createContext<ApiKeyState | null>(null);

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((val) => {
        if (val) setApiKeyState(val);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const setApiKey = useCallback((key: string | null) => {
    setApiKeyState(key);
    if (key) {
      AsyncStorage.setItem(STORAGE_KEY, key).catch(() => {});
    } else {
      AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    }
  }, []);

  const value = useMemo<ApiKeyState>(
    () => ({ apiKey, setApiKey, hasKey: !!apiKey }),
    [apiKey],
  );

  if (!loaded) return null;
  return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>;
}

export function useApiKey(): ApiKeyState {
  const ctx = useContext(ApiKeyContext);
  if (!ctx) throw new Error("useApiKey must be used within ApiKeyProvider");
  return ctx;
}
