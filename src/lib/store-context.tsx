"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { RentalItem, Order } from "@/lib/types";
import { rentalItems as initialItems } from "@/data/items";
import { orders as initialOrders } from "@/data/orders";

interface StoreContextType {
  // Items
  items: RentalItem[];
  toggleItemAvailable: (id: string) => void;
  addItem: (item: RentalItem) => void;
  updateItem: (id: string, data: Partial<RentalItem>) => void;
  deleteItem: (id: string) => void;

  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  getOrderByCode: (code: string) => Order | undefined;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<RentalItem[]>([...initialItems]);
  const [orders, setOrders] = useState<Order[]>([...initialOrders]);

  // ---- Items ----
  const toggleItemAvailable = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item
      )
    );
  }, []);

  const addItem = useCallback((item: RentalItem) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const updateItem = useCallback((id: string, data: Partial<RentalItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // ---- Orders ----
  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  const updateOrderStatus = useCallback(
    (id: string, status: Order["status"]) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, status } : order
        )
      );
    },
    []
  );

  const getOrderByCode = useCallback(
    (code: string) => {
      return orders.find(
        (o) => o.code.toLowerCase() === code.trim().toLowerCase()
      );
    },
    [orders]
  );

  return (
    <StoreContext.Provider
      value={{
        items,
        toggleItemAvailable,
        addItem,
        updateItem,
        deleteItem,
        orders,
        addOrder,
        updateOrderStatus,
        getOrderByCode,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
