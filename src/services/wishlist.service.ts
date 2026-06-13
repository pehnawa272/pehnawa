import { prisma } from "@/lib/prisma";
import { NotFoundError, ConflictError } from "@/lib/errors";

const wishlistInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true, slug: true, title: true, subTitle: true,
          price: true, isEnquireOnly: true, category: true,
          images: { where: { isPrimary: true }, take: 1, select: { url: true } },
        },
      },
    },
    orderBy: { addedAt: "desc" as const },
  },
};

export const WishlistService = {

  async getByClerkId(clerkId: string) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundError("User");

    const wishlist = await prisma.wishlist.findUnique({
      where:   { userId: user.id },
      include: wishlistInclude,
    });

    // Return a default empty structure if the wishlist doesn't exist yet
    if (!wishlist) {
      return {
        id:        "",
        userId:    user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        items:     [],
      };
    }

    return wishlist;
  },

  async addProduct(clerkId: string, productId: string) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundError("User");

    const product = await prisma.product.findFirst({ where: { id: productId, deletedAt: null } });
    if (!product) throw new NotFoundError("Product");

    const wishlist = await prisma.wishlist.upsert({
      where:  { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    const existing = await prisma.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    });
    if (existing) throw new ConflictError("Product is already in wishlist");

    return prisma.wishlistItem.create({
      data: { wishlistId: wishlist.id, productId },
    });
  },

  async removeProduct(clerkId: string, productId: string) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundError("User");

    const wishlist = await prisma.wishlist.findUnique({ where: { userId: user.id } });
    if (!wishlist) throw new NotFoundError("Wishlist");

    const item = await prisma.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    });
    if (!item) throw new NotFoundError("Wishlist item");

    await prisma.wishlistItem.delete({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    });
    return { productId };
  },
};
