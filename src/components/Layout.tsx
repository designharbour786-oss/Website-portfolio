import type { ReactNode } from 'react';
import { Pill, ShoppingCart, Package, BarChart3, Settings, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/medicines', label: 'Medicines', icon: Pill },
  { to: '/sales', label: 'Sales', icon: ShoppingCart },
  { to: '/purchases', label: 'Purchases', icon: Package },
  { to: '/suppliers', label: 'Suppliers', icon: Users },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <aside className="hidden md:flex md:flex-col w-72 border-r border-slate-200 bg-white/80 backdrop-blur">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-sky-500 flex items-center justify-center text-white">
            <Pill className="h-6 w-6" />
          </div>
          <div>
            <div className="font-semibold tracking-tight">MediStock Pro</div>
            <div className="text-xs text-slate-500">Smart pharmacy inventory</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors select-none` +
                  (isActive
                    ? ' bg-sky-500 text-white shadow-sm'
                    : ' text-slate-700 hover:bg-slate-100')
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-slate-200 text-xs text-slate-500">
          Offline-ready · Role-based access
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:hidden">
            <div className="h-9 w-9 rounded-2xl bg-sky-500 flex items-center justify-center text-white">
              <Pill className="h-5 w-5" />
            </div>
            <div className="text-sm font-semibold tracking-tight">MediStock Pro</div>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs md:text-sm font-medium text-slate-500">Fast, touch-friendly pharmacy stock management</span>
          </div>
          <div className="flex items-center gap-3 text-xs md:text-sm text-slate-500">
            <span className="hidden sm:inline">Role:</span>
            <span className="font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-full">Owner</span>
          </div>
        </header>
        <main className="flex-1 px-3 md:px-6 py-4 md:py-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
