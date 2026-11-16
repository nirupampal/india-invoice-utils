import { expect, it } from 'vitest';
import { checkMoney, fraction, multiply, roundRatio, rupees, toPaise } from '../src/money';

it('uses exact decimal ratios and checks overflow', () => {
  expect(fraction(1e21)).toEqual([1000000000000000000000n, 1n]);
  expect(fraction(1e-7)).toEqual([1n, 10000000n]);
  expect(toPaise(-0.005)).toBe(-1n);
  expect(toPaise(1.005)).toBe(101n);
  expect(roundRatio(1n, 3n)).toBe(0n);
  expect(roundRatio(2n, 3n)).toBe(1n);
  expect(multiply(101n, 0.5)).toBe(51n);
  expect(rupees(101n)).toBe(1.01);
  expect(() => checkMoney(9007199254740992n)).toThrow(RangeError);
  expect(() => checkMoney(-9007199254740992n)).toThrow(RangeError);
});
