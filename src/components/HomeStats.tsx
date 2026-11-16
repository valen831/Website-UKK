"use client";

import { useStore } from "@/lib/store-context";

export function HomeStats() {
  const { items } = useStore();
  const itemCount = items.length > 0 ? `${items.length}+` : "10+";

  return (
    <div className="mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto">
      {[
        { value: itemCount, label: "Barang" },
        { value: "2K+", label: "Penyewa" },
        { value: "4.8★", label: "Rating" },
      ].map((stat) => (
        <div key={stat.label}>
          <div className="text-2xl font-bold text-white">{stat.value}</div>
          <div className="text-sm text-gray-400">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
