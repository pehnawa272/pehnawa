import OthersClient from "./OthersClient";

export const dynamic = "force-dynamic";

import { ProductService } from "@/services/product.service";

export const metadata = {
  title: "Others | Pehnawa by Laxshmi",
  description: "Explore our curated selection of unique pieces that stand beyond categories. Handcrafted luxury, beautifully uncategorised.",
  alternates: {
    canonical: "https://pehnawa.com/others",
  },
  openGraph: {
    title: "Others | Pehnawa by Laxshmi",
    description: "Explore our curated selection of unique pieces that stand beyond categories. Handcrafted luxury, beautifully uncategorised.",
    url: "https://pehnawa.com/others",
    siteName: "Pehnawa by Laxshmi",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Others | Pehnawa by Laxshmi",
    description: "Explore our curated selection of unique pieces that stand beyond categories. Handcrafted luxury, beautifully uncategorised.",
  },
};

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
    images:      p.images && p.images.length > 0
      ? p.images.map((img) => img.url).filter(Boolean)
      : ["https://lh3.googleusercontent.com/aida-public/AB6AXuCQEdOybnVP46O-DFJtarqg5GFmzA0czzX6tV5p_SGKEfw38pMlpfNro4EnKG-HrHNr_zEKZw-THH7iMo4hBgRHNAIV8fXt7RGYSOSYNq7Ohn2iEHH-lqBTpLEaKX021NhpjpYpYFTl0EBrzyT7Drntg98T3_uSK6Npoi4EMLyh9xtv9SaoEaCh6H7yDQ-gV0MLdytw58tZpYs170gzsQxsFRE3gFGcfY-dvrd6-4S_GFwmsKG_zTOpkeINvVEIWbBWcRfq1L1xV-U"],
    details:     p.details || [],
  };
}

export default async function OthersPage() {
  let initialProducts = [];
  try {
    const d = await ProductService.list({ category: "OTHERS", page: 1, limit: 100 });
    if (d?.items) {
      initialProducts = d.items.map(mapDbProduct);
    }
  } catch (err) {
    console.error("Failed to fetch others products on server:", err);
  }

  return <OthersClient initialProducts={initialProducts} />;
}
