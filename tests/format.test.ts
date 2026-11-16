import { describe, expect, it } from 'vitest';
import { formatCompactINR, formatIndianNumber, formatINR } from '../src/index';

// Escaped on purpose: a literal sign can be silently turned into '?' by non-UTF-8 editors.
const R = '₹';

describe('format', () => {
  it('groups, rounds and handles signs', () => {
    expect(formatIndianNumber(1234567.5)).toBe('12,34,567.50');
    expect(formatIndianNumber(0)).toBe('0.00');
    expect(formatIndianNumber(-1.005)).toBe('-1.01');
    expect(formatIndianNumber(0.005)).toBe('0.01');
    expect(formatIndianNumber(1.005)).toBe('1.01');
    expect(formatIndianNumber(10000000, { decimals: 0 })).toBe('1,00,00,000');
    expect(formatIndianNumber(1e-7, { decimals: 6 })).toBe('0.000000');
    expect(formatIndianNumber(1e21, { decimals: 0 })).toBe('1,00,00,00,00,00,00,00,00,00,000');
    expect(formatINR(123456.5)).toBe(`${R}1,23,456.50`);
    expect(formatINR(-500)).toBe(`-${R}500.00`);
    expect(formatINR(5, { symbol: false, showPlusSign: true, decimals: 0 })).toBe('+5');
    expect(formatINR(0, { showPlusSign: true })).toBe(`${R}0.00`);
    expect(formatINR(-0.001, { showPlusSign: true })).toBe(`${R}0.00`);
  });
  it('uses the real Indian Rupee sign U+20B9', () => {
    expect(formatINR(1).codePointAt(0)).toBe(0x20b9);
    expect(formatCompactINR(1500).codePointAt(0)).toBe(0x20b9);
    expect(formatINR(1)).not.toContain('?');
  });
  it('compacts and trims zeros', () => {
    for (const [input, expected] of [[1500, `${R}1.5K`], [250000, `${R}2.5 L`], [34000000, `${R}3.4 Cr`], [1000, `${R}1K`], [0, `${R}0`], [-1500, `-${R}1.5K`], [12.5, `${R}12.5`], [-0.01, `${R}0`]] as const) expect(formatCompactINR(input)).toBe(expected);
    expect(formatCompactINR(1599, { decimals: 0 })).toBe(`${R}2K`);
    expect(formatCompactINR(1500, { decimals: 2 })).toBe(`${R}1.5K`);
  });
  it('rejects invalid inputs', () => {
    for (const n of [NaN, Infinity, -Infinity]) expect(() => formatINR(n)).toThrow(RangeError);
    for (const decimals of [-1, 7, 1.5, NaN]) expect(() => formatINR(1, { decimals })).toThrow(RangeError);
    expect(() => formatCompactINR(1e20)).toThrow(RangeError);
  });
});
