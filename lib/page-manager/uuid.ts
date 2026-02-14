/**
 * UUID generation utility for unique page IDs
 * Uses crypto.randomUUID() when available, falls back to a custom implementation
 */

/**
 * Generates a RFC4122 version 4 compliant UUID
 * @returns A unique UUID string
 */
export function generateUUID(): string {
  // Use native crypto.randomUUID if available (modern browsers and Node.js 16.7+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback implementation for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
