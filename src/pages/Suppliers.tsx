import { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { addSupplier, deleteSupplier, getSnapshot, updateSupplier } from '../lib/db';
import type { Supplier } from '../lib/db';

function useDbSnapshot() {
  return getSnapshot();
}

const emptyForm: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  phone: '',
  email: '',
  address: '',
  gstNumber: '',
  notes: '',
};

export function SuppliersPage() {
  const snapshot = useDbSnapshot();
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptyForm);

  function resetForm() {
    setEditing(null);
    setForm(emptyForm);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updateSupplier(editing.id, form);
    } else {
      addSupplier(form);
    }
    resetForm();
  }

  function startEdit(s: Supplier) {
    const { id, createdAt, updatedAt, ...rest } = s;
    setEditing(s);
    setForm(rest);
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Suppliers</h1>
          <p className="text-sm text-slate-500">Keep contact and GST details handy for quick reorders.</p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 text-white px-4 py-3 text-sm font-semibold shadow-sm active:scale-[0.99]"
        >
          <Plus className="h-5 w-5" />
          <span>{editing ? 'New supplier' : 'Add supplier'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {snapshot.suppliers.map((s) => (
            <div key={s.id} className="flex items-start gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-800 truncate">{s.name}</div>
                <div className="text-[11px] text-slate-500 space-x-2 mt-1">
                  {s.phone && <span>{s.phone}</span>}
                  {s.email && <span>{s.email}</span>}
                  {s.gstNumber && <span>GST: {s.gstNumber}</span>}
                </div>
                {s.address && <div className="text-[11px] text-slate-500 mt-1">{s.address}</div>}
                {s.notes && <div className="text-[11px] text-slate-500 mt-1">Notes: {s.notes}</div>}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(s)}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-600"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteSupplier(s.id)}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-rose-50 text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {!snapshot.suppliers.length && (
            <div className="px-4 py-6 text-center text-xs text-slate-400">No suppliers yet.</div>
          )}
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5 space-y-3 md:space-y-4"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm md:text-base font-semibold">
              {editing ? 'Edit supplier' : 'New supplier'}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 md:gap-4 text-xs md:text-sm">
            <div className="space-y-1">
              <label className="font-medium">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">Address</label>
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">GST number</label>
              <input
                value={form.gstNumber}
                onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm tracking-[0.2em]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">Notes</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
              {editing ? 'Save changes' : 'Save supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
