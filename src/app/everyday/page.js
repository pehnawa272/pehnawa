import EverydayEditClient from "./EverydayEditClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Professional Ethnic | Pehnawa by Laxshmi",
  description: "Elegant professional ethnic wear crafted for modern women. Discover kurtis, sarees, and contemporary Indian fashion at Pehnawa by Laxshmi.",
  alternates: {
    canonical: "https://pehnawa.com/everyday",
  },
  openGraph: {
    title: "Everyday Edit | Pehnawa by Laxshmi",
    description: "Elegant everyday ethnic wear crafted for modern women. Discover kurtis, sarees, and contemporary Indian fashion at Pehnawa by Laxshmi.",
    url: "https://pehnawa.com/everyday",
    siteName: "Pehnawa by Laxshmi",
    images: [
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC97tUowY5kTW2SBnGPaaJBMWKCO7J_5baz4MUC6dDAKkv5vC2HxNNY4TezK9Pb-KiwPJil8gLD0AFCW_xCr4QUL1dSqOX6h4AIyrIj1SB5zsztBzHQ65hWuepoTOlvjUIj2UHoD8GKzrgBhJU9EZLq5fvyw6Yffe_0ZcmqhX1d-Z8u-gzM45BpEY3NFKg5bA1nGMu4E1nzCL6U-xEsc-9d7j3En1SrYCK-jauIw7QevI_QTEXHTWDt2VnxFH3b_k1GoHgex2gh6MQ",
        width: 1200,
        height: 630,
        alt: "Pehnawa by Laxshmi Everyday Collection",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Everyday Edit | Pehnawa by Laxshmi",
    description: "Elegant everyday ethnic wear crafted for modern women. Discover kurtis, sarees, and contemporary Indian fashion at Pehnawa by Laxshmi.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuC97tUowY5kTW2SBnGPaaJBMWKCO7J_5baz4MUC6dDAKkv5vC2HxNNY4TezK9Pb-KiwPJil8gLD0AFCW_xCr4QUL1dSqOX6h4AIyrIj1SB5zsztBzHQ65hWuepoTOlvjUIj2UHoD8GKzrgBhJU9EZLq5fvyw6Yffe_0ZcmqhX1d-Z8u-gzM45BpEY3NFKg5bA1nGMu4E1nzCL6U-xEsc-9d7j3En1SrYCK-jauIw7QevI_QTEXHTWDt2VnxFH3b_k1GoHgex2gh6MQ"],
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
  };
}

export default async function EverydayEditPage() {
  let initialProducts = [];
  try {
    const d = await ProductService.list({ category: "EVERYDAY", page: 1, limit: 100 });
    if (d?.items) {
      initialProducts = d.items.map(mapDbProduct);
    }
  } catch (err) {
    console.error("Failed to fetch everyday products on server:", err);
  }

  return <EverydayEditClient initialProducts={initialProducts} />;
}
