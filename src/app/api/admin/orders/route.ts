import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, Prisma } from "@/generated/client";
import { successResponse, handleError } from "@/lib/errors";
import { buildPaginatedResponse } from "@/lib/pagination";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";

// GET /api/admin/orders?status=&search=&page=&limit=
export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { searchParams } = req.nextUrl;
    const { status, search, page, limit } = z.object({
      status: z.nativeEnum(OrderStatus).optional(),
      search: z.string().max(100).optional(),
      page:   z.coerce.number().int().positive().default(1),
      limit:  z.coerce.number().int().positive().max(500).default(20),
    }).parse(Object.fromEntries(searchParams.entries()));

    const skip  = (page - 1) * limit;
    const where: Prisma.OrderWhereInput = {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(search ? {
        OR: [
          { orderNumber: { contains: search, mode: "insensitive" } },
          { user: { email: { contains: search, mode: "insensitive" } } },
          { user: { name:  { contains: search, mode: "insensitive" } } },
        ],
      } : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user:    { select: { id: true, name: true, email: true, phone: true } },
          address: true,
          items:   true,
          payment: { select: { status: true, method: true, amount: true, razorpayOrderId: true, razorpayPaymentId: true, createdAt: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return successResponse(buildPaginatedResponse(orders, total, { page, limit, skip }));
  } catch (e) {
    return handleError(e);
  }
}
