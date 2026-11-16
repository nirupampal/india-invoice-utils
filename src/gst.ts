import { checkMoney, fraction, nonnegative, roundRatio, rupees, toPaise } from './money';
import { getStateByCode } from './states';
import type { GSTBreakup, GSTInput } from './types';

export const GST_RATES = /* @__PURE__ */ Object.freeze([0, 0.1, 0.25, 1, 1.5, 3, 5, 6, 7.5, 12, 18, 28, 40] as const);
export interface PaiseGST {
  taxableValue: bigint; cgst: bigint; sgst: bigint; igst: bigint;
  cess: bigint; totalTax: bigint; total: bigint;
}
/** Calculate a validated non-negative amount in paise without numeric conversion. @internal
 * @example gstPaise(10000n, 18, 0, false, false).total; // 11800n
 */
export function gstPaise(amount: bigint, rate: number, cess: number, inclusive: boolean, interstate: boolean): PaiseGST {
  nonnegative(rate, 'rate');
  nonnegative(cess, 'cess');
  const [rn, rd] = fraction(rate);
  const [cn, cd] = fraction(cess);
  const gstWeight = rn * cd;
  const cessWeight = cn * rd;
  const baseWeight = 100n * rd * cd;
  const denominator = baseWeight + gstWeight + cessWeight;
  const taxableValue = inclusive ? roundRatio(amount * baseWeight, denominator) : amount;
  const tax = inclusive ? amount - taxableValue : roundRatio(amount * gstWeight, baseWeight) + roundRatio(amount * cessWeight, baseWeight);
  // Inclusive rounding residual is allocated proportionally, with GST receiving ties.
  const gst = inclusive ? (gstWeight + cessWeight === 0n ? 0n : roundRatio(tax * gstWeight, gstWeight + cessWeight)) : roundRatio(amount * gstWeight, baseWeight);
  const cgst = interstate ? 0n : gst / 2n;
  const sgst = interstate ? 0n : gst - cgst;
  return { taxableValue, cgst, sgst, igst: interstate ? gst : 0n, cess: tax - gst, totalTax: tax, total: checkMoney(taxableValue + tax) };
}
/** Convert bounded internal tax amounts to the public rupee result. @internal
 * @example gstNumbers(gstPaise(10000n, 18, 0, false, false), 18).total; // 118
 */
export function gstNumbers(value: PaiseGST, rate: number): GSTBreakup {
  return { taxableValue: rupees(value.taxableValue), cgst: rupees(value.cgst), sgst: rupees(value.sgst), igst: rupees(value.igst), cess: rupees(value.cess), totalTax: rupees(value.totalTax), total: rupees(value.total), rate };
}
/** Calculate GST and percentage cess; inclusive input includes both taxes.
 * @example calculateGST({ amount: 100, rate: 18 }); // total: 118, cgst: 9, sgst: 9
 * @throws {RangeError} For negative, non-finite or out-of-range inputs.
 */
export function calculateGST(input: GSTInput): GSTBreakup {
  nonnegative(input.amount, 'amount');
  return gstNumbers(gstPaise(toPaise(input.amount), input.rate, input.cess ?? 0, input.inclusive ?? false, input.interstate ?? false), input.rate);
}
/** Compare recognized state codes. This is a convenience comparison, not a place-of-supply ruling.
 * @example isInterstate('19', '27'); // true
 * @throws {RangeError} If either code is unknown.
 */
export function isInterstate(supplierStateCode: string, placeOfSupplyStateCode: string): boolean {
  const supplier = getStateByCode(supplierStateCode);
  const recipient = getStateByCode(placeOfSupplyStateCode);
  if (!supplier || !recipient) throw new RangeError('Unknown GST state code');
  return supplier.code !== recipient.code;
}
