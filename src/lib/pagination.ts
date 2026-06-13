import { NextRequest } from "next/server";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function getPagination(req: NextRequest, defaultLimit = 20): PaginationParams {
  const page  = Math.max(1, parseInt(req.nextUrl.searchParams.get("page")  ?? "1",  10));
  const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") ?? String(defaultLimit), 10)));
  return { page, limit, skip: (page - 1) * limit };
}

export function buildPaginatedResponse<T>(
  items: T[],
  total: number,
  { page, limit }: PaginationParams
): PaginatedResponse<T> {
  const pages = Math.ceil(total / limit);
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  };
}
