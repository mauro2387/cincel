/**
 * CajaPage - Centro de Control de Caja y Bancos
 * Dashboard financiero real: Saldo + Proyección + Movimientos
 * Responde: "¿Cuánta plata tengo? ¿Me quedo sin caja en X días?"
 */

import { useState, useEffect } from 'react';
import { 
  useCashAccountsStore, 
  ACCOUNT_TYPES, 
  TRANSACTION_CATEGORIES,
  getAccountTypeConfig,
  getCategoryConfig 
} from '../store/cashAccountsStore';
import { useReceivablesPayablesStore } from '../store/receivablesPayablesStore';
import { useCommitmentsStore } from '../store/commitmentsStore';
import type { 
  CashAccount, 
  CashTransactionType,
  CashTransactionCategory 
} from '../../lib/database.types';

// Formatear moneda
const formatCurrency = (amount: number, currency: string = 'UYU') => {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function CajaPage() {
  const {
    accounts,
    transactions,
    projection,
    fetchAccounts,
    fetchTransactions,
    addAccount,
    addTransaction,
    reconcileTransaction,
    getPositionSummary,
    getDaysUntilNegative,
    getMonthlyMovements,
    loading,
  } = useCashAccountsStore();
  
  const { getTotalReceivables, getTotalPayables, getExpectedIncome, getExpectedExpense } = useReceivablesPayablesStore();
  const { summary: commitmentsSummary } = useCommitmentsStore();
  
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'accounts' | 'transactions' | 'projection'>('accounts');
  
  // Form states
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'bank' as CashAccount['type'],
    bank_name: '',
    account_number: '',
    initial_balance: 0,
    currency: 'UYU',
  });
  
  const [newTransaction, setNewTransaction] = useState({
    account_id: '',
    type: 'expense' as CashTransactionType,
    category: 'supplier_payment' as CashTransactionCategory,
    amount: 0,
    description: '',
    reference: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, [fetchAccounts, fetchTransactions]);

  const positionSummary = getPositionSummary();
  const daysUntilNegative = getDaysUntilNegative();
  
  // Métricas clave
  const totalAvailable = positionSummary.total_available;
  const totalReceivables = getTotalReceivables();
  const totalPayables = getTotalPayables();
  const totalCommitted = commitmentsSummary?.total_pending_invoice || 0;
  
  // Proyección neta
  const expectedIncome7 = getExpectedIncome(7);
  const expectedExpense7 = getExpectedExpense(7);
  const projection7Days = totalAvailable + expectedIncome7 - expectedExpense7 - (totalCommitted * 0.3);
  
  const expectedIncome30 = getExpectedIncome(30);
  const expectedExpense30 = getExpectedExpense(30);
  const projection30Days = totalAvailable + expectedIncome30 - expectedExpense30 - totalCommitted;

  const handleCreateAccount = () => {
    if (!newAccount.name) return;
    addAccount({
      code: `${newAccount.type.toUpperCase()}-${String(accounts.length + 1).padStart(3, '0')}`,
      name: newAccount.name,
      type: newAccount.type,
      bank_name: newAccount.bank_name || null,
      account_number: newAccount.account_number || null,
      currency: newAccount.currency,
      initial_balance: newAccount.initial_balance,
      current_balance: newAccount.initial_balance,
      available_balance: newAccount.initial_balance,
      credit_limit: 0,
      is_default: false,
      active: true,
      notes: null,
    });
    setShowNewAccountModal(false);
    setNewAccount({
      name: '',
      type: 'bank',
      bank_name: '',
      account_number: '',
      initial_balance: 0,
      currency: 'UYU',
    });
  };

  const handleCreateTransaction = () => {
    if (!newTransaction.account_id || !newTransaction.amount || !newTransaction.description) return;
    addTransaction({
      account_id: newTransaction.account_id,
      type: newTransaction.type,
      category: newTransaction.category,
      amount: newTransaction.amount,
      description: newTransaction.description,
      reference: newTransaction.reference || null,
      project_id: null,
      receivable_id: null,
      payable_id: null,
      transfer_account_id: null,
      bank_reference: null,
      reconciled: false,
      reconciled_at: null,
      reconciled_by: null,
      transaction_date: newTransaction.transaction_date,
      created_by: null,
    });
    setShowNewTransactionModal(false);
    setNewTransaction({
      account_id: '',
      type: 'expense',
      category: 'supplier_payment',
      amount: 0,
      description: '',
      reference: '',
      transaction_date: new Date().toISOString().split('T')[0],
    });
  };

  const filteredTransactions = selectedAccountId
    ? transactions.filter(t => t.account_id === selectedAccountId)
    : transactions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">💰 Centro de Caja</h1>
          <p className="text-gray-600">Control de efectivo, bancos y proyección de flujo</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewTransactionModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <span>💵</span>
            Registrar Movimiento
          </button>
          <button
            onClick={() => setShowNewAccountModal(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <span>🏦</span>
            Nueva Cuenta
          </button>
        </div>
      </div>

      {/* KPIs Principales - El "Martillo" */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Saldo Disponible */}
        <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-green-200">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <span className="text-xl">💵</span>
            <span className="text-sm font-medium">DISPONIBLE HOY</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalAvailable)}</div>
          <div className="text-xs text-gray-500 mt-1">
            Caja: {formatCurrency(positionSummary.total_cash)} | Banco: {formatCurrency(positionSummary.total_bank)}
          </div>
        </div>
        
        {/* Por Cobrar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <span className="text-xl">📥</span>
            <span className="text-sm font-medium">POR COBRAR</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalReceivables)}</div>
          <div className="text-xs text-gray-500 mt-1">
            7 días: {formatCurrency(expectedIncome7)}
          </div>
        </div>
        
        {/* Por Pagar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <span className="text-xl">📤</span>
            <span className="text-sm font-medium">POR PAGAR</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalPayables)}</div>
          <div className="text-xs text-gray-500 mt-1">
            7 días: {formatCurrency(expectedExpense7)}
          </div>
        </div>
        
        {/* Comprometido */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-2 text-orange-600 mb-1">
            <span className="text-xl">📋</span>
            <span className="text-sm font-medium">COMPROMETIDO</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalCommitted)}</div>
          <div className="text-xs text-gray-500 mt-1">
            OC aprobadas sin facturar
          </div>
        </div>
        
        {/* Proyección */}
        <div className={`p-4 rounded-xl shadow-sm border-2 ${
          projection7Days < 0 ? 'bg-red-50 border-red-300' : 
          projection7Days < totalAvailable * 0.2 ? 'bg-yellow-50 border-yellow-300' : 
          'bg-green-50 border-green-300'
        }`}>
          <div className={`flex items-center gap-2 mb-1 ${
            projection7Days < 0 ? 'text-red-600' : 
            projection7Days < totalAvailable * 0.2 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            <span className="text-xl">{projection7Days < 0 ? '⚠️' : '📊'}</span>
            <span className="text-sm font-medium">PROYECCIÓN 7D</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(projection7Days)}</div>
          {daysUntilNegative !== null && daysUntilNegative < 30 && (
            <div className="text-xs text-red-600 font-medium mt-1">
              ⚠️ Caja negativa en {daysUntilNegative} días
            </div>
          )}
        </div>
      </div>

      {/* Alerta de Caja Crítica */}
      {daysUntilNegative !== null && daysUntilNegative < 14 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-4">
          <span className="text-3xl">🚨</span>
          <div>
            <h3 className="font-bold text-red-800">ALERTA: Caja crítica en {daysUntilNegative} días</h3>
            <p className="text-red-600 text-sm">
              Con los cobros y pagos esperados, la caja quedará negativa. 
              Revisa cobros pendientes y posterga pagos no urgentes.
            </p>
          </div>
          <button className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
            Ver Acciones
          </button>
        </div>
      )}

      {/* Tabs de Vista */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {[
            { id: 'accounts', label: 'Cuentas', icon: '🏦' },
            { id: 'transactions', label: 'Movimientos', icon: '📋' },
            { id: 'projection', label: 'Proyección', icon: '📈' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as typeof viewMode)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                viewMode === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido según Tab */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : viewMode === 'accounts' ? (
        /* Vista de Cuentas */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.filter(a => a.active).map(account => {
            const typeConfig = getAccountTypeConfig(account.type);
            const accountMovements = getMonthlyMovements(account.id);
            return (
              <div
                key={account.id}
                className={`bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer ${
                  selectedAccountId === account.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => {
                  setSelectedAccountId(account.id === selectedAccountId ? null : account.id);
                  setViewMode('transactions');
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`p-2 rounded-lg ${typeConfig.color} text-white text-xl`}>
                      {typeConfig.icon}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{account.name}</h3>
                      <p className="text-xs text-gray-500">{account.code}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{account.currency}</span>
                </div>
                
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {formatCurrency(account.current_balance, account.currency)}
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                  <span className="text-green-600">↑ {formatCurrency(accountMovements.income, account.currency)}</span>
                  <span className="text-red-600">↓ {formatCurrency(accountMovements.expense, account.currency)}</span>
                </div>
                
                {account.bank_name && (
                  <div className="mt-2 text-xs text-gray-400">
                    {account.bank_name} • {account.account_number}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : viewMode === 'transactions' ? (
        /* Vista de Movimientos */
        <div className="space-y-4">
          {/* Filtro por cuenta */}
          <div className="flex items-center gap-4 bg-white p-3 rounded-lg border">
            <span className="text-sm text-gray-500">Filtrar por cuenta:</span>
            <select
              value={selectedAccountId || ''}
              onChange={(e) => setSelectedAccountId(e.target.value || null)}
              className="px-3 py-1.5 border rounded-lg text-sm"
            >
              <option value="">Todas las cuentas</option>
              {accounts.filter(a => a.active).map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <span className="text-sm text-gray-400">
              {filteredTransactions.length} movimientos
            </span>
          </div>
          
          {/* Lista de transacciones */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">FECHA</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">DESCRIPCIÓN</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">CUENTA</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">CATEGORÍA</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">MONTO</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">CONC.</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTransactions.slice(0, 20).map(txn => {
                  const account = accounts.find(a => a.id === txn.account_id);
                  const categoryConfig = getCategoryConfig(txn.category);
                  const isIncome = txn.type === 'income' || txn.type === 'transfer_in';
                  return (
                    <tr key={txn.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(txn.transaction_date).toLocaleDateString('es-UY')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{txn.description}</div>
                        {txn.reference && (
                          <div className="text-xs text-gray-400">{txn.reference}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {account?.name || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                          {categoryConfig.icon} {categoryConfig.label}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-sm font-medium text-right ${
                        isIncome ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isIncome ? '+' : '-'} {formatCurrency(txn.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {txn.reconciled ? (
                          <span className="text-green-500" title="Conciliado">✓</span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              reconcileTransaction(txn.id);
                            }}
                            className="text-gray-300 hover:text-green-500"
                            title="Marcar como conciliado"
                          >
                            ○
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Vista de Proyección */
        <div className="space-y-4">
          {/* Resumen de proyección */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border">
              <div className="text-sm text-gray-500 mb-1">Proyección 7 días</div>
              <div className={`text-xl font-bold ${projection7Days < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatCurrency(projection7Days)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border">
              <div className="text-sm text-gray-500 mb-1">Proyección 14 días</div>
              <div className={`text-xl font-bold ${
                (totalAvailable + getExpectedIncome(14) - getExpectedExpense(14) - totalCommitted * 0.6) < 0 
                  ? 'text-red-600' : 'text-gray-900'
              }`}>
                {formatCurrency(totalAvailable + getExpectedIncome(14) - getExpectedExpense(14) - totalCommitted * 0.6)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border">
              <div className="text-sm text-gray-500 mb-1">Proyección 30 días</div>
              <div className={`text-xl font-bold ${projection30Days < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatCurrency(projection30Days)}
              </div>
            </div>
          </div>
          
          {/* Gráfico de proyección (simplificado como tabla) */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Flujo de Caja Proyectado - Próximos 30 días</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">FECHA</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">INGRESOS ESP.</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">EGRESOS ESP.</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">COMPROMETIDO</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">SALDO PROY.</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {projection.filter((_, i) => i % 3 === 0 || i < 7).slice(0, 15).map((day, i) => (
                    <tr key={i} className={day.cumulative_balance < 0 ? 'bg-red-50' : ''}>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {new Date(day.date).toLocaleDateString('es-UY', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-4 py-2 text-sm text-right text-green-600">
                        {day.expected_income > 0 ? formatCurrency(day.expected_income) : '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-right text-red-600">
                        {day.expected_expense > 0 ? formatCurrency(day.expected_expense) : '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-right text-orange-600">
                        {day.committed_expense > 0 ? formatCurrency(day.committed_expense) : '-'}
                      </td>
                      <td className={`px-4 py-2 text-sm font-medium text-right ${
                        day.cumulative_balance < 0 ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {formatCurrency(day.cumulative_balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Cuenta */}
      {showNewAccountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Nueva Cuenta</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: BROU Cuenta Corriente"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                  <select
                    value={newAccount.type}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, type: e.target.value as CashAccount['type'] }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {ACCOUNT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                  <select
                    value={newAccount.currency}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UYU">UYU - Pesos</option>
                    <option value="USD">USD - Dólares</option>
                  </select>
                </div>
              </div>
              
              {newAccount.type === 'bank' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                    <input
                      type="text"
                      value={newAccount.bank_name}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, bank_name: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: BROU"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nº Cuenta</label>
                    <input
                      type="text"
                      value={newAccount.account_number}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, account_number: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="001-123456-001"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Inicial</label>
                <input
                  type="number"
                  value={newAccount.initial_balance}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, initial_balance: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewAccountModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAccount}
                disabled={!newAccount.name}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Crear Cuenta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Movimiento */}
      {showNewTransactionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Registrar Movimiento</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta *</label>
                <select
                  value={newTransaction.account_id}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, account_id: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccionar cuenta</option>
                  {accounts.filter(a => a.active).map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatCurrency(a.current_balance, a.currency)})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction(prev => ({ 
                      ...prev, 
                      type: e.target.value as CashTransactionType,
                      category: e.target.value === 'income' ? 'client_payment' : 'supplier_payment'
                    }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="income">💵 Ingreso</option>
                    <option value="expense">💸 Egreso</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, category: e.target.value as CashTransactionCategory }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    {TRANSACTION_CATEGORIES
                      .filter(c => 
                        newTransaction.type === 'income' 
                          ? ['client_payment', 'advance_received', 'retention_release', 'interest', 'other'].includes(c.value)
                          : !['client_payment', 'advance_received', 'retention_release'].includes(c.value)
                      )
                      .map(c => (
                        <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                      ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                  <input
                    type="number"
                    value={newTransaction.amount || ''}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                  <input
                    type="date"
                    value={newTransaction.transaction_date}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, transaction_date: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: Pago a proveedor de cemento"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
                <input
                  type="text"
                  value={newTransaction.reference}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, reference: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: FAC-001 o TRF-12345"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewTransactionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateTransaction}
                disabled={!newTransaction.account_id || !newTransaction.amount || !newTransaction.description}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
