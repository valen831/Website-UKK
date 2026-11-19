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
  refreshItems: () => Promise<void>;

  // Orders
  orders: Order[];
  addOrder: (order: Order) => Promise<boolean>;
  updateOrderStatus: (id: string, status: Order["status"], code?: string) => Promise<boolean>;
  getOrderByCode: (code: string) => Order | undefined;
  refreshOrders: () => Promise<void>;

  // Loading state
  loading: boolean;
  ordersLoading: boolean;
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

const ITEM_DB_FIELDS: Record<string, string> = {
  name: "name",
  category: "category",
  description: "description",
  specifications: "specifications",
  pricePerDay: "price_per_day",
  deposit: "deposit",
  images: "images",
  stock: "stock",
  rating: "rating",
  reviewCount: "review_count",
  featured: "featured",
  available: "available",
  bookedDates: "booked_dates",
  slug: "slug",
};

function itemToDb(item: Partial<RentalItem>): Record<string, unknown> {
  const db: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(item)) {
    if (key === "id") continue;
    const col = ITEM_DB_FIELDS[key];
    if (col) db[col] = value;
  }
  return db;
}

function dbToOrder(row: any): Order {
  return {
    id: row.id,
    code: row.code,
    userId: row.user_id || undefined,
    items: row.items || [],
    totalPrice: row.total_price || 0,
    totalDeposit: row.total_deposit || 0,
    grandTotal: row.grand_total || 0,
    customer: {
      name: row.customer_name || "",
      whatsapp: row.customer_whatsapp || "",
      address: row.customer_address || "",
      idNumber: row.customer_id_number || undefined,
    },
    deliveryMethod: row.delivery_method || "pickup",
    paymentMethod: row.payment_method || "cash",
    status: row.status || "pending",
    createdAt: row.created_at || new Date().toISOString(),
    notes: row.notes || undefined,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<RentalItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const refreshItems = useCallback(async () => {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setItems(data.map(dbToItem));
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data.map(dbToOrder));
    }
    setOrdersLoading(false);
  }, []);

  // Fetch items and orders on mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [itemsRes, ordersRes] = await Promise.all([
        supabase.from("items").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
      ]);
      
      if (itemsRes.error || !itemsRes.data || itemsRes.data.length === 0) {
        // Auto-seed items ke Supabase tanpa id statis agar generate UUID valid
        await supabase.from("items").insert(
          rentalItems.map(({ id: _id, ...rest }) => ({
            ...rest,
            price_per_day: rest.pricePerDay,
            review_count: rest.reviewCount,
            booked_dates: rest.bookedDates,
          }))
        );
        const { data: newItems } = await supabase.from("items").select("*").order("created_at", { ascending: false });
        setItems(newItems && newItems.length > 0 ? newItems.map(dbToItem) : []);
      } else {
        setItems(itemsRes.data.map(dbToItem));
      }

      if (ordersRes.error || !ordersRes.data) {
        setOrders([]);
      } else {
        setOrders(ordersRes.data.map(dbToOrder));
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  // ---- Items ----

  const toggleItemAvailable = useCallback(async (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    const newVal = !target.available;

    const { error } = await supabase.from("items").update({ available: newVal }).eq("id", id);
    if (error) {
      console.error("toggleItemAvailable error:", error.message);
      alert("Gagal mengubah status: " + error.message);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, available: newVal } : item
      )
    );
  }, [items]);

  const addItem = useCallback(async (item: RentalItem) => {
    const { id: _discard, ...rest } = item;
    const dbPayload = itemToDb(rest);
    const { data, error } = await supabase.from("items").insert(dbPayload).select().single();
    if (error) {
      alert("Gagal menambah barang: " + error.message);
      return;
    }
    setItems((prev) => [dbToItem(data), ...prev]);
  }, []);

  const updateItem = useCallback(
    async (id: string, data: Partial<RentalItem>) => {
      const { error } = await supabase
        .from("items")
        .update(itemToDb(data))
        .eq("id", id);
      if (error) {
        alert("Gagal menyimpan perubahan: " + error.message);
        return;
      }
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...data } : item))
      );
    },
    []
  );

  const deleteItem = useCallback(async (id: string) => {
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) {
      alert("Gagal menghapus barang: " + error.message);
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // ---- Orders ----

  const addOrder = useCallback(async (order: Order): Promise<boolean> => {
    const payload = {
      code: order.code,
      user_id: order.userId || null,
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
    };

    const { data, error } = await supabase
      .from("orders")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("addOrder error:", error.message);
      alert("Gagal menyimpan pesanan ke database: " + error.message);
      return false;
    }

    if (data) {
      setOrders((prev) => [dbToOrder(data), ...prev]);
    } else {
      setOrders((prev) => [order, ...prev]);
    }
    return true;
  }, []);

  const updateOrderStatus = useCallback(
    async (id: string, status: Order["status"], code?: string): Promise<boolean> => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      let res;
      if (isUuid) {
        res = await supabase
          .from("orders")
          .update({ status })
          .eq("id", id)
          .select();
      } else if (code) {
        res = await supabase
          .from("orders")
          .update({ status })
          .eq("code", code)
          .select();
      } else {
        res = await supabase
          .from("orders")
          .update({ status })
          .eq("id", id)
          .select();
      }

      // Jika update id menghasilkan 0 baris dan ada code unik, coba fallback update by code
      if ((!res.data || res.data.length === 0) && code && isUuid) {
        res = await supabase
          .from("orders")
          .update({ status })
          .eq("code", code)
          .select();
      }

      if (res.error) {
        console.error("updateOrderStatus error:", res.error.message);
        alert("Gagal mengubah status pesanan: " + res.error.message);
        return false;
      }

      if (!res.data || res.data.length === 0) {
        alert(
          "Gagal mengubah status di Supabase: Tidak ada data yang terubah.\n\n" +
          "Kemungkinan penyebab:\n" +
          "1. Akun Anda belum memiliki role 'admin' di tabel profiles.\n" +
          "2. Policy RLS Supabase untuk UPDATE belum terpasang. Jalankan script fix-orders.sql di Supabase SQL Editor."
        );
        return false;
      }

      const updatedRow = res.data[0];
      const realId = updatedRow.id;

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id || order.code === code
            ? { ...order, id: realId, status }
            : order
        )
      );

      return true;
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
        refreshItems,
        orders,
        addOrder,
        updateOrderStatus,
        getOrderByCode,
        refreshOrders,
        loading,
        ordersLoading,
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
