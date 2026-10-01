import { RentalItem } from "@/lib/types";

export const rentalItems: RentalItem[] = [
  {
    id: "1",
    slug: "canon-eos-r6-mark-ii",
    name: "Canon EOS R6 Mark II",
    category: "kamera",
    description:
      "Kamera mirrorless full-frame Canon EOS R6 Mark II dengan sensor 24.2 MP, autofocus canggih, dan stabilisasi gambar 8 stop. Cocok untuk fotografi pernikahan, acara, dan konten kreator. Termasuk lensa RF 24-105mm f/4L IS USM, baterai cadangan, dan kartu memori 64GB.",
    specifications: {
      Sensor: "24.2 MP Full-Frame CMOS",
      ISO: "100–102400",
      Video: "4K 60fps, Full HD 180fps",
      Stabilisasi: "In-body 8-stop",
      Layar: "3.0\" Vari-angle Touchscreen",
      Berat: "670g (body only)",
      "Dalam paket": "Body, Lensa RF 24-105mm, 2x Baterai, Charger, SD Card 64GB, Tas Kamera",
    },
    pricePerDay: 350000,
    deposit: 1000000,
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800",
      "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800",
    ],
    stock: 3,
    rating: 4.9,
    reviewCount: 128,
    featured: true,
    available: true,
    bookedDates: ["2026-10-05", "2026-10-06", "2026-10-07", "2026-10-12", "2026-10-13"],
  },
  {
    id: "2",
    slug: "sony-a7-iv",
    name: "Sony A7 IV",
    category: "kamera",
    description:
      "Kamera mirrorless full-frame Sony A7 IV dengan sensor 33 MP, real-time eye AF, dan video 4K 60p 10-bit. Pilihan ideal untuk hybrid shooter yang membutuhkan kualitas foto dan video terbaik. Termasuk lensa FE 28-70mm f/3.5-5.6.",
    specifications: {
      Sensor: "33 MP Full-Frame Exmor R CMOS",
      ISO: "100–51200",
      Video: "4K 60fps 10-bit 4:2:2",
      AF: "759 point phase-detection",
      Layar: "3.0\" Tilt Touchscreen",
      Berat: "658g (body only)",
      "Dalam paket": "Body, Lensa FE 28-70mm, Baterai, Charger, SD Card 32GB",
    },
    pricePerDay: 300000,
    deposit: 1000000,
    images: [
      "https://images.unsplash.com/photo-1606986628253-e3e31a180a8f?w=800",
      "https://images.unsplash.com/photo-1617575521317-d2974f3b56d2?w=800",
    ],
    stock: 2,
    rating: 4.8,
    reviewCount: 95,
    featured: true,
    available: true,
    bookedDates: ["2026-10-08", "2026-10-09"],
  },
  {
    id: "3",
    slug: "tenda-naturehike-cloud-up-2",
    name: "Tenda Naturehike Cloud Up 2",
    category: "camping",
    description:
      "Tenda ultralight 2 orang dari Naturehike, seri Cloud Up. Ringan hanya 1.7kg, tahan air 4000mm, mudah dipasang. Sempurna untuk hiking dan camping weekend. Dilengkapi footprint dan flysheet.",
    specifications: {
      Kapasitas: "2 orang",
      Berat: "1.7kg (packed)",
      "Waterproof Rating": "4000mm",
      Material: "20D Nylon Silicone",
      Dimensi: "210x125x100cm",
      "Pack Size": "42x14cm",
      "Dalam paket": "Tenda inner, Flysheet, Footprint, Tiang, Pasak, Tas penyimpanan",
    },
    pricePerDay: 75000,
    deposit: 300000,
    images: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800",
      "https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=800",
    ],
    stock: 5,
    rating: 4.7,
    reviewCount: 203,
    featured: true,
    available: true,
    bookedDates: [],
  },
  {
    id: "4",
    slug: "epson-eb-fh06-projector",
    name: "Epson EB-FH06 Projector",
    category: "proyektor",
    description:
      "Proyektor Epson EB-FH06 Full HD 1080p dengan 3500 lumens. Ideal untuk presentasi bisnis, nonton bareng, dan acara outdoor. Koneksi HDMI, USB, dan wireless. Sudah termasuk layar proyektor portable 100 inch.",
    specifications: {
      Resolusi: "Full HD 1080p",
      Brightness: "3500 lumens",
      "Contrast Ratio": "16000:1",
      Koneksi: "HDMI x2, USB-A, VGA",
      "Ukuran Layar": "30\" – 300\"",
      Berat: "2.7kg",
      "Dalam paket": "Proyektor, Kabel HDMI 3m, Remote, Tas, Layar 100\" + Tripod",
    },
    pricePerDay: 200000,
    deposit: 500000,
    images: [
      "https://images.unsplash.com/photo-1626379953822-baec19c3accd?w=800",
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800",
    ],
    stock: 4,
    rating: 4.6,
    reviewCount: 87,
    featured: true,
    available: true,
    bookedDates: ["2026-10-10", "2026-10-11"],
  },
  {
    id: "5",
    slug: "paket-dekorasi-pesta-ulang-tahun",
    name: "Paket Dekorasi Pesta Ulang Tahun",
    category: "pesta",
    description:
      "Paket dekorasi lengkap untuk pesta ulang tahun. Termasuk backdrop glitter, balon helium 50 pcs, banner HAPPY BIRTHDAY, confetti, pom-pom kertas, fairy lights, dan taplak meja. Tersedia pilihan warna: gold, rose gold, pastel rainbow.",
    specifications: {
      Backdrop: "Sequin/Glitter 2x2m",
      Balon: "50 pcs Helium Latex + 5 Foil",
      Banner: "HAPPY BIRTHDAY metallic",
      Lighting: "Fairy lights 10m warm white",
      Taplak: "2 pcs satin 150x250cm",
      Confetti: "Gold/Silver 500g",
      "Dalam paket": "Semua item + pompa balon manual + selotip dekorasi",
    },
    pricePerDay: 150000,
    deposit: 200000,
    images: [
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800",
    ],
    stock: 6,
    rating: 4.5,
    reviewCount: 156,
    featured: false,
    available: true,
    bookedDates: [],
  },
  {
    id: "6",
    slug: "speaker-jbl-partybox-310",
    name: "Speaker JBL PartyBox 310",
    category: "elektronik",
    description:
      "Speaker portabel JBL PartyBox 310 dengan daya 240W, bass yang powerful, dan LED light show. Baterai tahan 18 jam, tahan cipratan air IPX4. Cocok untuk pesta, acara outdoor, dan gathering. Sudah termasuk 2 mic wireless.",
    specifications: {
      Output: "240W RMS",
      Baterai: "18 jam",
      Koneksi: "Bluetooth 5.1, AUX, USB, Mic/Guitar input",
      "Water Resistance": "IPX4",
      Berat: "17.4kg",
      Dimensi: "68.8 x 32.6 x 36.5 cm",
      "Dalam paket": "Speaker, 2x Wireless Mic, Kabel power, AUX cable, Stand speaker",
    },
    pricePerDay: 250000,
    deposit: 500000,
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800",
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800",
    ],
    stock: 3,
    rating: 4.8,
    reviewCount: 112,
    featured: true,
    available: true,
    bookedDates: ["2026-10-14", "2026-10-15"],
  },
  {
    id: "7",
    slug: "sleeping-bag-consina-sleep-warmer",
    name: "Sleeping Bag Consina Sleep Warmer",
    category: "camping",
    description:
      "Sleeping bag Consina Sleep Warmer dengan comfort temperature 5°C. Material polyester tahan air, dilengkapi hood dan zipper dua arah. Ringan dan mudah dibawa untuk camping gunung atau hiking.",
    specifications: {
      "Comfort Temp": "5°C",
      Material: "Polyester Ripstop",
      Filling: "Hollow Fiber 300gsm",
      Dimensi: "210x75cm",
      "Pack Size": "35x20cm",
      Berat: "1.2kg",
      "Dalam paket": "Sleeping bag + compression sack",
    },
    pricePerDay: 35000,
    deposit: 100000,
    images: [
      "https://images.unsplash.com/photo-1510672981848-a1c4f1cb5ccf?w=800",
      "https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=800",
    ],
    stock: 10,
    rating: 4.4,
    reviewCount: 78,
    featured: false,
    available: true,
    bookedDates: [],
  },
  {
    id: "8",
    slug: "gopro-hero-12-black",
    name: "GoPro HERO 12 Black",
    category: "kamera",
    description:
      "Action camera GoPro HERO 12 Black dengan video 5.3K60, HyperSmooth 6.0, dan waterproof hingga 10m. Ideal untuk vlog travel, olahraga ekstrem, dan underwater. Termasuk mounting kit lengkap.",
    specifications: {
      Video: "5.3K60 / 4K120",
      Foto: "27 MP",
      Stabilisasi: "HyperSmooth 6.0",
      Waterproof: "10m tanpa housing",
      Baterai: "Enduro Battery",
      Berat: "154g",
      "Dalam paket": "GoPro, 3x Baterai, Charger, Head strap, Chest mount, Selfie stick, SD Card 64GB",
    },
    pricePerDay: 150000,
    deposit: 500000,
    images: [
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800",
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800",
    ],
    stock: 4,
    rating: 4.7,
    reviewCount: 94,
    featured: false,
    available: true,
    bookedDates: ["2026-10-03", "2026-10-04"],
  },
  {
    id: "9",
    slug: "gitar-akustik-yamaha-f310",
    name: "Gitar Akustik Yamaha F310",
    category: "musik",
    description:
      "Gitar akustik Yamaha F310 dengan suara jernih dan nyaman dimainkan. Cocok untuk acara akustik, latihan band, atau sekadar hiburan saat camping. Termasuk softcase, capo, dan pick set.",
    specifications: {
      Tipe: "Acoustic Folk Guitar",
      Top: "Spruce",
      "Back & Side": "Meranti",
      Neck: "Nato",
      Senar: "Steel String",
      Berat: "2.3kg",
      "Dalam paket": "Gitar, Softcase, Capo, Pick set (5pcs), Strap",
    },
    pricePerDay: 50000,
    deposit: 200000,
    images: [
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800",
      "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800",
    ],
    stock: 3,
    rating: 4.3,
    reviewCount: 45,
    featured: false,
    available: true,
    bookedDates: [],
  },
  {
    id: "10",
    slug: "sepeda-lipat-polygon-urbano-5",
    name: "Sepeda Lipat Polygon Urbano 5",
    category: "olahraga",
    description:
      "Sepeda lipat Polygon Urbano 5 dengan frame aluminium ringan, 9-speed Shimano Sora, dan ban 20 inch. Mudah dilipat dan dibawa, cocok untuk city touring atau eksplorasi wisata. Termasuk helm dan gembok.",
    specifications: {
      Frame: "Alloy 6061",
      Groupset: "Shimano Sora 9-speed",
      "Wheel Size": "20 inch",
      Brake: "Disc Brake",
      "Folded Size": "84x64x38cm",
      Berat: "11.8kg",
      "Dalam paket": "Sepeda, Helm, Gembok, Toolkit, Pompa mini",
    },
    pricePerDay: 100000,
    deposit: 500000,
    images: [
      "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800",
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800",
    ],
    stock: 2,
    rating: 4.6,
    reviewCount: 67,
    featured: true,
    available: true,
    bookedDates: ["2026-10-06", "2026-10-07"],
  },
];

export function getItemBySlug(slug: string): RentalItem | undefined {
  return rentalItems.find((item) => item.slug === slug);
}

export function getItemsByCategory(category: string): RentalItem[] {
  return rentalItems.filter((item) => item.category === category);
}

export function getFeaturedItems(): RentalItem[] {
  return rentalItems.filter((item) => item.featured);
}

export function searchItems(query: string): RentalItem[] {
  const q = query.toLowerCase();
  return rentalItems.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
  );
}
