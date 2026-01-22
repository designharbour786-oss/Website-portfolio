import { useMemo, useState } from 'react';
import { Plus, Search, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import { addMedicine, deleteMedicine, getSnapshot, updateMedicine } from '../lib/db';
import type { Medicine } from '../lib/db';

function useDbSnapshot() {
  return getSnapshot();
}

const emptyForm: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  brand: '',
  batchNumber: '',
  category: '',
  purchasePrice: 0,
  sellingPrice: 0,
  quantity: 0,
  expiryDate: '',
  supplierId: undefined,
  barcode: '',
};

export function MedicinesPage() {
  const snapshot = useDbSnapshot();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [form, setForm] = useState(emptyForm);

  const medicines = snapshot.medicines;

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return medicines.filter((m) =>
      !q
        ? true
        : m.name.toLowerCase().includes(q) ||
          m.brand.toLowerCase().includes(q) ||
          m.barcode?.toLowerCase().includes(q) ||
          m.batchNumber.toLowerCase().includes(q),
    );
  }, [medicines, query]);

  function resetForm() {
    setEditing(null);
    setForm(emptyForm);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updateMedicine(editing.id, form);
    } else {
      addMedicine(form);
    }
    resetForm();
  }

  function startEdit(m: Medicine) {
    const { id, createdAt, updatedAt, ...rest } = m;
    setEditing(m);
    setForm(rest);
  }

  function stockColor(qty: number) {
    if (qty === 0) return 'bg-rose-100 text-rose-700';
    if (qty <= 5) return 'bg-rose-50 text-rose-700';
    if (qty <= 10) return 'bg-amber-50 text-amber-700';
    return 'bg-emerald-50 text-emerald-700';
  }

  function expiryLabel(date: string) {
    if (!date) return { label: 'No expiry', className: 'text-slate-500' };
    const now = new Date();
    const d = new Date(date);
    const diffDays = Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'Expired', className: 'text-rose-600 font-medium' };
    if (diffDays <= 7) return { label: `Expiring in ${diffDays}d`, className: 'text-rose-500' };
    if (diffDays <= 15) return { label: `Expiring in ${diffDays}d`, className: 'text-amber-600' };
    if (diffDays <= 30) return { label: `Expiring in ${diffDays}d`, className: 'text-amber-500' };
    return { label: d.toLocaleDateString(), className: 'text-slate-600' };
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Medicines</h1>
          <p className="text-sm text-slate-500">Fast search, large touch targets, and expiry color alerts.</p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 text-white px-4 py-3 text-sm font-semibold shadow-sm active:scale-[0.99]"
        >
          <Plus className="h-5 w-5" />
          <span>{editing ? 'New medicine' : 'Add medicine'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-3 md:p-4 border-b border-slate-100 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-2xl px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, brand, barcode, batch no."
                className="flex-1 bg-transparent border-0 outline-none text-sm"
              />
            </div>
            <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> OK
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Low
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-50 text-rose-700">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Out
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr className="text-left">
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Batch</th>
                  <th className="px-3 py-2 font-medium">Stock</th>
                  <th className="px-3 py-2 font-medium">Expiry</th>
                  <th className="px-3 py-2 font-medium text-right">Price</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const expiry = expiryLabel(m.expiryDate);
                  return (
                    <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-800">{m.name}</div>
                        <div className="text-[11px] text-slate-500">{m.brand}</div>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-600">{m.batchNumber}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium ${stockColor(
                            m.quantity,
                          )}`}
                        >
                          <span className="h-2 w-2 rounded-full bg-current/60" />
                          {m.quantity}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <span className={expiry.className}>{expiry.label}</span>
                      </td>
                      <td className="px-3 py-2 text-right text-xs text-slate-700">₹{m.sellingPrice.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(m)}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMedicine(m.id)}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-rose-50 text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!filtered.length && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-xs text-slate-400">
                      No medicines yet. Use the form on the right to add your first item.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
            <AlertTriangle className="h-3 w-3 text-amber-500" />
            <span>System warns 30 / 15 / 7 days before expiry inside each row.</span>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5 space-y-3 md:space-y-4"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm md:text-base font-semibold">
              {editing ? 'Edit medicine' : 'New medicine'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
            <div className="space-y-1">
              <label className="font-medium">Medicine name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">Brand</label>
              <input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">Batch no.</label>
              <input
                value={form.batchNumber}
                onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">Category</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">Purchase price</label>
              <input
                type="number"
                min={0}
                value={form.purchasePrice}
                onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">Selling price</label>
              <input
                type="number"
                min={0}
                value={form.sellingPrice}
                onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">Quantity</label>
              <input
                type="number"
                min={0}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">Expiry date</label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">Barcode (optional)</label>
              <input
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm tracking-[0.2em]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">Supplier (note)</label>
              <input
                placeholder="Link to supplier record by name"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-2xl border border-slate-200 text-xs md:text-sm font-medium text-slate-700"
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-4 py-3 rounded-2xl bg-sky-500 text-white text-xs md:text-sm font-semibold shadow-sm min-w-[120px]"
            >
              {editing ? 'Save changes' : 'Save medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
