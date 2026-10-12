"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { RentalItem, Order } from "@/lib/types";
import { rentalItems } from "@/data/items";
import { orders as initialOrders } from "@/data/orders";
import { supabase } from "@/lib/supabase";

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

  // Loading state
  loading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// --- DB ↔ App mappers ---

function dbToItem(row: any): RentalItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.description || "",
    specifications: row.specifications || {},
    pricePerDay: row.price_per_day,
    deposit: row.deposit,
    images: row.images || [],
    stock: row.stock,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    featured: row.featured,
    available: row.available,
    bookedDates: row.booked_dates || [],
  };
}

function itemToDb(item: Partial<RentalItem>): Record<string, unknown> {
  const db: any = { ...item };
  if ("pricePerDay" in item) {
    db.price_per_day = item.pricePerDay;
    delete db.pricePerDay;
  }
  if ("reviewCount" in item) {
    db.review_count = item.reviewCount;
    delete db.reviewCount;
  }
  if ("bookedDates" in item) {
    db.booked_dates = item.bookedDates;
    delete db.bookedDates;
  }
  return db;
}

function dbToOrder(row: any): Order {
  return {
    id: row.id,
    code: row.code,
    items: row.items,
    totalPrice: row.total_price,
    totalDeposit: row.total_deposit,
    grandTotal: row.grand_total,
    customer: {
      name: row.customer_name,
      whatsapp: row.customer_whatsapp,
      address: row.customer_address,
      idNumber: row.customer_id_number || undefined,
    },
    deliveryMethod: row.delivery_method,
    paymentMethod: row.payment_method,
    status: row.status,
    createdAt: row.created_at,
    notes: row.notes || undefined,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<RentalItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch items and orders on mount
  useEffect(() => {
    async function fetchData() {
      const [itemsRes, ordersRes] = await Promise.all([
        supabase.from("items").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
      ]);
      
      if (itemsRes.error || !itemsRes.data || itemsRes.data.length === 0) {
        setItems(rentalItems);
      } else {
        setItems(itemsRes.data.map(dbToItem));
      }

      if (ordersRes.error || !ordersRes.data || ordersRes.data.length === 0) {
        setOrders(initialOrders);
      } else {
        setOrders(ordersRes.data.map(dbToOrder));
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  // ---- Items ----

  const toggleItemAvailable = useCallback(async (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (!target) return prev;
      const newVal = !target.available;
      supabase.from("items").update({ available: newVal }).eq("id", id).then();
      return prev.map((item) =>
        item.id === id ? { ...item, available: newVal } : item
      );
    });
  }, []);

  const addItem = useCallback(async (item: RentalItem) => {
    const { error } = await supabase.from("items").insert(itemToDb(item));
    if (!error) setItems((prev) => [item, ...prev]);
  }, []);

  const updateItem = useCallback(
    async (id: string, data: Partial<RentalItem>) => {
      const { error } = await supabase
        .from("items")
        .update(itemToDb(data))
        .eq("id", id);
      if (!error) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...data } : item))
        );
      }
    },
    []
  );

  const deleteItem = useCallback(async (id: string) => {
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (!error) setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // ---- Orders ----

  const addOrder = useCallback(async (order: Order) => {
    const { error } = await supabase.from("orders").insert({
      code: order.code,
      user_id: (order as any).userId || null,
      items: order.items,
      total_price: order.totalPrice,
      total_deposit: order.totalDeposit,
      grand_total: order.grandTotal,
      customer_name: order.customer.name,
      customer_whatsapp: order.customer.whatsapp,
      customer_address: order.customer.address,
      customer_id_number: order.customer.idNumber || null,
      delivery_method: order.deliveryMethod,
      payment_method: order.paymentMethod,
      status: order.status,
      notes: order.notes || null,
    });
    if (!error) setOrders((prev) => [order, ...prev]);
  }, []);

  const updateOrderStatus = useCallback(
    async (id: string, status: Order["status"]) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);
      if (!error) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === id ? { ...order, status } : order
          )
        );
      }
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
        loading,
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
