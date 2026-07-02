import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  // Only load the weights actually used in the UI (400 body, 500 medium, 700 bold).
  // Omitting this downloads every weight variant — an extra 300-400 KB of font data.
  weight: ["400", "500", "700"],
  // Show fallback system font immediately; swap to Playfair once downloaded.
  // Prevents invisible text during font load (FOIT).
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  // Weights used across the site: light labels (300), body (400), medium (500),
  // semibold (600), bold CTAs and headings (700).
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "PEHNAWA BY LAXSHMI | Desi Vibes, Modern Soul - Digital Luxury Atelier",
  description:
    "Bridging ancestral Indian craftsmanship and contemporary global luxury. Explore our Professional Ethnic, Signature Ensembles, and Golden Era Collection.",
  keywords: "Pehnawa by Laxshmi, Pehnawa, Couture, Indian Luxury Wear, Golden Era, Luxury Sarees, Lucknow Chikankari, Zardozi, Designer Kurta",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${montserrat.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-luxury-bg text-foreground font-sans flex flex-col hide-scrollbar">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
