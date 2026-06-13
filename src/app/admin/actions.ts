"use server";

import { prisma } from "@/lib/prisma";
import { ProductCategory, ProductStatus } from "@/generated/client";
import { requireAdmin } from "@/lib/admin-guard";
import { NextResponse } from "next/server";

// Fetch all occasions, create standard ones if none exist
export async function getOccasions() {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck instanceof NextResponse) {
      throw new Error("Forbidden: Admin role required");
    }

    let occasions = await prisma.occasion.findMany({
      orderBy: { name: "asc" },
    });

    if (occasions.length === 0) {
      // Seed default required occasions if database is empty
      const defaultOccasions = [
        { name: "Wedding Guest",    slug: "wedding-guest" },
        { name: "Haldi",            slug: "haldi" },
        { name: "Mehendi",          slug: "mehendi" },
        { name: "Reception",        slug: "reception" },
        { name: "Bridesmaid",       slug: "bridesmaid" },
        { name: "Festive",          slug: "festive" },
        { name: "Office Wear",      slug: "office-wear" },
        { name: "Cocktail Evening", slug: "cocktail-evening" },
        { name: "Wedding",          slug: "wedding" },
        { name: "Sangeet",          slug: "sangeet" },
        { name: "Casual",           slug: "casual" },
      ];

      await prisma.occasion.createMany({
        data: defaultOccasions,
        skipDuplicates: true,
      });

      occasions = await prisma.occasion.findMany({
        orderBy: { name: "asc" },
      });
    }

    return { success: true, data: occasions };
  } catch (error) {
    console.error("Failed to fetch occasions:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch occasions" };
  }
}

// Fetch list of products to link as accessories
export async function getAccessoryProducts() {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck instanceof NextResponse) {
      throw new Error("Forbidden: Admin role required");
    }

    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        status: { not: ProductStatus.DELETED },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
      },
      orderBy: { title: "asc" },
    });

    return { success: true, data: products };
  } catch (error) {
    console.error("Failed to fetch products for accessories:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch products" };
  }
}

