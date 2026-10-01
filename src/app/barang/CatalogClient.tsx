"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store-context";
import { ItemCard } from "@/components/ItemCard";
import {
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  Category,
  SortOption,
} from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const initialCategory = searchParams.get("kategori") || "";
  const { items: storeItems } = useStore();

  const [search, setSearch] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const categories = Object.entries(CATEGORY_LABELS) as [Category, string][];

  const filteredItems = useMemo(() => {
    let items = [...storeItems];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory) {
      items = items.filter((item) => item.category === selectedCategory);
    }

    // Price filter
    items = items.filter(
      (item) =>
        item.pricePerDay >= priceRange[0] &&
        item.pricePerDay <= priceRange[1]
    );

    // Availability filter
    if (showAvailableOnly) {
      items = items.filter((item) => item.available);
    }

    // Sorting
    switch (sortBy) {
      case "price-low":
        items.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case "price-high":
        items.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case "popular":
        items.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "newest":
        items.sort((a, b) => Number(b.id) - Number(a.id));
        break;
    }

    return items;
  }, [storeItems, search, selectedCategory, sortBy, priceRange, showAvailableOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-secondary mb-2">
          Katalog Barang
        </h1>
        <p className="text-gray-500">
          Temukan barang yang Anda butuhkan dari {storeItems.length} item tersedia
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-border p-5 space-y-6 lg:sticky lg:top-24">
            {/* Search */}
            <div>
              <label className="text-sm font-semibold text-secondary mb-2 block">
                Pencarian
              </label>
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  type="text"
                  placeholder="Cari barang..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-muted border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-semibold text-secondary mb-2 block">
                Kategori
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-xl text-sm transition-colors",
                    !selectedCategory
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  Semua Kategori
                </button>
                {categories.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() =>
                      setSelectedCategory(selectedCategory === key ? "" : key)
                    }
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center gap-2",
                      selectedCategory === key
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <span className="text-base">{CATEGORY_ICONS[key]}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div>
              <label className="text-sm font-semibold text-secondary mb-2 block">
                Harga per Hari
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min={0}
                  max={500000}
                  step={25000}
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Number(e.target.value)])
                  }
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatCurrency(priceRange[0])}</span>
                  <span>{formatCurrency(priceRange[1])}</span>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAvailableOnly}
                  onChange={(e) => setShowAvailableOnly(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded"
                />
                <span className="text-sm text-gray-600">
                  Tersedia saja
                </span>
              </label>
            </div>

            {/* Reset */}
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("");
                setPriceRange([0, 500000]);
                setShowAvailableOnly(false);
                setSortBy("popular");
              }}
              className="w-full py-2.5 border border-border rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-6 bg-white rounded-2xl border border-border p-4">
            <span className="text-sm text-gray-500">
              {filteredItems.length} barang ditemukan
            </span>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 hidden sm:block">
                Urutkan:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm bg-muted border border-border rounded-xl px-3 py-2 outline-none focus:border-primary transition-colors"
              >
                <option value="popular">Terpopuler</option>
                <option value="newest">Terbaru</option>
                <option value="price-low">Harga Terendah</option>
                <option value="price-high">Harga Tertinggi</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-secondary mb-2">
                Barang Tidak Ditemukan
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Coba ubah filter atau kata kunci pencarian Anda
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("");
                  setPriceRange([0, 500000]);
                  setShowAvailableOnly(false);
                }}
                className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CatalogClient() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 bg-gray-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
