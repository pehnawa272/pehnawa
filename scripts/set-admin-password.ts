/**
 * Set (or reset) the admin user's password.
 *
 * Usage:
 *   ADMIN_INITIAL_PASSWORD="your-strong-password" npm run admin:set-password
 *   # or pass it as an argument:
 *   npm run admin:set-password -- "your-strong-password"
 *
 * Targets the user whose email is ADMIN_LOGIN_EMAIL (default admin@pehnawa.com).
 * Hashes with scrypt (src/lib/password.ts) and stores in User.passwordHash.
 *
 * Note: connects via the DIRECT Postgres URL (Supabase pooler can't be used
 * for some operations); we derive it from DATABASE_URL if needed.
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/password";

const ADMIN_EMAIL = process.env.ADMIN_LOGIN_EMAIL ?? "admin@pehnawa.com";

function directUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  // Supabase: pooler (6543/pgbouncer) → direct (5432) for writes from scripts.
  return url.replace(":6543", ":5432").replace(/\?pgbouncer=true/, "");
}

async function main() {
  const password = process.env.ADMIN_INITIAL_PASSWORD ?? process.argv[2];
  if (!password) {
    console.error(
      "❌ No password provided. Set ADMIN_INITIAL_PASSWORD or pass it as an argument."
    );
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString: directUrl() });
  const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: { passwordHash },
    });
    console.log(`✅ Password set for admin user: ${user.email}`);
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2025") {
      console.error(`❌ No user found with email ${ADMIN_EMAIL}. Run \`npm run db:seed\` first.`);
    } else {
      console.error("❌ Failed to set password:", e);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
