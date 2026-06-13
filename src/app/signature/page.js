import SignatureEditClient from "./SignatureEditClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Signature Edit | Pehnawa by Laxshmi",
  description: "Explore our signature luxury Indian couture ensembles. Meticulously handcrafted masterpieces blending heritage and modern elegance.",
  alternates: {
    canonical: "https://pehnawa.com/signature",
  },
  openGraph: {
    title: "Signature Edit | Pehnawa by Laxshmi",
    description: "Explore our signature luxury Indian couture ensembles. Meticulously handcrafted masterpieces blending heritage and modern elegance.",
    url: "https://pehnawa.com/signature",
    siteName: "Pehnawa by Laxshmi",
    images: [
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoL47DJkjHGr61NjYkTOcfLko3oZNy2gs8Z7jxqcNsQiNy8zB9JdCeONutnlgwnhSm98xeAzDm945RtVORC_kIl-GPUbGDRL6Z-zeoIbaZ47WT-usrwEozEVag4vVcrpfbnbYNQ2cn5-5j41apwopsuDIy2O_B-T9CKFbCKF2pTQcbTcgVO-EEDiGPLL8JAapv2oTPXyCNOgex-w37mOreodCRkYW4cu1tu9U0Tnn8XdzthIcjGHeTnjPZDK1kbfVkODDFmGSIsAU",
        width: 1200,
        height: 630,
        alt: "Pehnawa by Laxshmi Signature Edit",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Signature Edit | Pehnawa by Laxshmi",
    description: "Explore our signature luxury Indian couture ensembles. Meticulously handcrafted masterpieces blending heritage and modern elegance.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuCoL47DJkjHGr61NjYkTOcfLko3oZNy2gs8Z7jxqcNsQiNy8zB9JdCeONutnlgwnhSm98xeAzDm945RtVORC_kIl-GPUbGDRL6Z-zeoIbaZ47WT-usrwEozEVag4vVcrpfbnbYNQ2cn5-5j41apwopsuDIy2O_B-T9CKFbCKF2pTQcbTcgVO-EEDiGPLL8JAapv2oTPXyCNOgex-w37mOreodCRkYW4cu1tu9U0Tnn8XdzthIcjGHeTnjPZDK1kbfVkODDFmGSIsAU"],
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

export default async function SignatureEditPage() {
  let initialProducts = [];
  try {
    const d = await ProductService.list({ category: "SIGNATURE", page: 1, limit: 100 });
    if (d?.items) {
      initialProducts = d.items.map(mapDbProduct);
    }
  } catch (err) {
    console.error("Failed to fetch signature products on server:", err);
  }

  return <SignatureEditClient initialProducts={initialProducts} />;
}
