import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import { StoreProvider } from "@/lib/store-context";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "RentaGo — Sewa Barang Mudah & Terpercaya",
    template: "%s | RentaGo",
  },
  description:
    "Platform persewaan barang terlengkap. Sewa kamera, alat camping, proyektor, perlengkapan pesta, dan lainnya dengan mudah dan terpercaya.",
  keywords: [
    "sewa barang",
    "rental",
    "sewa kamera",
    "sewa camping",
    "sewa proyektor",
    "persewaan",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <StoreProvider>
            <CartProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </CartProvider>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
