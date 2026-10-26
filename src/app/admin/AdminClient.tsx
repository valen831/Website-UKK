"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
  RentalItem,
  CATEGORY_LABELS,
  Category,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  OrderStatus,
  PAYMENT_METHOD_LABELS,
} from "@/lib/types";
import { formatCurrency, formatDate, formatShortDate, cn } from "@/lib/utils";

type Tab = "items" | "orders" | "reports" | "users";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

export function AdminClient() {
  const { user, profile, loading: authLoading } = useAuth();
  const {
    items: itemsList,
    toggleItemAvailable,
    addItem: storeAddItem,
    updateItem,
    deleteItem,
    orders: ordersList,
    updateOrderStatus,
  } = useStore();

  const [tab, setTab] = useState<Tab>("items");
  const [editingItem, setEditingItem] = useState<RentalItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<Category>("kamera");
  const [formPrice, setFormPrice] = useState("");
  const [formDeposit, setFormDeposit] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formImage, setFormImage] = useState("");

  // Reports state
  const [reportFrom, setReportFrom] = useState("");
  const [reportTo, setReportTo] = useState("");
  const [reportStatus, setReportStatus] = useState<string>("all");
  const [printingOrder, setPrintingOrder] = useState<typeof ordersList[number] | null>(null);

  // Users state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Fetch users when tab switches to users
  useEffect(() => {
    if (tab === "users") {
      setUsersLoading(true);
      supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setUsers((data as UserProfile[]) || []);
          setUsersLoading(false);
        });
    }
  }, [tab]);

  // ---- Access control ----
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (profile?.role !== "admin") {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-secondary mb-2">Akses Ditolak</h1>
        <p className="text-gray-500 mb-6">
          Halaman ini hanya untuk administrator.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors text-sm"
        >
          Login sebagai Admin
        </Link>
      </div>
    );
  }

  // ---- Item form helpers ----
  function resetForm() {
    setFormName("");
    setFormCategory("kamera");
    setFormPrice("");
    setFormDeposit("");
    setFormDescription("");
    setFormStock("");
    setFormImage("");
  }

  function openEditForm(item: RentalItem) {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPrice(item.pricePerDay.toString());
    setFormDeposit(item.deposit.toString());
    setFormDescription(item.description);
    setFormStock(item.stock.toString());
    setFormImage(item.images[0] || "");
    setShowAddForm(true);
  }

  function openAddForm() {
    setEditingItem(null);
    resetForm();
    setShowAddForm(true);
  }

  function handleSaveItem(e: React.FormEvent) {
    e.preventDefault();

    const slug = formName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    if (editingItem) {
      updateItem(editingItem.id, {
        name: formName,
        slug,
        category: formCategory,
        pricePerDay: Number(formPrice),
        deposit: Number(formDeposit),
        description: formDescription,
        stock: Number(formStock),
        images: formImage
          ? [formImage, ...editingItem.images.slice(1)]
          : editingItem.images,
      });
    } else {
      const newItem: RentalItem = {
        id: Date.now().toString(),
        slug,
        name: formName,
        category: formCategory,
        description: formDescription,
        specifications: {},
        pricePerDay: Number(formPrice),
        deposit: Number(formDeposit),
        images: formImage
          ? [formImage]
          : ["https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800"],
        stock: Number(formStock) || 1,
        rating: 0,
        reviewCount: 0,
        featured: false,
        available: true,
        bookedDates: [],
      };
      storeAddItem(newItem);
    }

    setShowAddForm(false);
    resetForm();
    setEditingItem(null);
  }

  function handleDeleteItem(id: string) {
    if (confirm("Yakin ingin menghapus barang ini?")) {
      deleteItem(id);
    }
  }

  // ---- Reports computed ----
  const filteredOrders = ordersList.filter((order) => {
    const orderDate = order.createdAt.slice(0, 10);
    if (reportFrom && orderDate < reportFrom) return false;
    if (reportTo && orderDate > reportTo) return false;
    if (reportStatus !== "all" && order.status !== reportStatus) return false;
    return true;
  });

  const reportStats = {
    totalOrders: filteredOrders.length,
    totalRevenue: filteredOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.grandTotal, 0),
    avgPerOrder: 0,
    activeOrders: filteredOrders.filter((o) => o.status === "active").length,
  };
  reportStats.avgPerOrder =
    reportStats.totalOrders > 0
      ? Math.round(reportStats.totalRevenue / reportStats.totalOrders)
      : 0;

  // Category revenue breakdown
  const categoryRevenue: Record<string, number> = {};
  filteredOrders
    .filter((o) => o.status !== "cancelled")
    .forEach((order) => {
      order.items.forEach((ci) => {
        const cat = CATEGORY_LABELS[ci.item.category] || ci.item.category;
        categoryRevenue[cat] = (categoryRevenue[cat] || 0) + ci.subtotal;
      });
    });
  const maxCatRevenue = Math.max(...Object.values(categoryRevenue), 1);

  function handlePrintReport() {
    window.print();
  }

  function handlePrintNota(order: typeof ordersList[number]) {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
      setPrintingOrder(null);
    }, 100);
  }

  // ---- Tabs config ----
  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "items", label: "Barang", count: itemsList.length },
    { key: "orders", label: "Pesanan", count: ordersList.length },
    { key: "reports", label: "Laporan" },
    { key: "users", label: "Pengguna", count: users.length || undefined },
  ];

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          ${printingOrder ? '#print-nota' : '#print-report'} { display: block !important; }
        }
      `}</style>

      {/* Hidden print report */}
      <div id="print-report" style={{ display: "none" }}>
        <div style={{ fontFamily: "Arial, sans-serif", padding: "40px", color: "#000", background: "#fff", maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "32px", borderBottom: "2px solid #f97316", paddingBottom: "16px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#f97316", margin: "0" }}>
              RentaGo
            </h1>
            <p style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
              Laporan Pendapatan
            </p>
            {(reportFrom || reportTo) && (
              <p style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                Periode: {reportFrom || "Awal"} — {reportTo || "Sekarang"}
              </p>
            )}
          </div>

          {/* Summary */}
          <table style={{ width: "100%", marginBottom: "24px", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "8px 12px", border: "1px solid #ddd", fontWeight: "bold", background: "#f9fafb" }}>Total Pesanan</td>
                <td style={{ padding: "8px 12px", border: "1px solid #ddd" }}>{reportStats.totalOrders}</td>
                <td style={{ padding: "8px 12px", border: "1px solid #ddd", fontWeight: "bold", background: "#f9fafb" }}>Total Pendapatan</td>
                <td style={{ padding: "8px 12px", border: "1px solid #ddd" }}>{formatCurrency(reportStats.totalRevenue)}</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 12px", border: "1px solid #ddd", fontWeight: "bold", background: "#f9fafb" }}>Rata-rata / Pesanan</td>
                <td style={{ padding: "8px 12px", border: "1px solid #ddd" }}>{formatCurrency(reportStats.avgPerOrder)}</td>
                <td style={{ padding: "8px 12px", border: "1px solid #ddd", fontWeight: "bold", background: "#f9fafb" }}>Pesanan Aktif</td>
                <td style={{ padding: "8px 12px", border: "1px solid #ddd" }}>{reportStats.activeOrders}</td>
              </tr>
            </tbody>
          </table>

          {/* Orders table */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={{ padding: "8px 10px", border: "1px solid #ddd", textAlign: "left" }}>Kode</th>
                <th style={{ padding: "8px 10px", border: "1px solid #ddd", textAlign: "left" }}>Penyewa</th>
                <th style={{ padding: "8px 10px", border: "1px solid #ddd", textAlign: "right" }}>Total</th>
                <th style={{ padding: "8px 10px", border: "1px solid #ddd", textAlign: "center" }}>Status</th>
                <th style={{ padding: "8px 10px", border: "1px solid #ddd", textAlign: "left" }}>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ padding: "6px 10px", border: "1px solid #ddd", fontFamily: "monospace" }}>{order.code}</td>
                  <td style={{ padding: "6px 10px", border: "1px solid #ddd" }}>{order.customer.name}</td>
                  <td style={{ padding: "6px 10px", border: "1px solid #ddd", textAlign: "right" }}>{formatCurrency(order.grandTotal)}</td>
                  <td style={{ padding: "6px 10px", border: "1px solid #ddd", textAlign: "center" }}>{ORDER_STATUS_LABELS[order.status]}</td>
                  <td style={{ padding: "6px 10px", border: "1px solid #ddd" }}>{formatShortDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "32px", paddingTop: "16px", borderTop: "1px solid #ddd", fontSize: "12px", color: "#999", textAlign: "center" }}>
            Dicetak pada: {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>

      {/* Hidden print nota (per-order invoice) */}
      <div id="print-nota" style={{ display: "none" }}>
        {printingOrder && (
          <div style={{ fontFamily: "Arial, sans-serif", padding: "40px", color: "#000", background: "#fff", maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "24px", borderBottom: "2px solid #f97316", paddingBottom: "16px" }}>
              <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#f97316", margin: "0" }}>
                RentaGo
              </h1>
              <p style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
                Nota Pembelian / Invoice
              </p>
            </div>

            {/* Order info */}
            <table style={{ width: "100%", marginBottom: "20px", fontSize: "13px" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "4px 0", fontWeight: "bold", width: "140px" }}>Kode Pesanan</td>
                  <td style={{ padding: "4px 0" }}>: {printingOrder.code}</td>
                  <td style={{ padding: "4px 0", fontWeight: "bold", width: "140px" }}>Tanggal</td>
                  <td style={{ padding: "4px 0" }}>: {formatShortDate(printingOrder.createdAt)}</td>
                </tr>
                <tr>
                  <td style={{ padding: "4px 0", fontWeight: "bold" }}>Nama Penyewa</td>
                  <td style={{ padding: "4px 0" }}>: {printingOrder.customer.name}</td>
                  <td style={{ padding: "4px 0", fontWeight: "bold" }}>Status</td>
                  <td style={{ padding: "4px 0" }}>: {ORDER_STATUS_LABELS[printingOrder.status]}</td>
                </tr>
                <tr>
                  <td style={{ padding: "4px 0", fontWeight: "bold" }}>No. WhatsApp</td>
                  <td style={{ padding: "4px 0" }}>: {printingOrder.customer.whatsapp}</td>
                  <td style={{ padding: "4px 0", fontWeight: "bold" }}>Pembayaran</td>
                  <td style={{ padding: "4px 0" }}>: {PAYMENT_METHOD_LABELS[printingOrder.paymentMethod]}</td>
                </tr>
                <tr>
                  <td style={{ padding: "4px 0", fontWeight: "bold", verticalAlign: "top" }}>Alamat</td>
                  <td colSpan={3} style={{ padding: "4px 0" }}>: {printingOrder.customer.address}</td>
                </tr>
              </tbody>
            </table>

            {/* Items table */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "16px" }}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={{ padding: "8px 10px", border: "1px solid #ddd", textAlign: "left" }}>No</th>
                  <th style={{ padding: "8px 10px", border: "1px solid #ddd", textAlign: "left" }}>Nama Barang</th>
                  <th style={{ padding: "8px 10px", border: "1px solid #ddd", textAlign: "center" }}>Durasi</th>
                  <th style={{ padding: "8px 10px", border: "1px solid #ddd", textAlign: "right" }}>Harga/Hari</th>
                  <th style={{ padding: "8px 10px", border: "1px solid #ddd", textAlign: "right" }}>Subtotal</th>
                  <th style={{ padding: "8px 10px", border: "1px solid #ddd", textAlign: "right" }}>Deposit</th>
                </tr>
              </thead>
              <tbody>
                {printingOrder.items.map((ci, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: "6px 10px", border: "1px solid #ddd" }}>{idx + 1}</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #ddd" }}>{ci.item.name}</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #ddd", textAlign: "center" }}>{ci.days} hari</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #ddd", textAlign: "right" }}>{formatCurrency(ci.item.pricePerDay)}</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #ddd", textAlign: "right" }}>{formatCurrency(ci.subtotal)}</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #ddd", textAlign: "right" }}>{formatCurrency(ci.deposit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <table style={{ width: "300px", marginLeft: "auto", fontSize: "13px", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "6px 10px", border: "1px solid #ddd", fontWeight: "bold" }}>Total Sewa</td>
                  <td style={{ padding: "6px 10px", border: "1px solid #ddd", textAlign: "right" }}>{formatCurrency(printingOrder.totalPrice)}</td>
                </tr>
                <tr>
                  <td style={{ padding: "6px 10px", border: "1px solid #ddd", fontWeight: "bold" }}>Total Deposit</td>
                  <td style={{ padding: "6px 10px", border: "1px solid #ddd", textAlign: "right" }}>{formatCurrency(printingOrder.totalDeposit)}</td>
                </tr>
                <tr style={{ background: "#fff7ed" }}>
                  <td style={{ padding: "8px 10px", border: "1px solid #ddd", fontWeight: "bold", fontSize: "14px" }}>Grand Total</td>
                  <td style={{ padding: "8px 10px", border: "1px solid #ddd", textAlign: "right", fontWeight: "bold", fontSize: "14px", color: "#f97316" }}>{formatCurrency(printingOrder.grandTotal)}</td>
                </tr>
              </tbody>
            </table>

            {printingOrder.notes && (
              <div style={{ marginTop: "16px", padding: "8px 12px", background: "#f9fafb", borderRadius: "4px", fontSize: "12px" }}>
                <strong>Catatan:</strong> {printingOrder.notes}
              </div>
            )}

            <div style={{ marginTop: "32px", paddingTop: "16px", borderTop: "1px solid #ddd", fontSize: "12px", color: "#999", textAlign: "center" }}>
              * Deposit dikembalikan saat barang dikembalikan dalam kondisi baik.<br />
              Dicetak pada: {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary">
              Admin Panel
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Kelola barang, pesanan, laporan & pengguna
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-8 max-w-md overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap px-3",
                tab === t.key
                  ? "bg-white text-secondary shadow-sm"
                  : "text-gray-500 hover:text-secondary"
              )}
            >
              {t.label}
              {t.count != null && ` (${t.count})`}
            </button>
          ))}
        </div>

        {/* ===================== ITEMS TAB ===================== */}
        {tab === "items" && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={openAddForm}
                className="px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Tambah Barang
              </button>
            </div>

            {/* Add/Edit Form Modal */}
            {showAddForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
                <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-secondary">
                      {editingItem ? "Edit Barang" : "Tambah Barang"}
                    </h2>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingItem(null);
                      }}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleSaveItem} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Barang *
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori *
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) =>
                          setFormCategory(e.target.value as Category)
                        }
                        className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm outline-none focus:border-primary transition-all"
                      >
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Harga/Hari (Rp) *
                        </label>
                        <input
                          type="number"
                          required
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm outline-none focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Deposit (Rp) *
                        </label>
                        <input
                          type="number"
                          required
                          value={formDeposit}
                          onChange={(e) => setFormDeposit(e.target.value)}
                          className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm outline-none focus:border-primary transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stok
                      </label>
                      <input
                        type="number"
                        value={formStock}
                        onChange={(e) => setFormStock(e.target.value)}
                        className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL Gambar
                      </label>
                      <input
                        type="url"
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deskripsi
                      </label>
                      <textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm outline-none focus:border-primary transition-all resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm"
                      >
                        {editingItem ? "Simpan Perubahan" : "Tambah Barang"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false);
                          setEditingItem(null);
                        }}
                        className="px-6 py-2.5 border border-border rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Items Table */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted border-b border-border">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">
                        Barang
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">
                        Kategori
                      </th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-600">
                        Harga/Hari
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">
                        Stok
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600">
                        Status
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {itemsList.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.images[0]}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                            <span className="font-medium text-secondary truncate max-w-[200px]">
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="px-2 py-0.5 bg-accent text-primary text-xs rounded-md capitalize">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(item.pricePerDay)}
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell">
                          {item.stock}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleItemAvailable(item.id)}
                            className={cn(
                              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                              item.available
                                ? "bg-green-500"
                                : "bg-gray-300"
                            )}
                            title={item.available ? "Klik untuk nonaktifkan" : "Klik untuk aktifkan"}
                          >
                            <span
                              className={cn(
                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                                item.available ? "translate-x-6" : "translate-x-1"
                              )}
                            />
                          </button>
                          <span
                            className={cn(
                              "block text-xs font-medium mt-1",
                              item.available
                                ? "text-green-600"
                                : "text-red-500"
                            )}
                          >
                            {item.available ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditForm(item)}
                              className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== ORDERS TAB ===================== */}
        {tab === "orders" && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted border-b border-border">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">
                      Kode
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">
                      Penyewa
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">
                      Pembayaran
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">
                      Total
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">
                      Tanggal
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ordersList.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-medium text-secondary">
                        {order.code}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-secondary font-medium">{order.customer.name}</div>
                        <div className="text-xs text-gray-400">{order.customer.whatsapp}</div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-md">
                          {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-primary">
                        {formatCurrency(order.grandTotal)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value as OrderStatus)
                          }
                          className={cn(
                            "px-2 py-1 rounded-md text-xs font-medium border-0 outline-none cursor-pointer",
                            ORDER_STATUS_COLORS[order.status]
                          )}
                        >
                          {Object.entries(ORDER_STATUS_LABELS).map(
                            ([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            )
                          )}
                        </select>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handlePrintNota(order)}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          title="Cetak Nota"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 12h.008v.008h-.008V12Zm-3 0h.008v.008h-.008V12Z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {ordersList.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-500">Belum ada pesanan</p>
                <p className="text-xs text-gray-400 mt-1">
                  Pesanan akan muncul di sini saat user melakukan checkout
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===================== REPORTS TAB ===================== */}
        {tab === "reports" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-2xl border border-border p-4 sm:p-6">
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dari Tanggal
                  </label>
                  <input
                    type="date"
                    value={reportFrom}
                    onChange={(e) => setReportFrom(e.target.value)}
                    className="px-4 py-2.5 bg-muted border border-border rounded-xl text-sm outline-none focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sampai Tanggal
                  </label>
                  <input
                    type="date"
                    value={reportTo}
                    onChange={(e) => setReportTo(e.target.value)}
                    className="px-4 py-2.5 bg-muted border border-border rounded-xl text-sm outline-none focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={reportStatus}
                    onChange={(e) => setReportStatus(e.target.value)}
                    className="px-4 py-2.5 bg-muted border border-border rounded-xl text-sm outline-none focus:border-primary transition-all"
                  >
                    <option value="all">Semua Status</option>
                    {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrintReport}
                    className="px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 12h.008v.008h-.008V12Zm-3 0h.008v.008h-.008V12Z" />
                    </svg>
                    Cetak PDF
                  </button>
                  <button
                    onClick={handlePrintReport}
                    className="px-4 py-2.5 border border-border text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-border p-4 sm:p-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Pesanan</p>
                <p className="text-2xl font-bold text-secondary mt-1">{reportStats.totalOrders}</p>
              </div>
              <div className="bg-white rounded-2xl border border-border p-4 sm:p-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Pendapatan</p>
                <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(reportStats.totalRevenue)}</p>
              </div>
              <div className="bg-white rounded-2xl border border-border p-4 sm:p-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rata-rata / Pesanan</p>
                <p className="text-2xl font-bold text-secondary mt-1">{formatCurrency(reportStats.avgPerOrder)}</p>
              </div>
              <div className="bg-white rounded-2xl border border-border p-4 sm:p-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pesanan Aktif</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{reportStats.activeOrders}</p>
              </div>
            </div>

            {/* Category Revenue Breakdown */}
            {Object.keys(categoryRevenue).length > 0 && (
              <div className="bg-white rounded-2xl border border-border p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-secondary mb-4">Pendapatan per Kategori</h3>
                <div className="space-y-3">
                  {Object.entries(categoryRevenue)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, revenue]) => (
                      <div key={cat}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-700">{cat}</span>
                          <span className="font-medium text-secondary">{formatCurrency(revenue)}</span>
                        </div>
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${(revenue / maxCatRevenue) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Report Orders Table */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted border-b border-border">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Kode</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Penyewa</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-600">Total</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-secondary">
                          {order.code}
                        </td>
                        <td className="px-4 py-3 text-secondary">
                          {order.customer.name}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-primary">
                          {formatCurrency(order.grandTotal)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={cn(
                              "px-2 py-1 rounded-md text-xs font-medium",
                              ORDER_STATUS_COLORS[order.status]
                            )}
                          >
                            {ORDER_STATUS_LABELS[order.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                          {formatShortDate(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-gray-500">Tidak ada data untuk filter ini</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Coba ubah rentang tanggal atau filter status
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== USERS TAB ===================== */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Total: <span className="font-semibold text-secondary">{users.length}</span> pengguna terdaftar
              </p>
            </div>

            {usersLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted border-b border-border">
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">
                          Pengguna
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">
                          Email
                        </th>
                        <th className="text-center px-4 py-3 font-semibold text-gray-600">
                          Role
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">
                          Bergabung
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {u.avatar_url ? (
                                <img
                                  src={u.avatar_url}
                                  alt={u.name || ""}
                                  className="w-9 h-9 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">
                                  {(u.name || u.email || "?").charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="font-medium text-secondary">
                                {u.name || "—"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                            {u.email || "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={cn(
                                "px-2.5 py-0.5 rounded-md text-xs font-medium",
                                u.role === "admin"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-gray-100 text-gray-600"
                              )}
                            >
                              {u.role === "admin" ? "Admin" : "User"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                            {u.created_at ? formatShortDate(u.created_at) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {users.length === 0 && !usersLoading && (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">👥</div>
                    <p className="text-gray-500">Belum ada pengguna terdaftar</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
