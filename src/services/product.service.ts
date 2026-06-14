import { prisma } from "@/lib/prisma";
import { ProductStatus, Prisma } from "@/generated/client";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { buildPaginatedResponse } from "@/lib/pagination";
import type { CreateProductInput, UpdateProductInput, ProductFilterInput } from "@/lib/validations/product";

// ─── Selectors ───────────────────────────────────────────────────────────────

const productCardSelect = {
  id: true, slug: true, title: true, subTitle: true,
  price: true, isEnquireOnly: true, category: true, subCategory: true,
  status: true, isFeatured: true, craftingHours: true, sortOrder: true,
  createdAt: true,
  images: { where: { isPrimary: true }, take: 1, select: { url: true, alt: true } },
} satisfies Prisma.ProductSelect;

const productDetailSelect = {
  ...productCardSelect,
  description: true, fabric: true, embroidery: true, details: true, colours: true,
  images:   { orderBy: { sortOrder: "asc" as const } },
  videos:   { orderBy: { sortOrder: "asc" as const } },
  occasions: { include: { occasion: true } },
  accessories: {
    include: {
      accessory: {
        select: { id: true, slug: true, title: true, price: true,
          images: { where: { isPrimary: true }, take: 1 } },
      },
    },
  },
} satisfies Prisma.ProductSelect;

// ─── Service ─────────────────────────────────────────────────────────────────

export const ProductService = {

  async list(filters: ProductFilterInput) {
    const { page, limit, category, status, featured, search, minPrice, maxPrice, occasionId, sortBy, sortOrder } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ...(status === ProductStatus.DELETED ? {} : { deletedAt: null }),
      ...(status   ? { status }               : { status: ProductStatus.PUBLISHED }),
      ...(category ? { category }             : {}),
      ...(featured !== undefined ? { isFeatured: featured } : {}),
      ...(minPrice !== undefined ? { price: { gte: minPrice } } : {}),
      ...(maxPrice !== undefined ? { price: { lte: maxPrice } } : {}),
      ...(occasionId ? { occasions: { some: { occasionId } } } : {}),
      ...(search ? {
        OR: [
          { title:       { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { fabric:      { contains: search, mode: "insensitive" } },
        ],
      } : {}),
    };

    const [raw, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select:  productCardSelect,
        orderBy: sortBy
          ? [{ [sortBy]: sortOrder || "desc" }]
          : [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const items = raw.map((p) => ({
      ...p,
      primaryImage: p.images[0]?.url ?? null,
    }));

    return buildPaginatedResponse(items, total, { page, limit, skip });
  },

  async getBySlug(slug: string) {
    const product = await prisma.product.findFirst({
      where:  { slug, deletedAt: null, status: { not: ProductStatus.DELETED } },
      select: productDetailSelect,
    });
    if (!product) throw new NotFoundError("Product");
    return product;
  },

  async getById(id: string) {
    const product = await prisma.product.findFirst({
      where:  { id, deletedAt: null },
      select: productDetailSelect,
    });
    if (!product) throw new NotFoundError("Product");
    return product;
  },

  async create(data: CreateProductInput) {
    const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (existing) throw new ConflictError(`Slug "${data.slug}" is already in use`);

    const { occasionIds, ...rest } = data;

    return prisma.product.create({
      data: {
        ...rest,
        status: ProductStatus.DRAFT,
        occasions: occasionIds?.length
          ? { create: occasionIds.map((occasionId) => ({ occasionId })) }
          : undefined,
      },
      select: productDetailSelect,
    });
  },

  async update(id: string, data: UpdateProductInput) {
    await ProductService.getById(id); // throws NotFoundError if missing

    const { occasionIds, ...rest } = data as UpdateProductInput & { occasionIds?: string[] };

    return prisma.$transaction(async (tx) => {
      if (occasionIds !== undefined) {
        await tx.productOccasion.deleteMany({ where: { productId: id } });
        if (occasionIds.length) {
          await tx.productOccasion.createMany({
            data: occasionIds.map((occasionId) => ({ productId: id, occasionId })),
          });
        }
      }

      return tx.product.update({
        where:  { id },
        data:   rest,
        select: productDetailSelect,
      });
    });
  },

  async setStatus(id: string, status: ProductStatus) {
    await ProductService.getById(id);
    return prisma.product.update({
      where: { id },
      data:  { status },
      select: productCardSelect,
    });
  },

  async softDelete(id: string) {
    await ProductService.getById(id);
    return prisma.product.update({
      where: { id },
      data:  { deletedAt: new Date(), status: ProductStatus.DELETED },
      select: { id: true, slug: true, deletedAt: true },
    });
  },

  async restore(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundError("Product");
    return prisma.product.update({
      where:  { id },
      data:   { deletedAt: null, status: ProductStatus.DRAFT },
      select: productCardSelect,
    });
  },

  // ── Images ─────────────────────────────────────────────────────────────────

  async addImage(productId: string, data: {
    url: string; cloudinaryId: string; alt?: string; isPrimary?: boolean; sortOrder?: number;
  }) {
    await ProductService.getById(productId);

    if (data.isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId },
        data:  { isPrimary: false },
      });
    }

    return prisma.productImage.create({
      data: { productId, ...data },
    });
  },

  async removeImage(imageId: string) {
    const image = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) throw new NotFoundError("Image");
    await prisma.productImage.delete({ where: { id: imageId } });
    return { id: imageId, cloudinaryId: image.cloudinaryId };
  },

  async reorderImages(productId: string, order: { id: string; sortOrder: number }[]) {
    await ProductService.getById(productId);
    await prisma.$transaction(
      order.map(({ id, sortOrder }) =>
        prisma.productImage.update({ where: { id }, data: { sortOrder } })
      )
    );
    return prisma.productImage.findMany({
      where:   { productId },
      orderBy: { sortOrder: "asc" },
    });
  },

  // ── Videos ─────────────────────────────────────────────────────────────────

  async addVideo(productId: string, data: {
    url: string; cloudinaryId: string; thumbnail?: string; sortOrder?: number;
  }) {
    await ProductService.getById(productId);
    return prisma.productVideo.create({ data: { productId, ...data } });
  },

  async removeVideo(videoId: string) {
    const video = await prisma.productVideo.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundError("Video");
    await prisma.productVideo.delete({ where: { id: videoId } });
    return { id: videoId, cloudinaryId: video.cloudinaryId };
  },
};
