import { describe, expect, it } from 'vitest';
import { calculateGST, GST_RATES, isInterstate } from '../src/index';

describe('GST', () => {
  it('calculates exclusive and inclusive splits', () => {
    expect(calculateGST({ amount: 100, rate: 18 })).toEqual({ taxableValue: 100, cgst: 9, sgst: 9, igst: 0, cess: 0, totalTax: 18, total: 118, rate: 18 });
    expect(calculateGST({ amount: 118, rate: 18, inclusive: true, interstate: true }).taxableValue).toBe(100);
    expect(calculateGST({ amount: 1, rate: 1 })).toMatchObject({ cgst: 0, sgst: 0.01 });
    expect(calculateGST({ amount: 120, rate: 18, cess: 2, inclusive: true })).toMatchObject({ taxableValue: 100, totalTax: 20, cess: 2 });
    expect(calculateGST({ amount: 100, rate: 18, cess: 2, interstate: true })).toMatchObject({ igst: 18, cess: 2, total: 120 });
    expect(calculateGST({ amount: 1.005, rate: 0 }).total).toBe(1.01);
    expect(calculateGST({ amount: 0.005, rate: 0 }).total).toBe(0.01);
    expect(calculateGST({ amount: 0, rate: 0, inclusive: true }).total).toBe(0);
    expect(calculateGST({ amount: 100, rate: 0, cess: 1, inclusive: true }).total).toBe(100);
    expect(calculateGST({ amount: 0.03, rate: 18, cess: 12, inclusive: true })).toMatchObject({ taxableValue: 0.02, totalTax: 0.01, cess: 0, total: 0.03 });
    expect(calculateGST({ amount: 100, rate: 0.125 }).totalTax).toBe(0.13);
    expect(GST_RATES).toEqual([0, 0.1, 0.25, 1, 1.5, 3, 5, 6, 7.5, 12, 18, 28, 40]);
    expect(Object.isFrozen(GST_RATES)).toBe(true);
  });
  it('rejects invalid numbers and compares recognized codes', () => {
    for (const field of ['amount', 'rate', 'cess']) for (const value of [-1, NaN, Infinity]) expect(() => calculateGST({ amount: 1, rate: 1, [field]: value })).toThrow(RangeError);
    expect(isInterstate('19', '27')).toBe(true);
    expect(isInterstate('7', ' 07 ')).toBe(false);
    expect(() => isInterstate('00', '19')).toThrow(RangeError);
    expect(() => isInterstate('19', '00')).toThrow(RangeError);
  });
  it('conserves inclusive paise across rates, cess and small amounts', () => {
    for (let p = 0; p < 200; p++) for (const rate of [0, 0.1, 5, 18, 40]) {
      const result = calculateGST({ amount: p / 100, rate, cess: 2, inclusive: true });
      const cents = (n: number): number => Math.round(n * 100);
      expect(cents(result.taxableValue) + cents(result.totalTax)).toBe(p);
      expect(cents(result.cgst) + cents(result.sgst) + cents(result.cess)).toBe(cents(result.totalTax));
    }
  });
});
