"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  key: string;
  productId: number;
  slug: string;
  name: string;
  values: Record<string, string>;
  price: number;
  qty: number;
  image: string | null;
};

type CartApi = {
  items: CartItem[];
  count: number;
  total: number;
  ready: boolean;
  add: (item: Omit<CartItem, "key" | "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const STORAGE = "mwp-cart";
const CartContext = createContext<CartApi | null>(null);

const keyOf = (productId: number, values: Record<string, string>) =>
  productId + ":" + Object.entries(values).map(([k, v]) => `${k}=${v}`).join("|");

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- восстановление корзины после гидратации
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* корзина просто начнётся пустой */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE, JSON.stringify(items));
    } catch {
      /* приватный режим — корзина живёт до перезагрузки */
    }
  }, [items, ready]);

  const add = useCallback<CartApi["add"]>((item, qty = 1) => {
    const key = keyOf(item.productId, item.values);
    setItems((prev) => {
      const found = prev.find((i) => i.key === key);
      if (found) return prev.map((i) => (i.key === key ? { ...i, ...item, qty: i.qty + qty } : i));
      return [...prev, { ...item, key, qty }];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(999, qty)) } : i)));
  }, []);

  const remove = useCallback((key: string) => setItems((prev) => prev.filter((i) => i.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const api = useMemo<CartApi>(
    () => ({
      items,
      ready,
      count: items.reduce((a, i) => a + i.qty, 0),
      total: items.reduce((a, i) => a + i.qty * i.price, 0),
      add,
      setQty,
      remove,
      clear,
    }),
    [items, ready, add, setQty, remove, clear],
  );

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart вне CartProvider");
  return ctx;
}
