"use client";

import { useState } from "react";
import { orders } from "@/data/orders";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, Order } from "@/lib/types";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

export function OrderStatusClient() {
  const [code, setCode] = useState("");
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const found = orders.find(
      (o) => o.code.toLowerCase() === code.trim().toLowerCase()
    );
    if (found) {
      setSearchedOrder(found);
      setNotFound(false);
    } else {
      setSearchedOrder(null);
      setNotFound(true);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-secondary mb-3">
          Cek Status Pesanan
        </h1>
        <p className="text-gray-500">
          Masukkan kode pesanan untuk melihat status terkini
        </p>
      </div>

      {/* Search form */}
      <form
        onSubmit={handleSearch}
        className="flex gap-3 max-w-md mx-auto mb-10"
      >
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Masukkan kode pesanan (mis: RNT-20261001-001)"
          className="flex-1 px-4 py-3 bg-white border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          required
        />
        <button
          type="submit"
          className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm shrink-0"
        >
          Cek
        </button>
      </form>

      {/* Result */}
      {searchedOrder && (
        <div className="bg-white rounded-2xl border border-border p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Kode Pesanan</p>
              <p className="font-bold text-secondary font-mono text-lg">
                {searchedOrder.code}
              </p>
            </div>
            <span
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold",
                ORDER_STATUS_COLORS[searchedOrder.status]
              )}
            >
              {ORDER_STATUS_LABELS[searchedOrder.status]}
            </span>
          </div>

          {/* Timeline */}
          <div className="mb-6">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200" />
              {(
                ["pending", "confirmed", "active", "returned", "completed"] as const
              ).map((status, i) => {
                const statusOrder = [
                  "pending",
                  "confirmed",
                  "active",
                  "returned",
                  "completed",
                ];
                const currentIndex = statusOrder.indexOf(searchedOrder.status);
                const isActive = i <= currentIndex;
                const isCurrent = status === searchedOrder.status;

                return (
                  <div key={status} className="relative flex flex-col items-center z-10">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2",
                        isActive
                          ? "bg-primary border-primary text-white"
                          : "bg-white border-gray-300 text-gray-400",
                        isCurrent && "ring-4 ring-primary/20"
                      )}
                    >
                      {isActive ? "✓" : i + 1}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] mt-1.5 text-center whitespace-nowrap",
                        isActive ? "text-primary font-medium" : "text-gray-400"
                      )}
                    >
                      {ORDER_STATUS_LABELS[status]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 mb-1">Nama Penyewa</p>
                <p className="font-medium text-secondary">
                  {searchedOrder.customer.name}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Metode</p>
                <p className="font-medium text-secondary capitalize">
                  {searchedOrder.deliveryMethod === "pickup"
                    ? "Ambil di Toko"
                    : "Diantar"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Tanggal Pesan</p>
                <p className="font-medium text-secondary">
                  {formatDate(searchedOrder.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Grand Total</p>
                <p className="font-bold text-primary">
                  {formatCurrency(searchedOrder.grandTotal)}
                </p>
              </div>
            </div>

            {searchedOrder.notes && (
              <div>
                <p className="text-gray-500 mb-1">Catatan</p>
                <p className="font-medium text-secondary">
                  {searchedOrder.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {notFound && (
        <div className="text-center py-8 animate-fade-in">
          <div className="text-5xl mb-4">😕</div>
          <h3 className="font-semibold text-secondary mb-2">
            Pesanan Tidak Ditemukan
          </h3>
          <p className="text-sm text-gray-500">
            Pastikan kode pesanan yang Anda masukkan benar.
            <br />
            Coba: <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">RNT-20261001-001</code>
          </p>
        </div>
      )}
    </div>
  );
}
