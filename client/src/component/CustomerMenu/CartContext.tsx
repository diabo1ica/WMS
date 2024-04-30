import React, { createContext, useContext, useState } from 'react';

interface Item {
    uniqueKey: number;
    pk: number;
    name: string;
    price: number;
    amount: number;
}

interface CartContextType {
  cartItems: Item[];
  addToCart: (item: Item) => void;
  removeFromCart: (itemId: number) => void;
  amountChanges: (item: Item) => void;
  clearCart:()=>void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('error');
  }
  return context;
};

interface CartProps {
    children: React.ReactNode;
}  

const CartProvider: React.FC<CartProps> = ({ children}) => {
  const [cartItems, setCartItems] = useState<Item[]>([]);
  
  const addToCart = (item: Item) => {
    const existingItem = cartItems.findIndex(i => i.pk === item.pk);
    if (existingItem !== -1) {
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingItem].amount += item.amount;
      setCartItems(updatedCartItems);
    } else {
      setCartItems([...cartItems, item]);
    }
  };

  const amountChanges = (item: Item) => {
    const existingItem = cartItems.findIndex(i => i.pk === item.pk);
    if (existingItem !== -1) {
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingItem].amount = item.amount;
      setCartItems(updatedCartItems);
    }
    if (item.amount === 0) {
      removeFromCart(item.pk);
    }
  };

  console.log(cartItems);
  const removeFromCart = (itemId: number) => {
    setCartItems(cartItems.filter((item) => item.pk !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  }

  const contextValue: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    amountChanges,
    clearCart
  };

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

export default CartProvider;