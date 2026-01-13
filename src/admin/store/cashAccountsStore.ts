/**
 * Cash Accounts Store - ERP Core
 * Gestión de cuentas de caja y bancos con saldo real y proyección
 * Responde: "¿Cuánta plata tengo hoy? ¿Cuándo me quedo sin caja?"
 */

import { create } from 'zustand';
import type { 
  CashAccount, 
  CashTransaction, 
  CashAccountType,
  CashTransactionType,
  CashTransactionCategory,
  CashPositionSummary
} from '../../lib/database.types';

// Tipo local para proyección diaria del flujo de caja
export interface DailyCashProjection {
  date: string;
  starting_balance: number;
  expected_income: number;
  expected_expense: number;
  committed_expense: number;
  projected_balance: number;
  cumulative_balance: number;
}

// ============================================
// TIPOS AUXILIARES
// ============================================

export const ACCOUNT_TYPES: { value: CashAccountType; label: string; icon: string; color: string }[] = [
  { value: 'cash', label: 'Caja', icon: '💵', color: 'bg-green-500' },
  { value: 'bank', label: 'Banco', icon: '🏦', color: 'bg-blue-500' },
  { value: 'digital_wallet', label: 'Billetera Digital', icon: '📱', color: 'bg-purple-500' },
  { value: 'investment', label: 'Inversión', icon: '📈', color: 'bg-amber-500' },
];

export const TRANSACTION_CATEGORIES: { 
  value: CashTransactionCategory; 
  label: string; 
  type: CashTransactionType;
  icon: string;
}[] = [
  // Ingresos
  { value: 'client_payment', label: 'Pago de Cliente', type: 'income', icon: '💰' },
  { value: 'advance_received', label: 'Anticipo Recibido', type: 'income', icon: '📥' },
  { value: 'retention_release', label: 'Liberación Retención', type: 'income', icon: '🔓' },
  { value: 'interest', label: 'Intereses', type: 'income', icon: '📊' },
  // Egresos
  { value: 'supplier_payment', label: 'Pago a Proveedor', type: 'expense', icon: '🏭' },
  { value: 'payroll', label: 'Nómina', type: 'expense', icon: '👷' },
  { value: 'tax', label: 'Impuestos', type: 'expense', icon: '📋' },
  { value: 'overhead', label: 'Gastos Generales', type: 'expense', icon: '🏢' },
  { value: 'petty_cash', label: 'Caja Chica', type: 'expense', icon: '💸' },
  { value: 'bank_fee', label: 'Comisiones Bancarias', type: 'expense', icon: '🏦' },
  // Otros
  { value: 'transfer', label: 'Transferencia', type: 'transfer_out', icon: '↔️' },
  { value: 'adjustment', label: 'Ajuste', type: 'expense', icon: '⚖️' },
  { value: 'other', label: 'Otro', type: 'expense', icon: '📝' },
];

export const getAccountTypeConfig = (type: CashAccountType) => 
  ACCOUNT_TYPES.find(t => t.value === type) || ACCOUNT_TYPES[0];

export const getCategoryConfig = (category: CashTransactionCategory) =>
  TRANSACTION_CATEGORIES.find(c => c.value === category) || TRANSACTION_CATEGORIES[TRANSACTION_CATEGORIES.length - 1];

// ============================================
// DATOS DEMO
// ============================================

const mockAccounts: CashAccount[] = [
  {
    id: 'acc-1',
    code: 'CAJA-001',
    name: 'Caja Principal',
    type: 'cash',
    bank_name: null,
    account_number: null,
    currency: 'UYU',
    initial_balance: 50000,
    current_balance: 127500,
    available_balance: 127500,
    credit_limit: 0,
    is_default: true,
    active: true,
    notes: 'Caja principal de la empresa',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'acc-2',
    code: 'BROU-001',
    name: 'BROU Cuenta Corriente',
    type: 'bank',
    bank_name: 'BROU',
    account_number: '001-123456-001',
    currency: 'UYU',
    initial_balance: 250000,
    current_balance: 1458000,
    available_balance: 1458000,
    credit_limit: 500000,
    is_default: false,
    active: true,
    notes: 'Cuenta principal para operaciones',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'acc-3',
    code: 'ITAU-001',
    name: 'Itaú Cuenta Empresa',
    type: 'bank',
    bank_name: 'Itaú',
    account_number: '12345678',
    currency: 'UYU',
    initial_balance: 180000,
    current_balance: 542300,
    available_balance: 542300,
    credit_limit: 200000,
    is_default: false,
    active: true,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'acc-4',
    code: 'ITAU-USD',
    name: 'Itaú Dólares',
    type: 'bank',
    bank_name: 'Itaú',
    account_number: '12345679',
    currency: 'USD',
    initial_balance: 15000,
    current_balance: 28500,
    available_balance: 28500,
    credit_limit: 0,
    is_default: false,
    active: true,
    notes: 'Cuenta en dólares para pagos internacionales',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockTransactions: CashTransaction[] = [
  {
    id: 'txn-1',
    code: 'TXN-2026-0001',
    account_id: 'acc-2',
    type: 'income',
    category: 'client_payment',
    amount: 850000,
    balance_after: 1458000,
    reference: 'FAC-2026-0042',
    description: 'Pago parcial Casa Carrasco - Hito Estructura',
    project_id: 'proj-1',
    receivable_id: 'rec-1',
    payable_id: null,
    transfer_account_id: null,
    bank_reference: 'TRF-12345',
    reconciled: true,
    reconciled_at: '2026-01-10T14:30:00Z',
    reconciled_by: 'admin-1',
    transaction_date: '2026-01-10',
    created_by: 'admin-1',
    created_at: '2026-01-10T14:30:00Z',
  },
  {
    id: 'txn-2',
    code: 'TXN-2026-0002',
    account_id: 'acc-2',
    type: 'expense',
    category: 'supplier_payment',
    amount: 245000,
    balance_after: 1213000,
    reference: 'OC-2026-0015',
    description: 'Pago Ferretería Industrial - Materiales estructura',
    project_id: 'proj-1',
    receivable_id: null,
    payable_id: 'pay-1',
    transfer_account_id: null,
    bank_reference: 'TRF-12346',
    reconciled: true,
    reconciled_at: '2026-01-11T10:00:00Z',
    reconciled_by: 'admin-1',
    transaction_date: '2026-01-11',
    created_by: 'admin-1',
    created_at: '2026-01-11T10:00:00Z',
  },
  {
    id: 'txn-3',
    code: 'TXN-2026-0003',
    account_id: 'acc-1',
    type: 'expense',
    category: 'petty_cash',
    amount: 12500,
    balance_after: 115000,
    reference: null,
    description: 'Gastos varios de obra - Combustible y viáticos',
    project_id: 'proj-1',
    receivable_id: null,
    payable_id: null,
    transfer_account_id: null,
    bank_reference: null,
    reconciled: false,
    reconciled_at: null,
    reconciled_by: null,
    transaction_date: '2026-01-12',
    created_by: 'admin-1',
    created_at: '2026-01-12T16:00:00Z',
  },
  {
    id: 'txn-4',
    code: 'TXN-2026-0004',
    account_id: 'acc-2',
    type: 'expense',
    category: 'payroll',
    amount: 380000,
    balance_after: 833000,
    reference: 'NOM-2026-01',
    description: 'Nómina Enero 2026 - Primera quincena',
    project_id: null,
    receivable_id: null,
    payable_id: 'pay-2',
    transfer_account_id: null,
    bank_reference: 'MULTI-78901',
    reconciled: true,
    reconciled_at: '2026-01-13T09:00:00Z',
    reconciled_by: 'admin-1',
    transaction_date: '2026-01-13',
    created_by: 'admin-1',
    created_at: '2026-01-13T09:00:00Z',
  },
];

// Proyección demo para los próximos 30 días
const generateProjection = (): DailyCashProjection[] => {
  const today = new Date();
  const projection: DailyCashProjection[] = [];
  let cumulativeBalance = 2127800; // Suma de todas las cuentas UYU
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    // Simular flujos esperados
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();
    
    let expectedIncome = 0;
    let expectedExpense = 0;
    let committedExpense = 0;
    
    // Cobros esperados (más probables fin de semana/mes)
    if (dayOfMonth === 15 || dayOfMonth === 30) {
      expectedIncome = 450000 + Math.random() * 200000;
    } else if (dayOfWeek === 5) {
      expectedIncome = Math.random() > 0.6 ? 180000 : 0;
    }
    
    // Pagos esperados
    if (dayOfMonth === 5 || dayOfMonth === 20) {
      expectedExpense = 320000 + Math.random() * 100000; // Nómina
    }
    if (dayOfWeek === 3) {
      expectedExpense += 85000 + Math.random() * 50000; // Proveedores
    }
    
    // Comprometido (OC aprobadas)
    if (i < 7) {
      committedExpense = Math.random() > 0.7 ? 125000 : 0;
    } else if (i < 14) {
      committedExpense = Math.random() > 0.5 ? 95000 : 0;
    }
    
    const netFlow = expectedIncome - expectedExpense - committedExpense;
    cumulativeBalance += netFlow;
    
    projection.push({
      date: date.toISOString().split('T')[0],
      starting_balance: cumulativeBalance - netFlow,
      expected_income: Math.round(expectedIncome),
      expected_expense: Math.round(expectedExpense),
      committed_expense: Math.round(committedExpense),
      projected_balance: Math.round(netFlow),
      cumulative_balance: Math.round(cumulativeBalance),
    });
  }
  
  return projection;
};

// ============================================
// STORE INTERFACE
// ============================================

interface CashAccountsState {
  accounts: CashAccount[];
  transactions: CashTransaction[];
  projection: DailyCashProjection[];
  selectedAccountId: string | null;
  loading: boolean;
  
  // Acciones
  fetchAccounts: () => Promise<void>;
  fetchTransactions: (accountId?: string) => Promise<void>;
  fetchProjection: (days: number) => Promise<void>;
  
  addAccount: (account: Omit<CashAccount, 'id' | 'created_at' | 'updated_at'>) => void;
  updateAccount: (id: string, updates: Partial<CashAccount>) => void;
  
  addTransaction: (transaction: Omit<CashTransaction, 'id' | 'code' | 'created_at' | 'balance_after'>) => void;
  reconcileTransaction: (id: string) => void;
  
  selectAccount: (id: string | null) => void;
  
  // Getters
  getPositionSummary: () => CashPositionSummary;
  getAccountBalance: (accountId: string) => number;
  getDaysUntilNegative: () => number | null;
  getMonthlyMovements: (accountId?: string) => { income: number; expense: number; net: number };
}

// ============================================
// STORE
// ============================================

export const useCashAccountsStore = create<CashAccountsState>((set, get) => ({
  accounts: mockAccounts,
  transactions: mockTransactions,
  projection: generateProjection(),
  selectedAccountId: null,
  loading: false,
  
  fetchAccounts: async () => {
    set({ loading: true });
    await new Promise(r => setTimeout(r, 300));
    set({ loading: false });
  },
  
  fetchTransactions: async (_accountId?: string) => {
    set({ loading: true });
    await new Promise(r => setTimeout(r, 300));
    set({ loading: false });
  },
  
  fetchProjection: async (_days: number) => {
    set({ loading: true });
    await new Promise(r => setTimeout(r, 300));
    set({ projection: generateProjection(), loading: false });
  },
  
  addAccount: (account) => {
    const newAccount: CashAccount = {
      ...account,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set(state => ({ accounts: [...state.accounts, newAccount] }));
  },
  
  updateAccount: (id, updates) => {
    set(state => ({
      accounts: state.accounts.map(acc =>
        acc.id === id ? { ...acc, ...updates, updated_at: new Date().toISOString() } : acc
      ),
    }));
  },
  
  addTransaction: (transaction) => {
    const { accounts } = get();
    const account = accounts.find(a => a.id === transaction.account_id);
    if (!account) return;
    
    const balanceChange = transaction.type === 'income' || transaction.type === 'transfer_in'
      ? transaction.amount
      : -transaction.amount;
    
    const newBalance = account.current_balance + balanceChange;
    
    const code = `TXN-${new Date().getFullYear()}-${String(get().transactions.length + 1).padStart(4, '0')}`;
    
    const newTransaction: CashTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
      code,
      balance_after: newBalance,
      created_at: new Date().toISOString(),
    };
    
    set(state => ({
      transactions: [newTransaction, ...state.transactions],
      accounts: state.accounts.map(acc =>
        acc.id === transaction.account_id
          ? { 
              ...acc, 
              current_balance: newBalance,
              available_balance: newBalance,
              updated_at: new Date().toISOString(),
            }
          : acc
      ),
    }));
  },
  
  reconcileTransaction: (id) => {
    set(state => ({
      transactions: state.transactions.map(txn =>
        txn.id === id
          ? { ...txn, reconciled: true, reconciled_at: new Date().toISOString() }
          : txn
      ),
    }));
  },
  
  selectAccount: (id) => set({ selectedAccountId: id }),
  
  getPositionSummary: () => {
    const { accounts, transactions } = get();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const uyuAccounts = accounts.filter(a => a.currency === 'UYU' && a.active);
    
    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.transaction_date);
      return tDate >= startOfMonth && uyuAccounts.some(a => a.id === t.account_id);
    });
    
    const incomeMtd = monthTransactions
      .filter(t => t.type === 'income' || t.type === 'transfer_in')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenseMtd = monthTransactions
      .filter(t => t.type === 'expense' || t.type === 'transfer_out')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      total_cash: accounts.filter(a => a.type === 'cash' && a.active && a.currency === 'UYU')
        .reduce((sum, a) => sum + a.current_balance, 0),
      total_bank: accounts.filter(a => a.type === 'bank' && a.active && a.currency === 'UYU')
        .reduce((sum, a) => sum + a.current_balance, 0),
      total_available: uyuAccounts.reduce((sum, a) => sum + a.available_balance, 0),
      accounts: accounts.filter(a => a.active).map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        balance: a.current_balance,
        currency: a.currency,
      })),
      income_mtd: incomeMtd,
      expense_mtd: expenseMtd,
      net_mtd: incomeMtd - expenseMtd,
    };
  },
  
  getAccountBalance: (accountId) => {
    const account = get().accounts.find(a => a.id === accountId);
    return account?.current_balance || 0;
  },
  
  getDaysUntilNegative: () => {
    const { projection } = get();
    const negativeDay = projection.findIndex(p => p.cumulative_balance < 0);
    return negativeDay === -1 ? null : negativeDay;
  },
  
  getMonthlyMovements: (accountId?: string) => {
    const { transactions, accounts } = get();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const filtered = transactions.filter(t => {
      const tDate = new Date(t.transaction_date);
      const dateMatch = tDate >= startOfMonth;
      const accountMatch = accountId ? t.account_id === accountId : true;
      return dateMatch && accountMatch && accounts.some(a => a.id === t.account_id && a.currency === 'UYU');
    });
    
    const income = filtered
      .filter(t => t.type === 'income' || t.type === 'transfer_in')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = filtered
      .filter(t => t.type === 'expense' || t.type === 'transfer_out')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expense, net: income - expense };
  },
}));
