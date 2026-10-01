import type { Metadata } from "next";
import { CheckoutClient } from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Selesaikan pesanan sewa barang Anda.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
