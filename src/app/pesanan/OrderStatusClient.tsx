"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
  OrderStatus,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
} from "@/lib/types";
import { formatCurrency, formatDate, formatShortDate, cn } from "@/lib/utils";

// -- Flat order shape from Supabase --
interface SupabaseOrder {
  id: string;
  code: string;
  items: CartItemJSON[];
  total_price: number;
  total_deposit: number;
  grand_total: number;
  customer_name: string;
  customer_whatsapp: string;
  customer_address: string;
  customer_id_number?: string;
  delivery_method: "pickup" | "delivery";
  payment_method: PaymentMethod;
  status: OrderStatus;
  created_at: string;
  notes?: string;
  user_id?: string;
}

interface CartItemJSON {
  item: {
    id: string;
    name: string;
    images: string[];
    [key: string]: unknown;
  };
  startDate: string;
  endDate: string;
  days: number;
  subtotal: number;
  deposit: number;
}

// -- Status filter tabs (TikTok Shop / Shopee style) --
const STATUS_TABS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Menunggu" },
  { key: "confirmed", label: "Dikonfirmasi" },
  { key: "active", label: "Sedang Disewa" },
  { key: "returned", label: "Dikembalikan" },
  { key: "completed", label: "Selesai" },
  { key: "cancelled", label: "Dibatalkan" },
];

// -- Timeline steps --
const TIMELINE_STEPS: { status: OrderStatus; label: string; icon: string }[] = [
  { status: "pending", label: "Pesanan Dibuat", icon: "📋" },
  { status: "confirmed", label: "Dikonfirmasi", icon: "✅" },
  { status: "active", label: "Sedang Disewa", icon: "📦" },
  { status: "returned", label: "Dikembalikan", icon: "🔄" },
  { status: "completed", label: "Selesai", icon: "🎉" },
];

const STATUS_INDEX: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  active: 2,
  returned: 3,
  completed: 4,
};

// -- Empty state icons per tab --
const EMPTY_ICONS: Record<string, string> = {
  all: "📭",
  pending: "⏳",
  confirmed: "📝",
  active: "📦",
  returned: "🔄",
  completed: "✅",
  cancelled: "❌",
};

export function OrderStatusClient() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<SupabaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Guest code lookup
  const [guestCode, setGuestCode] = useState("");
  const [guestOrder, setGuestOrder] = useState<SupabaseOrder | null>(null);
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  // Fetch orders for logged-in user
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) {
          setError(err.message);
          setOrders([]);
        } else {
          setOrders((data as SupabaseOrder[]) ?? []);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  // Guest code lookup handler
  const handleGuestLookup = useCallback(async () => {
    const code = guestCode.trim();
    if (!code) return;
    setGuestLoading(true);
    setGuestError(null);
    setGuestOrder(null);

    const { data, error: err } = await supabase
      .from("orders")
      .select("*")
      .eq("code", code)
      .single();

    if (err || !data) {
      setGuestError("Pesanan tidak ditemukan. Periksa kembali kode pesanan.");
    } else {
      setGuestOrder(data as SupabaseOrder);
    }
    setGuestLoading(false);
  }, [guestCode]);

  // Filter + search (for logged-in user)
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (activeTab !== "all") {
      result = result.filter((o) => o.status === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((o) => o.code.toLowerCase().includes(q));
    }

    return result;
  }, [orders, activeTab, searchQuery]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    for (const o of orders) {
      counts[o.status] = (counts[o.status] || 0) + 1;
    }
    return counts;
  }, [orders]);

  // Auth still loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Not logged in → guest mode
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50/80">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <h1 className="text-lg font-bold text-secondary">Pesanan Saya</h1>

          {/* Login prompt */}
          <div className="bg-white rounded-2xl border border-border p-6 text-center space-y-3">
            <div className="text-4xl">🔐</div>
            <p className="text-sm text-gray-600">
              Login untuk melihat semua pesanan Anda.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
            >
              Login untuk melihat pesanan
            </Link>
          </div>

          {/* Guest code lookup */}
          <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
            <div className="text-center">
              <p className="text-sm font-semibold text-secondary mb-1">
                Atau cari pesanan dengan kode
              </p>
              <p className="text-xs text-gray-400">
                Masukkan kode pesanan yang Anda terima saat checkout.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={guestCode}
                onChange={(e) => setGuestCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGuestLookup()}
                placeholder="Contoh: ORD-XXXX"
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/30 border border-transparent focus:border-primary/40 transition-all"
              />
              <button
                onClick={handleGuestLookup}
                disabled={guestLoading || !guestCode.trim()}
                className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {guestLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Cari"
                )}
              </button>
            </div>

            {guestError && (
              <p className="text-sm text-red-500 text-center">{guestError}</p>
            )}

            {guestOrder && (
              <div className="pt-2">
                <OrderCard
                  order={guestOrder}
                  expanded={expandedId === guestOrder.id}
                  onToggle={() =>
                    setExpandedId(
                      expandedId === guestOrder.id ? null : guestOrder.id
                    )
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Logged in → full view
  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 pt-4 pb-0">
          <h1 className="text-lg font-bold text-secondary mb-3">Pesanan Saya</h1>

          {/* Search bar */}
          <div className="relative mb-3">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode pesanan..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/30 border border-transparent focus:border-primary/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center text-white text-xs transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Scrollable tabs */}
          <div className="-mx-4 px-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-0 min-w-max">
              {STATUS_TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                const count = tabCounts[tab.key] || 0;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span
                        className={cn(
                          "ml-1 text-xs",
                          isActive ? "text-primary" : "text-gray-400"
                        )}
                      >
                        ({count})
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Order list */}
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="font-semibold text-secondary mb-1 text-base">
              Gagal Memuat Pesanan
            </h3>
            <p className="text-sm text-gray-400 max-w-xs">{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState tab={activeTab} hasSearch={!!searchQuery.trim()} />
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              expanded={expandedId === order.id}
              onToggle={() =>
                setExpandedId(expandedId === order.id ? null : order.id)
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================
// Empty state
// ============================================================
function EmptyState({
  tab,
  hasSearch,
}: {
  tab: OrderStatus | "all";
  hasSearch: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">{hasSearch ? "🔍" : EMPTY_ICONS[tab]}</div>
      <h3 className="font-semibold text-secondary mb-1 text-base">
        {hasSearch ? "Pesanan Tidak Ditemukan" : "Belum Ada Pesanan"}
      </h3>
      <p className="text-sm text-gray-400 max-w-xs">
        {hasSearch
          ? "Coba periksa kembali kode pesanan yang Anda masukkan."
          : tab === "all"
          ? "Pesanan yang Anda buat akan muncul di sini."
          : `Belum ada pesanan dengan status "${STATUS_TABS.find((t) => t.key === tab)?.label}".`}
      </p>
    </div>
  );
}

// ============================================================
// Order card (Shopee-style)
// ============================================================
function OrderCard({
  order,
  expanded,
  onToggle,
}: {
  order: SupabaseOrder;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isCancelled = order.status === "cancelled";

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Card header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono font-semibold text-secondary truncate">
            {order.code}
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-xs text-gray-400 shrink-0">
            {formatShortDate(order.created_at)}
          </span>
        </div>
        <span
          className={cn(
            "px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 ml-2",
            ORDER_STATUS_COLORS[order.status]
          )}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </button>

      {/* Items preview */}
      <div className="px-4 py-3 space-y-3">
        {order.items.map((ci, i) => (
          <div key={`${ci.item.id}-${i}`} className="flex gap-3">
            <img
              src={ci.item.images[0]}
              alt={ci.item.name}
              className="w-16 h-16 object-cover rounded-xl bg-gray-100 shrink-0"
            />
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-sm font-medium text-secondary truncate">
                {ci.item.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatShortDate(ci.startDate)} — {formatShortDate(ci.endDate)}{" "}
                <span className="text-gray-300">·</span> {ci.days} hari
              </p>
              <p className="text-xs font-semibold text-primary mt-1">
                {formatCurrency(ci.subtotal)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Card footer */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <div className="text-xs text-gray-400">
          {order.items.length} barang
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400">Total: </span>
          <span className="text-sm font-bold text-primary">
            {formatCurrency(order.grand_total)}
          </span>
        </div>
      </div>

      {/* Action buttons row */}
      <div className="px-4 pb-3 flex justify-end gap-2">
        <button
          onClick={onToggle}
          className="px-4 py-2 text-xs font-medium rounded-lg border border-primary text-primary hover:bg-primary/5 transition-colors"
        >
          {expanded ? "Tutup Detail" : "Lihat Detail"}
        </button>
        {(order.status === "completed" || order.status === "cancelled") && (
          <a
            href="/barang"
            className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-orange-600 transition-colors"
          >
            Pesan Lagi
          </a>
        )}
      </div>

      {/* Expandable detail */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 animate-fade-in-up">
          {/* Vertical timeline (Shopee-style) */}
          {!isCancelled && (
            <div className="px-4 py-4">
              <p className="text-xs font-semibold text-secondary mb-3 uppercase tracking-wider">
                Status Pesanan
              </p>
              <div className="relative pl-6">
                {TIMELINE_STEPS.map((step, i) => {
                  const currentIdx = STATUS_INDEX[order.status] ?? -1;
                  const isReached = i <= currentIdx;
                  const isCurrent = i === currentIdx;
                  const isLast = i === TIMELINE_STEPS.length - 1;

                  return (
                    <div key={step.status} className="relative pb-5 last:pb-0">
                      {/* Connector line */}
                      {!isLast && (
                        <div
                          className={cn(
                            "absolute left-[-14px] top-5 w-[2px] h-full",
                            isReached && i < currentIdx
                              ? "bg-primary"
                              : "bg-gray-200"
                          )}
                        />
                      )}
                      {/* Dot */}
                      <div
                        className={cn(
                          "absolute left-[-20px] top-0.5 w-[14px] h-[14px] rounded-full border-2 flex items-center justify-center",
                          isReached
                            ? "border-primary bg-primary"
                            : "border-gray-300 bg-white",
                          isCurrent && "ring-4 ring-primary/20"
                        )}
                      >
                        {isReached && (
                          <svg
                            className="w-2 h-2 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      {/* Content */}
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            isReached ? "text-secondary" : "text-gray-400"
                          )}
                        >
                          {step.icon} {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-[11px] text-primary font-medium mt-0.5">
                            Status saat ini
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="px-4 py-4">
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 rounded-xl">
                <span className="text-lg">❌</span>
                <div>
                  <p className="text-sm font-semibold text-red-700">
                    Pesanan Dibatalkan
                  </p>
                  <p className="text-xs text-red-500">
                    Pesanan ini telah dibatalkan.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Customer info */}
          <div className="px-4 pb-4">
            <p className="text-xs font-semibold text-secondary mb-2 uppercase tracking-wider">
              Informasi Penyewa
            </p>
            <div className="bg-white rounded-xl p-3 border border-gray-100 space-y-2">
              <InfoRow label="Nama" value={order.customer_name} />
              <InfoRow label="WhatsApp" value={order.customer_whatsapp} />
              <InfoRow label="Alamat" value={order.customer_address} />
              {order.customer_id_number && (
                <InfoRow label="No. KTP" value={order.customer_id_number} />
              )}
              <InfoRow
                label="Pengambilan"
                value={
                  order.delivery_method === "pickup"
                    ? "Ambil di Toko"
                    : "Diantar"
                }
              />
              <InfoRow
                label="Pembayaran"
                value={PAYMENT_METHOD_LABELS[order.payment_method]}
              />
            </div>
          </div>

          {/* Price breakdown */}
          <div className="px-4 pb-4">
            <p className="text-xs font-semibold text-secondary mb-2 uppercase tracking-wider">
              Rincian Harga
            </p>
            <div className="bg-white rounded-xl p-3 border border-gray-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Sewa</span>
                <span className="font-medium text-secondary">
                  {formatCurrency(order.total_price)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Deposit</span>
                <span className="font-medium text-secondary">
                  {formatCurrency(order.total_deposit)}
                </span>
              </div>
              <div className="h-px bg-gray-100 my-1" />
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-secondary">
                  Grand Total
                </span>
                <span className="font-bold text-primary text-base">
                  {formatCurrency(order.grand_total)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="px-4 pb-4">
              <p className="text-xs font-semibold text-secondary mb-2 uppercase tracking-wider">
                Catatan
              </p>
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            </div>
          )}

          {/* Order date */}
          <div className="px-4 pb-4">
            <p className="text-xs text-gray-400">
              Dipesan pada {formatDate(order.created_at)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Info row helper
// ============================================================
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-medium text-secondary text-right ml-4 break-words min-w-0">
        {value}
      </span>
    </div>
  );
}
