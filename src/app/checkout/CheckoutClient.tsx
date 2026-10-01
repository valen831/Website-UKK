"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useStore } from "@/lib/store-context";
import {
  PaymentMethod,
  PAYMENT_CATEGORIES,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_ICONS,
} from "@/lib/types";
import {
  formatCurrency,
  formatShortDate,
  generateOrderCode,
  buildWhatsAppUrl,
  cn,
} from "@/lib/utils";

export function CheckoutClient() {
  const { items, totalPrice, totalDeposit, grandTotal, removeItem, clearCart } =
    useCart();
  const { addOrder } = useStore();

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [delivery, setDelivery] = useState<"pickup" | "delivery">("pickup");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [notes, setNotes] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0 || !paymentMethod) return;

    const code = generateOrderCode();

    // Save order to global store for real-time access
    addOrder({
      id: Date.now().toString(),
      code,
      items: [...items],
      totalPrice,
      totalDeposit,
      grandTotal,
      customer: {
        name,
        whatsapp,
        address,
      },
      deliveryMethod: delivery,
      paymentMethod: paymentMethod as PaymentMethod,
      status: "pending",
      createdAt: new Date().toISOString(),
      notes: notes || undefined,
    });

    setOrderCode(code);
    setSubmitted(true);
    clearCart();
  }

  // Empty cart
  if (items.length === 0 && !submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h1 className="text-2xl font-bold text-secondary mb-3">
          Keranjang Kosong
        </h1>
        <p className="text-gray-500 mb-8">
          Anda belum menambahkan barang ke keranjang. Jelajahi katalog untuk
          menemukan barang yang Anda butuhkan.
        </p>
        <Link
          href="/barang"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
        >
          Jelajahi Katalog
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    );
  }

  // Order success
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-secondary mb-3">
          Pesanan Berhasil Dibuat! 🎉
        </h1>
        <p className="text-gray-500 mb-2">
          Kode pesanan Anda:
        </p>
        <div className="inline-block px-6 py-3 bg-accent rounded-xl mb-4">
          <span className="text-2xl font-bold text-primary font-mono">
            {orderCode}
          </span>
        </div>
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">Metode Pembayaran:</p>
          <span className="inline-block px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg">
            {PAYMENT_METHOD_LABELS[paymentMethod as PaymentMethod]}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
          Simpan kode pesanan ini untuk mengecek status. Tim kami akan
          menghubungi Anda via WhatsApp untuk konfirmasi.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/pesanan"
            className="px-6 py-3 border border-border text-secondary font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cek Status Pesanan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-secondary mb-8">
        Checkout
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Cart items + Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-secondary mb-4">
                Barang Sewaan ({items.length})
              </h2>
              <div className="space-y-4">
                {items.map((ci) => (
                  <div
                    key={ci.item.id}
                    className="flex gap-4 p-4 bg-muted rounded-xl"
                  >
                    <img
                      src={ci.item.images[0]}
                      alt={ci.item.name}
                      className="w-20 h-20 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-secondary text-sm truncate">
                        {ci.item.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatShortDate(ci.startDate)} — {formatShortDate(ci.endDate)} ({ci.days} hari)
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold text-primary">
                          {formatCurrency(ci.subtotal)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(ci.item.id)}
                          className="text-xs text-red-500 hover:text-red-700 transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Form */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-secondary mb-4">
                Data Penyewa
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat *
                  </label>
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Masukkan alamat lengkap"
                    rows={3}
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                  />
                </div>

                {/* Delivery method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metode Pengambilan
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDelivery("pickup")}
                      className={cn(
                        "p-4 rounded-xl border-2 text-center transition-all",
                        delivery === "pickup"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-gray-300"
                      )}
                    >
                      <div className="text-2xl mb-1">🏪</div>
                      <div className="text-sm font-medium text-secondary">
                        Ambil di Toko
                      </div>
                      <div className="text-xs text-gray-500">Gratis</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDelivery("delivery")}
                      className={cn(
                        "p-4 rounded-xl border-2 text-center transition-all",
                        delivery === "delivery"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-gray-300"
                      )}
                    >
                      <div className="text-2xl mb-1">🚚</div>
                      <div className="text-sm font-medium text-secondary">
                        Diantar
                      </div>
                      <div className="text-xs text-gray-500">
                        Biaya menyesuaikan
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan (opsional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan tambahan..."
                    rows={2}
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-secondary mb-4">
                Metode Pembayaran *
              </h2>
              <div className="space-y-5">
                {PAYMENT_CATEGORIES.map((category) => (
                  <div key={category.key}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {category.label}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {category.methods.map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={cn(
                            "p-3 rounded-xl border-2 text-center transition-all",
                            paymentMethod === method
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                              : "border-border hover:border-gray-300"
                          )}
                        >
                          <div className="text-xl mb-1">
                            {PAYMENT_METHOD_ICONS[method]}
                          </div>
                          <div className="text-xs font-medium text-secondary leading-tight">
                            {PAYMENT_METHOD_LABELS[method]}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {!paymentMethod && (
                <p className="text-xs text-red-500 mt-3">
                  * Pilih metode pembayaran untuk melanjutkan
                </p>
              )}
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-border p-6 lg:sticky lg:top-24 space-y-6">
              <h2 className="font-semibold text-secondary">Ringkasan Pesanan</h2>

              <div className="space-y-3">
                {items.map((ci) => (
                  <div key={ci.item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">
                      {ci.item.name} ({ci.days}h)
                    </span>
                    <span className="font-medium shrink-0">
                      {formatCurrency(ci.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Sewa</span>
                  <span className="font-medium">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Deposit</span>
                  <span className="font-medium">
                    {formatCurrency(totalDeposit)}
                  </span>
                </div>
              </div>

              {paymentMethod && (
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pembayaran</span>
                    <span className="font-medium text-blue-600">
                      {PAYMENT_METHOD_LABELS[paymentMethod as PaymentMethod]}
                    </span>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-secondary">Grand Total</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  *Deposit dikembalikan saat barang dikembalikan.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={!paymentMethod}
                  className={cn(
                    "w-full py-3.5 font-semibold rounded-xl transition-colors text-sm",
                    paymentMethod
                      ? "bg-primary text-white hover:bg-primary-dark"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  Buat Pesanan
                </button>

                <a
                  href={buildWhatsAppUrl(items, name || "Customer")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 border border-green-500 text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                  </svg>
                  Pesan via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
