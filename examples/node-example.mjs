import { calculateInvoice, formatINR } from '../dist/index.js';

const invoice = calculateInvoice({
  items: [{ name: 'Consulting', quantity: 2, unitPrice: 100, gstRate: 18 }],
});
console.log(formatINR(invoice.grandTotal));
console.log(invoice.grandTotalInWords);
if (invoice.grandTotal !== 236) throw new Error('Unexpected invoice total');
