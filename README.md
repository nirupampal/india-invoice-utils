# india-invoice-utils

[![npm](https://img.shields.io/npm/v/india-invoice-utils)](https://www.npmjs.com/package/india-invoice-utils)
[![downloads](https://img.shields.io/npm/dw/india-invoice-utils)](https://www.npmjs.com/package/india-invoice-utils)
[![CI](https://github.com/nirupampal/india-invoice-utils/actions/workflows/ci.yml/badge.svg)](https://github.com/nirupampal/india-invoice-utils/actions/workflows/ci.yml)
[![size](https://img.shields.io/bundlephobia/minzip/india-invoice-utils)](https://bundlephobia.com/package/india-invoice-utils)
[![license](https://img.shields.io/npm/l/india-invoice-utils)](https://github.com/nirupampal/india-invoice-utils/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

Zero-dependency Indian invoicing: INR formatting, lakh/crore words, paise-accurate GST, invoice totals and offline ID validation.

**[Try it live on StackBlitz](https://stackblitz.com/github/nirupampal/india-invoice-utils/tree/main/examples/demo?file=index.html)**: a small GST invoice calculator built with this package.

```ts
import { calculateInvoice } from 'india-invoice-utils';

const invoice = calculateInvoice({
  items: [{ name: 'Consulting', quantity: 2, unitPrice: 100, gstRate: 18 }],
});
invoice.totalCGST;         // 18
invoice.totalSGST;         // 18
invoice.grandTotal;        // 236
invoice.grandTotalInWords; // 'Two Hundred Thirty Six Rupees Only'
```

## Why

- Zero runtime dependencies; no network, DOM, Node built-ins or Intl dependency.
- Integer paise for money and exact decimal ratios for percentages and quantities.
- Indian numbering with singular Rupee/Paisa support.
- Strict TypeScript, ESM/CommonJS declarations, named exports and tree shaking.
- About 5 kB gzipped; published with npm provenance.

### Why not just `Intl.NumberFormat('en-IN')`?

`Intl` formats numbers well, but it does not split GST into CGST/SGST/IGST,
allocate odd paise, back-calculate tax-inclusive prices, group tax by rate,
round off to the rupee or write "Rupees ... Only". This package does all of
that in integer paise, so CGST + SGST always adds up to the printed total.

## Install

```sh
npm install india-invoice-utils
pnpm add india-invoice-utils
yarn add india-invoice-utils
bun add india-invoice-utils
```

Supports Node 18+, modern browsers, React, Next.js server/client, React Native,
Deno and Bun. Engines must support ES2020 BigInt; use a compatible Hermes or
JavaScriptCore version for React Native. No polyfills are bundled. Browser script
tags need a bundler or an ESM-aware npm CDN.

```js
// Deno
import { formatINR } from 'npm:india-invoice-utils';
```

```js
// CommonJS
const { formatINR } = require('india-invoice-utils');
```

## Quick start

```ts
import { formatINR, amountInWords, calculateGST } from 'india-invoice-utils';

formatINR(123456.5); // '₹1,23,456.50'
amountInWords(1.005); // 'One Rupee and One Paisa Only'
calculateGST({ amount: 100, rate: 18 });
// { taxableValue: 100, cgst: 9, sgst: 9, igst: 0, cess: 0,
//   totalTax: 18, total: 118, rate: 18 }
```

## Calculation contract

Public amounts are rupee numbers. Decimal strings become exact BigInt ratios;
money arithmetic uses integer paise. Half ties round away from zero:
`1.005` becomes `1.01`, `-0.005` becomes `-0.01`. Precision already lost before
calling the library cannot be recovered. Returned numbers are still binary
floats: compare monetary identities in paise, not with decimal addition and `===`.

Money rejects non-finite inputs and absolute paise above Number.MAX_SAFE_INTEGER.
Very large returned rupee numbers may not distinguish every paisa. Integer words
support absolute values through 9_999_999_999_999. Invoice words impose this
additional whole-rupee limit. Formatting and words accept negatives; GST and
invoices require non-negative amounts/rates/quantities. Credit notes are outside
this API.

Unit prices round to paise before quantity multiplication; line gross then rounds
to paise. Fixed discounts apply per line; percentage discounts apply to rounded
gross. Discounts cannot exceed gross. Tax applies after discount. Each line is
rounded separately; tax groups sum those rounded values.

Cess is a percentage of taxable value. Exclusive GST and cess round separately.
Inclusive prices include both: taxable value rounds from
`amount / (1 + (rate + cess) / 100)`. Remaining paise form total tax, allocated
proportionally between GST and cess, with half-paisa ties assigned to GST.
This preserves the inclusive total even for tiny amounts.

Intrastate GST assigns odd paise to SGST. CGST + SGST equals GST alone;
totalTax also includes cess. Interstate supplies use IGST. Extra charges share
pricesIncludeTax and are included in subtotal, groups and totals. Groups sort by
GST rate and aggregate cess even when cess rates differ. roundOff defaults true,
rounding the final total to the nearest rupee, half upward, so an invoice under
50 paise rounds to a grand total of zero. Empty invoices and zero quantities are valid.

## Full API reference

Examples below assume named imports from india-invoice-utils. All public types
are exported; see [src/types.ts](https://github.com/nirupampal/india-invoice-utils/blob/main/src/types.ts) for complete declarations.

### Formatting

`formatIndianNumber(value: number, opts?: { decimals?: number }): string`

```ts
formatIndianNumber(1234567.5); // '12,34,567.50'
formatIndianNumber(-500, { decimals: 0 }); // '-500'
```

`formatINR(value: number, opts?: { symbol?: boolean; decimals?: number; showPlusSign?: boolean }): string`

```ts
formatINR(-500); // '-₹500.00'
formatINR(500, { symbol: false, showPlusSign: true }); // '+500.00'
```

Both default to two decimals. Precision must be an integer from 0 through 6.
Rounded zero has no sign. Invalid precision/non-finite values throw RangeError.

`formatCompactINR(value: number, opts?: { decimals?: number }): string`

```ts
formatCompactINR(1500); // '₹1.5K'
formatCompactINR(250000); // '₹2.5 L'
formatCompactINR(34000000); // '₹3.4 Cr'
formatCompactINR(1000, { decimals: 2 }); // '₹1K'
```

Defaults to one decimal; trailing fractional zeros are trimmed. Units are chosen
from the paise-rounded input before compact rounding, so 99999 can display ?100K.

### Words

`numberToIndianWords(n: number): string`

```ts
numberToIndianWords(123456);
// 'One Lakh Twenty Three Thousand Four Hundred Fifty Six'
numberToIndianWords(1000000000000); // 'One Lakh Crore'
numberToIndianWords(-20); // 'Minus Twenty'
```

Only integers are accepted. Fractional, non-finite and out-of-range values throw
RangeError. Large values recursively use Crore rather than Arab/Kharab.

`amountInWords(amount: number, opts?: WordsOptions): string`

```ts
amountInWords(1234.5);
// 'One Thousand Two Hundred Thirty Four Rupees and Fifty Paise Only'
amountInWords(1); // 'One Rupee Only'
amountInWords(0); // 'Zero Rupees Only'
amountInWords(-0.01); // 'Minus Zero Rupees and One Paisa Only'
amountInWords(1.01, { currency: 'Dollar', subunit: 'Cent', suffix: '', case: 'upper' });
// 'ONE DOLLAR AND ONE CENT'
```

Defaults: currency Rupees, subunit Paise, suffix Only, case title. Case accepts
title, upper or lower; title preserves the lowercase connector `and`. Custom
unit strings are used verbatim; only the defaults Rupees/Paise singularize.
The suffix can be empty. Invalid or out-of-range money throws RangeError.

### GST

GST_RATES is frozen and readonly:
`[0, 0.1, 0.25, 1, 1.5, 3, 5, 6, 7.5, 12, 18, 28, 40]`.
Slabs change over time. This is not an applicability table; any finite
non-negative rate is accepted, subject to monetary bounds.

`calculateGST(input: GSTInput): GSTBreakup`

```ts
calculateGST({ amount: 120, rate: 18, cess: 2, inclusive: true, interstate: true });
// { taxableValue: 100, cgst: 0, sgst: 0, igst: 18, cess: 2,
//   totalTax: 20, total: 120, rate: 18 }
calculateGST({ amount: 1, rate: 1 });
// { taxableValue: 1, cgst: 0, sgst: 0.01, igst: 0, cess: 0,
//   totalTax: 0.01, total: 1.01, rate: 1 }
```

Only amount/rate are required. inclusive/interstate default false, cess defaults
zero. Invalid numbers throw RangeError.

`isInterstate(supplierStateCode: string, placeOfSupplyStateCode: string): boolean`

```ts
isInterstate('19', '27'); // true
isInterstate('7', ' 07 '); // false
```

Unknown codes throw RangeError. This only compares codes: exports, SEZ supplies
and special place-of-supply rules require caller decisions.

### Invoice

`calculateInvoice(input: InvoiceInput): InvoiceSummary`

```ts
calculateInvoice({
  items: [
    { name: 'Service', quantity: 2, unitPrice: 100, gstRate: 18,
      discount: { percent: 10 }, hsn: '9983' },
    { name: 'Goods', quantity: 1, unitPrice: 50, gstRate: 5, discount: 5, cess: 2 },
  ],
  extraCharges: [{ label: 'Delivery', amount: 10, gstRate: 18 }],
  interstate: false,
  pricesIncludeTax: false,
  roundOff: true,
});
```

InvoiceItem requires name, quantity, unitPrice and gstRate. Optional discount is
a fixed per-line amount or `{ percent: number }` from 0-100. hsn is an optional
string; cess is an optional percentage. Extra charges require label/amount and
default gstRate to zero. There is no HSN/rate applicability lookup.

Results include items, extraCharges, taxSummary, subtotal, totalDiscount,
totalTaxableValue, totalCGST, totalSGST, totalIGST, totalCess, totalTax, signed
roundOff, grandTotal and grandTotalInWords. Lines contain name, quantity, rounded
unitPrice, gross, discount, GSTBreakup fields, lineTotal and hsn when supplied.
taxSummary entries contain GSTBreakup fields grouped by rate.

Invalid input throws InvoiceError with code INVALID_INPUT or OUT_OF_RANGE.

```ts
try {
  calculateInvoice({ items: [{ name: 'Bad', quantity: -1, unitPrice: 10, gstRate: 0 }] });
} catch (error: unknown) {
  if (error instanceof InvoiceError) console.log(error.code); // 'INVALID_INPUT'
}
new InvoiceError('INVALID_INPUT', 'Invalid product');
```

### Complete invoice example

```ts
const invoice = calculateInvoice({
  items: [{ name: 'Consulting', quantity: 2, unitPrice: 100, gstRate: 18 }],
});
console.log(invoice);
```

```json
{
  "items": [
    {
      "name": "Consulting",
      "quantity": 2,
      "unitPrice": 100,
      "gross": 200,
      "discount": 0,
      "taxableValue": 200,
      "cgst": 18,
      "sgst": 18,
      "igst": 0,
      "cess": 0,
      "totalTax": 36,
      "total": 236,
      "rate": 18,
      "lineTotal": 236
    }
  ],
  "extraCharges": [],
  "taxSummary": [
    {
      "taxableValue": 200,
      "cgst": 18,
      "sgst": 18,
      "igst": 0,
      "cess": 0,
      "totalTax": 36,
      "total": 236,
      "rate": 18
    }
  ],
  "subtotal": 200,
  "totalDiscount": 0,
  "totalTaxableValue": 200,
  "totalCGST": 18,
  "totalSGST": 18,
  "totalIGST": 0,
  "totalCess": 0,
  "totalTax": 36,
  "roundOff": 0,
  "grandTotal": 236,
  "grandTotalInWords": "Two Hundred Thirty Six Rupees Only"
}
```

### GSTIN

`getGSTINChecksum(first14: string): string`

```ts
getGSTINChecksum('27AAPFU0939F1Z'); // 'V'
```

Trims/uppercases input and requires 14 alphanumeric characters; throws RangeError
otherwise. It computes a checksum, not structural validation of the prefix.

`validateGSTIN(gstin: string): GSTINValidation`

```ts
const prefix = '27AAPFU0939F1Z';
validateGSTIN(prefix + getGSTINChecksum(prefix)); // { valid: true }
validateGSTIN('bad'); // { valid: false, error: 'LENGTH' }
```

Error precedence: LENGTH, FORMAT, STATE_CODE, CHECKSUM. Entity position accepts
1-9 or A-Z. Special non-PAN identifiers are outside the supported format.

`parseGSTIN(gstin: string): ParsedGSTIN | null`

```ts
parseGSTIN('27AAPFU0939F1ZV');
// { stateCode: '27', stateName: 'Maharashtra', pan: 'AAPFU0939F',
//   entityNumber: '1', checksum: 'V' }
parseGSTIN('invalid'); // null
```

All normalize case/whitespace. A valid checksum does not prove registration,
active status or ownership.

### States

GST_STATE_CODES is a deeply frozen Readonly<Record<string, GSTState>> containing
01-38, 97 and 99 with `{ code, name, ut }` entries.

`getStateByCode(code: string): GSTState | undefined`

```ts
getStateByCode('7'); // { code: '07', name: 'Delhi', ut: true }
getStateByCode('00'); // undefined
```

`getStateCode(nameOrAlias: string): string | undefined`

```ts
getStateCode(' NCT of Delhi '); // '07'
getStateCode('Orissa'); // '21'
getStateCode('Odisha'); // '21'
getStateCode('Andhra Pradesh'); // '37'
```

Codes 25/28 are historical entries. The current alias Daman and Diu resolves to
merged code 26; its explicit legacy name resolves to 25. Code 99 is Centre
Jurisdiction in this library's requested GST mapping; the
[official e-way bill master](https://docs.ewaybillgst.gov.in/apidocs/state-code.html)
uses 99 for Other Country. Do not reuse this as an e-way bill master. Verify
against the [GST portal](https://www.gst.gov.in/) before each release.

### Validators

Inputs are strings and are trimmed; case is ignored where sensible. Non-string
input returns false (or null/undefined) instead of throwing. These check
syntax, not issuance, existence, ownership or reachability.

```ts
validatePAN(' abcpa1234f '); // true
getPANHolderType('ABCPA1234F'); // 'Individual'
getPANHolderType('ABCXA1234F'); // null
validateIFSC(' sbin0001234 '); // true
validatePincode('741101'); // true
validateIndianMobile('+91 86176-24775'); // true
normalizeIndianMobile('08617624775'); // '+918617624775'
normalizeIndianMobile('123'); // null
```

Signatures: `validatePAN(pan: string): boolean`,
`getPANHolderType(pan: string): PANHolderType | null`,
`validateIFSC(ifsc: string): boolean`, `validatePincode(pincode: string): boolean`,
`validateIndianMobile(input: string): boolean`,
`normalizeIndianMobile(input: string): string | null`.

PAN requires five letters, four digits and one letter. Its fourth character maps:

| Character | Holder type |
| --- | --- |
| P | Individual |
| C | Company |
| H | Hindu Undivided Family |
| F | Firm |
| A | Association of Persons |
| T | Trust |
| B | Body of Individuals |
| L | Local Authority |
| J | Artificial Juridical Person |
| G | Government |

IFSC requires four letters, zero and six alphanumeric characters. Pincodes require
six digits starting 1-9. Mobile normalization removes whitespace/dashes, accepts
one optional +91, 91 or 0 prefix and requires ten digits starting 6-9. Other
punctuation is rejected.

## React and Next.js

```tsx
'use client';
import { formatINR } from 'india-invoice-utils';

export function Price({ amount }: { amount: number }) {
  return <span>{formatINR(amount)}</span>;
}
```

The same imports work in Server Components without use client.

```ts
// app/api/invoice/route.ts
import { calculateInvoice } from 'india-invoice-utils';

export function GET() {
  const invoice = calculateInvoice({
    items: [{ name: 'Consulting', quantity: 2, unitPrice: 100, gstRate: 18 }],
  });
  return new Response(JSON.stringify(invoice), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

Keep authoritative prices/taxes on your server. Validate external JSON and do not
trust submitted totals. React Native can render formatINR(amount) in a Text
component; this package has no React dependency.

## Comparison

| Capability | This package | Generic formatter | Decimal arithmetic library |
| --- | --- | --- | --- |
| Indian grouping | Built in | Locale/config dependent | Presentation required |
| Rupee/Paisa words | Built in | Usually separate | Separate |
| GST and invoice groups | Built in | Application code | Application code |
| Indian ID syntax | Built in | Separate | Separate |
| Arbitrary-precision public API | No: number inputs/outputs | Usually no | Often available |
| Runtime dependencies | Zero | Varies | Varies |

## Disclaimer

Not tax advice. Verify rates, cess, state codes, place-of-supply and invoice
requirements with official sources and a qualified adviser. This package does
not file returns, generate compliant e-invoices/IRNs, validate registrations
online or guarantee legal compliance.

## Contributing and release

Issues and pull requests are welcome. See [CONTRIBUTING.md](https://github.com/nirupampal/india-invoice-utils/blob/main/CONTRIBUTING.md),
[CODE_OF_CONDUCT.md](https://github.com/nirupampal/india-invoice-utils/blob/main/CODE_OF_CONDUCT.md) and [SECURITY.md](https://github.com/nirupampal/india-invoice-utils/blob/main/SECURITY.md).
CI runs lint, strict typecheck, tests with 95% coverage thresholds and dual
builds on Node 18/20/22. Releases use Changesets and npm provenance.

## License

[MIT](https://github.com/nirupampal/india-invoice-utils/blob/main/LICENSE) © 2026 Nirupam Pal.
