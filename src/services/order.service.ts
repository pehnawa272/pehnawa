import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentMethod, PaymentStatus, WalletTxType, WalletTxReason } from "@/generated/client";
import { NotFoundError, AppError, ForbiddenError } from "@/lib/errors";
import { buildPaginatedResponse } from "@/lib/pagination";
import type { CreateOrderInput } from "@/lib/validations/order";

function generateOrderNumber(): string {
  const year   = new Date().getFullYear();
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `PEH-${year}-${suffix}`;
}

const STATUS_TIMESTAMP: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.ACCEPTED]:      "acceptedAt",
  [OrderStatus.IN_STITCHING]:  "stitchingAt",
  [OrderStatus.QUALITY_CHECK]: "qualityCheckAt",
  [OrderStatus.READY_TO_SHIP]: "readyAt",
  [OrderStatus.SHIPPED]:       "shippedAt",
  [OrderStatus.DELIVERED]:     "deliveredAt",
  [OrderStatus.CANCELLED]:     "cancelledAt",
};

const orderInclude = {
  items: {
    include: {
      product: { select: { slug: true, title: true } },
      measurementProfile: { select: { label: true } },
    },
  },
  payment: true,
  address: true,
  user:    { select: { id: true, name: true, email: true, phone: true } },
};

export const OrderService = {

  async create(input: CreateOrderInput) {
    const { clerkId, addressId, items, walletAmountToUse = 0, giftDraping, giftMessage } = input;

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundError("User");

    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: user.id, deletedAt: null },
    });
    if (!address) throw new NotFoundError("Address");

    // Fetch products and snapshot prices
    const productIds = items.map((i) => i.productId);
    const products   = await prisma.product.findMany({
      where:   { id: { in: productIds }, deletedAt: null },
      include: { images: { where: { isPrimary: true }, take: 1 } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new AppError(`Product ${item.productId} not found`, 400);
      if (product.isEnquireOnly || !product.price) {
        throw new AppError(`"${product.title}" is an enquire-only product and cannot be ordered directly`, 400);
      }
      subtotal += product.price * item.quantity;
      return {
        product:              { connect: { id: product.id } },
        productTitle:         product.title,
        productSlug:          product.slug,
        productImageUrl:      product.images[0]?.url ?? null,
        unitPrice:            product.price,
        quantity:             item.quantity,
        size:                 item.size ?? null,
        colour:               item.colour ?? null,
        customTailoring:      (item.customTailoring ?? undefined) as object | undefined,
        measurementProfileId: item.measurementProfileId ?? null,
      };
    });

    // Resolve wallet usage
    const wallet             = await prisma.wallet.findUnique({ where: { userId: user.id } });
    const effectiveWalletUse = Math.min(walletAmountToUse, wallet?.balance ?? 0, subtotal);
    const razorpayAmount     = subtotal - effectiveWalletUse;
    const paymentMethod: PaymentMethod =
      effectiveWalletUse > 0 && razorpayAmount === 0 ? PaymentMethod.WALLET :
      effectiveWalletUse > 0                         ? PaymentMethod.MIXED  :
                                                       PaymentMethod.RAZORPAY;

    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber:  generateOrderNumber(),
          userId:       user.id,
          addressId,
          status:       OrderStatus.NEW,
          subtotal,
          discount:     effectiveWalletUse,
          shipping:     0,
          total:        subtotal - effectiveWalletUse,
          giftDraping:  giftDraping ?? false,
          giftMessage:  giftMessage ?? null,
          items:        { create: orderItems },
          payment: {
            create: {
              method:        paymentMethod,
              status:        PaymentStatus.PENDING,
              amount:        subtotal - effectiveWalletUse,
              walletAmount:  effectiveWalletUse,
              razorpayAmount,
            },
          },
        },
        include: orderInclude,
      });

      // Debit wallet if used
      if (effectiveWalletUse > 0 && wallet) {
        const newBalance = wallet.balance - effectiveWalletUse;
        await tx.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } });
        await tx.walletTransaction.create({
          data: {
            walletId:    wallet.id,
            type:        WalletTxType.DEBIT,
            reason:      WalletTxReason.ORDER_PAYMENT,
            amount:      effectiveWalletUse,
            balance:     newBalance,
            description: `Applied to order ${order.orderNumber}`,
            referenceId: order.id,
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cart: { userId: user.id } } });

      return order;
    });
  },

  async createGuestOrder(payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    items: Array<{
      productId: string;
      quantity: number;
      size?: string;
      colour?: string;
      customTailoring?: any;
      measurementProfileId?: string;
    }>;
    shippingForm: {
      name: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      zip: string;
      giftDraping: boolean;
    };
    totalAmountInPaise: number;
    subtotalAmountInPaise?: number;
    discountAmountInPaise?: number;
    couponCode?: string;
  }) {
    const {
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
      items, shippingForm, totalAmountInPaise,
      subtotalAmountInPaise, discountAmountInPaise, couponCode,
    } = payload;

    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Find or create the user by email
        let user = await tx.user.findUnique({ where: { email: shippingForm.email } });
        if (!user) {
          user = await tx.user.create({
            data: {
              email:     shippingForm.email,
              name:      shippingForm.name,
              phone:     shippingForm.phone,
              clerkId:   `guest_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`,
              role:      "CUSTOMER",
            },
          });
        }

        // 2. Create the Address
        const address = await tx.address.create({
          data: {
            userId:    user.id,
            type:      "SHIPPING",
            name:      shippingForm.name,
            phone:     shippingForm.phone,
            line1:     shippingForm.address,
            city:      shippingForm.city,
            state:     shippingForm.state,
            pincode:   shippingForm.zip,
            country:   "IN",
          },
        });

        // 3. Prepare order items
        const productIdsOrSlugs = items.map((i) => i.productId);
        const products = await tx.product.findMany({
          where: {
            OR: [
              { id: { in: productIdsOrSlugs } },
              { slug: { in: productIdsOrSlugs } }
            ],
            deletedAt: null,
          },
          include: { images: { where: { isPrimary: true }, take: 1 } },
        });
        const productMap = new Map();
        for (const p of products) {
          productMap.set(p.id, p);
          productMap.set(p.slug, p);
        }

        let calculatedSubtotal = 0;
        const orderItems = items.map((item) => {
          const product = productMap.get(item.productId);
          if (!product) throw new AppError(`Product ${item.productId} not found`, 400);
          calculatedSubtotal += product.price! * item.quantity;
          return {
            productId:            product.id,
            productTitle:         product.title,
            productSlug:          product.slug,
            productImageUrl:      product.images[0]?.url ?? null,
            unitPrice:            product.price!,
            quantity:             item.quantity,
            size:                 item.size ?? null,
            colour:               item.colour ?? null,
            customTailoring:      (item.customTailoring ?? undefined) as any,
            measurementProfileId: item.measurementProfileId ?? null,
          };
        });

        // Double-check total amount matches calculation
        // When a coupon is applied, totalAmountInPaise = subtotal - discount
        const expectedSubtotal = subtotalAmountInPaise ?? totalAmountInPaise;
        if (calculatedSubtotal !== expectedSubtotal) {
          console.error(`[createGuestOrder] Amount mismatch: calculated=${calculatedSubtotal} vs expected=${expectedSubtotal}`);
          throw new AppError("Order calculation mismatch", 400);
        }

        const discount = discountAmountInPaise ?? 0;
        const orderTotal = calculatedSubtotal - discount;

        // 4. Resolve coupon (if code was used)
        let couponId: string | undefined;
        if (couponCode) {
          const coupon = await tx.coupon.findUnique({ where: { code: couponCode } });
          if (coupon) {
            // Final safety: prevent same email from reusing a coupon
            const alreadyUsed = await tx.order.findFirst({
              where: {
                userId: user.id,
                couponId: coupon.id,
                payment: { status: "PAID" },
              },
            });
            if (alreadyUsed) {
              throw new AppError("You have already used this coupon code", 400);
            }

            couponId = coupon.id;
            // Increment usedCount atomically
            await tx.coupon.update({
              where: { id: coupon.id },
              data: { usedCount: { increment: 1 } },
            });
          }
        }

        // 5. Create Order + OrderItems + Payment
        const order = await tx.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            userId:      user.id,
            addressId:   address.id,
            status:      OrderStatus.NEW,
            subtotal:    calculatedSubtotal,
            discount,
            shipping:    0,
            total:       orderTotal,
            giftDraping: shippingForm.giftDraping,
            giftMessage: null,
            ...(couponId ? { couponId } : {}),
            items: {
              create: orderItems,
            },
            payment: {
              create: {
                method:            PaymentMethod.RAZORPAY,
                status:            PaymentStatus.PAID,
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature,
                amount:            orderTotal,
                razorpayAmount:    orderTotal,
                paidAt:            new Date(),
              },
            },
          },
          include: orderInclude,
        });

        // 6. Clear active cart for this user (if any cart items exist)
        await tx.cartItem.deleteMany({
          where: { cart: { userId: user.id } },
        });

        return order;
      });
    } catch (err) {
      console.error("[OrderService.createGuestOrder ERROR]", err);
      throw err;
    }
  },

  async getById(id: string, clerkId?: string) {
    const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });
    if (!order) throw new NotFoundError("Order");

    // If clerkId provided, verify ownership (customers can only see their own)
    if (clerkId) {
      const user = await prisma.user.findUnique({ where: { clerkId } });
      if (!user || (order.userId !== user.id && user.role !== "ADMIN")) {
        throw new ForbiddenError("You do not have access to this order");
      }
    }

    return order;
  },

  async listByClerkId(clerkId: string, page: number, limit: number) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundError("User");

    const skip  = (page - 1) * limit;
    const where = { userId: user.id, deletedAt: null };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items:   { select: { productTitle: true, quantity: true, unitPrice: true } },
          payment: { select: { status: true, method: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return buildPaginatedResponse(orders, total, { page, limit, skip });
  },

  async updateStatus(
    id: string,
    status: OrderStatus | undefined,
    extras?: { trackingCode?: string; shippingCarrier?: string; trackingUrl?: string; cancellationReason?: string }
  ) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundError("Order");

    const tsField = status ? STATUS_TIMESTAMP[status] : undefined;

    return prisma.order.update({
      where: { id },
      data: {
        ...(status                       ? { status }                                         : {}),
        ...(extras?.trackingCode         ? { trackingCode: extras.trackingCode }               : {}),
        ...(extras?.shippingCarrier      ? { shippingCarrier: extras.shippingCarrier }         : {}),
        ...(extras?.trackingUrl          ? { trackingUrl: extras.trackingUrl }                 : {}),
        ...(extras?.cancellationReason   ? { cancellationReason: extras.cancellationReason }   : {}),
        ...(tsField                      ? { [tsField]: new Date() }                           : {}),
      },
      include: orderInclude,
    });
  },

  async cancel(id: string, clerkId: string, reason: string) {
    const user  = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundError("User");

    const order = await prisma.order.findFirst({ where: { id, userId: user.id } });
    if (!order) throw new NotFoundError("Order");

    const nonCancellable: OrderStatus[] = [
      OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED,
    ];
    if (nonCancellable.includes(order.status)) {
      throw new AppError(`Cannot cancel an order with status "${order.status}"`, 400, "INVALID_STATUS");
    }

    return OrderService.updateStatus(id, OrderStatus.CANCELLED, { cancellationReason: reason });
  },
};
