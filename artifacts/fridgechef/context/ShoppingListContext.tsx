import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "@fridgechef/shopping-checked";

interface ShoppingListState {
  checkedItems: Set<string>;
  toggleItem: (item: string) => void;
  clearChecked: () => void;
}

const ShoppingListContext = createContext<ShoppingListState | null>(null);

export function ShoppingListProvider({ children }: { children: React.ReactNode }) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (Array.isArray(parsed)) setCheckedItems(new Set(parsed as string[]));
        }
      })
      .catch(() => {});
  }, []);

  const persist = useCallback((set: Set<string>) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...set])).catch(() => {});
  }, []);

  const toggleItem = useCallback(
    (item: string) => {
      setCheckedItems((prev) => {
        const next = new Set(prev);
        if (next.has(item)) next.delete(item);
        else next.add(item);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const clearChecked = useCallback(() => {
    setCheckedItems(new Set());
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const value = useMemo<ShoppingListState>(
    () => ({ checkedItems, toggleItem, clearChecked }),
    [checkedItems, toggleItem, clearChecked],
  );

  return <ShoppingListContext.Provider value={value}>{children}</ShoppingListContext.Provider>;
}

export function useShoppingList(): ShoppingListState {
  const ctx = useContext(ShoppingListContext);
  if (!ctx) throw new Error("useShoppingList must be used within ShoppingListProvider");
  return ctx;
}
