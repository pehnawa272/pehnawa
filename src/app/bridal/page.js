import BridalAtelierClient from "./BridalAtelierClient";

export const metadata = {
  title: "Golden Era | Pehnawa by Laxshmi",
  description: "Timeless elegant ethnic wear for the sophisticated woman. Premium sarees, luxury kurta sets, and refined festive fashion crafted with generational artisanship at Pehnawa by Laxshmi.",
  alternates: {
    canonical: "https://pehnawa.com/bridal",
  },
  openGraph: {
    title: "Golden Era | Pehnawa by Laxshmi",
    description: "Timeless elegant ethnic wear for the sophisticated woman. Premium sarees, luxury kurta sets, and refined festive fashion crafted with generational artisanship at Pehnawa by Laxshmi.",
    url: "https://pehnawa.com/bridal",
    siteName: "Pehnawa by Laxshmi",
    images: [
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCuXZfCFIpSAljRaK6G6aykleA_EL9MP4BofaJdZOEZZOQMj6MuAdpBI9NJax5AQRysImiirS0Ehxakbmsc1ZXHcUylWfEw7_CrNjzTVc-ioyJsb4xGj2uPFc3By8uzoZ8AwknjrmN35T0E87Fua01HhqIMl-a8srcdqkgVMbGI1mwd2sqefk1aQydV3d-9YfH8ckXn3PhrCx0aqYR3_K9YQg3Sw_FXsfHZZnLtQ-Nqmwqs04lFNTlHb45aWCJIcKj47QqT26jK6kc",
        width: 1200,
        height: 630,
        alt: "PEHNAWA BY LAXSHMI Golden Era — Timeless Elegant Ethnic Wear",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Golden Era | Pehnawa by Laxshmi",
    description: "Timeless elegant ethnic wear for the sophisticated woman. Premium sarees, luxury kurta sets, and refined festive fashion crafted with generational artisanship at Pehnawa by Laxshmi.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuCuXZfCFIpSAljRaK6G6aykleA_EL9MP4BofaJdZOEZZOQMj6MuAdpBI9NJax5AQRysImiirS0Ehxakbmsc1ZXHcUylWfEw7_CrNjzTVc-ioyJsb4xGj2uPFc3By8uzoZ8AwknjrmN35T0E87Fua01HhqIMl-a8srcdqkgVMbGI1mwd2sqefk1aQydV3d-9YfH8ckXn3PhrCx0aqYR3_K9YQg3Sw_FXsfHZZnLtQ-Nqmwqs04lFNTlHb45aWCJIcKj47QqT26jK6kc"],
  },
};

import { ProductService } from "@/services/product.service";

function mapDbProduct(p) {
  return {
    id:          p.slug || p.id,
    dbId:        p.id,
    title:       p.title,
    category:    p.category.toLowerCase(),
    subCategory: p.subCategory ? p.subCategory.toLowerCase().replace(/_/g, "-") : null,
    subTitle:    p.subTitle || "",
    price:       (p.price || 0) / 100,
    description: p.description,
    fabric:      p.fabric || "",
    embroidery:  p.embroidery || "",
    images:      p.images && p.images.length > 0 ? p.images.map((img) => img.url).filter(Boolean) : ["https://lh3.googleusercontent.com/aida-public/AB6AXuCQEdOybnVP46O-DFJtarqg5GFmzA0czzX6tV5p_SGKEfw38pMlpfNro4EnKG-HrHNr_zEKZw-THH7iMo4hBgRHNAIV8fXt7RGYSOSYNq7Ohn2iEHH-lqBTpLEaKX021NhpjpYpYFTl0EBrzyT7Drntg98T3_uSK6Npoi4EMLyh9xtv9SaoEaCh6H7yDQ-gV0MLdytw58tZpYs170gzsQxsFRE3gFGcfY-dvrd6-4S_GFwmsKG_zTOpkeINvVEIWbBWcRfq1L1xV-U"],
    details:     p.details || [],
    occasion:    p.occasions?.[0]?.occasion?.name || "The Grand Wedding",
  };
}

export default async function BridalAtelierPage() {
  let initialProducts = [];
  try {
    const d = await ProductService.list({ category: "BRIDAL", page: 1, limit: 100 });
    if (d?.items) {
      initialProducts = d.items.map(mapDbProduct);
    }
  } catch (err) {
    console.error("Failed to fetch Golden Era products on server:", err);
  }

  return <BridalAtelierClient initialProducts={initialProducts} />;
}
