import { expect, it } from 'vitest';
import { getGSTINChecksum, parseGSTIN, validateGSTIN } from '../src/index';

it('generates, validates and parses checksums', () => {
  const prefix = '27AAPFU0939F1Z';
  const checksum = getGSTINChecksum(prefix);
  expect(checksum).toBe('V'); // Independent known checksum vector.
  const gstin = prefix + checksum;
  expect(validateGSTIN(` ${gstin.toLowerCase()} `)).toEqual({ valid: true });
  expect(getGSTINChecksum(` ${prefix.toLowerCase()} `)).toBe(checksum);
  expect(parseGSTIN(gstin)).toEqual({ stateCode: '27', stateName: 'Maharashtra', pan: 'AAPFU0939F', entityNumber: '1', checksum });
  expect(parseGSTIN(gstin.toLowerCase())).toEqual(parseGSTIN(gstin));
  expect(validateGSTIN('short')).toEqual({ valid: false, error: 'LENGTH' });
  expect(validateGSTIN('27AAPFU0939F0ZV')).toEqual({ valid: false, error: 'FORMAT' });
  expect(validateGSTIN('00' + gstin.slice(2))).toEqual({ valid: false, error: 'STATE_CODE' });
  expect(validateGSTIN(prefix + (checksum === '0' ? '1' : '0'))).toEqual({ valid: false, error: 'CHECKSUM' });
  expect(parseGSTIN('bad')).toBeNull();
  for (const prefix of ['short', '!!!!!!!!!!!!!!']) expect(() => getGSTINChecksum(prefix)).toThrow(RangeError);
});
