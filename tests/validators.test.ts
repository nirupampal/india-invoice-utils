import { expect, it } from 'vitest';
import { getPANHolderType, normalizeIndianMobile, validateIFSC, validateIndianMobile, validatePAN, validatePincode } from '../src/index';

it('validates PAN and holder types', () => {
  expect(validatePAN(' abcpa1234f ')).toBe(true);
  expect(validatePAN('123')).toBe(false);
  expect(getPANHolderType(' abcpa1234f ')).toBe('Individual');
  expect(getPANHolderType('ABCCA1234F')).toBe('Company');
  for (const type of 'PHFATBLJG') expect(getPANHolderType(`ABC${type}A1234F`)).not.toBeNull();
  expect(getPANHolderType('ABCXA1234F')).toBeNull();
  expect(getPANHolderType('invalid')).toBeNull();
});
it('returns false or null for non-string input instead of throwing', () => {
  for (const value of [null, undefined, 123, {}, []] as unknown as string[]) {
    expect(validatePAN(value)).toBe(false);
    expect(getPANHolderType(value)).toBeNull();
    expect(validateIFSC(value)).toBe(false);
    expect(validatePincode(value)).toBe(false);
    expect(validateIndianMobile(value)).toBe(false);
    expect(normalizeIndianMobile(value)).toBeNull();
  }
});
it('validates IFSC and pincodes', () => {
  expect(validateIFSC(' sbin0001234 ')).toBe(true);
  expect(validateIFSC('SBIN1001234')).toBe(false);
  expect(validatePincode(' 741101 ')).toBe(true);
  for (const value of ['012345', '74110', '7411011', 'abcdef']) expect(validatePincode(value)).toBe(false);
});
it('normalizes mobiles without removing arbitrary punctuation', () => {
  for (const value of ['8617624775', ' +91 86176-24775 ', '918617624775', '08617624775']) {
    expect(validateIndianMobile(value)).toBe(true);
    expect(normalizeIndianMobile(value)).toBe('+918617624775');
  }
  expect(normalizeIndianMobile('9123456789')).toBe('+919123456789');
  for (const value of ['', '+9186176247750', '+9108617624775', '5861762477', '86176abc75', '(861)7624775', '00918617624775']) {
    expect(validateIndianMobile(value)).toBe(false);
    expect(normalizeIndianMobile(value)).toBeNull();
  }
});
