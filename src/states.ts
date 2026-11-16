import type { GSTState } from './types';

// Verify this list against the official GST portal list before each release.
// 25 and 28 are legacy codes retained for historical records.
// 99 is Centre Jurisdiction here; e-way bill masters use 99 for Other Country.
const NAMES = [
  'Jammu and Kashmir', 'Himachal Pradesh', 'Punjab', 'Chandigarh', 'Uttarakhand',
  'Haryana', 'Delhi', 'Rajasthan', 'Uttar Pradesh', 'Bihar', 'Sikkim',
  'Arunachal Pradesh', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura', 'Meghalaya',
  'Assam', 'West Bengal', 'Jharkhand', 'Odisha', 'Chhattisgarh', 'Madhya Pradesh',
  'Gujarat', 'Daman and Diu (Legacy)', 'Dadra and Nagar Haveli and Daman and Diu',
  'Maharashtra', 'Andhra Pradesh (Before Division)', 'Karnataka', 'Goa',
  'Lakshadweep', 'Kerala', 'Tamil Nadu', 'Puducherry', 'Andaman and Nicobar Islands',
  'Telangana', 'Andhra Pradesh', 'Ladakh',
];
const UT = /* @__PURE__ */ new Set(['01', '04', '07', '25', '26', '31', '34', '35', '38']);
export const GST_STATE_CODES: Readonly<Record<string, GSTState>> = /* @__PURE__ */ Object.freeze(
  Object.fromEntries([
    ...NAMES.map((name, index) => { const code = String(index + 1).padStart(2, '0'); return [code, Object.freeze({ code, name, ut: UT.has(code) })] as const; }),
    ['97', Object.freeze({ code: '97', name: 'Other Territory', ut: false })],
    ['99', Object.freeze({ code: '99', name: 'Centre Jurisdiction', ut: false })],
  ]),
);
/** Look up a code, accepting trimmed one- or two-digit strings.
 * @example getStateByCode('7'); // { code: '07', name: 'Delhi', ut: true }
 */
export function getStateByCode(code: string): GSTState | undefined {
  const normalized = code.trim();
  return /^\d{1,2}$/.test(normalized) ? GST_STATE_CODES[normalized.padStart(2, '0')] : undefined;
}
const aliases: Readonly<Record<string, string>> = {
  'nct of delhi': '07', 'new delhi': '07', orissa: '21', pondicherry: '34',
  uttaranchal: '05', 'jammu & kashmir': '01', 'daman and diu': '26',
  'dadra and nagar haveli': '26', 'andaman and nicobar': '35',
};
/** Resolve an official name or common alias, ignoring case and surrounding whitespace.
 * @example getStateCode('Orissa'); // '21'
 */
export function getStateCode(nameOrAlias: string): string | undefined {
  const name = nameOrAlias.trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(aliases, name) ? aliases[name] : Object.values(GST_STATE_CODES).find(state => state.name.toLowerCase() === name)?.code;
}
