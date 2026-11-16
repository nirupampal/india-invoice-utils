import { expect, it } from 'vitest';
import { getStateByCode, getStateCode, GST_STATE_CODES } from '../src/index';

it('looks up all state codes and aliases without prototype leakage', () => {
  expect(Object.keys(GST_STATE_CODES)).toHaveLength(40);
  expect(getStateByCode('7')).toEqual({ code: '07', name: 'Delhi', ut: true });
  expect(getStateByCode(' 19 ')?.name).toBe('West Bengal');
  expect(getStateByCode('00')).toBeUndefined();
  expect(getStateByCode('constructor')).toBeUndefined();
  expect(getStateCode(' DELHI ')).toBe('07');
  expect(getStateCode('NCT of Delhi')).toBe('07');
  expect(getStateCode('Orissa')).toBe('21');
  expect(getStateCode('Odisha')).toBe('21');
  expect(getStateCode('Andhra Pradesh')).toBe('37');
  expect(getStateCode('Daman and Diu')).toBe('26');
  expect(getStateCode('unknown')).toBeUndefined();
  expect(getStateCode('constructor')).toBeUndefined();
  expect(Object.isFrozen(GST_STATE_CODES)).toBe(true);
  expect(Object.isFrozen(GST_STATE_CODES['19'])).toBe(true);
});
it('returns undefined for non-string state input', () => {
  for (const value of [null, undefined, 7] as unknown as string[]) {
    expect(getStateByCode(value)).toBeUndefined();
    expect(getStateCode(value)).toBeUndefined();
  }
});
