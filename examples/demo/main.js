import { calculateInvoice, formatINR, GST_RATES, parseGSTIN, validateGSTIN } from 'india-invoice-utils';

const $ = (id) => document.getElementById(id);
const tbody = $('items').querySelector('tbody');

const starter = [
  { name: 'Web design', quantity: 1, unitPrice: 15000, gstRate: 18, discount: 10, cess: 0 },
  { name: 'Hosting (1 yr)', quantity: 1, unitPrice: 4999, gstRate: 18, discount: 0, cess: 0 },
  { name: 'Printed brochures', quantity: 250, unitPrice: 12.5, gstRate: 12, discount: 0, cess: 0 },
];

function rateOptions(selected) {
  return GST_RATES.map((r) => `<option value="${r}"${r === selected ? ' selected' : ''}>${r}</option>`).join('');
}

function addRow(item = { name: '', quantity: 1, unitPrice: 0, gstRate: 18, discount: 0, cess: 0 }) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input data-k="name" value="${item.name}" placeholder="Item name" /></td>
    <td><input data-k="quantity" type="number" min="0" step="any" value="${item.quantity}" /></td>
    <td><input data-k="unitPrice" type="number" min="0" step="0.01" value="${item.unitPrice}" /></td>
    <td><select data-k="gstRate">${rateOptions(item.gstRate)}</select></td>
    <td><input data-k="discount" type="number" min="0" max="100" step="any" value="${item.discount}" /></td>
    <td><input data-k="cess" type="number" min="0" step="any" value="${item.cess}" /></td>
    <td class="num" data-out="lineTotal"></td>
    <td><button type="button" class="remove" aria-label="Remove item">×</button></td>`;
  tr.querySelector('.remove').addEventListener('click', () => { tr.remove(); render(); });
  tbody.appendChild(tr);
}

function readItems() {
  return [...tbody.rows].map((tr) => {
    const v = (k) => tr.querySelector(`[data-k="${k}"]`).value;
    const discount = Number(v('discount')) || 0;
    return {
      name: v('name') || 'Item',
      quantity: Number(v('quantity')),
      unitPrice: Number(v('unitPrice')),
      gstRate: Number(v('gstRate')),
      cess: Number(v('cess')) || 0,
      ...(discount ? { discount: { percent: discount } } : {}),
    };
  });
}

function row(label, value, strong = false) {
  return `<tr${strong ? ' class="strong"' : ''}><th>${label}</th><td class="num">${value}</td></tr>`;
}

function render() {
  $('error').textContent = '';
  try {
    const inv = calculateInvoice({
      items: readItems(),
      interstate: $('interstate').checked,
      pricesIncludeTax: $('inclusive').checked,
      roundOff: $('roundOff').checked,
    });
    [...tbody.rows].forEach((tr, i) => { tr.querySelector('[data-out="lineTotal"]').textContent = formatINR(inv.items[i].lineTotal); });
    const tax = inv.totalIGST
      ? row('IGST', formatINR(inv.totalIGST))
      : row('CGST', formatINR(inv.totalCGST)) + row('SGST', formatINR(inv.totalSGST));
    $('summary').innerHTML = `
      <table>
        ${row('Subtotal', formatINR(inv.subtotal))}
        ${row('Discount', formatINR(-inv.totalDiscount))}
        ${row('Taxable value', formatINR(inv.totalTaxableValue))}
        ${tax}
        ${inv.totalCess ? row('Cess', formatINR(inv.totalCess)) : ''}
        ${row('Round off', formatINR(inv.roundOff, { showPlusSign: true }))}
        ${row('Grand total', formatINR(inv.grandTotal), true)}
      </table>
      <p class="words">${inv.grandTotalInWords}</p>
      <details><summary>Raw result</summary><pre>${JSON.stringify(inv, null, 2)}</pre></details>`;
  } catch (error) {
    $('error').textContent = error.message;
  }
}

function checkGSTIN() {
  const value = $('gstin').value;
  if (!value.trim()) { $('gstinResult').textContent = ''; return; }
  const result = validateGSTIN(value);
  const parsed = parseGSTIN(value);
  $('gstinResult').textContent = result.valid
    ? `✓ Valid format · ${parsed.stateName} · PAN ${parsed.pan}`
    : `✗ Invalid (${result.error})`;
  $('gstinResult').className = result.valid ? 'ok' : 'bad';
}

starter.forEach(addRow);
$('add').addEventListener('click', () => { addRow(); render(); });
document.addEventListener('input', (e) => { if (e.target.id === 'gstin') checkGSTIN(); else render(); });
document.addEventListener('change', render);
render();
