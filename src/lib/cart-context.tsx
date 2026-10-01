"use client";

import { createContext, useContext, useReducer, ReactNode, useCallback } from "react";
import { CartItem, RentalItem } from "@/lib/types";
import { calculateDays } from "@/lib/utils";

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { item: RentalItem; startDate: string; endDate: string } }
  | { type: "REMOVE_ITEM"; payload: { itemId: string } }
  | { type: "CLEAR_CART" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const { item, startDate, endDate } = action.payload;
      // Remove existing entry for same item
      const filtered = state.items.filter((ci) => ci.item.id !== item.id);
      const days = calculateDays(startDate, endDate);
      const newItem: CartItem = {
        item,
        startDate,
        endDate,
        days,
        subtotal: days * item.pricePerDay,
        deposit: item.deposit,
      };
      return { items: [...filtered, newItem] };
    }
    case "REMOVE_ITEM":
      return {
        items: state.items.filter((ci) => ci.item.id !== action.payload.itemId),
      };
    case "CLEAR_CART":
      return { items: [] };
    default:
      return state;
  }
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: RentalItem, startDate: string, endDate: string) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  totalPrice: number;
  totalDeposit: number;
  grandTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addItem = useCallback(
    (item: RentalItem, startDate: string, endDate: string) => {
      dispatch({ type: "ADD_ITEM", payload: { item, startDate, endDate } });
    },
    []
  );

  const removeItem = useCallback((itemId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { itemId } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const totalPrice = state.items.reduce((sum, ci) => sum + ci.subtotal, 0);
  const totalDeposit = state.items.reduce((sum, ci) => sum + ci.deposit, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        clearCart,
        totalPrice,
        totalDeposit,
        grandTotal: totalPrice + totalDeposit,
        itemCount: state.items.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
