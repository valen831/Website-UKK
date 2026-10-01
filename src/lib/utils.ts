import { CartItem } from "@/lib/types";

// ==========================================
// Utility functions
// ==========================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
}

export function generateOrderCode(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `RNT-${dateStr}-${random}`;
}

export function isDateBooked(date: Date, bookedDates: string[]): boolean {
  const dateStr = date.toISOString().slice(0, 10);
  return bookedDates.includes(dateStr);
}

export function getDatesBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function hasBookingConflict(
  startDate: string,
  endDate: string,
  bookedDates: string[]
): boolean {
  const requestedDates = getDatesBetween(startDate, endDate);
  return requestedDates.some((date) => bookedDates.includes(date));
}

export function buildWhatsAppUrl(cart: CartItem[], customerName: string): string {
  const phoneNumber = "6281234567890"; // Ganti dengan nomor WhatsApp pemilik
  const items = cart
    .map(
      (ci) =>
        `• ${ci.item.name} (${ci.days} hari, ${formatCurrency(ci.subtotal)})`
    )
    .join("\n");

  const totalPrice = cart.reduce((sum, ci) => sum + ci.subtotal, 0);
  const totalDeposit = cart.reduce((sum, ci) => sum + ci.deposit, 0);

  const message = encodeURIComponent(
    `Halo, saya ${customerName} ingin menyewa:\n\n${items}\n\nTotal Sewa: ${formatCurrency(totalPrice)}\nTotal Deposit: ${formatCurrency(totalDeposit)}\nGrand Total: ${formatCurrency(totalPrice + totalDeposit)}\n\nMohon konfirmasinya. Terima kasih!`
  );

  return `https://wa.me/${phoneNumber}?text=${message}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
