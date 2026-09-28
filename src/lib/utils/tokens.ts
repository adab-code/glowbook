import { createHash, randomBytes } from "node:crypto";

/** URL-safe random token. 32 bytes gives 256 bits of entropy. */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

/**
 * Hash a token for storage. Reset and invite tokens are single-use, so a plain
 * SHA-256 digest is enough: there is no need to brute-force a random 256-bit value,
 * and lookups stay fast because the digest is the lookup key.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
export const STAFF_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
