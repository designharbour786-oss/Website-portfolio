import { useMemo, useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { getSnapshot, recordPurchase } from '../lib/db';
import type { Medicine, PurchaseItem } from '../lib/db';

function useDbSnapshot() {
  return getSnapshot();
}

interface Row {
  medicine: Medicine;
  quantity: number;
  unitCost: number;
}

export function PurchasesPage() {
  const snapshot = useDbSnapshot();
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<Row[]>([]);

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

  function addRow(medicine: Medicine) {
    setRows((prev) => {
      const existing = prev.find((row) => row.medicine.id === medicine.id);
      if (existing) {
        return prev.map((row) =>
          row.medicine.id === medicine.id
            ? { ...row, quantity: row.quantity + 1 }
            : row,
        );
      }
      return [...prev, { medicine, quantity: 1, unitCost: medicine.purchasePrice }];
    });
  }

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((prev) =>
      prev.map((row) => (row.medicine.id === id ? { ...row, ...patch } : row)),
    );
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((row) => row.medicine.id !== id));
  }

  const totals = useMemo(() => {
    const subtotal = rows.reduce((sum, row) => sum + row.unitCost * row.quantity, 0);
    const tax = (subtotal * 5) / 100;
    const grandTotal = subtotal + tax;
    return { subtotal, tax, grandTotal };
  }, [rows]);

  function handleSave() {
    if (!rows.length) return;
    const items: PurchaseItem[] = rows.map((row) => ({
      id: row.medicine.id,
      medicineId: row.medicine.id,
      quantity: row.quantity,
      unitCost: row.unitCost,
      total: row.unitCost * row.quantity,
    }));
    recordPurchase({
      supplierId: undefined,
      invoiceNumber: `PUR-${Date.now()}`,
      items,
      subtotal: totals.subtotal,
      tax: totals.tax,
      discount: 0,
      grandTotal: totals.grandTotal,
    });
    setRows([]);
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Purchases</h1>
          <p className="text-sm text-slate-500">Record incoming stock and keep supplier invoices in sync.</p>
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
                placeholder="Search medicine to add to purchase"
                className="flex-1 bg-transparent border-0 outline-none text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-3 md:p-4 max-h-[360px] overflow-y-auto">
            {searchResults.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => addRow(m)}
                className="flex flex-col items-start gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 hover:border-sky-400 text-left text-xs md:text-sm active:scale-[0.99]"
              >
                <div className="font-medium text-slate-800 truncate w-full">{m.name}</div>
                <div className="text-[11px] text-slate-500 truncate w-full">{m.brand}</div>
                <div className="text-[11px] text-slate-500">₹{m.purchasePrice.toFixed(2)}</div>
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
            <h2 className="text-sm md:text-base font-semibold">Purchase items</h2>
            <Plus className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {rows.map((row) => (
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
                  onChange={(e) => updateRow(row.medicine.id, { quantity: Number(e.target.value) })}
                  className="w-14 rounded-xl border border-slate-200 px-2 py-1 text-xs text-right"
                />
                <input
                  type="number"
                  min={0}
                  value={row.unitCost}
                  onChange={(e) => updateRow(row.medicine.id, { unitCost: Number(e.target.value) })}
                  className="w-20 rounded-xl border border-slate-200 px-2 py-1 text-xs text-right"
                />
                <button
                  type="button"
                  onClick={() => removeRow(row.medicine.id)}
                  className="h-7 w-7 inline-flex items-center justify-center rounded-full bg-rose-50 text-rose-600"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            {!rows.length && (
              <div className="px-3 md:px-4 py-6 text-center text-xs text-slate-400">No items yet.</div>
            )}
          </div>
          <div className="p-3 md:p-4 space-y-2 border-t border-slate-100 text-xs md:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Tax (5%)</span>
              <span className="font-medium">₹{totals.tax.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-sm font-semibold text-slate-800">Total</span>
              <span className="text-xl font-semibold text-sky-600">₹{totals.grandTotal.toFixed(2)}</span>
            </div>
            <button
              type="button"
              disabled={!rows.length}
              onClick={handleSave}
              className="w-full mt-2 rounded-2xl bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold py-3 shadow-sm active:scale-[0.99]"
            >
              Save purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
