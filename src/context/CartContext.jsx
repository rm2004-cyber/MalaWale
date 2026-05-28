import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { cartService } from '../utils/service';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
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
    } catch (error) {
      console.error("Fetch Cart Error:", error.message);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, variantId, quantity = 1) => {
    try {
      const response = await cartService.addToCart({ productId, variantId, quantity });
      if (response.data.success) {
        await fetchCart();
        return { success: true, message: "Item cart mein jud gaya! 🛒" };
      }
    } catch (error) {
      console.error("Add To Cart Error:", error.message);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const removeFromCart = async (productId, variantId) => {
    try {
      const response = await cartService.removeFromCart({ productId, variantId });
      if (response.data.success) {
        await fetchCart();
        return { success: true, message: "Item cart se saaf! 🗑️" };
      }
    } catch (error) {
      console.error("Remove From Cart Error:", error.message);
      return { success: false, error: error.message };
    }
  };

  const updateQuantity = async (productId, variantId, quantity) => {
    try {
      const response = await cartService.updateQuantity({ productId, variantId, quantity });
      if (response.data.success) {
        await fetchCart();
        return { success: true };
      }
    } catch (error) {
      console.error("Update Quantity Error:", error.message);
      return { success: false, error: error.message };
    }
  };

  const getCartCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

const getCartTotal = () => {
  if (!cart || !cart.items) return 0;
  return cart.items.reduce((total, item) => {
    const variant =
      item.product?.variants?.find((v) => v.size === item.size) ||
      item.product?.variants?.[0];
    const price = variant?.price ?? variant?.mrp ?? 0;
    return total + price * (item.quantity || 1);
  }, 0);
};
const clearCart = async () => {
    try {
      const response = await cartService.clearCart();
      if (response.data.success) {
        setCart(null); 
        return { success: true };
      }
    } catch (error) {
      console.error("Clear Cart Error:", error.message);
      setCart(null); 
      return { success: false };
    }
  };
  return (
    <CartContext.Provider value={{ 
      cart, 
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