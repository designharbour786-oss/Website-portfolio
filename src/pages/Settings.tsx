import { useRef } from 'react';
import { Shield, Upload, Download } from 'lucide-react';
import { exportBackup, importBackup } from '../lib/db';

export function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleExport() {
    const data = exportBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medistock-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        importBackup(data);
        alert('Backup restored successfully');
      } catch (err) {
        console.error(err);
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Settings & backup</h1>
        <p className="text-sm text-slate-500">Offline-first with one-click backup and restore.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-sky-500" />
            <div>
              <div className="text-sm font-semibold">Role-based access (demo)</div>
              <div className="text-xs text-slate-500">Owner has full access. Staff can be restricted per screen.</div>
            </div>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3">
            This demo runs fully in your browser. A production setup would connect to a secure cloud backend with
            offline sync per user account.
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Download className="h-5 w-5 text-emerald-500" />
            <div className="text-sm font-semibold">Backup & restore</div>
          </div>
          <div className="flex flex-col gap-2 text-xs">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-white px-4 py-2 text-sm font-semibold shadow-sm active:scale-[0.99]"
            >
              <Download className="h-4 w-4" />
              Export data
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 text-slate-800 px-4 py-2 text-sm font-semibold border border-slate-200 active:scale-[0.99]"
            >
              <Upload className="h-4 w-4" />
              Import backup
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImport}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
