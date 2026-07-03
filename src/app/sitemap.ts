import type { MetadataRoute } from "next";

const baseUrl = "https://pehnawabylaxshmi.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/bridal`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/everyday`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/signature`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/others`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/craftsmanship`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/book`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/return-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

  // TODO (optional, not applied here): add individual /product/[id] pages
  // dynamically by querying Prisma for published products, e.g.:
  //
  // const products = await prisma.product.findMany({ where: { published: true } });
  // const productRoutes = products.map((p) => ({
  //   url: `${baseUrl}/product/${p.id}`,
  //   lastModified: p.updatedAt,
  //   changeFrequency: "weekly" as const,
  //   priority: 0.7,
  // }));
  // return [...staticRoutes, ...productRoutes];
  //
  // Left as static-only for now since this file didn't previously exist —
  // wire in the dynamic part once you confirm the static version works.

  return staticRoutes;
}
