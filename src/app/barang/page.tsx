import type { Metadata } from "next";
import { CatalogClient } from "./CatalogClient";

export const metadata: Metadata = {
  title: "Katalog Barang",
  description: "Jelajahi semua barang sewaan — kamera, alat camping, proyektor, perlengkapan pesta, dan lainnya.",
};

export default function CatalogPage() {
  return <CatalogClient />;
}
