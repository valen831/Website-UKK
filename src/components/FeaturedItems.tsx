"use client";

import { useStore } from "@/lib/store-context";
import { ItemCard } from "@/components/ItemCard";

export function FeaturedItems() {
  const { items } = useStore();
  const featuredItems = items.filter((item) => item.featured && item.available);

  // If no featured available items, show first 6 available items
  const displayItems =
    featuredItems.length > 0
      ? featuredItems
      : items.filter((item) => item.available).slice(0, 6);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayItems.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
