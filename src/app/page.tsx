import Link from "next/link";
import { ItemCard } from "@/components/ItemCard";
import { HeroSearch } from "@/components/HeroSearch";
import { getFeaturedItems } from "@/data/items";
import { CATEGORY_LABELS, CATEGORY_ICONS, Category } from "@/lib/types";

export default function HomePage() {
  const featuredItems = getFeaturedItems();
  const categories = Object.entries(CATEGORY_LABELS) as [Category, string][];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary via-gray-900 to-secondary overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-400 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-primary/20 text-primary text-sm font-medium rounded-full mb-6">
              🎉 Persewaan Barang #1 di Indonesia
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Sewa Apa Saja,{" "}
              <span className="text-primary">Kapan Saja</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Dari kamera profesional hingga alat camping — temukan dan sewa
              barang berkualitas dengan harga terjangkau. Proses mudah, cepat,
              dan terpercaya.
            </p>

            {/* Search Bar */}
            <HeroSearch />

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto">
              {[
                { value: "500+", label: "Barang" },
                { value: "2K+", label: "Penyewa" },
                { value: "4.8★", label: "Rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Kategori Populer */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-3">
              Kategori Populer
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Jelajahi berbagai kategori barang sewaan kami
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map(([key, label]) => (
              <Link
                key={key}
                href={`/barang?kategori=${key}`}
                className="group flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  {CATEGORY_ICONS[key]}
                </span>
                <span className="text-sm font-medium text-secondary text-center group-hover:text-primary transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Barang Unggulan */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-2">
                Barang Unggulan
              </h2>
              <p className="text-gray-500">
                Pilihan terpopuler dari pelanggan kami
              </p>
            </div>
            <Link
              href="/barang"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary text-sm font-medium rounded-xl border border-primary/20 hover:bg-primary hover:text-white transition-all"
            >
              Lihat Semua
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Cara Kerja */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-3">
              Cara Kerja
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Sewa barang dalam 3 langkah mudah
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                ),
                title: "Pilih Barang",
                desc: "Jelajahi katalog kami dan pilih barang yang Anda butuhkan. Gunakan filter untuk menemukan dengan cepat.",
              },
              {
                step: "02",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                ),
                title: "Tentukan Tanggal",
                desc: "Pilih tanggal mulai dan selesai sewa. Sistem akan menghitung total biaya secara otomatis.",
              },
              {
                step: "03",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                ),
                title: "Konfirmasi & Ambil",
                desc: "Isi data diri, konfirmasi pesanan, lalu ambil di toko atau minta diantar ke lokasi Anda.",
              },
            ].map((step) => (
              <div
                key={step.step}
                className="relative group text-center p-8 bg-white rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <span className="absolute top-4 right-4 text-4xl font-bold text-gray-100 group-hover:text-primary/10 transition-colors">
                  {step.step}
                </span>
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary group-hover:text-white transition-all">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold text-secondary mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimoni */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-3">
              Apa Kata Mereka?
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Testimoni dari pelanggan setia RentaGo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Rina Wulandari",
                role: "Konten Kreator",
                text: "Sewa kamera di RentaGo sangat mudah! Barangnya terawat, harga bersaing, dan prosesnya cepat. Sangat recommended! 👍",
                rating: 5,
              },
              {
                name: "Andi Prasetyo",
                role: "Event Organizer",
                text: "Sudah 3x sewa proyektor dan sound system. Kualitas selalu terjaga dan pelayanannya ramah. Pasti balik lagi!",
                rating: 5,
              },
              {
                name: "Dewi Sartika",
                role: "Mahasiswi",
                text: "Alat camping lengkap dan harganya terjangkau banget. Cocok untuk anak kuliahan yang suka hiking weekend! ⛺",
                rating: 4,
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="p-6 bg-white rounded-2xl border border-border"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`w-4 h-4 ${i < testimonial.rating ? "text-yellow-400" : "text-gray-200"}`}
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-secondary">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary to-orange-500 rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Siap Untuk Menyewa?
            </h2>
            <p className="text-orange-100 mb-8 max-w-lg mx-auto">
              Temukan barang yang Anda butuhkan dan mulai sewa sekarang.
              Proses cepat dan mudah!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/barang"
                className="px-8 py-3.5 bg-white text-primary font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Jelajahi Katalog
              </Link>
              <a
                href="https://wa.me/628974467878?text=Halo%2C%20saya%20ingin%20bertanya%20tentang%20persewaan%20barang"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                Chat WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
