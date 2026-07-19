import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";

/**
 * POST /api/reviews/lookup-products
 * Public endpoint to look up reviewable products for a customer.
 * Accepts { email, phone } in body (at least one is required).
 * Rate limit: 10 requests per hour per IP.
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limit lookup to prevent enumeration: 10 per hour per IP
    const rl = await checkRateLimit(req, "review_lookup", { requests: 10, duration: "1 h" });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many lookup attempts, please try again later." },
        { status: 429 }
      );
    }

    const { email, phone } = await req.json();

    const cleanEmail = email?.trim();
    const cleanPhone = phone?.trim();

    if (!cleanEmail && !cleanPhone) {
      return NextResponse.json({ success: true, products: [] });
    }

    // 1. Build the user search conditions
    const userOrConditions = [];
    if (cleanEmail) {
      userOrConditions.push({ email: { equals: cleanEmail, mode: "insensitive" } });
    }
    if (cleanPhone) {
      userOrConditions.push({ phone: { equals: cleanPhone } });
    }

    // 2. Find matching users first (decoupled query)
    const users = await prisma.user.findMany({
      where: {
        OR: userOrConditions as any,
      },
      select: {
        id: true,
      },
    });

    if (users.length === 0) {
      return NextResponse.json({ success: true, products: [] });
    }

    const userIds = users.map((u) => u.id);

    // 3. Find delivered orders for those user IDs
    const orders = await prisma.order.findMany({
      where: {
        status: "DELIVERED",
        userId: { in: userIds },
      },
      include: {
        items: true,
      },
    });

    if (orders.length === 0) {
      return NextResponse.json({ success: true, products: [] });
    }

    // Map order items to unique product lookup objects
    const items = orders.flatMap((order) =>
      order.items.map((item) => ({
        orderId: order.id,
        orderNumber: order.orderNumber,
        productId: item.productId,
        productTitle: item.productTitle,
        productImageUrl: item.productImageUrl || null,
      }))
    );

    if (items.length === 0) {
      return NextResponse.json({ success: true, products: [] });
    }

    // Check for existing reviews matching these orderId + productId combinations
    const existingReviews = await prisma.review.findMany({
      where: {
        OR: items.map((item) => ({
          orderId: item.orderId,
          productId: item.productId,
        })),
      },
      select: {
        orderId: true,
        productId: true,
      },
    });

    const reviewedKeys = new Set(
      existingReviews.map((r) => `${r.orderId}:${r.productId}`)
    );

    // Filter down to reviewable items only
    const reviewableProducts = items.filter(
      (item) => !reviewedKeys.has(`${item.orderId}:${item.productId}`)
    );

    // Return the minimal info needed for review submission selection
    return NextResponse.json({
      success: true,
      products: reviewableProducts,
    });
  } catch (err) {
    console.error("Lookup products error:", err);
    return NextResponse.json(
      { error: "An error occurred while finding your orders." },
      { status: 500 }
    );
  }
}
