/**
 * Diagnostic script: check all products in the DB
 * Run with: npx ts-node --project tsconfig.json -e "require('./src/scratch/check-products.ts')"
 * Or simply: npx tsx src/scratch/check-products.ts
 */
import { prisma } from "@/lib/prisma";

async function main() {
  const all = await prisma.product.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      category: true,
      subCategory: true,
      price: true,
      isEnquireOnly: true,
      createdAt: true,
      images: { select: { url: true, isPrimary: true }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`\n📦 Total products in DB: ${all.length}\n`);
  for (const p of all) {
    const imgStatus = p.images.length > 0 ? "✅ has image" : "❌ NO image";
    const priceStr = p.isEnquireOnly ? "enquire only" : `₹${(p.price || 0) / 100}`;
    console.log(
      `  [${p.status.padEnd(10)}] ${p.title.padEnd(40)} | ${p.category}/${p.subCategory || "—"} | ${priceStr} | ${imgStatus} | slug: ${p.slug}`
    );
  }

  // Show breakdown by status
  const byStatus = all.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});
  console.log("\n📊 By status:", byStatus);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
