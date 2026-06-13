import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
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
