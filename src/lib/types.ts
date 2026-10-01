// ==========================================
// Types untuk Aplikasi Persewaan Barang
// ==========================================

export interface RentalItem {
  id: string;
  slug: string;
  name: string;
  category: Category;
  description: string;
  specifications: Record<string, string>;
  pricePerDay: number;
  deposit: number;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  available: boolean;
  bookedDates: string[]; // ISO date strings "YYYY-MM-DD"
}

export type Category =
  | "kamera"
  | "camping"
  | "proyektor"
  | "pesta"
  | "elektronik"
  | "olahraga"
  | "musik"
  | "lainnya";

export const CATEGORY_LABELS: Record<Category, string> = {
  kamera: "Kamera & Fotografi",
  camping: "Alat Camping",
  proyektor: "Proyektor",
  pesta: "Perlengkapan Pesta",
  elektronik: "Elektronik",
  olahraga: "Olahraga",
  musik: "Alat Musik",
  lainnya: "Lainnya",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  kamera: "📷",
  camping: "⛺",
  proyektor: "📽️",
  pesta: "🎉",
  elektronik: "💻",
  olahraga: "⚽",
  musik: "🎸",
  lainnya: "📦",
};

export interface CartItem {
  item: RentalItem;
  startDate: string;
  endDate: string;
  days: number;
  subtotal: number;
  deposit: number;
}

export type PaymentMethod =
  | "transfer_bca"
  | "transfer_bri"
  | "transfer_mandiri"
  | "transfer_bni"
  | "ewallet_dana"
  | "ewallet_ovo"
  | "ewallet_gopay"
  | "ewallet_shopeepay"
  | "cod";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  transfer_bca: "Transfer BCA",
  transfer_bri: "Transfer BRI",
  transfer_mandiri: "Transfer Mandiri",
  transfer_bni: "Transfer BNI",
  ewallet_dana: "DANA",
  ewallet_ovo: "OVO",
  ewallet_gopay: "GoPay",
  ewallet_shopeepay: "ShopeePay",
  cod: "Bayar di Tempat (COD)",
};

export const PAYMENT_METHOD_ICONS: Record<PaymentMethod, string> = {
  transfer_bca: "🏦",
  transfer_bri: "🏦",
  transfer_mandiri: "🏦",
  transfer_bni: "🏦",
  ewallet_dana: "💙",
  ewallet_ovo: "💜",
  ewallet_gopay: "💚",
  ewallet_shopeepay: "🧡",
  cod: "💵",
};

export type PaymentCategory = "transfer" | "ewallet" | "cod";

export const PAYMENT_CATEGORIES: {
  key: PaymentCategory;
  label: string;
  methods: PaymentMethod[];
}[] = [
  {
    key: "transfer",
    label: "Transfer Bank",
    methods: ["transfer_bca", "transfer_bri", "transfer_mandiri", "transfer_bni"],
  },
  {
    key: "ewallet",
    label: "E-Wallet",
    methods: ["ewallet_dana", "ewallet_ovo", "ewallet_gopay", "ewallet_shopeepay"],
  },
  {
    key: "cod",
    label: "Bayar di Tempat",
    methods: ["cod"],
  },
];

export interface Order {
  id: string;
  code: string;
  items: CartItem[];
  totalPrice: number;
  totalDeposit: number;
  grandTotal: number;
  customer: CustomerInfo;
  deliveryMethod: "pickup" | "delivery";
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  notes?: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "active"
  | "returned"
  | "completed"
  | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Menunggu Konfirmasi",
  confirmed: "Dikonfirmasi",
  active: "Sedang Disewa",
  returned: "Dikembalikan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  returned: "bg-purple-100 text-purple-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export interface CustomerInfo {
  name: string;
  whatsapp: string;
  address: string;
  idNumber?: string;
}

export type SortOption = "newest" | "price-low" | "price-high" | "popular";
