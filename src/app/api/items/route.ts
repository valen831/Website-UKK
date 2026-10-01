import { rentalItems, getItemBySlug, searchItems, getFeaturedItems } from "@/data/items";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const slug = searchParams.get("slug");

  // Get single item by slug
  if (slug) {
    const item = getItemBySlug(slug);
    if (!item) {
      return Response.json({ error: "Barang tidak ditemukan" }, { status: 404 });
    }
    return Response.json(item);
  }

  // Get featured items
  if (featured === "true") {
    return Response.json(getFeaturedItems());
  }

  // Search items
  if (q) {
    return Response.json(searchItems(q));
  }

  // Filter by category
  if (category) {
    const filtered = rentalItems.filter((item) => item.category === category);
    return Response.json(filtered);
  }

  // Return all
  return Response.json(rentalItems);
}
