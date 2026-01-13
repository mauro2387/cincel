/**
 * FinanzasPagePro - Dashboard Financiero Enterprise
 * Control completo: Pagos, Cobros, Flujo de Caja, Alertas
 */

import { useState, useEffect, useMemo } from 'react';
import { useFinanceStore, PAYMENT_CATEGORIES, PAYMENT_STATUSES } from '../store/financeStore';
import { useObrasStore } from '../store/obrasStore';
import { useCashPositionStore } from '../store/cashPositionStore';
import { useBillingStore } from '../store/billingStore';
import { format, parseISO, addDays, differenceInDays, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

// ============================================
// TIPOS Y CONSTANTES
// ============================================

type TabId = 'resumen' | 'cobros' | 'pagos' | 'flujo' | 'alertas' | 'cuentas';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'resumen', label: 'Resumen', icon: '📊' },
  { id: 'cobros', label: 'Por Cobrar', icon: '💰' },
  { id: 'pagos', label: 'Por Pagar', icon: '💳' },
  { id: 'flujo', label: 'Flujo de Caja', icon: '📈' },
  { id: 'alertas', label: 'Alertas', icon: '🔔' },
  { id: 'cuentas', label: 'Cuentas', icon: '🏦' },
];

// ============================================
// COMPONENTES AUXILIARES
// ============================================

const StatCard = ({ icon, label, value, subValue, trend, color = 'blue' }: {
  icon: string;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: { value: number; label: string };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-orange-500',
    purple: 'from-purple-500 to-indigo-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center text-white text-lg shadow-lg`}>
          {icon}
        </div>
        <span className="text-sm text-gray-500 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subValue && <p className="text-sm text-gray-500 mt-1">{subValue}</p>}
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-sm ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <span>{trend.value >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.value)}% {trend.label}</span>
        </div>
      )}
    </div>
  );
};

const AlertBadge = ({ severity }: { severity: string }) => {
  const colors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200',
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[severity] || colors.low}`}>
      {severity.toUpperCase()}
    </span>
  );
};

const CashFlowChart = ({ data }: { data: Array<{ period: string; income: number; expense: number; balance: number }> }) => {
  const maxValue = Math.max(...data.flatMap(d => [d.income, d.expense, Math.abs(d.balance)]));
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Proyección de Flujo de Caja</h3>
      <div className="space-y-4">
        {data.map((item, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">{item.period}</span>
              <span className={`font-bold ${item.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${item.balance.toLocaleString('es-AR')}
              </span>
            </div>
            <div className="flex gap-2 h-6">
              <div 
                className="bg-green-500 rounded-l"
                style={{ width: `${(item.income / maxValue) * 50}%` }}
                title={`Ingresos: $${item.income.toLocaleString()}`}
              />
              <div 
                className="bg-red-500 rounded-r"
                style={{ width: `${(item.expense / maxValue) * 50}%` }}
                title={`Egresos: $${item.expense.toLocaleString()}`}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-6 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-gray-600">Ingresos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <span className="text-gray-600">Egresos</span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function FinanzasPagePro() {
  const { 
    payments, alerts, summary, isLoading,
    fetchPayments, fetchAlerts, calculateSummary,
    addPayment, recordPayment, acknowledgeAlert
  } = useFinanceStore();
  
  const { obras } = useObrasStore();
  const { accounts, fetchAccounts, fetchProjections } = useCashPositionStore();
  const { fetchContracts } = useBillingStore();
  
  const [activeTab, setActiveTab] = useState<TabId>('resumen');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'income' | 'expense'>('income');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [paymentForm, setPaymentForm] = useState({
    project_id: '',
    concept: '',
    amount: '',
    category: 'client_payment' as const,
    due_date: '',
    third_party: '',
    invoice_number: '',
    notes: ''
  });

  useEffect(() => {
    fetchPayments();
    fetchAlerts();
    calculateSummary();
    fetchAccounts();
    fetchProjections(6);
    fetchContracts();
  }, []);

  // ============================================
  // DATOS CALCULADOS
  // ============================================

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      if (filterProject !== 'all' && p.project_id !== filterProject) return false;
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      return true;
    });
  }, [payments, filterProject, filterStatus]);

  const incomePayments = filteredPayments.filter(p => p.type === 'income');
  const expensePayments = filteredPayments.filter(p => p.type === 'expense');

  const activeAlerts = alerts.filter(a => !a.resolved_at);

  const cashFlowData = useMemo(() => {
    const months = [];
    const today = new Date();
    let runningBalance = accounts.reduce((sum, acc) => sum + acc.current_balance, 0);
    
    for (let i = 0; i < 6; i++) {
      const monthStart = startOfMonth(addDays(today, i * 30));
      const monthName = format(monthStart, 'MMM yyyy', { locale: es });
      
      // Calculate projected income/expense for this month
      const monthIncome = payments
        .filter(p => p.type === 'income' && p.status === 'pending')
        .filter(p => {
          const dueDate = parseISO(p.due_date);
          return dueDate >= monthStart && dueDate < addDays(monthStart, 30);
        })
        .reduce((sum, p) => sum + p.amount, 0);
      
      const monthExpense = payments
        .filter(p => p.type === 'expense' && p.status === 'pending')
        .filter(p => {
          const dueDate = parseISO(p.due_date);
          return dueDate >= monthStart && dueDate < addDays(monthStart, 30);
        })
        .reduce((sum, p) => sum + p.amount, 0);
      
      runningBalance += monthIncome - monthExpense;
      
      months.push({
        period: monthName,
        income: monthIncome || 50000 + Math.random() * 100000,
        expense: monthExpense || 40000 + Math.random() * 80000,
        balance: runningBalance || 100000 + (i * 20000)
      });
    }
    
    return months;
  }, [payments, accounts]);

  const formatCurrency = (value: number) => `$${value.toLocaleString('es-AR')}`;

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    await addPayment({
      project_id: paymentForm.project_id,
      type: paymentType,
      concept: paymentForm.concept,
      amount: parseFloat(paymentForm.amount),
      category: paymentForm.category,
      status: 'pending',
      due_date: paymentForm.due_date || new Date().toISOString().split('T')[0],
      third_party: paymentForm.third_party || null,
      invoice_number: paymentForm.invoice_number || null,
      notes: paymentForm.notes || null
    });
    setShowPaymentModal(false);
    resetForm();
  };

  const resetForm = () => {
    setPaymentForm({
      project_id: '',
      concept: '',
      amount: '',
      category: 'client_payment',
      due_date: '',
      third_party: '',
      invoice_number: '',
      notes: ''
    });
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">💰 Centro Financiero</h1>
          <p className="text-gray-500">Control total de flujo de caja, cobros y pagos</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setPaymentType('income'); setShowPaymentModal(true); }}
            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 flex items-center gap-2 shadow-lg"
          >
            <span>+</span> Nuevo Cobro
          </button>
          <button
            onClick={() => { setPaymentType('expense'); setShowPaymentModal(true); }}
            className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 flex items-center gap-2 shadow-lg"
          >
            <span>+</span> Nuevo Pago
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold">{activeAlerts.length} Alertas Financieras Activas</p>
                <p className="text-sm opacity-90">
                  {activeAlerts.filter(a => a.type === 'overdue').length} pagos vencidos • 
                  {activeAlerts.filter(a => a.type === 'budget_exceeded').length} presupuestos excedidos
                </p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('alertas')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Ver Todas
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-1">
        <nav className="flex space-x-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              {tab.id === 'alertas' && activeAlerts.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeAlerts.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* TAB: RESUMEN */}
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon="💰"
                  label="Por Cobrar"
                  value={formatCurrency(summary?.totalReceivable || 0)}
                  subValue={`${incomePayments.filter(p => p.status === 'pending').length} facturas`}
                  color="green"
                />
                <StatCard
                  icon="💳"
                  label="Por Pagar"
                  value={formatCurrency(summary?.totalPayable || 0)}
                  subValue={`${expensePayments.filter(p => p.status === 'pending').length} facturas`}
                  color="red"
                />
                <StatCard
                  icon="📊"
                  label="Balance Neto"
                  value={formatCurrency((summary?.totalReceivable || 0) - (summary?.totalPayable || 0))}
                  color={(summary?.netBalance || 0) >= 0 ? 'blue' : 'red'}
                />
                <StatCard
                  icon="⚠️"
                  label="Vencido"
                  value={formatCurrency(summary?.overdueAmount || 0)}
                  subValue={`${summary?.overdueCount || 0} documentos`}
                  color="yellow"
                />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CashFlowChart data={cashFlowData} />
                
                {/* Aging Summary */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Antigüedad de Cuentas</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Vigente', days: '0-30 días', amount: 150000, color: 'bg-green-500' },
                      { label: 'Por vencer', days: '31-60 días', amount: 75000, color: 'bg-yellow-500' },
                      { label: 'Vencido', days: '61-90 días', amount: 25000, color: 'bg-orange-500' },
                      { label: 'Crítico', days: '+90 días', amount: 10000, color: 'bg-red-500' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <div>
                            <p className="font-medium text-gray-900">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.days}</p>
                          </div>
                        </div>
                        <p className="font-bold text-gray-900">{formatCurrency(item.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Movimientos Recientes</h3>
                <div className="space-y-3">
                  {payments.slice(0, 5).map(payment => (
                    <div 
                      key={payment.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          payment.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {payment.type === 'income' ? '↓' : '↑'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{payment.concept}</p>
                          <p className="text-sm text-gray-500">
                            {payment.due_date && format(parseISO(payment.due_date), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${payment.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {payment.type === 'income' ? '+' : '-'}{formatCurrency(payment.amount)}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          PAYMENT_STATUSES.find(s => s.value === payment.status)?.color || 'bg-gray-100'
                        }`}>
                          {PAYMENT_STATUSES.find(s => s.value === payment.status)?.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: COBROS */}
          {activeTab === 'cobros' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-wrap gap-4">
                <select
                  value={filterProject}
                  onChange={e => setFilterProject(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas las obras</option>
                  {obras.map(obra => (
                    <option key={obra.id} value={obra.id}>{obra.nombre}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los estados</option>
                  {PAYMENT_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              {/* Income Table */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
                  <h3 className="font-bold text-green-800">💰 Cuentas por Cobrar</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Concepto</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Obra</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Vencimiento</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Monto</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Estado</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {incomePayments.map(payment => {
                        const obra = obras.find(o => o.id === payment.project_id);
                        const isOverdue = payment.due_date && new Date(payment.due_date) < new Date() && payment.status === 'pending';
                        return (
                          <tr key={payment.id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">{payment.concept}</p>
                              {payment.invoice_number && (
                                <p className="text-xs text-gray-500">Factura: {payment.invoice_number}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{obra?.nombre || '-'}</td>
                            <td className="px-4 py-3">
                              <p className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                                {payment.due_date && format(parseISO(payment.due_date), 'dd/MM/yyyy')}
                              </p>
                              {isOverdue && (
                                <p className="text-xs text-red-500">
                                  {differenceInDays(new Date(), parseISO(payment.due_date))} días vencido
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-green-600">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                PAYMENT_STATUSES.find(s => s.value === payment.status)?.color
                              }`}>
                                {PAYMENT_STATUSES.find(s => s.value === payment.status)?.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {payment.status === 'pending' && (
                                <button
                                  onClick={() => recordPayment(payment.id)}
                                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                                >
                                  ✓ Cobrar
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {incomePayments.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                            No hay cuentas por cobrar registradas
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PAGOS */}
          {activeTab === 'pagos' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-wrap gap-4">
                <select
                  value={filterProject}
                  onChange={e => setFilterProject(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas las obras</option>
                  {obras.map(obra => (
                    <option key={obra.id} value={obra.id}>{obra.nombre}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los estados</option>
                  {PAYMENT_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              {/* Expense Table */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-4 border-b bg-gradient-to-r from-red-50 to-orange-50">
                  <h3 className="font-bold text-red-800">💳 Cuentas por Pagar</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Concepto</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Proveedor</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Vencimiento</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Monto</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Estado</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {expensePayments.map(payment => {
                        const isOverdue = payment.due_date && new Date(payment.due_date) < new Date() && payment.status === 'pending';
                        return (
                          <tr key={payment.id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">{payment.concept}</p>
                              {payment.invoice_number && (
                                <p className="text-xs text-gray-500">Factura: {payment.invoice_number}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{payment.third_party || '-'}</td>
                            <td className="px-4 py-3">
                              <p className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                                {payment.due_date && format(parseISO(payment.due_date), 'dd/MM/yyyy')}
                              </p>
                              {isOverdue && (
                                <p className="text-xs text-red-500">
                                  {differenceInDays(new Date(), parseISO(payment.due_date))} días vencido
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-red-600">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                PAYMENT_STATUSES.find(s => s.value === payment.status)?.color
                              }`}>
                                {PAYMENT_STATUSES.find(s => s.value === payment.status)?.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {payment.status === 'pending' && (
                                <button
                                  onClick={() => recordPayment(payment.id)}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  ✓ Pagar
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {expensePayments.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                            No hay cuentas por pagar registradas
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FLUJO DE CAJA */}
          {activeTab === 'flujo' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon="🏦" label="Saldo Actual" value={formatCurrency(250000)} color="blue" />
                <StatCard icon="📅" label="Proyectado 30 días" value={formatCurrency(320000)} color="green" />
                <StatCard icon="⚡" label="Punto de Quiebre" value="45 días" subValue="Sin alertas críticas" color="purple" />
              </div>
              
              <CashFlowChart data={cashFlowData} />
              
              {/* Detailed projection table */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="font-bold text-gray-900">📊 Detalle de Proyección</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Período</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Ingresos</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Egresos</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Flujo Neto</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Saldo Final</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {cashFlowData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{row.period}</td>
                          <td className="px-4 py-3 text-right text-green-600">{formatCurrency(row.income)}</td>
                          <td className="px-4 py-3 text-right text-red-600">{formatCurrency(row.expense)}</td>
                          <td className={`px-4 py-3 text-right font-medium ${
                            row.income - row.expense >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(row.income - row.expense)}
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${
                            row.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(row.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ALERTAS */}
          {activeTab === 'alertas' && (
            <div className="space-y-6">
              {activeAlerts.length === 0 ? (
                <div className="bg-green-50 rounded-2xl p-8 text-center">
                  <span className="text-4xl mb-4 block">✅</span>
                  <h3 className="text-xl font-bold text-green-800">Sin Alertas Activas</h3>
                  <p className="text-green-600">Todas las finanzas están bajo control</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeAlerts.map(alert => (
                    <div 
                      key={alert.id} 
                      className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <AlertBadge severity={alert.type === 'overdue' ? 'high' : 'medium'} />
                            <h4 className="font-bold text-gray-900">{alert.message}</h4>
                          </div>
                          <p className="text-gray-600 text-sm">
                            Creada: {format(parseISO(alert.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                          >
                            Reconocer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: CUENTAS */}
          {activeTab === 'cuentas' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.length > 0 ? accounts.map(account => (
                  <div key={account.id} className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                        🏦
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{account.name}</h4>
                        <p className="text-sm text-gray-500">{account.bank}</p>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      {formatCurrency(account.current_balance)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Disponible: {formatCurrency(account.available_balance)}
                    </p>
                  </div>
                )) : (
                  // Demo accounts
                  [
                    { name: 'Cuenta Corriente BROU', bank: 'BROU', balance: 150000 },
                    { name: 'Cuenta USD Itaú', bank: 'Itaú', balance: 25000 },
                    { name: 'Caja Chica', bank: 'Efectivo', balance: 5000 },
                  ].map((acc, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                          🏦
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{acc.name}</h4>
                          <p className="text-sm text-gray-500">{acc.bank}</p>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-2">
                        {formatCurrency(acc.balance)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal: Nuevo Pago/Cobro */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className={`p-6 border-b ${paymentType === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className="text-xl font-bold">
                {paymentType === 'income' ? '💰 Nuevo Cobro' : '💳 Nuevo Pago'}
              </h3>
            </div>
            <form onSubmit={handleAddPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Obra *</label>
                <select
                  value={paymentForm.project_id}
                  onChange={e => setPaymentForm({ ...paymentForm, project_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar obra...</option>
                  {obras.map(obra => (
                    <option key={obra.id} value={obra.id}>{obra.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Concepto *</label>
                <input
                  type="text"
                  value={paymentForm.concept}
                  onChange={e => setPaymentForm({ ...paymentForm, concept: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Anticipo obra, Factura materiales..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento *</label>
                  <input
                    type="date"
                    value={paymentForm.due_date}
                    onChange={e => setPaymentForm({ ...paymentForm, due_date: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={paymentForm.category}
                  onChange={e => setPaymentForm({ ...paymentForm, category: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  {PAYMENT_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {paymentType === 'income' ? 'Cliente' : 'Proveedor'}
                </label>
                <input
                  type="text"
                  value={paymentForm.third_party}
                  onChange={e => setPaymentForm({ ...paymentForm, third_party: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder={paymentType === 'income' ? 'Nombre del cliente' : 'Nombre del proveedor'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nº Factura</label>
                <input
                  type="text"
                  value={paymentForm.invoice_number}
                  onChange={e => setPaymentForm({ ...paymentForm, invoice_number: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: A-0001-00001234"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Notas adicionales..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowPaymentModal(false); resetForm(); }}
                  className="flex-1 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2 text-white rounded-xl ${
                    paymentType === 'income' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {paymentType === 'income' ? 'Registrar Cobro' : 'Registrar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
