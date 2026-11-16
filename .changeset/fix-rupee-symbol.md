---
'india-invoice-utils': patch
---

Fix `formatINR` and `formatCompactINR` printing `?` instead of the Indian Rupee sign `₹` (the source file had been saved in a non-UTF-8 encoding). The sign is now written as the `₹` escape and tested by code point. Validators, GSTIN and state lookups now return `false`/`null`/`undefined` for non-string input instead of throwing a `TypeError`. README cleanup and better npm keywords.
