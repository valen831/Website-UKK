import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="text-7xl mb-6">🔍</div>
      <h1 className="text-3xl font-bold text-secondary mb-3">
        Halaman Tidak Ditemukan
      </h1>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Maaf, halaman yang Anda cari tidak ada. Mungkin sudah dipindahkan atau
        dihapus.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Kembali ke Beranda
      </Link>
    </div>
  );
}
