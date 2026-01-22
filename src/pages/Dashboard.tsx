import { useMemo } from 'react';
import { AlertTriangle, Pill, TrendingDown, TrendingUp } from 'lucide-react';
import { getSnapshot } from '../lib/db';

function useDbSnapshot() {
  // simple subscription-free snapshot, good enough for demo
  return getSnapshot();
}

export function DashboardPage() {
  const snapshot = useDbSnapshot();

  const { totalMedicines, lowStockCount, expiredCount, todaySales } = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const totalMedicines = snapshot.medicines.length;
    const lowStockCount = snapshot.medicines.filter((m) => m.quantity <= 10 && m.quantity > 0).length;
    const expiredCount = snapshot.medicines.filter((m) => new Date(m.expiryDate) < now).length;
    const todaySales = snapshot.sales
      .filter((s) => new Date(s.createdAt) >= startOfDay)
      .reduce((sum, s) => sum + s.grandTotal, 0);
    return { totalMedicines, lowStockCount, expiredCount, todaySales };
  }, [snapshot]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-1">Dashboard</h1>
        <p className="text-sm text-slate-500">Single-glance view of stock, expiry, and today&apos;s billing.</p>
      </div>
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-3 md:p-4 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total medicines</span>
            <Pill className="h-5 w-5 text-sky-500" />
          </div>
          <div className="text-2xl md:text-3xl font-semibold">{totalMedicines}</div>
        </div>
        <div className="bg-white rounded-2xl border border-amber-200 p-3 md:p-4 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-700">Low stock</span>
            <TrendingDown className="h-5 w-5 text-amber-500" />
          </div>
          <div className="text-2xl md:text-3xl font-semibold text-amber-700">{lowStockCount}</div>
          <span className="text-[11px] text-amber-600">Below 10 units</span>
        </div>
        <div className="bg-white rounded-2xl border border-rose-200 p-3 md:p-4 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-700">Expired</span>
            <AlertTriangle className="h-5 w-5 text-rose-500" />
          </div>
          <div className="text-2xl md:text-3xl font-semibold text-rose-700">{expiredCount}</div>
          <span className="text-[11px] text-rose-600">Remove from shelf immediately</span>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-200 p-3 md:p-4 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-700">Today&apos;s sales</span>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-2xl md:text-3xl font-semibold text-emerald-700">
            ₹{todaySales.toFixed(2)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm">
          <h2 className="text-sm md:text-base font-semibold mb-3">Upcoming expiries</h2>
          <p className="text-xs text-slate-500 mb-3">30 / 15 / 7-day alerts to prevent losses.</p>
          <div className="border border-dashed border-slate-200 rounded-xl p-4 text-xs text-slate-400 text-center">
            Add medicines to see expiry alerts here.
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm">
          <h2 className="text-sm md:text-base font-semibold mb-3">Today&apos;s quick view</h2>
          <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
            <div className="bg-slate-50 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-slate-500">Bills</span>
              <span className="text-xl font-semibold">{snapshot.sales.length}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-slate-500">Items sold</span>
              <span className="text-xl font-semibold">
                {snapshot.sales.reduce((sum, s) => sum + s.items.reduce((a, i) => a + i.quantity, 0), 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
