import { useMemo, useState } from 'react';
import { Calendar, FileText } from 'lucide-react';
import { getSnapshot } from '../lib/db';

function useDbSnapshot() {
  return getSnapshot();
}

export function ReportsPage() {
  const snapshot = useDbSnapshot();
  const [range, setRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const { totalSales, billCount, itemsSold } = useMemo(() => {
    const now = new Date();
    let from = new Date();
    if (range === 'daily') from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (range === 'weekly') from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    if (range === 'monthly') from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);

    const relevant = snapshot.sales.filter((s) => new Date(s.createdAt) >= from);
    const totalSales = relevant.reduce((sum, s) => sum + s.grandTotal, 0);
    const billCount = relevant.length;
    const itemsSold = relevant.reduce((sum, s) => sum + s.items.reduce((a, i) => a + i.quantity, 0), 0);
    return { totalSales, billCount, itemsSold };
  }, [snapshot, range]);

  const expirySoon = useMemo(() => {
    const now = new Date();
    return snapshot.medicines.filter((m) => {
      const d = new Date(m.expiryDate);
      const diffDays = Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30;
    });
  }, [snapshot]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Reports</h1>
          <p className="text-sm text-slate-500">One-tap summaries for sales, stock, and expiry.</p>
        </div>
        <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs">
          {['daily', 'weekly', 'monthly'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r as any)}
              className={`px-3 py-1 rounded-full font-medium capitalize ${
                range === r ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total sales</span>
            <FileText className="h-4 w-4 text-sky-500" />
          </div>
          <div className="text-2xl font-semibold">₹{totalSales.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Bills</span>
            <Calendar className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-semibold">{billCount}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Items sold</span>
          </div>
          <div className="text-2xl font-semibold">{itemsSold}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <h2 className="text-sm md:text-base font-semibold mb-3">Expiry report (next 30 days)</h2>
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs md:text-sm">
            {expirySoon.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-2 py-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 truncate">{m.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">Batch {m.batchNumber}</div>
                </div>
                <div className="text-right text-[11px] text-amber-600">
                  {new Date(m.expiryDate).toLocaleDateString()}
                </div>
              </div>
            ))}
            {!expirySoon.length && (
              <div className="py-4 text-center text-xs text-slate-400">No items expiring soon.</div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <h2 className="text-sm md:text-base font-semibold mb-3">Stock snapshot</h2>
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs md:text-sm">
            {snapshot.medicines.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-2 py-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 truncate">{m.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{m.brand}</div>
                </div>
                <div className="text-right text-[11px] text-slate-600">Qty: {m.quantity}</div>
              </div>
            ))}
            {!snapshot.medicines.length && (
              <div className="py-4 text-center text-xs text-slate-400">No stock yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
