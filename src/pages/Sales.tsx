import { useMemo, useState } from 'react';
import { Printer, Trash2, Percent, Search } from 'lucide-react';
import { getSnapshot, recordSale } from '../lib/db';
import type { Medicine, SaleItem } from '../lib/db';

function useDbSnapshot() {
  return getSnapshot();
}

interface CartRow {
  medicine: Medicine;
  quantity: number;
}

export function SalesPage() {
  const snapshot = useDbSnapshot();
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartRow[]>([]);
  const [taxPercent, setTaxPercent] = useState(5);
  const [discount, setDiscount] = useState(0);

  const medicines = snapshot.medicines;

  const searchResults = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return medicines.slice(0, 20);
    return medicines.filter((m) =>
      m.name.toLowerCase().includes(q) ||
      m.brand.toLowerCase().includes(q) ||
      m.barcode?.toLowerCase().includes(q) ||
      m.batchNumber.toLowerCase().includes(q),
    );
  }, [medicines, query]);

  function addToCart(medicine: Medicine) {
    setCart((prev) => {
      const existing = prev.find((row) => row.medicine.id === medicine.id);
      if (existing) {
        return prev.map((row) =>
          row.medicine.id === medicine.id
            ? { ...row, quantity: row.quantity + 1 }
            : row,
        );
      }
      return [...prev, { medicine, quantity: 1 }];
    });
  }

  function updateQty(id: string, qty: number) {
    setCart((prev) =>
      prev.map((row) => (row.medicine.id === id ? { ...row, quantity: Math.max(1, qty) } : row)),
    );
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((row) => row.medicine.id !== id));
  }

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, row) => sum + row.medicine.sellingPrice * row.quantity, 0);
    const tax = (subtotal * taxPercent) / 100;
    const grandBeforeDiscount = subtotal + tax;
    const finalDiscount = Math.min(discount, grandBeforeDiscount);
    const grandTotal = grandBeforeDiscount - finalDiscount;
    return { subtotal, tax, grandTotal };
  }, [cart, taxPercent, discount]);

  function handleCheckout() {
    if (!cart.length) return;
    const items: SaleItem[] = cart.map((row) => ({
      id: row.medicine.id,
      medicineId: row.medicine.id,
      quantity: row.quantity,
      unitPrice: row.medicine.sellingPrice,
      total: row.medicine.sellingPrice * row.quantity,
    }));
    const subtotal = totals.subtotal;
    const sale = recordSale({
      invoiceNumber: `INV-${Date.now()}`,
      items,
      subtotal,
      tax: totals.tax,
      discount,
      grandTotal: totals.grandTotal,
    });
    window.print();
    console.log('Sale recorded', sale);
    setCart([]);
    setDiscount(0);
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Billing</h1>
          <p className="text-sm text-slate-500">Scan or search, tap to add, big totals for quick review.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-3 md:p-4 border-b border-slate-100 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-2xl px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or scan barcode"
                className="flex-1 bg-transparent border-0 outline-none text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-3 md:p-4 max-h-[360px] overflow-y-auto">
            {searchResults.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => addToCart(m)}
                className="flex flex-col items-start gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 hover:border-sky-400 text-left text-xs md:text-sm active:scale-[0.99]"
              >
                <div className="font-medium text-slate-800 truncate w-full">{m.name}</div>
                <div className="text-[11px] text-slate-500 truncate w-full">{m.brand}</div>
                <div className="text-[11px] text-slate-500">₹{m.sellingPrice.toFixed(2)}</div>
              </button>
            ))}
            {!searchResults.length && (
              <div className="col-span-full text-center text-xs text-slate-400 py-6">
                No medicines found. Add items in the Medicines screen.
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-3 md:p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm md:text-base font-semibold">Current bill</h2>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-600"
            >
              <Printer className="h-3 w-3" /> Print
            </button>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {cart.map((row) => (
              <div key={row.medicine.id} className="flex items-center gap-2 px-3 md:px-4 py-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs md:text-sm font-medium text-slate-800 truncate">
                    {row.medicine.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{row.medicine.brand}</div>
                </div>
                <input
                  type="number"
                  min={1}
                  value={row.quantity}
                  onChange={(e) => updateQty(row.medicine.id, Number(e.target.value))}
                  className="w-14 rounded-xl border border-slate-200 px-2 py-1 text-xs text-right"
                />
                <div className="text-xs md:text-sm w-16 text-right text-slate-700">
                  ₹{(row.medicine.sellingPrice * row.quantity).toFixed(2)}
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(row.medicine.id)}
                  className="h-7 w-7 inline-flex items-center justify-center rounded-full bg-rose-50 text-rose-600"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            {!cart.length && (
              <div className="px-3 md:px-4 py-6 text-center text-xs text-slate-400">No items in bill.</div>
            )}
          </div>
          <div className="p-3 md:p-4 space-y-2 border-t border-slate-100 text-xs md:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-slate-600">
                Tax
                <Percent className="h-3 w-3" />
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                  className="w-14 rounded-xl border border-slate-200 px-2 py-1 text-xs text-right"
                />
                <span className="font-medium">₹{totals.tax.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600">Discount</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-20 rounded-xl border border-slate-200 px-2 py-1 text-xs text-right"
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-sm font-semibold text-slate-800">Total</span>
              <span className="text-xl font-semibold text-emerald-600">₹{totals.grandTotal.toFixed(2)}</span>
            </div>
            <button
              type="button"
              disabled={!cart.length}
              onClick={handleCheckout}
              className="w-full mt-2 rounded-2xl bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold py-3 shadow-sm active:scale-[0.99]"
            >
              Complete bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
