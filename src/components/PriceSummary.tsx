import { formatCurrency } from "@/lib/utils";

interface PriceSummaryProps {
  pricePerDay: number;
  days: number;
  deposit: number;
}

export function PriceSummary({ pricePerDay, days, deposit }: PriceSummaryProps) {
  const subtotal = pricePerDay * days;
  const grandTotal = subtotal + deposit;

  return (
    <div className="bg-accent rounded-2xl p-4 space-y-3">
      <h4 className="font-semibold text-secondary text-sm">Ringkasan Harga</h4>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            {formatCurrency(pricePerDay)} × {days} hari
          </span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Deposit (dikembalikan)</span>
          <span className="font-medium">{formatCurrency(deposit)}</span>
        </div>
      </div>

      <div className="border-t border-primary/20 pt-3">
        <div className="flex justify-between">
          <span className="font-semibold text-secondary">Total Bayar</span>
          <span className="font-bold text-lg text-primary">
            {formatCurrency(grandTotal)}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          *Deposit akan dikembalikan setelah barang dikembalikan dalam kondisi baik.
        </p>
      </div>
    </div>
  );
}
