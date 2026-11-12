import type { Metadata } from "next";
import { AdminClient } from "./AdminClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Panel admin untuk mengelola barang dan pesanan.",
};

export default function AdminPage() {
  return <AdminClient />;
}
