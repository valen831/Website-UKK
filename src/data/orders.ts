import { Order } from "@/lib/types";

// Mock orders data — ini bisa diganti dengan database nanti
export const orders: Order[] = [
  {
    id: "1",
    code: "RNT-20261001-001",
    items: [],
    totalPrice: 700000,
    totalDeposit: 1000000,
    grandTotal: 1700000,
    customer: {
      name: "Budi Santoso",
      whatsapp: "6281234567890",
      address: "Jl. Sudirman No. 45, Jakarta Selatan",
    },
    deliveryMethod: "delivery",
    status: "active",
    createdAt: "2026-09-28T10:00:00Z",
    notes: "Tolong diantar sebelum jam 3 sore",
  },
  {
    id: "2",
    code: "RNT-20261001-002",
    items: [],
    totalPrice: 300000,
    totalDeposit: 500000,
    grandTotal: 800000,
    customer: {
      name: "Sari Dewi",
      whatsapp: "6289876543210",
      address: "Jl. Gatot Subroto No. 12, Bandung",
    },
    deliveryMethod: "pickup",
    status: "completed",
    createdAt: "2026-09-25T14:30:00Z",
  },
];
