import { v4 as uuid } from 'uuid';

export type Role = 'owner' | 'staff';

export interface Medicine {
  id: string;
  name: string;
  brand: string;
  batchNumber: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  expiryDate: string;
  supplierId?: string;
  barcode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: string;
  medicineId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  createdAt: string;
}

export interface PurchaseItem {
  id: string;
  medicineId: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface Purchase {
  id: string;
  supplierId?: string;
  invoiceNumber?: string;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  createdAt: string;
}

export interface BackupPayload {
  medicines: Medicine[];
  suppliers: Supplier[];
  sales: Sale[];
  purchases: Purchase[];
  createdAt: string;
}

const STORAGE_KEY = 'medistock-pro-v1';

export interface DatabaseState {
  medicines: Medicine[];
  suppliers: Supplier[];
  sales: Sale[];
  purchases: Purchase[];
}

const defaultState: DatabaseState = {
  medicines: [],
  suppliers: [],
  sales: [],
  purchases: [],
};

function loadState(): DatabaseState {
  if (typeof localStorage === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as DatabaseState;
    return { ...defaultState, ...parsed };
  } catch (e) {
    console.error('Failed to load local data', e);
    return defaultState;
  }
}

function saveState(state: DatabaseState) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save local data', e);
  }
}

let currentState: DatabaseState = loadState();

function emitChange() {
  saveState(currentState);
}

export function getSnapshot(): DatabaseState {
  return currentState;
}

export function subscribe(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

export function addMedicine(input: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>): Medicine {
  const now = new Date().toISOString();
  const medicine: Medicine = { ...input, id: uuid(), createdAt: now, updatedAt: now };
  currentState = { ...currentState, medicines: [...currentState.medicines, medicine] };
  emitChange();
  return medicine;
}

export function updateMedicine(id: string, patch: Partial<Medicine>): Medicine | undefined {
  let updated: Medicine | undefined;
  currentState = {
    ...currentState,
    medicines: currentState.medicines.map((m) => {
      if (m.id !== id) return m;
      updated = { ...m, ...patch, updatedAt: new Date().toISOString() };
      return updated!;
    }),
  };
  emitChange();
  return updated;
}

export function deleteMedicine(id: string) {
  currentState = { ...currentState, medicines: currentState.medicines.filter((m) => m.id !== id) };
  emitChange();
}

export function recordSale(input: Omit<Sale, 'id' | 'createdAt'>): Sale {
  const now = new Date().toISOString();
  const sale: Sale = { ...input, id: uuid(), createdAt: now };
  // decrease stock
  const medicines = currentState.medicines.map((m) => {
    const items = sale.items.filter((i) => i.medicineId === m.id);
    if (!items.length) return m;
    const soldQty = items.reduce((sum, i) => sum + i.quantity, 0);
    return { ...m, quantity: Math.max(0, m.quantity - soldQty), updatedAt: now };
  });
  currentState = { ...currentState, sales: [...currentState.sales, sale], medicines };
  emitChange();
  return sale;
}

export function recordPurchase(input: Omit<Purchase, 'id' | 'createdAt'>): Purchase {
  const now = new Date().toISOString();
  const purchase: Purchase = { ...input, id: uuid(), createdAt: now };
  const medicines = currentState.medicines.map((m) => {
    const items = purchase.items.filter((i) => i.medicineId === m.id);
    if (!items.length) return m;
    const qty = items.reduce((sum, i) => sum + i.quantity, 0);
    return { ...m, quantity: m.quantity + qty, updatedAt: now };
  });
  currentState = { ...currentState, purchases: [...currentState.purchases, purchase], medicines };
  emitChange();
  return purchase;
}

export function addSupplier(input: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Supplier {
  const now = new Date().toISOString();
  const supplier: Supplier = { ...input, id: uuid(), createdAt: now, updatedAt: now };
  currentState = { ...currentState, suppliers: [...currentState.suppliers, supplier] };
  emitChange();
  return supplier;
}

export function updateSupplier(id: string, patch: Partial<Supplier>): Supplier | undefined {
  let updated: Supplier | undefined;
  const now = new Date().toISOString();
  currentState = {
    ...currentState,
    suppliers: currentState.suppliers.map((s) => {
      if (s.id !== id) return s;
      updated = { ...s, ...patch, updatedAt: now };
      return updated!;
    }),
  };
  emitChange();
  return updated;
}

export function deleteSupplier(id: string) {
  currentState = { ...currentState, suppliers: currentState.suppliers.filter((s) => s.id !== id) };
  emitChange();
}

export function exportBackup(): BackupPayload {
  const snapshot = getSnapshot();
  return {
    ...snapshot,
    createdAt: new Date().toISOString(),
  };
}

export function importBackup(payload: BackupPayload) {
  currentState = {
    medicines: payload.medicines ?? [],
    suppliers: payload.suppliers ?? [],
    sales: payload.sales ?? [],
    purchases: payload.purchases ?? [],
  };
  emitChange();
}
