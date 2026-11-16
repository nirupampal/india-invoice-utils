import type { PANHolderType } from './types';

/** Validate PAN syntax, not issuance or ownership.
 * @example validatePAN('abcpa1234f'); // true
 */
export function validatePAN(pan: string): boolean { return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.trim().toUpperCase()); }
const HOLDERS: Readonly<Record<string, PANHolderType>> = { P: 'Individual', C: 'Company', H: 'Hindu Undivided Family', F: 'Firm', A: 'Association of Persons', T: 'Trust', B: 'Body of Individuals', L: 'Local Authority', J: 'Artificial Juridical Person', G: 'Government' };
/** Return a recognized fourth-character holder type, or null.
 * @example getPANHolderType('ABCPA1234F'); // 'Individual'
 */
export function getPANHolderType(pan: string): PANHolderType | null { return validatePAN(pan) ? HOLDERS[pan.trim().toUpperCase().charAt(3)] ?? null : null; }
/** Validate IFSC syntax, not bank-branch existence.
 * @example validateIFSC('SBIN0001234'); // true
 */
export function validateIFSC(ifsc: string): boolean { return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.trim().toUpperCase()); }
/** Validate six-digit pincode syntax, not postal allocation.
 * @example validatePincode('741101'); // true
 */
export function validatePincode(pincode: string): boolean { return /^[1-9][0-9]{5}$/.test(pincode.trim()); }
/** Normalize a mobile number, removing whitespace/dashes and one optional prefix.
 * @example normalizeIndianMobile('08617-624775'); // '+918617624775'
 */
export function normalizeIndianMobile(input: string): string | null {
  let value = input.trim().replace(/[\s-]/g, '');
  if (value.startsWith('+91')) value = value.slice(3);
  else if (value.length === 12 && value.startsWith('91')) value = value.slice(2);
  else if (value.length === 11 && value.startsWith('0')) value = value.slice(1);
  return /^[6-9]\d{9}$/.test(value) ? `+91${value}` : null;
}
/** Validate mobile syntax with optional +91, 91 or 0 prefix; no ownership lookup.
 * @example validateIndianMobile('+91 86176 24775'); // true
 */
export function validateIndianMobile(input: string): boolean { return normalizeIndianMobile(input) !== null; }
