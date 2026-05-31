import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { cartService } from '../utils/service';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: any;
  cartItems: Record<string, any>;
  getCartItem: (productId: string, size?: string) => any;
  cartLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, size: string, quantity?: number) => Promise<{ success: boolean; message?: string; error?: any }>;
  removeFromCart: (productId: string, size: string) => Promise<{ success: boolean; message?: string; error?: any }>;
  updateQuantity: (productId: string, size: string, quantity: number) => Promise<{ success: boolean; error?: any } | undefined>;
  clearCart: () => Promise<{ success: boolean } | undefined>;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<any>(null);
  const [cartItems, setCartItems] = useState<Record<string, any>>({});
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setCartLoading(true);
    try {
      const response = await cartService.getCart();
      if (response.data.success) {
        setCart(response.data.cart);
      }
    } catch (error: any) {
      console.error("Fetch Cart Error:", error.message);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Derived state mapping: productId + size -> item details
  useEffect(() => {
    if (!cart || !cart.items) {
      setCartItems({});
      return;
    }
    const map: Record<string, any> = {};
    cart.items.forEach((item: any) => {
      const prodId = typeof item.product === 'object' && item.product !== null 
        ? item.product._id 
        : item.product;
      if (prodId) {
        const sizeKey = (item.size || "Standard").toLowerCase();
        map[`${prodId}_${sizeKey}`] = {
          quantity: item.quantity,
          size: item.size,
          product: item.product,
          _id: item._id
        };
      }
    });
    setCartItems(map);
  }, [cart]);

  const getCartItem = useCallback((productId: string, size?: string) => {
    if (!productId) return null;
    const sizeKey = (size || "Standard").toLowerCase();
    return cartItems[`${productId}_${sizeKey}`] || null;
  }, [cartItems]);

  const addToCart = async (productId: string, size: string, quantity = 1) => {
    try {
      const response = await cartService.addToCart({ productId, size, quantity });
      if (response.data.success) {
        await fetchCart();
        return { success: true, message: "Item added to cart successfully." };
      }
      return { success: false, error: response.data.message };
    } catch (error: any) {
      console.error("Add To Cart Error:", error.message);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const removeFromCart = async (productId: string, size: string) => {
    try {
      const response = await cartService.removeFromCart({ productId, size });
      if (response.data.success) {
        await fetchCart();
        return { success: true, message: "Item removed from cart." };
      }
      return { success: false, error: response.data.message };
    } catch (error: any) {
      console.error("Remove From Cart Error:", error.message);
      return { success: false, error: error.message };
    }
  };

  const updateQuantity = async (productId: string, size: string, quantity: number) => {
    try {
      const response = await cartService.updateQuantity({ productId, size, quantity });
      if (response.data.success) {
        await fetchCart();
        return { success: true };
      }
    } catch (error: any) {
      console.error("Update Quantity Error:", error.message);
      return { success: false, error: error.message };
    }
  };

  const getCartCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total: number, item: any) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total: number, item: any) => {
      const variant =
        item.product?.variants?.find((v: any) => v.size?.toLowerCase() === item.size?.toLowerCase()) ||
        item.product?.variants?.[0];
      
      const price = variant?.price ?? variant?.mrp ?? 0;
      return total + price * (item.quantity || 1);
    }, 0);
  };

  const clearCart = async () => {
    try {
      // Local state is cleared. Backend automatically handles database cart deletion upon order completion.
      setCart(null); 
      return { success: true };
    } catch (error: any) {
      console.error("Clear Cart Error:", error.message);
      setCart(null); 
      return { success: false };
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      cartItems,
      getCartItem,
      cartLoading, 
      fetchCart, 
      addToCart, 
      removeFromCart, 
      updateQuantity,
      clearCart, 
      cartCount: getCartCount(),
      cartTotal: getCartTotal()
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);