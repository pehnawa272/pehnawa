/**
 * Password hashing — scrypt (Node built-in crypto, zero dependencies).
 *
 * scrypt is a memory-hard KDF suitable for password storage. Each hash uses a
 * random 16-byte salt. Stored format is self-describing so params can evolve:
 *
 *   scrypt$<N>$<saltHex>$<hashHex>
 *
 * Verification is constant-time (timingSafeEqual) to avoid timing side-channels.
 */

import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

function scryptAsync(
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, options, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey as Buffer);
    });
  });
}

// scrypt cost parameter. 2^17 = 131072 — OWASP-recommended for password storage.
// Memory use ≈ 128 * N * r bytes (~134MB at r=8), so maxmem must be raised above
// Node's 32MB default; keep it in sync for hash and verify.
const N = 131072;
const KEY_LEN = 64;
const SALT_LEN = 16;
const MAXMEM = 256 * 1024 * 1024; // 256MB headroom

export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  const salt = randomBytes(SALT_LEN);
  const derived = (await scryptAsync(password, salt, KEY_LEN, { N, maxmem: MAXMEM })) as Buffer;
  return `scrypt$${N}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string | null | undefined
): Promise<boolean> {
  if (!stored) return false;

  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "scrypt") return false;

  const cost = Number.parseInt(parts[1], 10);
  const salt = Buffer.from(parts[2], "hex");
  const expected = Buffer.from(parts[3], "hex");
  if (!Number.isFinite(cost) || salt.length === 0 || expected.length === 0) {
    return false;
  }

  let derived: Buffer;
  try {
    derived = (await scryptAsync(password, salt, expected.length, { N: cost, maxmem: MAXMEM })) as Buffer;
  } catch {
    return false;
  }

  // Lengths are equal by construction, but guard before timingSafeEqual anyway.
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}
