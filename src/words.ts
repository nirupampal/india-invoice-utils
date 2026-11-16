import { toPaise } from './money';
import type { WordsOptions } from './types';

const SMALL = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'] as const;
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'] as const;
const MAX = 9_999_999_999_999;
function words(n: number): string {
  if (n < 20) return SMALL[n]!;
  if (n < 100) return `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${words(n % 10)}` : ''}`;
  const [size, label]: [number, string] = n >= 10_000_000 ? [10_000_000, 'Crore'] : n >= 100_000 ? [100_000, 'Lakh'] : n >= 1_000 ? [1_000, 'Thousand'] : [100, 'Hundred'];
  return `${words(Math.floor(n / size))} ${label}${n % size ? ` ${words(n % size)}` : ''}`;
}
/** Spell a signed integer using repeated Crore groups up to 99,99,99,99,99,999.
 * @example numberToIndianWords(123456); // 'One Lakh Twenty Three Thousand Four Hundred Fifty Six'
 * @throws {RangeError} For fractional, non-finite or out-of-range values.
 */
export function numberToIndianWords(n: number): string {
  if (!Number.isSafeInteger(n) || Math.abs(n) > MAX) throw new RangeError('Expected an integer within ±99,99,99,99,99,999');
  return `${n < 0 ? 'Minus ' : ''}${words(Math.abs(n))}`;
}
/** Spell money after rounding to paise. Default Rupees/Paise singularize automatically.
 * @example amountInWords(1.01); // 'One Rupee and One Paisa Only'
 * @throws {RangeError} For non-finite or out-of-range money.
 */
export function amountInWords(amount: number, opts: WordsOptions = {}): string {
  return paiseInWords(toPaise(amount), opts);
}
/** Spell bounded integer paise without a floating-point round trip. @internal
 * @example paiseInWords(101n); // 'One Rupee and One Paisa Only'
 */
export function paiseInWords(paise: bigint, opts: WordsOptions = {}): string {
  const absolute = paise < 0n ? -paise : paise;
  const whole = Number(absolute / 100n);
  const fraction = Number(absolute % 100n);
  const currency = opts.currency ?? 'Rupees';
  const subunit = opts.subunit ?? 'Paise';
  const major = currency === 'Rupees' && whole === 1 ? 'Rupee' : currency;
  const minor = subunit === 'Paise' && fraction === 1 ? 'Paisa' : subunit;
  const result = `${paise < 0n ? 'Minus ' : ''}${numberToIndianWords(whole)} ${major}${fraction ? ` and ${words(fraction)} ${minor}` : ''} ${opts.suffix ?? 'Only'}`.trim();
  return opts.case === 'upper' ? result.toUpperCase() : opts.case === 'lower' ? result.toLowerCase() : result;
}
