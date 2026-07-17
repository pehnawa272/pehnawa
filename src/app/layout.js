import { Playfair_Display, Montserrat } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";


const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "PEHNAWA BY LAXSHMI | Desi Vibes, Modern Soul - Digital Luxury Atelier",
  description:
    "Bridging ancestral Indian craftsmanship and contemporary global luxury. Explore our Professional Ethnic, Signature Ensembles, and Golden Era Collection.",
  keywords: "Pehnawa by Laxshmi, Pehnawa, Couture, Indian Luxury Wear, Golden Era, Luxury Sarees, Lucknow Chikankari, Zardozi, Designer Kurta",
};

export default async function RootLayout({ children }) {
  // Read the nonce set by middleware so it can be forwarded to any <Script>
  // components added in future. Next.js also reads x-nonce internally and
  // automatically adds nonce="..." to every hydration <script> it generates.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${montserrat.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-luxury-bg text-foreground font-sans flex flex-col hide-scrollbar">
        <CartProvider>{children}</CartProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}