import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: Record<string, number>;
  cartCount: number;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  items: CartItem[];
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('mela-cart');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Keep a map of loaded products in memory & localStorage for cart rendering
  const [productMap, setProductMap] = useState<Record<string, Product>>(() => {
    try {
      const stored = localStorage.getItem('mela-product-cache');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mela-cart', JSON.stringify(cart));
    } catch {
      // Ignore localStorage errors (e.g. private mode quota)
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('mela-product-cache', JSON.stringify(productMap));
    } catch {
      // Ignore localStorage errors
    }
  }, [productMap]);

  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setProductMap((prev) => ({ ...prev, [product.id]: product }));
    setCart((prev) => {
      const current = prev[product.id] || 0;
      const maxStock = product.stock ?? 999;
      const next = Math.min(current + quantity, maxStock);
      return { ...prev, [product.id]: next };
    });
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const prod = productMap[productId];
      const maxStock = prod?.stock ?? 999;
      const nextQty = current + delta;
      if (nextQty <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: Math.min(nextQty, maxStock) };
    });
  }, [productMap]);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({});
  }, []);

  const items: CartItem[] = Object.entries(cart)
    .filter(([_, qty]) => qty > 0)
    .map(([productId, quantity]) => ({
      productId,
      quantity,
      product: productMap[productId] || {
        id: productId,
        slug: productId,
        name: 'Handcrafted Item',
        description: null,
        price_inr: 0,
        stock: 10,
        category_id: null,
        artisan_id: null,
        image_url: null,
        featured: false,
        active: true,
      },
    }));

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        items,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
