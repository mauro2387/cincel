/**
 * Cash Position Store - Control de Caja y Bancos
 * Saldo real, proyectado, punto de quiebre
 */

import { create } from 'zustand';

// ============================================
// TIPOS
// ============================================

export interface BankAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'cash' | 'credit_line' | 'investment';
  bank: string;
  account_number: string;
  currency: 'UYU' | 'USD';
  current_balance: number;
  available_balance: number;
  credit_limit?: number;
  is_active: boolean;
  color: string;
  icon: string;
  last_reconciled: string | null;
  created_at: string;
}

export interface CashMovement {
  id: string;
  account_id: string;
  date: string;
  type: 'income' | 'expense' | 'transfer_in' | 'transfer_out';
  category: string;
  description: string;
  amount: number;
  balance_after: number;
  reference: string | null;
  project_id: string | null;
  project_name: string | null;
  supplier_id: string | null;
  client_id: string | null;
  reconciled: boolean;
  created_at: string;
}

export interface CashProjection {
  date: string;
  opening_balance: number;
  projected_income: number;
  projected_expense: number;
  committed_expense: number;       // OC aprobadas
  net_movement: number;
  closing_balance: number;
  cumulative_income: number;
  cumulative_expense: number;
  is_negative: boolean;
  risk_level: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  items: CashProjectionItem[];
}

export interface CashProjectionItem {
  id: string;
  date: string;
  type: 'income' | 'expense' | 'commitment';
  category: string;
  description: string;
  amount: number;
  probability: number;             // 0-100% de probabilidad de ocurrir
  source: 'invoice' | 'milestone' | 'purchase_order' | 'payroll' | 'recurring' | 'manual';
  project_id: string | null;
  project_name: string | null;
  is_overdue: boolean;
  days_overdue: number;
}

export interface AccountTransfer {
  id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  date: string;
  description: string;
  created_at: string;
}

export interface CashPositionSummary {
  total_balance: number;
  total_balance_usd: number;
  available_credit: number;
  
  // Por moneda
  uyu_balance: number;
  usd_balance: number;
  
  // Proyección
  balance_7_days: number;
  balance_14_days: number;
  balance_30_days: number;
  balance_60_days: number;
  
  // Punto de quiebre
  breakeven_date: string | null;   // Fecha donde el saldo se vuelve negativo
  days_until_breakeven: number | null;
  
  // Compromisos
  pending_payments_7_days: number;
  pending_payments_30_days: number;
  committed_not_invoiced: number;  // OC aprobadas sin factura
  
  // Cobros esperados
  expected_income_7_days: number;
  expected_income_30_days: number;
  overdue_receivables: number;
  
  // Alertas
  accounts_negative: number;
  high_risk_days: number;
}

// ============================================
// STORE
// ============================================

interface CashPositionState {
  // Data
  accounts: BankAccount[];
  movements: CashMovement[];
  projections: CashProjection[];
  transfers: AccountTransfer[];
  summary: CashPositionSummary | null;
  
  // Loading
  loading: boolean;
  
  // Actions
  fetchAccounts: () => Promise<void>;
  fetchMovements: (accountId?: string) => Promise<void>;
  fetchProjections: (days: number) => Promise<void>;
  addAccount: (account: Omit<BankAccount, 'id' | 'created_at'>) => void;
  updateAccountBalance: (accountId: string, balance: number) => void;
  addMovement: (movement: Omit<CashMovement, 'id' | 'created_at'>) => void;
  createTransfer: (transfer: Omit<AccountTransfer, 'id' | 'created_at'>) => void;
  reconcileMovement: (movementId: string) => void;
  
  // Computed
  getAccountById: (id: string) => BankAccount | undefined;
  getMovementsByAccount: (accountId: string) => CashMovement[];
  getTotalBalance: () => number;
  getProjectedBalance: (days: number) => number;
}

// Mock data
const mockAccounts: BankAccount[] = [
  {
    id: 'acc-1',
    name: 'Cuenta Corriente BROU',
    type: 'checking',
    bank: 'BROU',
    account_number: '****4521',
    currency: 'UYU',
    current_balance: 2450000,
    available_balance: 2450000,
    is_active: true,
    color: '#1e40af',
    icon: '🏦',
    last_reconciled: '2026-01-10',
    created_at: new Date().toISOString(),
  },
  {
    id: 'acc-2',
    name: 'Cuenta USD Itaú',
    type: 'checking',
    bank: 'Itaú',
    account_number: '****8832',
    currency: 'USD',
    current_balance: 45000,
    available_balance: 45000,
    is_active: true,
    color: '#ea580c',
    icon: '💵',
    last_reconciled: '2026-01-08',
    created_at: new Date().toISOString(),
  },
  {
    id: 'acc-3',
    name: 'Caja Chica Obra',
    type: 'cash',
    bank: 'Efectivo',
    account_number: 'N/A',
    currency: 'UYU',
    current_balance: 85000,
    available_balance: 85000,
    is_active: true,
    color: '#16a34a',
    icon: '💰',
    last_reconciled: '2026-01-12',
    created_at: new Date().toISOString(),
  },
  {
    id: 'acc-4',
    name: 'Línea de Crédito',
    type: 'credit_line',
    bank: 'Santander',
    account_number: '****1199',
    currency: 'UYU',
    current_balance: 0,
    available_balance: 1500000,
    credit_limit: 1500000,
    is_active: true,
    color: '#dc2626',
    icon: '🏧',
    last_reconciled: null,
    created_at: new Date().toISOString(),
  },
];

const mockMovements: CashMovement[] = [
  {
    id: 'mov-1',
    account_id: 'acc-1',
    date: '2026-01-13',
    type: 'income',
    category: 'Cobro Cliente',
    description: 'Anticipo Casa Carrasco - Familia Rodríguez',
    amount: 850000,
    balance_after: 2450000,
    reference: 'FAC-2026-0042',
    project_id: 'proj-1',
    project_name: 'Casa Carrasco Premium',
    supplier_id: null,
    client_id: 'cli-1',
    reconciled: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mov-2',
    account_id: 'acc-1',
    date: '2026-01-12',
    type: 'expense',
    category: 'Pago Proveedor',
    description: 'Hormigón - Cementos del Plata',
    amount: -380000,
    balance_after: 1600000,
    reference: 'OC-2026-0089',
    project_id: 'proj-1',
    project_name: 'Casa Carrasco Premium',
    supplier_id: 'sup-1',
    client_id: null,
    reconciled: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mov-3',
    account_id: 'acc-1',
    date: '2026-01-10',
    type: 'expense',
    category: 'Nómina',
    description: 'Sueldos Enero 2026',
    amount: -420000,
    balance_after: 1980000,
    reference: 'NOM-2026-01',
    project_id: null,
    project_name: null,
    supplier_id: null,
    client_id: null,
    reconciled: true,
    created_at: new Date().toISOString(),
  },
];

const mockProjections: CashProjection[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() + i);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  
  const baseBalance = 2535000 - (i * 45000);
  const projectedIncome = isWeekend ? 0 : (i % 7 === 3 ? 650000 : (i % 5 === 0 ? 180000 : 0));
  const projectedExpense = isWeekend ? 0 : (85000 + Math.random() * 60000);
  const committed = i < 14 ? (i % 3 === 0 ? 120000 : 45000) : 25000;
  
  const closingBalance = baseBalance + projectedIncome - projectedExpense - committed;
  
  return {
    date: date.toISOString().split('T')[0],
    opening_balance: baseBalance,
    projected_income: projectedIncome,
    projected_expense: projectedExpense,
    committed_expense: committed,
    net_movement: projectedIncome - projectedExpense - committed,
    closing_balance: closingBalance,
    cumulative_income: projectedIncome * (i + 1) * 0.3,
    cumulative_expense: (projectedExpense + committed) * (i + 1) * 0.4,
    is_negative: closingBalance < 0,
    risk_level: closingBalance > 1000000 ? 'safe' : 
                closingBalance > 500000 ? 'low' : 
                closingBalance > 200000 ? 'medium' : 
                closingBalance > 0 ? 'high' : 'critical',
    items: [],
  };
});

const mockSummary: CashPositionSummary = {
  total_balance: 4435000,  // UYU equivalent
  total_balance_usd: 45000,
  available_credit: 1500000,
  
  uyu_balance: 2535000,
  usd_balance: 45000,
  
  balance_7_days: 2180000,
  balance_14_days: 1650000,
  balance_30_days: 890000,
  balance_60_days: -320000,
  
  breakeven_date: '2026-03-05',
  days_until_breakeven: 51,
  
  pending_payments_7_days: 485000,
  pending_payments_30_days: 1890000,
  committed_not_invoiced: 540000,
  
  expected_income_7_days: 650000,
  expected_income_30_days: 2100000,
  overdue_receivables: 380000,
  
  accounts_negative: 0,
  high_risk_days: 8,
};

export const useCashPositionStore = create<CashPositionState>((set, get) => ({
  accounts: mockAccounts,
  movements: mockMovements,
  projections: mockProjections,
  transfers: [],
  summary: mockSummary,
  loading: false,
  
  fetchAccounts: async () => {
    set({ loading: true });
    await new Promise(r => setTimeout(r, 300));
    set({ loading: false });
  },
  
  fetchMovements: async (_accountId?: string) => {
    set({ loading: true });
    await new Promise(r => setTimeout(r, 300));
    set({ loading: false });
  },
  
  fetchProjections: async (_days: number) => {
    set({ loading: true });
    await new Promise(r => setTimeout(r, 300));
    set({ loading: false });
  },
  
  addAccount: (account) => {
    const newAccount: BankAccount = {
      ...account,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    set(state => ({ accounts: [...state.accounts, newAccount] }));
  },
  
  updateAccountBalance: (accountId, balance) => {
    set(state => ({
      accounts: state.accounts.map(acc =>
        acc.id === accountId ? { ...acc, current_balance: balance, available_balance: balance } : acc
      )
    }));
  },
  
  addMovement: (movement) => {
    const newMovement: CashMovement = {
      ...movement,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    set(state => ({ movements: [newMovement, ...state.movements] }));
  },
  
  createTransfer: (transfer) => {
    const newTransfer: AccountTransfer = {
      ...transfer,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    set(state => ({ transfers: [...state.transfers, newTransfer] }));
    
    // Update balances
    const { accounts } = get();
    const fromAccount = accounts.find(a => a.id === transfer.from_account_id);
    const toAccount = accounts.find(a => a.id === transfer.to_account_id);
    
    if (fromAccount && toAccount) {
      get().updateAccountBalance(transfer.from_account_id, fromAccount.current_balance - transfer.amount);
      get().updateAccountBalance(transfer.to_account_id, toAccount.current_balance + transfer.amount);
    }
  },
  
  reconcileMovement: (movementId) => {
    set(state => ({
      movements: state.movements.map(mov =>
        mov.id === movementId ? { ...mov, reconciled: true } : mov
      )
    }));
  },
  
  getAccountById: (id) => {
    return get().accounts.find(acc => acc.id === id);
  },
  
  getMovementsByAccount: (accountId) => {
    return get().movements.filter(mov => mov.account_id === accountId);
  },
  
  getTotalBalance: () => {
    const { accounts } = get();
    const USD_RATE = 42; // Tipo de cambio aproximado
    return accounts.reduce((total, acc) => {
      if (acc.type === 'credit_line') return total;
      const balance = acc.currency === 'USD' ? acc.current_balance * USD_RATE : acc.current_balance;
      return total + balance;
    }, 0);
  },
  
  getProjectedBalance: (days) => {
    const { projections } = get();
    const projection = projections[days - 1];
    return projection?.closing_balance || 0;
  },
}));
