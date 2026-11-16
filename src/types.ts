export interface NumberFormatOptions { decimals?: number }
export interface INRFormatOptions extends NumberFormatOptions {
  symbol?: boolean;
  showPlusSign?: boolean;
}
export interface WordsOptions {
  currency?: string;
  subunit?: string;
  suffix?: string;
  case?: 'title' | 'upper' | 'lower';
}
export interface GSTInput {
  amount: number;
  rate: number;
  inclusive?: boolean;
  interstate?: boolean;
  /** Percentage cess on taxable value, not a fixed amount. */
  cess?: number;
}
export interface GSTBreakup {
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  totalTax: number;
  total: number;
  rate: number;
}
export interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  /** Fixed discount per line, or percentage of the rounded line gross. */
  discount?: number | { percent: number };
  hsn?: string;
  cess?: number;
}
export interface ExtraCharge { label: string; amount: number; gstRate?: number }
export interface InvoiceInput {
  items: InvoiceItem[];
  interstate?: boolean;
  pricesIncludeTax?: boolean;
  roundOff?: boolean;
  extraCharges?: ExtraCharge[];
}
export interface InvoiceLine extends GSTBreakup {
  name: string;
  quantity: number;
  unitPrice: number;
  gross: number;
  discount: number;
  lineTotal: number;
  hsn?: string;
}
export type TaxSummary = GSTBreakup;
export interface InvoiceSummary {
  items: InvoiceLine[];
  extraCharges: InvoiceLine[];
  taxSummary: TaxSummary[];
  subtotal: number;
  totalDiscount: number;
  totalTaxableValue: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  totalCess: number;
  totalTax: number;
  roundOff: number;
  grandTotal: number;
  grandTotalInWords: string;
}
export type InvoiceErrorCode = 'INVALID_INPUT' | 'OUT_OF_RANGE';
/** A calculation failure with a stable code.
 * @example if (error instanceof InvoiceError) console.log(error.code);
 */
export class InvoiceError extends Error {
  /** Create a typed invoice error.
   * @example new InvoiceError('INVALID_INPUT', 'Quantity must be non-negative');
   */
  constructor(public readonly code: InvoiceErrorCode, message: string) {
    super(message);
    this.name = 'InvoiceError';
  }
}
export interface GSTState { readonly code: string; readonly name: string; readonly ut: boolean }
export type GSTINError = 'LENGTH' | 'FORMAT' | 'STATE_CODE' | 'CHECKSUM';
export type GSTINValidation = { valid: true } | { valid: false; error: GSTINError };
export interface ParsedGSTIN {
  stateCode: string;
  stateName: string;
  pan: string;
  entityNumber: string;
  checksum: string;
}
export type PANHolderType = 'Individual' | 'Company' | 'Hindu Undivided Family' | 'Firm' |
  'Association of Persons' | 'Trust' | 'Body of Individuals' | 'Local Authority' |
  'Artificial Juridical Person' | 'Government';
