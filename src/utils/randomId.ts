/**
 * Generate a UUID string using the best available method.
 *
 * Uses `crypto.randomUUID` when present. Falls back to a small RFC4122 v4
 * implementation when unavailable.
 */
export function randomId(): string {
  if (typeof crypto !== 'undefined') {
    if (typeof (crypto as any).randomUUID === 'function') {
      return (crypto as any).randomUUID();
    }
    const bytes = new Uint8Array(16);
    if (typeof crypto.getRandomValues === 'function') {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i += 1) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }
    // set bits for version and `clock_seq_hi_and_reserved`
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0'));
    return (
      `${hex[0]}${hex[1]}${hex[2]}${hex[3]}-` +
      `${hex[4]}${hex[5]}-` +
      `${hex[6]}${hex[7]}-` +
      `${hex[8]}${hex[9]}-` +
      `${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`
    );
  }
  // Fallback when crypto is unavailable
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}