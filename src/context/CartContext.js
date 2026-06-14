"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const savedCart = window.localStorage.getItem("pehnawa_cart");
    if (!savedCart) {
      return [];
    }

    try {
      return JSON.parse(savedCart);
    } catch (e) {
      console.error("Error parsing cart storage:", e);
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart = useCallback((product, fitSize = "S", customTailoring = null, colour = null) => {
    setCartItems((prevItems) => {
      const colourKey = colour || "standard";
      const itemKey = `${product.id}-${fitSize}-${colourKey}-${customTailoring ? JSON.stringify(customTailoring) : "standard"}`;
      const existingIndex = prevItems.findIndex((item) => item.key === itemKey);

      let updatedCart;
      if (existingIndex > -1) {
        updatedCart = [...prevItems];
        updatedCart[existingIndex].quantity += 1;
      } else {
        updatedCart = [
          ...prevItems,
          {
            key: itemKey,
            id: product.id,
            title: product.title,
            price: product.price || 0,
            image: product.images?.[0] || "",
            category: product.category,
            size: fitSize,
            colour: colour,
            customTailoring: customTailoring,
            quantity: 1,
          },
        ];
      }
      window.localStorage.setItem("pehnawa_cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
    setCartOpen(true); // Open drawer instantly on add
  }, []);

  const removeFromCart = useCallback((itemKey) => {
    setCartItems((prevItems) => {
      const updatedCart = prevItems.filter((item) => item.key !== itemKey);
      window.localStorage.setItem("pehnawa_cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  }, []);

  const updateQuantity = useCallback((itemKey, delta) => {
    setCartItems((prevItems) => {
      const updatedCart = prevItems
        .map((item) => {
          if (item.key === itemKey) {
            const newQty = item.quantity + delta;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
      window.localStorage.setItem("pehnawa_cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    window.localStorage.setItem("pehnawa_cart", JSON.stringify([]));
  }, []);

  const toggleCart = useCallback(() => setCartOpen((prev) => !prev), []);
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
  const cartCount = useMemo(() => cartItems.reduce((count, item) => count + item.quantity, 0), [cartItems]);

  const contextValue = useMemo(() => ({
    cartItems,
    cartOpen,
    cartTotal,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
  }), [
    cartItems,
    cartOpen,
    cartTotal,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
