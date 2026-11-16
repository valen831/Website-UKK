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
        { 
          value: (
            <span className="inline-flex items-center gap-1">
              4.8{" "}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-yellow-400 inline">
                <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
              </svg>
            </span>
          ), 
          label: "Rating" 
        },
      ].map((stat) => (
        <div key={stat.label}>
          <div className="text-2xl font-bold text-white flex items-center justify-center">{stat.value}</div>
          <div className="text-sm text-gray-400">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
