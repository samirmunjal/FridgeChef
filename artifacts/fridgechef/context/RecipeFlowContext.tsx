import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Recipe } from "@workspace/api-client-react";

interface RecipeFlowState {
  photoUri: string | null;
  ingredients: string[];
  cuisines: string[];
  diets: string[];
  recipes: Recipe[];
  setPhotoUri: (uri: string | null) => void;
  setIngredients: (ingredients: string[]) => void;
  addIngredient: (ingredient: string) => void;
  removeIngredient: (ingredient: string) => void;
  toggleCuisine: (cuisine: string) => void;
  toggleDiet: (diet: string) => void;
  setRecipes: (recipes: Recipe[]) => void;
  reset: () => void;
}

const RecipeFlowContext = createContext<RecipeFlowState | null>(null);

export function RecipeFlowProvider({ children }: { children: React.ReactNode }) {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [ingredients, setIngredientsState] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>(["Any"]);
  const [diets, setDiets] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const setIngredients = useCallback((next: string[]) => {
    setIngredientsState(next);
  }, []);

  const addIngredient = useCallback((ingredient: string) => {
    const trimmed = ingredient.trim();
    if (!trimmed) return;
    setIngredientsState((prev) =>
      prev.some((i) => i.toLowerCase() === trimmed.toLowerCase()) ? prev : [...prev, trimmed],
    );
  }, []);

  const removeIngredient = useCallback((ingredient: string) => {
    setIngredientsState((prev) => prev.filter((i) => i !== ingredient));
  }, []);

  const toggleCuisine = useCallback((cuisine: string) => {
    setCuisines((prev) => {
      if (cuisine === "Any") return ["Any"];
      const withoutAny = prev.filter((c) => c !== "Any");
      const next = withoutAny.includes(cuisine)
        ? withoutAny.filter((c) => c !== cuisine)
        : [...withoutAny, cuisine];
      return next.length === 0 ? ["Any"] : next;
    });
  }, []);

  const toggleDiet = useCallback((diet: string) => {
    setDiets((prev) => (prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]));
  }, []);

  const reset = useCallback(() => {
    setPhotoUri(null);
    setIngredientsState([]);
    setCuisines(["Any"]);
    setDiets([]);
    setRecipes([]);
  }, []);

  const value = useMemo<RecipeFlowState>(
    () => ({
      photoUri,
      ingredients,
      cuisines,
      diets,
      recipes,
      setPhotoUri,
      setIngredients,
      addIngredient,
      removeIngredient,
      toggleCuisine,
      toggleDiet,
      setRecipes,
      reset,
    }),
    [photoUri, ingredients, cuisines, diets, recipes, setIngredients, addIngredient, removeIngredient, toggleCuisine, toggleDiet, reset],
  );

  return <RecipeFlowContext.Provider value={value}>{children}</RecipeFlowContext.Provider>;
}

export function useRecipeFlow(): RecipeFlowState {
  const ctx = useContext(RecipeFlowContext);
  if (!ctx) {
    throw new Error("useRecipeFlow must be used within a RecipeFlowProvider");
  }
  return ctx;
}
