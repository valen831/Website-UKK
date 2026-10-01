"use client";

import { useState } from "react";
import { useStore } from "@/lib/store-context";
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

type Tab = "items" | "orders";

export function AdminClient() {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">
            Admin Panel
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola barang dan pesanan
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 mb-8 max-w-xs">
        <button
          onClick={() => setTab("items")}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all",
            tab === "items"
              ? "bg-white text-secondary shadow-sm"
              : "text-gray-500 hover:text-secondary"
          )}
        >
          Barang ({itemsList.length})
        </button>
        <button
          onClick={() => setTab("orders")}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all",
            tab === "orders"
              ? "bg-white text-secondary shadow-sm"
              : "text-gray-500 hover:text-secondary"
          )}
        >
          Pesanan ({ordersList.length})
        </button>
      </div>

      {/* Items Tab */}
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

      {/* Orders Tab */}
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
    </div>
  );
}
