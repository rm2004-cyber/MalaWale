import React, { createContext, useContext, useState } from 'react';

interface AppContextType {
  user: any;
  cart: any[];
  favorites: any[];
  addToCart: (product: any, selectedSize: string) => void;
  removeFromCart: (productId: any, size: string) => void;
  toggleFavorite: (product: any) => void;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null); // Auth State
  const [cart, setCart] = useState<any[]>([]);   // Cart State
  const [favorites, setFavorites] = useState<any[]>([]); // Favorites State

  // 1. Add to Cart Logic (With Size)
  const addToCart = (product: any, selectedSize: string) => {
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
  const removeFromCart = (productId: any, size: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.id === productId && item.size === size))
    );
  };

  // 3. Toggle Favorites
  const toggleFavorite = (product: any) => {
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