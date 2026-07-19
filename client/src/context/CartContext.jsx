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

  // template: { templateId, title, image, category, price }
  const addItem = (template, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.templateId === template.templateId);
      if (existing) {
        return prev.map((item) =>
          item.templateId === template.templateId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...template, quantity }];
    });
  };

  const removeItem = (templateId) => {
    setItems((prev) => prev.filter((item) => item.templateId !== templateId));
  };

  const updateQuantity = (templateId, quantity) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.templateId === templateId ? { ...item, quantity } : item
      )
    );
  };

  const clear = () => setItems([]);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clear, count, subtotal }}
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
