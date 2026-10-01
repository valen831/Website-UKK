"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/barang?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/barang");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center bg-white rounded-2xl p-1.5 max-w-xl mx-auto shadow-lg shadow-black/10"
    >
      <div className="flex items-center gap-3 flex-1 px-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 text-gray-400 shrink-0"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          type="text"
          placeholder="Cari kamera, tenda, proyektor..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-secondary text-sm outline-none placeholder:text-gray-400 py-2"
        />
      </div>
      <button
        type="submit"
        className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors shrink-0"
      >
        Cari
      </button>
    </form>
  );
}
