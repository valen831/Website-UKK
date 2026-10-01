"use client";

import { useState } from "react";
import Link from "next/link";
import { RentalItem, CATEGORY_LABELS } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { useStore } from "@/lib/store-context";
import { DateRangePicker } from "@/components/DateRangePicker";
import { PriceSummary } from "@/components/PriceSummary";
import {
  formatCurrency,
  calculateDays,
  hasBookingConflict,
  cn,
} from "@/lib/utils";

interface Props {
  item: RentalItem;
}

export function ItemDetailClient({ item: initialItem }: Props) {
  const { items: storeItems } = useStore();
  // Use store version for real-time updates (e.g., admin toggling availability)
  const item = storeItems.find((i) => i.id === initialItem.id) || initialItem;

  const [selectedImage, setSelectedImage] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();

  const days = startDate && endDate ? calculateDays(startDate, endDate) : 0;
  const hasConflict =
    startDate && endDate
      ? hasBookingConflict(startDate, endDate, item.bookedDates)
      : false;

  function handleAddToCart() {
    if (!startDate || !endDate || hasConflict || !item.available) return;
    addItem(item, startDate, endDate);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  const whatsappText = encodeURIComponent(
    `Halo, saya ingin menyewa ${item.name}${startDate && endDate ? ` dari ${startDate} sampai ${endDate} (${days} hari)` : ""}. Apakah tersedia?`
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <Link href="/barang" className="hover:text-primary transition-colors">
          Katalog
        </Link>
        <span>/</span>
        <span className="text-secondary font-medium truncate">{item.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Gallery */}
        <div>
          {/* Main image */}
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 mb-4">
            <img
              src={item.images[selectedImage]}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {item.images.length > 1 && (
            <div className="flex gap-3">
              {item.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "w-20 h-20 rounded-xl overflow-hidden border-2 transition-all",
                    selectedImage === i
                      ? "border-primary"
                      : "border-transparent hover:border-gray-300"
                  )}
                >
                  <img
                    src={img}
                    alt={`${item.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-accent text-primary text-xs font-medium rounded-lg capitalize">
              {CATEGORY_LABELS[item.category]}
            </span>
            {item.available ? (
              <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-lg">
                ✓ Tersedia
              </span>
            ) : (
              <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-lg">
                ✗ Tidak Tersedia
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-secondary mb-3">
            {item.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-4 h-4 ${i < Math.floor(item.rating) ? "text-yellow-400" : "text-gray-200"}`}
                >
                  <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {item.rating} ({item.reviewCount} ulasan)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-3xl font-bold text-primary">
              {formatCurrency(item.pricePerDay)}
            </span>
            <span className="text-gray-500">/ hari</span>
          </div>

          {/* Not available warning */}
          {!item.available && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              Barang ini sedang tidak tersedia untuk disewa. Silakan hubungi kami atau cek kembali nanti.
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-secondary mb-2">Deskripsi</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Specifications */}
          <div className="mb-6">
            <h3 className="font-semibold text-secondary mb-3">Spesifikasi</h3>
            <div className="bg-muted rounded-xl p-4">
              <div className="space-y-2">
                {Object.entries(item.specifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between text-sm py-1 border-b border-border last:border-0"
                  >
                    <span className="text-gray-500">{key}</span>
                    <span className="font-medium text-secondary text-right max-w-[60%]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Date Picker - only show if available */}
          {item.available && (
            <>
              <div className="mb-6">
                <h3 className="font-semibold text-secondary mb-3">Pilih Tanggal Sewa</h3>
                <DateRangePicker
                  bookedDates={item.bookedDates}
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                />
              </div>

              {/* Date display */}
              {startDate && (
                <div className="mb-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Mulai:</span>
                    <span className="font-medium text-secondary">{startDate}</span>
                  </div>
                  {endDate && (
                    <>
                      <span className="text-gray-300">→</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Selesai:</span>
                        <span className="font-medium text-secondary">{endDate}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-md">
                        {days} hari
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Conflict warning */}
              {hasConflict && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  ⚠️ Beberapa tanggal yang dipilih sudah dipesan. Silakan pilih tanggal lain.
                </div>
              )}

              {/* Price Summary */}
              {days > 0 && !hasConflict && (
                <div className="mb-6">
                  <PriceSummary
                    pricePerDay={item.pricePerDay}
                    days={days}
                    deposit={item.deposit}
                  />
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!startDate || !endDate || hasConflict || !item.available}
              className={cn(
                "flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2",
                addedToCart
                  ? "bg-green-500 text-white"
                  : "bg-primary text-white hover:bg-primary-dark disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              )}
            >
              {addedToCart ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Ditambahkan!
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                  </svg>
                  Sewa Sekarang
                </>
              )}
            </button>

            <a
              href={`https://wa.me/628974467878?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 border border-green-500 text-green-600 rounded-xl font-semibold text-sm hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>

          {addedToCart && (
            <Link
              href="/checkout"
              className="mt-3 block text-center py-2.5 border border-primary text-primary rounded-xl text-sm font-medium hover:bg-primary/5 transition-colors"
            >
              Lanjut ke Checkout →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
