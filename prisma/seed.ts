/**
 * Pehnawa — Database Seed Script
 * Run: npx prisma db seed
 *
 * Seeds: occasions, all 11 products (with images), one admin user,
 * one customer user, cart, wishlist, wallet, referral code,
 * measurement profile, consultation, and a sample order with payment.
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ProductCategory, ProductStatus, ConsultationType, ConsultationStatus, OrderStatus, PaymentStatus, PaymentMethod, WalletTxType, WalletTxReason, UserRole } from "../src/generated/client";

// Prisma 7: connection via pg adapter
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma   = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log("🌱 Seeding Pehnawa database...\n");

  // ── 1. Occasions ────────────────────────────────────────────
  const occasionData = [
    { name: "Wedding",          slug: "wedding" },
    { name: "Sangeet",          slug: "sangeet" },
    { name: "Mehendi",          slug: "mehendi" },
    { name: "Reception",        slug: "reception" },
    { name: "Festive",          slug: "festive" },
    { name: "Casual",           slug: "casual" },
    { name: "Resort",           slug: "resort" },
    { name: "Soiree",           slug: "soiree" },
  ];

  const occasions = await Promise.all(
    occasionData.map((o) =>
      prisma.occasion.upsert({
        where: { slug: o.slug },
        update: {},
        create: o,
      })
    )
  );
  console.log(`✅ ${occasions.length} occasions seeded`);

  const occasionMap = Object.fromEntries(occasions.map((o) => [o.slug, o.id]));

  // ── 2. Admin User ────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@pehnawa.com" },
    update: {},
    create: {
      clerkId:   "clerk_admin_placeholder",
      email:     "admin@pehnawa.com",
      name:      "Pehnawa Admin",
      role:      UserRole.ADMIN,
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // ── 3. Customer User ─────────────────────────────────────────
  const customer = await prisma.user.upsert({
    where: { email: "ashraya@pehnawa.com" },
    update: {},
    create: {
      clerkId:   "clerk_customer_placeholder",
      email:     "ashraya@pehnawa.com",
      name:      "Ashraya Mishra",
      phone:     "+91 98765 43210",
      role:      UserRole.CUSTOMER,
    },
  });
  console.log(`✅ Customer user: ${customer.email}`);

  // ── 4. Shipping Address ───────────────────────────────────────
  const address = await prisma.address.upsert({
    where: { id: "seed-address-001" },
    update: {},
    create: {
      id:        "seed-address-001",
      userId:    customer.id,
      label:     "Home",
      name:      "Ashraya Mishra",
      phone:     "+91 98765 43210",
      line1:     "12, Gulmohar Lane",
      line2:     "Hazratganj",
      city:      "Lucknow",
      state:     "Uttar Pradesh",
      pincode:   "226001",
      country:   "IN",
      isDefault: true,
    },
  });

  // ── 5. Measurement Profile ────────────────────────────────────
  const measurements = await prisma.measurementProfile.upsert({
    where: { id: "seed-measure-001" },
    update: {},
    create: {
      id:        "seed-measure-001",
      userId:    customer.id,
      label:     "My Standard Measurements",
      isDefault: true,
      bust:      36,
      waist:     30,
      hips:      38,
      height:    64,
      shoulder:  14.5,
      sleeveLen: 23,
      notes:     "Prefer slightly relaxed fit on shoulders.",
    },
  });
  console.log(`✅ Measurement profile seeded`);

  // ── 6. Products ───────────────────────────────────────────────
  const productSeeds = [
    {
      id:           "seed-prod-noorani",
      slug:         "noorani-anarkali",
      title:        "The Noorani Anarkali",
      subTitle:     "Midnight Black Silk Anarkali",
      description:  "Hand-woven over 400 hours by master artisans in Lucknow. Features real gold-dipped silver zari threads woven with precision.",
      fabric:       "Mulberry Silk",
      embroidery:   "Chikankari & Zari Handwork",
      details:      ["100% hand-spun Mulberry Silk with organic dyes", "Real silver threads dipped in gold (Zari work)", "Traditional Lucknawi shadow-work Chikankari details", "Includes customized inner satin lining", "Dry clean only, store in cloth bags"],
      category:     ProductCategory.SIGNATURE,
      status:       ProductStatus.PUBLISHED,
      price:        4200000, // ₹42,000 in paise
      craftingHours: 400,
      isFeatured:   true,
      occasions:    ["sangeet", "festive"],
      images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDy_jSqaw9sjDFCdJmaS-IqoA3ErA67fJCHxXoUWB3-whnTDMnJHi-FuEt6lfecLo_auJE6xB89HamjXuSSuVMBK7BF7C45DtI8OLAc6um9Zda9uLPotD6xiLDrG6Wf1KgK5zbOsbOHhHAvrCPcyz5FJc3hE0t_KPPpIHkbO3-2wd_k09b8_eLVKucdkjrgZHERE9cs_HRa-kf_4UzUMAouc_3QJK-8a4n2avIP0Ks6TDCelpv7Advjd2fD6m4zGMzbvkAL7xRMHO0",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBD_s4i87wSyM2J27KSp94UjpCLEONAIvLo7SvqyIQGAMZ48Y2wt_lLfef4VUQGv2YcY3nbrQcKvoQDBBXhFQjjmtdCYM24AtUGv0u2zGwzYodym157YUS0PogDsRME-n873mfmvgfR3wcMtYKBH6zCZpQ-c1LsVfF-WG1wP8m53CVrtF9jyheblt5xdXg4SBLk1En6YWtLCF6ITpU8ZeuC55V_EksirqoLjp4lnuaTLj1QeloVUHUU9kiOENHIULwpSHtKcuYSeX0",
      ],
    },
    {
      id:          "seed-prod-sage",
      slug:        "sage-kurta",
      title:       "The Sage Minimalist Kurta",
      subTitle:    "Sage Green Linen Kurta",
      description: "An elegant, highly breathable linen kurta with delicate white floral hand-embroidery on the neckline.",
      fabric:      "Pure Linen",
      embroidery:  "Fine Threadwork",
      details:     ["Breathable natural linen", "Hand-embroidered neckline floral motifs", "Side pockets for functional luxury", "Relaxed architectural fit", "Hand wash cold with mild detergent"],
      category:    ProductCategory.EVERYDAY,
      status:      ProductStatus.PUBLISHED,
      price:       450000, // ₹4,500
      isFeatured:  false,
      occasions:   ["casual"],
      images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuCQEdOybnVP46O-DFJtarqg5GFmzA0czzX6tV5p_SGKEfw38pMlpfNro4EnKG-HrHNr_zEKZw-THH7iMo4hBgRHNAIV8fXt7RGYSOSYNq7Ohn2iEHH-lqBTpLEaKX021NhpjpYpYFTl0EBrzyT7Drntg98T3_uSK6Npoi4EMLyh9xtv9SaoEaCh6H7yDQ-gV0MLdytw58tZpYs170gzsQxsFRE3gFGcfY-dvrd6-4S_GFwmsKG_zTOpkeINvVEIWbBWcRfq1L1xV-U"],
    },
    {
      id:          "seed-prod-indigo",
      slug:        "indigo-set",
      title:       "Indigo Block-Print Set",
      subTitle:    "Indigo Hand-Block Printed Co-ord",
      description: "Contemporary geometric block printed co-ord set in a fluid, elegant silhouette.",
      fabric:      "Cotton Silk Blend",
      embroidery:  "Hand-Block Printing",
      details:     ["Traditional organic Indigo dyes", "Includes customized structured trousers", "Fluid contemporary silhouette", "Dry clean recommended for deep dyes"],
      category:    ProductCategory.EVERYDAY,
      status:      ProductStatus.PUBLISHED,
      price:       680000, // ₹6,800
      isFeatured:  false,
      occasions:   ["casual", "festive"],
      images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuC-gRrCLqNzGMrKDSUBEjxOfivSAFmHZys0gCYL3Oa8osPVCupqQvSmQf4VtGeCjC-NjK8J5mlrLk6QVhf4rnry8QfKbACPTZWDaiP9m8COFnYMpZFtQK-djcIZ4KM3719WAbNdzT-FU7C8R1GIwKyFgLGlyFnwvCqfwlzZ1N97twWOUICNtXN5Omf7SRHo54x4b5wmSxJOXi4ppIiTPL0W3L2dvfTbVKK-ppCa9cGBb4O2yYBIuqplL3P-angpiPPS9W7t870YgYE"],
    },
    {
      id:          "seed-prod-noor",
      slug:        "noor-ul-haya",
      title:       "Noor-ul-Haya",
      subTitle:    "Vintage Ivory Raw Silk Lehenga",
      description: "A magnificent bridal masterpiece. Crafted from vintage ivory raw silk and adorned with monumental Zardosi embroidery.",
      fabric:      "Vintage Raw Silk",
      embroidery:  "Zardosi Handwork with Pearls & Crystals",
      details:     ["Bespoke fit matching precision measurements", "Over 1,200 hours of custom handcrafting", "Includes double dupattas", "Heirloom storage box provided"],
      category:    ProductCategory.BRIDAL,
      status:      ProductStatus.PUBLISHED,
      price:       null,
      isEnquireOnly: true,
      craftingHours: 1200,
      isFeatured:  true,
      occasions:   ["wedding"],
      images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuC_Q2jKnx-0hB8dX8e5ZLpawjGEg0aEl4QflK6xUkgql06DKR_x-vr4ApQKJAV4oaEpyYDFjuaL6oaNlKV_mOJbG5dWSE3ggdcMXX_SB5ATof7hDB-w4FJuLOKeofePakP48X1lBBI0Mao4jb0O_VrshaflMfTCIJfNFKFztSkwFdHphNNLC68QX8AaZW9FPOO9EOa8dZOAsiG5PKSt-ODeQdgjThntS_VvH0bv68Y90h9A-c3CrguEecL2syU9naUYQfYjY7blOoc"],
    },
    {
      id:          "seed-prod-zarin",
      slug:        "zarin-e-ishq",
      title:       "Zarin-e-Ishq",
      subTitle:    "Champagne Gold Banarasi Lehenga",
      description: "An exquisite symphony of heritage champagne and gold tones. Woven with Banarasi brocade.",
      fabric:      "Banarasi Silk Brocade",
      embroidery:  "Hand-Woven Zari & Liquid Veils",
      details:     ["Traditional liquid gold drape appearance", "Bespoke Banarasi craftsmanship from Varanasi", "Detailed handcrafted custom blouse options", "Heirloom preservation box included"],
      category:    ProductCategory.BRIDAL,
      status:      ProductStatus.PUBLISHED,
      price:       null,
      isEnquireOnly: true,
      isFeatured:  true,
      occasions:   ["wedding", "reception"],
      images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuCIdam-zN36FckFdF2m4V23cuzeQOt4B_ASSrQdgz7xthL0ip8vD-A1bWDvEGoPfbjvjoBeVb50p6vSQmZC3OkDxaxtTfCAXs8mcF2OuBLPKWGfIcZYBTg5YyVZsjdv6a-Md8pmDQ-0rZiDVqKwgPn2SPClU6tBujpWNcQMGAV8ig01d1jbWSYQq7QyoyN9hnIuuqczByuHyzpOdCK8QKbiU3g0xvAOzdRjp-ppkQhb2oFHYYgoBc4LWFNd43IIEnz8n-2ZJ1a_ajA"],
    },
  ];

  for (const seed of productSeeds) {
    const { occasions: occasionSlugs, images, id, ...productData } = seed;
    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: {
        id,
        ...productData,
        images: {
          create: images.map((url, i) => ({
            url,
            cloudinaryId: `pehnawa/products/${productData.slug}/${i}`,
            isPrimary:    i === 0,
            sortOrder:    i,
          })),
        },
        occasions: {
          create: (occasionSlugs ?? [])
            .filter((s) => occasionMap[s])
            .map((s) => ({ occasionId: occasionMap[s] })),
        },
      },
    });
  }
  console.log(`✅ ${productSeeds.length} products seeded`);

  // ── 7. Cart ───────────────────────────────────────────────────
  await prisma.cart.upsert({
    where: { userId: customer.id },
    update: {},
    create: {
      userId: customer.id,
      items: {
        create: {
          productId: "seed-prod-sage",
          quantity:  1,
          size:      "M",
        },
      },
    },
  });
  console.log(`✅ Cart seeded`);

  // ── 8. Wishlist ───────────────────────────────────────────────
  await prisma.wishlist.upsert({
    where: { userId: customer.id },
    update: {},
    create: {
      userId: customer.id,
      items: {
        create: [
          { productId: "seed-prod-noorani" },
          { productId: "seed-prod-noor" },
        ],
      },
    },
  });
  console.log(`✅ Wishlist seeded`);

  // ── 9. Wallet ─────────────────────────────────────────────────
  await prisma.wallet.upsert({
    where: { userId: customer.id },
    update: {},
    create: {
      userId:  customer.id,
      balance: 10000, // ₹100 welcome credit
      transactions: {
        create: {
          type:        WalletTxType.CREDIT,
          reason:      WalletTxReason.ADMIN_CREDIT,
          amount:      10000,
          balance:     10000,
          description: "Welcome bonus from Pehnawa Atelier",
        },
      },
    },
  });
  console.log(`✅ Wallet seeded`);

  // ── 10. Referral Code ─────────────────────────────────────────
  await prisma.referralCode.upsert({
    where: { userId: customer.id },
    update: {},
    create: {
      userId:        customer.id,
      code:          "ASHRAYA100",
      referrerBonus: 10000,
      referredBonus: 5000,
    },
  });
  console.log(`✅ Referral code seeded`);

  // ── 11. Consultation Request ──────────────────────────────────
  await prisma.consultationRequest.create({
    data: {
      userId:        customer.id,
      clientName:    "Ashraya Mishra",
      clientEmail:   "ashraya@pehnawa.com",
      clientPhone:   "+91 98765 43210",
      type:          ConsultationType.VIRTUAL,
      status:        ConsultationStatus.SCHEDULED,
      requestedDate: new Date("2026-06-06"),
      requestedTime: "10:00 AM",
      scheduledAt:   new Date("2026-06-06T10:00:00+05:30"),
      message:       "Interested in bridal trousseau consultation — Noor-ul-Haya and bespoke blouse options.",
    },
  });
  console.log(`✅ Consultation request seeded`);

  // ── 12. Sample Order + Payment ────────────────────────────────
  const order = await prisma.order.create({
    data: {
      orderNumber: "PEH-2026-000001",
      userId:      customer.id,
      addressId:   address.id,
      status:      OrderStatus.DELIVERED,
      subtotal:    450000,
      discount:    10000, // ₹100 wallet credit used
      shipping:    0,
      total:       440000,
      giftDraping: true,
      deliveredAt: new Date("2026-05-20"),
      items: {
        create: {
          productId:           "seed-prod-sage",
          productTitle:        "The Sage Minimalist Kurta",
          productSlug:         "sage-kurta",
          productImageUrl:     "https://lh3.googleusercontent.com/aida-public/AB6AXuCQEdOybn...",
          unitPrice:           450000,
          quantity:            1,
          size:                "M",
          measurementProfileId: measurements.id,
        },
      },
      payment: {
        create: {
          method:           PaymentMethod.MIXED,
          status:           PaymentStatus.PAID,
          amount:           440000,
          walletAmount:     10000,
          razorpayAmount:   430000,
          razorpayOrderId:  "order_seed_001",
          razorpayPaymentId:"pay_seed_001",
          razorpaySignature:"seed_sig_001",
          paidAt:           new Date("2026-05-10"),
        },
      },
    },
  });
  console.log(`✅ Sample order seeded: ${order.orderNumber}`);

  console.log("\n🎉 Seeding complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
