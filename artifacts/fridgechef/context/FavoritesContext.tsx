import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Recipe } from "@workspace/api-client-react";

const STORAGE_KEY = "@fridgechef/favorites";

interface FavoritesState {
  savedRecipes: Recipe[];
  isFavorited: (id: string) => boolean;
  toggleFavorite: (recipe: Recipe) => void;
}

const FavoritesContext = createContext<FavoritesState | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (Array.isArray(parsed)) setSavedRecipes(parsed as Recipe[]);
        }
      })
      .catch(() => {});
  }, []);

  const persist = useCallback((recipes: Recipe[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipes)).catch(() => {});
  }, []);

  const isFavorited = useCallback(
    (id: string) => savedRecipes.some((r) => r.id === id),
    [savedRecipes],
  );

  const toggleFavorite = useCallback(
    (recipe: Recipe) => {
      setSavedRecipes((prev) => {
        const already = prev.some((r) => r.id === recipe.id);
        const next = already ? prev.filter((r) => r.id !== recipe.id) : [recipe, ...prev];
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const value = useMemo<FavoritesState>(
    () => ({ savedRecipes, isFavorited, toggleFavorite }),
    [savedRecipes, isFavorited, toggleFavorite],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesState {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
