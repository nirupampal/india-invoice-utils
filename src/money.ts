// Private implementation: decimal strings become exact rational BigInts.
// No binary floating-point multiplication participates in money arithmetic.
/** Convert a finite number's decimal representation to a rational. @internal
 * @example fraction(1.005); // [1005n, 1000n]
 */
export function fraction(value: number): [bigint, bigint] {
  if (!Number.isFinite(value)) throw new RangeError('Expected a finite number');
  const [mantissa = '', exponent = '0'] = Math.abs(value).toString().split('e');
  const [whole = '', decimal = ''] = mantissa.split('.');
  const scale = decimal.length - Number(exponent);
  const numerator = BigInt(whole + decimal) * (value < 0 ? -1n : 1n);
  return scale >= 0 ? [numerator, 10n ** BigInt(scale)] : [numerator * 10n ** BigInt(-scale), 1n];
}
/** Round a rational with a positive denominator, ties away from zero. @internal
 * @example roundRatio(1n, 2n); // 1n
 */
export function roundRatio(n: bigint, d: bigint): bigint {
  const sign = n < 0n ? -1n : 1n;
  const a = n < 0n ? -n : n;
  return sign * ((a + d / 2n) / d);
}
/** Round a finite value to a validated decimal scale. @internal
 * @example scaled(1.005, 2); // 101n
 */
export function scaled(value: number, decimals: number): bigint {
  const [n, d] = fraction(value);
  return roundRatio(n * 10n ** BigInt(decimals), d);
}
/** Reject paise outside the safe integer boundary. @internal
 * @example checkMoney(100n); // 100n
 */
export function checkMoney(paise: bigint): bigint {
  if (paise > BigInt(Number.MAX_SAFE_INTEGER) || paise < -BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new RangeError('Money exceeds the safe integer paise range');
  }
  return paise;
}
/** Convert rupees to bounded integer paise. @internal
 * @example toPaise(1.005); // 101n
 */
export function toPaise(value: number): bigint { return checkMoney(scaled(value, 2)); }
/** Convert bounded paise to a public rupee number. @internal
 * @example rupees(101n); // 1.01
 */
export function rupees(paise: bigint): number { return Number(checkMoney(paise)) / 100; }
/** Require a finite non-negative value. @internal
 * @example nonnegative(18, 'rate');
 */
export function nonnegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${label} must be finite and non-negative`);
}
/** Multiply paise by an exact decimal ratio and round once. @internal
 * @example multiply(101n, 0.5); // 51n
 */
export function multiply(paise: bigint, value: number, divisor = 1n): bigint {
  const [n, d] = fraction(value);
  return checkMoney(roundRatio(paise * n, d * divisor));
}
/** Require an integer formatting precision from zero through six. @internal
 * @example precision(2);
 */
export function precision(decimals: number): void {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 6) {
    throw new RangeError('decimals must be an integer from 0 to 6');
  }
}
