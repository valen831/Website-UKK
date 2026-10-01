import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getItemBySlug, rentalItems } from "@/data/items";
import { ItemDetailClient } from "./ItemDetailClient";

export async function generateStaticParams() {
  return rentalItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getItemBySlug(slug);
  if (!item) return { title: "Barang Tidak Ditemukan" };

  return {
    title: `Sewa ${item.name}`,
    description: item.description.slice(0, 155),
  };
}

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getItemBySlug(slug);

  if (!item) {
    notFound();
  }

  return <ItemDetailClient item={item} />;
}
