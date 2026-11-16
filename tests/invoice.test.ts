import { describe, expect, it } from 'vitest';
import { calculateInvoice, InvoiceError } from '../src/index';
import type { InvoiceInput, InvoiceItem } from '../src/index';

const item: InvoiceItem = { name: 'Service', quantity: 1, unitPrice: 100, gstRate: 18 };
describe('invoice', () => {
  it('calculates mixed discounted lines and charges', () => {
    const result = calculateInvoice({ items: [
      { name: 'A', quantity: 2, unitPrice: 100, gstRate: 18, discount: { percent: 10 }, hsn: '1234' },
      { name: 'B', quantity: 1, unitPrice: 50, gstRate: 5, discount: 5, cess: 2 },
      { name: 'C', quantity: 0.5, unitPrice: 100, gstRate: 18 },
    ], extraCharges: [{ label: 'Delivery', amount: 10, gstRate: 18 }, { label: 'Fee', amount: 1 }] });
    expect(result).toMatchObject({ subtotal: 311, totalDiscount: 25, totalTaxableValue: 286, totalCGST: 22.72, totalSGST: 22.73, totalCess: 0.9, totalTax: 46.35, roundOff: -0.35, grandTotal: 332 });
    expect(result.taxSummary.map(group => group.rate)).toEqual([0, 5, 18]);
    expect(result.taxSummary[2]?.taxableValue).toBe(240);
    expect(result.items[0]?.hsn).toBe('1234');
    expect(result.grandTotalInWords).toBe('Three Hundred Thirty Two Rupees Only');
  });
  it('handles inclusive interstate totals, cents and both round-off signs', () => {
    expect(calculateInvoice({ items: [{ ...item, unitPrice: 118 }], pricesIncludeTax: true, interstate: true, roundOff: false })).toMatchObject({ totalIGST: 18, grandTotal: 118, roundOff: 0 });
    expect(calculateInvoice({ items: [{ ...item, gstRate: 0, unitPrice: 1.7 }] }).roundOff).toBe(0.3);
    expect(calculateInvoice({ items: [{ ...item, gstRate: 0, unitPrice: 1.4 }] }).roundOff).toBe(-0.4);
    expect(calculateInvoice({ items: [{ ...item, gstRate: 0, unitPrice: 1.5 }] }).grandTotal).toBe(2);
    expect(calculateInvoice({ items: [{ ...item, gstRate: 0, unitPrice: 1.005 }], roundOff: false }).grandTotal).toBe(1.01);
    expect(calculateInvoice({ items: [{ ...item, quantity: 0 }] }).grandTotal).toBe(0);
    expect(calculateInvoice({ items: [] }).grandTotal).toBe(0);
    expect(calculateInvoice({ items: [{ ...item, discount: { percent: 100 } }] }).grandTotal).toBe(0);
  });
  it('wraps invalid JavaScript input in typed errors', () => {
    const invalid: unknown[] = [null, {}, { items: null }, { items: [null] }, { items: new Array(1) }, { items: [], extraCharges: {} }, { items: [], extraCharges: [null] }, { items: [], roundOff: 'yes' }];
    for (const patch of [{ name: '' }, { hsn: 123 }, { quantity: -1 }, { quantity: NaN }, { unitPrice: Infinity }, { gstRate: -1 }, { cess: -1 }, { discount: -1 }, { discount: 101 }, { discount: { percent: 101 } }, { discount: { percent: NaN } }, { discount: null }, { discount: 'x' }]) invalid.push({ items: [{ ...item, ...patch }] });
    for (const value of invalid) {
      expect(() => calculateInvoice(value as InvoiceInput)).toThrow(InvoiceError);
      try { calculateInvoice(value as InvoiceInput); } catch (error) { expect(error).toMatchObject({ code: 'INVALID_INPUT', name: 'InvoiceError' }); }
    }
    expect(() => calculateInvoice({ items: [{ ...item, unitPrice: 1e20 }] })).toThrow(InvoiceError);
    try { calculateInvoice({ items: [{ ...item, unitPrice: 1e20 }] }); } catch (error) { expect(error).toMatchObject({ code: 'OUT_OF_RANGE' }); }
  });
});
