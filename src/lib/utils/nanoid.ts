// src/lib/utils/nanoid.ts
// Simple client-side unique ID generator (no dependency needed)
export function nanoid(size = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const arr = new Uint8Array(size);
  if (typeof window !== "undefined") {
    window.crypto.getRandomValues(arr);
  }
  arr.forEach((v) => { result += chars[v % chars.length]; });
  return result;
}
