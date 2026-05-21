import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Auth State
  const [cart, setCart] = useState([]);   // Cart State
  const [favorites, setFavorites] = useState([]); // Favorites State

  // 1. Add to Cart Logic (With Size)
  const addToCart = (product, selectedSize) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.id === product.id && item.size === selectedSize
      );
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id && item.size === selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, size: selectedSize, quantity: 1 }];
    });
  };

  // 2. Remove from Cart
  const removeFromCart = (productId, size) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.id === productId && item.size === size))
    );
  };

  // 3. Toggle Favorites
  const toggleFavorite = (product) => {
    setFavorites((prevFavs) => {
      const isExist = prevFavs.some((item) => item.id === product.id);
      if (isExist) {
        return prevFavs.filter((item) => item.id !== product.id);
      }
      return [...prevFavs, product];
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        cart,
        favorites,
        addToCart,
        removeFromCart,
        toggleFavorite,
        setUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);