import { gstNumbers, gstPaise } from './gst';
import type { PaiseGST } from './gst';
import { checkMoney, multiply, nonnegative, roundRatio, rupees, toPaise } from './money';
import { paiseInWords } from './words';
import { InvoiceError } from './types';
import type { InvoiceInput, InvoiceItem, InvoiceLine, InvoiceSummary } from './types';

const KEYS = ['taxableValue', 'cgst', 'sgst', 'igst', 'cess', 'totalTax', 'total'] as const;
function zero(): PaiseGST { return { taxableValue: 0n, cgst: 0n, sgst: 0n, igst: 0n, cess: 0n, totalTax: 0n, total: 0n }; }
function add(target: PaiseGST, source: PaiseGST): void {
  for (const key of KEYS) target[key] = checkMoney(target[key] + source[key]);
}
function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new InvoiceError('INVALID_INPUT', message);
}
/** Calculate discounted lines, charges and rate-grouped tax totals in integer paise.
 * Fixed discounts apply per line before tax; extra charges share the inclusive setting.
 * @example calculateInvoice({ items: [{ name: 'Service', quantity: 1, unitPrice: 100, gstRate: 18 }] }).grandTotal; // 118
 * @throws {InvoiceError} For invalid input or monetary overflow.
 */
export function calculateInvoice(input: InvoiceInput): InvoiceSummary {
  try {
    assert(input !== null && typeof input === 'object', 'Expected an invoice object');
    assert(Array.isArray(input.items), 'items must be an array');
    for (const flag of [input.interstate, input.pricesIncludeTax, input.roundOff]) assert(flag === undefined || typeof flag === 'boolean', 'Flags must be booleans');
    assert(input.extraCharges === undefined || Array.isArray(input.extraCharges), 'extraCharges must be an array');
    const totals = zero();
    const groups = new Map<number, PaiseGST>();
    let subtotal = 0n;
    let totalDiscount = 0n;
    function line(item: InvoiceItem): InvoiceLine {
      assert(item !== null && typeof item === 'object', 'Expected an item object');
      assert(typeof item.name === 'string' && item.name.trim().length > 0, 'Item name is required');
      assert(item.hsn === undefined || typeof item.hsn === 'string', 'hsn must be a string');
      nonnegative(item.quantity, 'quantity');
      nonnegative(item.unitPrice, 'unitPrice');
      nonnegative(item.gstRate, 'gstRate');
      nonnegative(item.cess ?? 0, 'cess');
      const gross = multiply(toPaise(item.unitPrice), item.quantity);
      let discount = 0n;
      if (item.discount !== undefined) {
        if (typeof item.discount === 'number') {
          nonnegative(item.discount, 'discount');
          discount = toPaise(item.discount);
        } else {
          assert(item.discount !== null && typeof item.discount === 'object', 'Invalid discount');
          nonnegative(item.discount.percent, 'discount percent');
          assert(item.discount.percent <= 100, 'Discount percent must not exceed 100');
          discount = multiply(gross, item.discount.percent, 100n);
        }
      }
      assert(discount <= gross, 'Discount must not exceed line gross');
      const tax = gstPaise(gross - discount, item.gstRate, item.cess ?? 0, input.pricesIncludeTax ?? false, input.interstate ?? false);
      subtotal = checkMoney(subtotal + gross);
      totalDiscount = checkMoney(totalDiscount + discount);
      add(totals, tax);
      const group = groups.get(item.gstRate) ?? zero();
      add(group, tax);
      groups.set(item.gstRate, group);
      return { name: item.name, quantity: item.quantity, unitPrice: rupees(toPaise(item.unitPrice)), gross: rupees(gross), discount: rupees(discount), ...gstNumbers(tax, item.gstRate), lineTotal: rupees(tax.total), ...(item.hsn === undefined ? {} : { hsn: item.hsn }) };
    }
    const items = Array.from(input.items, line);
    const extraCharges = Array.from(input.extraCharges ?? [], charge => {
      assert(charge !== null && typeof charge === 'object', 'Expected a charge object');
      return line({ name: charge.label, quantity: 1, unitPrice: charge.amount, gstRate: charge.gstRate ?? 0 });
    });
    const grand = input.roundOff === false ? totals.total : checkMoney(roundRatio(totals.total, 100n) * 100n);
    return { items, extraCharges, taxSummary: [...groups.entries()].sort(([a], [b]) => a - b).map(([rate, tax]) => gstNumbers(tax, rate)), subtotal: rupees(subtotal), totalDiscount: rupees(totalDiscount), totalTaxableValue: rupees(totals.taxableValue), totalCGST: rupees(totals.cgst), totalSGST: rupees(totals.sgst), totalIGST: rupees(totals.igst), totalCess: rupees(totals.cess), totalTax: rupees(totals.totalTax), roundOff: rupees(grand - totals.total), grandTotal: rupees(grand), grandTotalInWords: paiseInWords(grand) };
  } catch (error: unknown) {
    if (error instanceof InvoiceError) throw error;
    const message = error instanceof Error ? error.message : 'Invalid invoice';
    throw new InvoiceError(/range|exceeds|within/.test(message) ? 'OUT_OF_RANGE' : 'INVALID_INPUT', message);
  }
}
