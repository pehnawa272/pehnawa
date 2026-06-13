import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserRole, Prisma } from "@/generated/client";
import { successResponse, handleError } from "@/lib/errors";
import { buildPaginatedResponse } from "@/lib/pagination";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";

// GET /api/admin/customers?search=&page=&limit=
export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { searchParams } = req.nextUrl;
    const { search, page, limit } = z.object({
      search: z.string().max(100).optional(),
      page:   z.coerce.number().int().positive().default(1),
      limit:  z.coerce.number().int().positive().max(100).default(20),
    }).parse(Object.fromEntries(searchParams.entries()));

    const skip  = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {
      role:      UserRole.CUSTOMER,
      deletedAt: null,
      ...(search ? {
        OR: [
          { name:  { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
    };

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, phone: true, createdAt: true,
          wallet:       { select: { balance: true } },
          referralCode: { select: { code: true, usesCount: true } },
          _count:       { select: { orders: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return successResponse(buildPaginatedResponse(customers, total, { page, limit, skip }));
  } catch (e) {
    return handleError(e);
  }
}
