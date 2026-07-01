import ProductDetailClient from "./ProductDetailClient";
import { DB } from "@/lib/db";
import { ProductService } from "@/services/product.service";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Try live DB first, then fall back to static mock
  let product = null;
  try {
    const dbProduct = await ProductService.getBySlug(id);
    if (dbProduct) {
      product = {
        title:    dbProduct.title,
        subTitle: dbProduct.subTitle || "",
        description: dbProduct.description || "",
        images:   dbProduct.images?.map((img) => img.url) || [],
      };
    }
  } catch {
    const staticProduct = DB.getProductById(id);
    if (staticProduct) {
      product = {
        title:       staticProduct.title,
        subTitle:    staticProduct.subTitle || "",
        description: staticProduct.description || "",
        images:      staticProduct.images || [],
      };
    }
  }

  if (!product) {
    return {
      title: "Product Not Found | Pehnawa by Laxshmi",
      description: "The requested couture piece could not be found.",
    };
  }

  const title = `${product.title} | Pehnawa by Laxshmi`;
  const description = `${product.subTitle} - ${product.description}`.substring(0, 155).trim();
  const imageUrl = product.images?.[0] || "";

  return {
    title,
    description,
    alternates: {
      canonical: `https://pehnawa.com/product/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://pehnawa.com/product/${id}`,
      siteName: "Pehnawa by Laxshmi",
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: product.title }]
        : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

function mapDbProduct(p) {
  const imgs = p.images?.map((img) => img.url).filter(Boolean) || [];
  const vids = p.videos?.map((v) => ({ url: v.url, thumbnail: v.thumbnail || null })).filter((v) => v.url) || [];
  return {
    id:          p.slug || p.id,
    dbId:        p.id,
    title:       p.title,
    category:    p.category?.toLowerCase(),
    subTitle:    p.subTitle || "",
    price:       p.price != null ? p.price / 100 : null,
    mrp:         p.mrp != null ? p.mrp / 100 : null,
    description: p.description || "",
    fabric:      p.fabric || "",
    embroidery:  p.embroidery || "",
    images:      imgs.length > 0 ? imgs : ["https://lh3.googleusercontent.com/aida-public/AB6AXuCQEdOybnVP46O-DFJtarqg5GFmzA0czzX6tV5p_SGKEfw38pMlpfNro4EnKG-HrHNr_zEKZw-THH7iMo4hBgRHNAIV8fXt7RGYSOSYNq7Ohn2iEHH-lqBTpLEaKX021NhpjpYpYFTl0EBrzyT7Drntg98T3_uSK6Npoi4EMLyh9xtv9SaoEaCh6H7yDQ-gV0MLdytw58tZpYs170gzsQxsFRE3gFGcfY-dvrd6-4S_GFwmsKG_zTOpkeINvVEIWbBWcRfq1L1xV-U"],
    videos:      vids,
    craftingHours: p.craftingHours || null,
    details:     p.details || [],
    colours:     p.colours || [],
  };
}

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  let product = null;
  try {
    const dbProduct = await ProductService.getBySlug(id);
    if (dbProduct) {
      product = mapDbProduct(dbProduct);
    }
  } catch {
    const staticProduct = DB.getProductById(id);
    if (staticProduct) {
      product = staticProduct;
    }
  }

  return <ProductDetailClient initialProduct={product} />;
}
