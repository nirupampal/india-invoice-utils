import { describe, expect, it } from 'vitest';
import { formatCompactINR, formatIndianNumber, formatINR } from '../src/index';

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
    expect(formatINR(123456.5)).toBe('?1,23,456.50');
    expect(formatINR(-500)).toBe('-?500.00');
    expect(formatINR(5, { symbol: false, showPlusSign: true, decimals: 0 })).toBe('+5');
    expect(formatINR(0, { showPlusSign: true })).toBe('?0.00');
    expect(formatINR(-0.001, { showPlusSign: true })).toBe('?0.00');
  });
  it('compacts and trims zeros', () => {
    for (const [input, expected] of [[1500, '?1.5K'], [250000, '?2.5 L'], [34000000, '?3.4 Cr'], [1000, '?1K'], [0, '?0'], [-1500, '-?1.5K'], [12.5, '?12.5'], [-0.01, '?0']] as const) expect(formatCompactINR(input)).toBe(expected);
    expect(formatCompactINR(1599, { decimals: 0 })).toBe('?2K');
    expect(formatCompactINR(1500, { decimals: 2 })).toBe('?1.5K');
  });
  it('rejects invalid inputs', () => {
    for (const n of [NaN, Infinity, -Infinity]) expect(() => formatINR(n)).toThrow(RangeError);
    for (const decimals of [-1, 7, 1.5, NaN]) expect(() => formatINR(1, { decimals })).toThrow(RangeError);
    expect(() => formatCompactINR(1e20)).toThrow(RangeError);
  });
});
