import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { checkRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

// Validation schema for review submission
const ReviewSchema = z.object({
  productId: z.string(),
  orderId: z.string(),
  customerName: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(1),
  images: z.array(z.string().url()).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

/**
 * POST /api/reviews/submit
 * Public endpoint for customers to submit a verified review after order delivery.
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 submissions per hour per IP
    const rl = await checkRateLimit(req, 'review_submit', { requests: 5, duration: '1 h' });
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests, please try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const data = ReviewSchema.parse(body);

    // Verify order exists and is delivered
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { user: true },
    });
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    if (order.status !== 'DELIVERED') {
      return NextResponse.json({ error: 'Order must be delivered before submitting a review.' }, { status: 400 });
    }

    // Email / phone matching (case‑insensitive)
    const userEmail = order.user.email?.toLowerCase();
    const userPhone = order.user.phone?.toLowerCase();
    const providedEmail = data.email?.toLowerCase();
    const providedPhone = data.phone?.toLowerCase();
    const emailMatches = providedEmail && userEmail && providedEmail === userEmail;
    const phoneMatches = providedPhone && userPhone && providedPhone === userPhone;
    if (!emailMatches && !phoneMatches) {
      return NextResponse.json({ error: 'Provided email or phone does not match order owner.' }, { status: 403 });
    }

    // Prevent duplicate review for same product + order
    const existing = await prisma.review.findFirst({
      where: { productId: data.productId, orderId: data.orderId },
    });
    if (existing) {
      return NextResponse.json({ error: 'A review for this product and order already exists.' }, { status: 400 });
    }

    // Create review (unapproved by default)
    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        orderId: data.orderId,
        customerName: data.customerName,
        rating: data.rating,
        text: data.text,
        images: data.images ?? [],
        isVerifiedPurchase: true,
        isApproved: false,
      },
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (e) {
    console.error('Review submit error:', e);
    const message = e instanceof Error ? e.message : 'Invalid request.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
