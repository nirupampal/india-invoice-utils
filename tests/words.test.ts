import { describe, expect, it } from 'vitest';
import { amountInWords, numberToIndianWords } from '../src/index';

describe('words', () => {
  it('spells integer scales', () => {
    expect(numberToIndianWords(123456)).toBe('One Lakh Twenty Three Thousand Four Hundred Fifty Six');
    expect(numberToIndianWords(0)).toBe('Zero');
    expect(numberToIndianWords(-20)).toBe('Minus Twenty');
    expect(numberToIndianWords(100)).toBe('One Hundred');
    expect(numberToIndianWords(1000)).toBe('One Thousand');
    expect(numberToIndianWords(100000)).toBe('One Lakh');
    expect(numberToIndianWords(10000000)).toBe('One Crore');
    expect(numberToIndianWords(1000000000000)).toBe('One Lakh Crore');
    expect(numberToIndianWords(9999999999999)).toBe('Nine Lakh Ninety Nine Thousand Nine Hundred Ninety Nine Crore Ninety Nine Lakh Ninety Nine Thousand Nine Hundred Ninety Nine');
    for (const value of [1e13, -1e13, 1.1, NaN, Infinity]) expect(() => numberToIndianWords(value)).toThrow(RangeError);
  });
  it('rounds and inflects money', () => {
    expect(amountInWords(1234.5)).toBe('One Thousand Two Hundred Thirty Four Rupees and Fifty Paise Only');
    expect(amountInWords(1)).toBe('One Rupee Only');
    expect(amountInWords(0)).toBe('Zero Rupees Only');
    expect(amountInWords(0.005)).toBe('Zero Rupees and One Paisa Only');
    expect(amountInWords(1.005)).toBe('One Rupee and One Paisa Only');
    expect(amountInWords(-1.01)).toBe('Minus One Rupee and One Paisa Only');
    expect(amountInWords(1.999)).toBe('Two Rupees Only');
    expect(amountInWords(-0.001)).toBe('Zero Rupees Only');
    expect(amountInWords(1.01, { currency: 'Dollar', subunit: 'Cent', suffix: '', case: 'upper' })).toBe('ONE DOLLAR AND ONE CENT');
    expect(amountInWords(2, { case: 'lower' })).toBe('two rupees only');
    expect(amountInWords(2, { case: 'title' })).toBe('Two Rupees Only');
    expect(() => amountInWords(Infinity)).toThrow(RangeError);
  });
});
