// Copy to app/api/invoice/route.ts, then import from 'india-invoice-utils'.
// No Next-specific imports are required: App Router accepts standard Responses.
import { calculateInvoice } from '../src/index';

export function GET(): Response {
  // Prices and tax rates are server-owned. Validate untrusted request bodies
  // and look up authoritative product prices before calculating real invoices.
  const invoice = calculateInvoice({
    items: [{ name: 'Consulting', quantity: 2, unitPrice: 100, gstRate: 18 }],
  });
  return new Response(JSON.stringify(invoice), {
    headers: { 'Content-Type': 'application/json' },
  });
}
