import Link from "next/link";
import { RentalItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface ItemCardProps {
  item: RentalItem;
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Link
      href={`/barang/${item.slug}`}
      className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={item.images[0]}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {item.featured && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary text-white text-xs font-semibold rounded-lg">
            Unggulan
          </span>
        )}
        {!item.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg">
              Tidak Tersedia
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="px-2.5 py-0.5 bg-accent text-primary text-xs font-medium rounded-md capitalize">
            {item.category}
          </span>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            Stok: {item.stock}
          </span>
        </div>

        <h3 className="font-semibold text-secondary text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {item.name}
        </h3>

        <div className="flex items-end justify-between">
          <div>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(item.pricePerDay)}
            </span>
            <span className="text-xs text-gray-400"> /hari</span>
          </div>
          <span className="text-xs text-gray-400">
            Deposit {formatCurrency(item.deposit)}
          </span>
        </div>
      </div>
    </Link>
  );
}
