# india-invoice-utils

## 0.1.1

### Patch Changes

- d7ae960: Fix `formatINR` and `formatCompactINR` printing `?` instead of the Indian Rupee sign `₹` (the source file had been saved in a non-UTF-8 encoding). The sign is now written as the `₹` escape and tested by code point. Validators, GSTIN and state lookups now return `false`/`null`/`undefined` for non-string input instead of throwing a `TypeError`. README cleanup and better npm keywords.

## 0.1.0

- Initial release: Indian number formatting, INR words, GST and invoice calculations.
- Add offline GSTIN, PAN, IFSC, pincode and mobile validation.
- Publish ESM, CommonJS and corresponding TypeScript declarations.
- Use integer paise and exact decimal ratios for monetary arithmetic.
