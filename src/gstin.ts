import { getStateByCode } from './states';
import type { GSTINValidation, ParsedGSTIN } from './types';

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
/** Compute the base-36 checksum of exactly 14 alphanumeric characters.
 * @example getGSTINChecksum('27AAPFU0939F1Z'); // 'V'
 * @throws {RangeError} For a non-alphanumeric or incorrectly sized prefix.
 */
export function getGSTINChecksum(first14: string): string {
  const input = first14.trim().toUpperCase();
  if (!/^[0-9A-Z]{14}$/.test(input)) throw new RangeError('Expected 14 alphanumeric characters');
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    const product = ALPHABET.indexOf(input.charAt(i)) * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + product % 36;
  }
  return ALPHABET.charAt((36 - sum % 36) % 36);
}
/** Validate GSTIN structure, recognized code and checksum, not registration status.
 * @example validateGSTIN('27AAPFU0939F1ZV'); // { valid: true }
 */
export function validateGSTIN(gstin: string): GSTINValidation {
  const value = gstin.trim().toUpperCase();
  if (value.length !== 15) return { valid: false, error: 'LENGTH' };
  if (!/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(value)) return { valid: false, error: 'FORMAT' };
  if (!getStateByCode(value.slice(0, 2))) return { valid: false, error: 'STATE_CODE' };
  if (getGSTINChecksum(value.slice(0, 14)) !== value.charAt(14)) return { valid: false, error: 'CHECKSUM' };
  return { valid: true };
}
/** Parse a valid GSTIN, or return null.
 * @example parseGSTIN('27AAPFU0939F1ZV')?.stateName; // 'Maharashtra'
 */
export function parseGSTIN(gstin: string): ParsedGSTIN | null {
  if (!validateGSTIN(gstin).valid) return null;
  const value = gstin.trim().toUpperCase();
  const stateCode = value.slice(0, 2);
  return { stateCode, stateName: getStateByCode(stateCode)!.name, pan: value.slice(2, 12), entityNumber: value.charAt(12), checksum: value.charAt(14) };
}
