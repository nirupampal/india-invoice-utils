import { precision, roundRatio, scaled, toPaise } from './money';
import type { INRFormatOptions, NumberFormatOptions } from './types';

function grouped(value: bigint, decimals: number): string {
  const digits = (value < 0n ? -value : value).toString().padStart(decimals + 1, '0');
  const integer = decimals ? digits.slice(0, -decimals) : digits;
  const head = integer.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const body = head ? `${head},${integer.slice(-3)}` : integer;
  return `${body}${decimals ? `.${digits.slice(-decimals)}` : ''}`;
}
/** Format with Indian digit grouping. Precision is 0-6; ties round away from zero.
 * @example formatIndianNumber(1234567.5); // '12,34,567.50'
 * @throws {RangeError} For non-finite input or invalid precision.
 */
export function formatIndianNumber(value: number, opts: NumberFormatOptions = {}): string {
  const decimals = opts.decimals ?? 2;
  precision(decimals);
  const rounded = scaled(value, decimals);
  return `${rounded < 0n ? '-' : ''}${grouped(rounded, decimals)}`;
}
/** Indian Rupee sign (U+20B9), escaped so non-UTF-8 editors cannot corrupt it. */
const RUPEE = '₹';
/** Format rupees with an optional symbol and positive sign.
 * @example formatINR(-500); // '-₹500.00'
 * @throws {RangeError} For non-finite input or invalid precision.
 */
export function formatINR(value: number, opts: INRFormatOptions = {}): string {
  const formatted = formatIndianNumber(value, opts);
  const negative = formatted.startsWith('-');
  const plus = opts.showPlusSign && /[1-9]/.test(formatted) ? '+' : '';
  return `${negative ? '-' : plus}${opts.symbol === false ? '' : RUPEE}${negative ? formatted.slice(1) : formatted}`;
}
/** Compact rupees using K, L and Cr, with trailing fractional zeros removed.
 * @example formatCompactINR(250000); // '₹2.5 L'
 * @throws {RangeError} For invalid precision, non-finite or out-of-range money.
 */
export function formatCompactINR(value: number, opts: NumberFormatOptions = {}): string {
  const decimals = opts.decimals ?? 1;
  precision(decimals);
  const paise = toPaise(value);
  const absolute = paise < 0n ? -paise : paise;
  const [divisor, suffix]: [bigint, string] = absolute >= 1_000_000_000n ? [1_000_000_000n, ' Cr'] :
    absolute >= 10_000_000n ? [10_000_000n, ' L'] :
    absolute >= 100_000n ? [100_000n, 'K'] : [100n, ''];
  const rounded = roundRatio(absolute * 10n ** BigInt(decimals), divisor);
  const formatted = grouped(rounded, decimals).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  return `${paise < 0n && rounded !== 0n ? '-' : ''}${RUPEE}${formatted}${suffix}`;
}
