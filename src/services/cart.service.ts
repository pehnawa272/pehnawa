import { prisma } from "@/lib/prisma";
import { NotFoundError, AppError } from "@/lib/errors";
import type { AddToCartInput } from "@/lib/validations/cart";

const cartInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true, slug: true, title: true, price: true,
          isEnquireOnly: true, status: true,
          images: { where: { isPrimary: true }, take: 1, select: { url: true } },
        },
      },
    },
    orderBy: { addedAt: "asc" as const },
  },
};

export const CartService = {

  async getOrCreate(userId: string) {
    return prisma.cart.upsert({
      where:   { userId },
      update:  {},
      create:  { userId },
      include: cartInclude,
    });
  },

  async getByClerkId(clerkId: string) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundError("User");
    return CartService.getOrCreate(user.id);
  },

  async addItem(clerkId: string, input: AddToCartInput) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundError("User");

    const product = await prisma.product.findFirst({
      where: { id: input.productId, deletedAt: null },
    });
    if (!product) throw new NotFoundError("Product");
    if (product.isEnquireOnly) {
      throw new AppError("Enquire-only products cannot be added to cart", 400, "ENQUIRE_ONLY");
    }

    const cart = await CartService.getOrCreate(user.id);

    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: input.productId, size: input.size ?? null },
    });

    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data:  { quantity: existing.quantity + input.quantity },
      });
    }

    return prisma.cartItem.create({
      data: {
        cartId:          cart.id,
        productId:       input.productId,
        quantity:        input.quantity,
        size:            input.size ?? null,
        customTailoring: (input.customTailoring ?? undefined) as object | undefined,
      },
    });
  },

  async updateItemQuantity(clerkId: string, itemId: string, quantity: number) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundError("User");

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId: user.id } },
    });
    if (!item) throw new NotFoundError("Cart item");

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return null;
    }

    return prisma.cartItem.update({
      where: { id: itemId },
      data:  { quantity },
    });
  },

  async removeItem(clerkId: string, itemId: string) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundError("User");

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId: user.id } },
    });
    if (!item) throw new NotFoundError("Cart item");

    await prisma.cartItem.delete({ where: { id: itemId } });
    return { id: itemId };
  },

  async clear(clerkId: string) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundError("User");

    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) return { cleared: 0 };

    const { count } = await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return { cleared: count };
  },
};
