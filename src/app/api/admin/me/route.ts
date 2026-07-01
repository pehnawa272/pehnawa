import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { successResponse, handleError } from "@/lib/errors";

// GET /api/admin/me — returns the current admin, or 401/403 via the guard.
// Used by the client AdminAuthWrapper to decide whether to show the login form.
export async function GET() {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { user } = guard;
    return successResponse({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    return handleError(e);
  }
}
