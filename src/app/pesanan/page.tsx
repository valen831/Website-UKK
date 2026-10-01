import type { Metadata } from "next";
import { OrderStatusClient } from "./OrderStatusClient";

export const metadata: Metadata = {
  title: "Cek Status Pesanan",
  description: "Cek status pesanan sewa barang Anda dengan kode pesanan.",
};

export default function OrderStatusPage() {
  return <OrderStatusClient />;
}
