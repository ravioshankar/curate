// encryption.ts - simple placeholder for backup encryption
// Replace with a proper crypto/KMS-backed implementation in production

export async function encryptString(plain: string, key: string): Promise<string> {
  // naive XOR-based placeholder (NOT SECURE)
  const out = Array.from(plain).map((ch, i) => String.fromCharCode(ch.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join('');
  return btoa(out);
}

export async function decryptString(enc: string, key: string): Promise<string> {
  const raw = atob(enc);
  const out = Array.from(raw).map((ch, i) => String.fromCharCode(ch.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join('');
  return out;
}
