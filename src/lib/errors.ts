import { NextResponse } from "next/server";
import { ZodError } from "zod";

// ─── Custom error classes ────────────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

// ─── Standard API response shapes ───────────────────────────────────────────

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    message: string;
    code?: string;
    fields?: Record<string, string[]>; // Zod field errors
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function successResponse<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(
  message: string,
  status = 400,
  code?: string,
  fields?: Record<string, string[]>
): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error: { message, code, fields } },
    { status }
  );
}

// ─── Central error handler — wrap every route handler with this ──────────────

export function handleError(error: unknown): NextResponse<ApiError> {
  // Zod validation error
  if (error instanceof ZodError) {
    const fields: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = issue.path.join(".");
      if (!fields[key]) fields[key] = [];
      fields[key].push(issue.message);
    }
    return errorResponse("Validation failed", 422, "VALIDATION_ERROR", fields);
  }

  // Known app error
  if (error instanceof AppError) {
    return errorResponse(error.message, error.statusCode, error.code);
  }

  // Prisma unique constraint violation
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  ) {
    return errorResponse("A record with this value already exists", 409, "CONFLICT");
  }

  // Prisma record not found
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2025"
  ) {
    return errorResponse("Record not found", 404, "NOT_FOUND");
  }

  // Unknown error — log and return generic message
  console.error("[API Error]", error);
  const devMessage = error instanceof Error ? error.message : String(error);
  const devStack = error instanceof Error ? error.stack : undefined;
  const isDev = process.env.NODE_ENV === "development";
  return errorResponse(
    isDev ? devMessage : "Internal server error",
    500,
    "INTERNAL_ERROR",
    isDev ? { stack: devStack ? [devStack] : [] } : undefined
  );
}
