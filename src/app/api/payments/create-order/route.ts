/**
 * POST /api/payments/create-order
 *
 * Creates a Razorpay order for guest checkout details and items.
 * Caches the checkout payload locally.
 */

import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { successResponse, handleError, AppError } from "@/lib/errors";
import { PendingOrderStore } from "@/lib/pending-order-store";
import { z } from "zod";

let razorpayClient: Razorpay | null = null;
function getRazorpay() {
  if (!razorpayClient) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new AppError("Razorpay credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are missing.", 500);
    }
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayClient;
}

const CustomTailoringInputSchema = z.object({
  neckline:          z.string().max(50).nullable().optional(),
  sleeve:            z.string().max(50).nullable().optional(),
  customSizeEnabled: z.boolean().default(false),
  bust:              z.string().max(10).nullable().optional(),
  waist:             z.string().max(10).nullable().optional(),
  height:            z.string().max(10).nullable().optional(),
  notes:             z.string().max(500).nullable().optional(),
});

const CheckoutItemInputSchema = z.object({
  id:                  z.string().min(1), // product id
  quantity:            z.number().int().positive().max(10),
  size:                z.string().max(20).nullable().optional(),
  colour:              z.string().max(50).nullable().optional(),
  customTailoring:     CustomTailoringInputSchema.nullable().optional(),
  measurementProfileId: z.string().cuid().nullable().optional(),
});

const ShippingFormSchema = z.object({
  name:        z.string().min(1).max(100),
  email:       z.string().email(),
  phone:       z.string().min(5).max(20),
  address:     z.string().min(1).max(500),
  city:        z.string().min(1).max(100),
  state:       z.string().min(1).max(100),
  zip:         z.string().min(4).max(10),
  giftDraping: z.boolean().default(false),
});

const CreateOrderPayloadSchema = z.object({
  shippingForm: ShippingFormSchema,
  items:        z.array(CheckoutItemInputSchema).min(1).max(20),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shippingForm, items } = CreateOrderPayloadSchema.parse(body);

    // Fetch products and calculate total price in paise
    const productIdsOrSlugs = items.map((i) => i.id);
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { id: { in: productIdsOrSlugs } },
          { slug: { in: productIdsOrSlugs } }
        ],
        deletedAt: null,
      },
    });

    const productMap = new Map();
    for (const p of products) {
      productMap.set(p.id, p);
      productMap.set(p.slug, p);
    }
    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(item.id);
      if (!product) {
        throw new AppError(`Product ${item.id} not found`, 404);
      }
      if (product.status !== "PUBLISHED") {
        throw new AppError(`"${product.title}" is currently not available`, 400);
      }
      if (product.isEnquireOnly || !product.price) {
        throw new AppError(`"${product.title}" is enquire-only and cannot be purchased directly`, 400);
      }
      subtotal += product.price * item.quantity;
    }

    if (subtotal <= 0) {
      throw new AppError("Order total must be greater than zero", 400);
    }

    // Create Razorpay Order
    const rzpOrder = await getRazorpay().orders.create({
      amount:   subtotal, // stored in paise, matching Razorpay expectation
      currency: "INR",
      receipt:  `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      notes: {
        clientEmail: shippingForm.email,
        itemCount:   String(items.length),
      },
    });

    // Save full checkout details to server cache
    await PendingOrderStore.save(rzpOrder.id, {
      razorpayOrderId: rzpOrder.id,
      items: items.map((item) => ({
        productId:            item.id,
        quantity:             item.quantity,
        size:                 item.size ?? undefined,
        colour:               item.colour ?? undefined,
        customTailoring:      item.customTailoring ?? undefined,
        measurementProfileId: item.measurementProfileId ?? undefined,
      })),
      shippingForm,
      totalAmountInPaise: subtotal,
    });

    return successResponse({
      razorpayOrderId: rzpOrder.id,
      amount:          subtotal,
      currency:        "INR",
      keyId:           process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      prefill: {
        name:    shippingForm.name,
        email:   shippingForm.email,
        contact: shippingForm.phone,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
