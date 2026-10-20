import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();
const CART_STORAGE_KEY = "cartItems";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to read cart from storage:", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Templates are digital goods — exactly one of each in the cart (no quantity).
  // Adding an already-present template is a no-op. Re-purchasing a template you
  // already own is always allowed (nothing here blocks it).
  const addItem = (template) => {
    setItems((prev) => {
      if (prev.some((item) => item.templateId === template.templateId)) return prev;
      return [...prev, { ...template, quantity: 1 }];
    });
  };

  const removeItem = (templateId) => {
    setItems((prev) => prev.filter((item) => item.templateId !== templateId));
  };

  const clear = () => setItems([]);

  const count = items.length;
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clear, count, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
