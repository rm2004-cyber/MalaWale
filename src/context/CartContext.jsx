import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { cartService } from '../utils/service';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState({});
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

  // Derived state mapping: productId + size -> item details
  useEffect(() => {
    if (!cart || !cart.items) {
      setCartItems({});
      return;
    }
    const map = {};
    cart.items.forEach(item => {
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

  const getCartItem = useCallback((productId, size) => {
    if (!productId) return null;
    const sizeKey = (size || "Standard").toLowerCase();
    return cartItems[`${productId}_${sizeKey}`] || null;
  }, [cartItems]);

  const addToCart = async (productId, size, quantity = 1) => { // variantId -> size
    try {
      // Backend ko ab 'size' bhejenge
      const response = await cartService.addToCart({ productId, size, quantity });
      if (response.data.success) {
        await fetchCart();
        return { success: true, message: "Item added to cart successfully." };
      }
    } catch (error) {
      console.error("Add To Cart Error:", error.message);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const removeFromCart = async (productId, size) => { // variantId -> size
    try {
      const response = await cartService.removeFromCart({ productId, size });
      if (response.data.success) {
        await fetchCart();
        return { success: true, message: "Item removed from cart." };
      }
    } catch (error) {
      console.error("Remove From Cart Error:", error.message);
      return { success: false, error: error.message };
    }
  };

  const updateQuantity = async (productId, size, quantity) => { // variantId -> size
    try {
      const response = await cartService.updateQuantity({ productId, size, quantity });
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
        item.product?.variants?.find((v) => v.size?.toLowerCase() === item.size?.toLowerCase()) ||
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