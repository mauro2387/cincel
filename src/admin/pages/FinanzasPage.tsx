/**
 * FinanzasPage - Dashboard financiero completo
 */

import { useState, useEffect } from 'react';
import { useFinanceStore, PAYMENT_CATEGORIES, PAYMENT_STATUSES } from '../store/financeStore';
import { useObrasStore } from '../store/obrasStore';

type Tab = 'resumen' | 'pagos' | 'alertas' | 'flujo';

export default function FinanzasPage() {
  const { 
    payments, alerts, summary, cashFlow, isLoading,
    fetchPayments, fetchAlerts, calculateSummary, calculateCashFlow,
    addPayment, recordPayment, acknowledgeAlert, resolveAlert
  } = useFinanceStore();
  const { obras } = useObrasStore();
  
  const [activeTab, setActiveTab] = useState<Tab>('resumen');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filterObra, setFilterObra] = useState<string>('all');
  
  const [paymentForm, setPaymentForm] = useState({
    project_id: '',
    concept: '',
    amount: '',
    category: 'other' as const,
    due_date: '',
    type: 'expense' as 'income' | 'expense'
  });

  useEffect(() => {
    fetchPayments();
    fetchAlerts();
    calculateSummary();
    calculateCashFlow(6);
  }, [fetchPayments, fetchAlerts, calculateSummary, calculateCashFlow]);

  const filteredPayments = payments.filter(p => filterObra === 'all' || p.project_id === filterObra);
  const activeAlerts = alerts.filter(a => a.resolved_at === null);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    await addPayment({
      project_id: paymentForm.project_id,
      type: paymentForm.type,
      concept: paymentForm.concept,
      amount: parseFloat(paymentForm.amount),
      category: paymentForm.category,
      status: 'pending',
      due_date: paymentForm.due_date || new Date().toISOString().split('T')[0],
      third_party: null,
      invoice_number: null,
      notes: null
    });
    setShowPaymentModal(false);
    setPaymentForm({ project_id: '', concept: '', amount: '', category: 'other', due_date: '', type: 'expense' });
  };

  const formatCurrency = (value: number) => `$${value.toLocaleString('es-AR')}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finanzas</h1>
          <p className="text-gray-500">Control financiero y flujo de caja</p>
        </div>
        <button
          onClick={() => setShowPaymentModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span> Nuevo Pago
        </button>
      </div>

      {/* Alert Banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <span className="text-xl">⚠️</span>
            <span className="font-medium">{activeAlerts.length} alertas activas</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'resumen' as Tab, label: 'Resumen', icon: '📊' },
            { id: 'pagos' as Tab, label: 'Pagos', icon: '💳' },
            { id: 'alertas' as Tab, label: `Alertas (${activeAlerts.length})`, icon: '🔔' },
            { id: 'flujo' as Tab, label: 'Flujo de Caja', icon: '📈' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* RESUMEN TAB */}
          {activeTab === 'resumen' && summary && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-600 font-medium">Por Cobrar</p>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(summary.totalReceivable)}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-red-600 font-medium">Por Pagar</p>
                  <p className="text-2xl font-bold text-red-700">{formatCurrency(summary.totalPayable)}</p>
                </div>
                <div className={`rounded-lg p-4 border ${summary.netBalance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                  <p className={`text-sm font-medium ${summary.netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Balance Neto</p>
                  <p className={`text-2xl font-bold ${summary.netBalance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                    {formatCurrency(summary.netBalance)}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <p className="text-sm text-yellow-600 font-medium">Vencido</p>
                  <p className="text-2xl font-bold text-yellow-700">{formatCurrency(summary.overdueAmount)}</p>
                  <p className="text-xs text-yellow-600">{summary.overdueCount} pagos</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold mb-4">Ingresos por Categoría</h3>
                  <div className="space-y-2">
                    {summary.incomeByCategory.map(cat => (
                      <div key={cat.category} className="flex justify-between">
                        <span className="text-gray-600">{cat.category}</span>
                        <span className="font-medium text-green-600">{formatCurrency(cat.amount)}</span>
                      </div>
                    ))}
                    {summary.incomeByCategory.length === 0 && (
                      <p className="text-gray-400">Sin datos</p>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold mb-4">Gastos por Categoría</h3>
                  <div className="space-y-2">
                    {summary.expensesByCategory.map(cat => (
                      <div key={cat.category} className="flex justify-between">
                        <span className="text-gray-600">{cat.category}</span>
                        <span className="font-medium text-red-600">{formatCurrency(cat.amount)}</span>
                      </div>
                    ))}
                    {summary.expensesByCategory.length === 0 && (
                      <p className="text-gray-400">Sin datos</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resumen' && !summary && (
            <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
          )}

          {/* PAGOS TAB */}
          {activeTab === 'pagos' && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <select
                  value={filterObra}
                  onChange={e => setFilterObra(e.target.value)}
                  className="border rounded-lg px-3 py-2"
                >
                  <option value="all">Todas las obras</option>
                  {obras.map(obra => (
                    <option key={obra.id} value={obra.id}>{obra.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Concepto</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Obra</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Categoría</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Monto</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Vencimiento</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredPayments.map(payment => {
                      const obra = obras.find(o => o.id === payment.project_id);
                      const category = PAYMENT_CATEGORIES.find(c => c.value === payment.category);
                      const status = PAYMENT_STATUSES.find(s => s.value === payment.status);
                      return (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className={payment.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                              {payment.type === 'income' ? '↑' : '↓'}
                            </span>{' '}
                            {payment.concept}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{obra?.nombre || '-'}</td>
                          <td className="px-4 py-3">{category?.label || payment.category}</td>
                          <td className={`px-4 py-3 text-right font-medium ${
                            payment.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {payment.type === 'income' ? '+' : '-'}{formatCurrency(payment.amount)}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {payment.due_date ? new Date(payment.due_date).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status?.color || 'bg-gray-100 text-gray-800'}`}>
                              {status?.label || payment.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {payment.status === 'pending' && (
                              <button
                                onClick={() => recordPayment(payment.id)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Marcar Pagado
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredPayments.length === 0 && (
                  <p className="text-center py-8 text-gray-500">No hay pagos registrados</p>
                )}
              </div>
            </div>
          )}

          {/* ALERTAS TAB */}
          {activeTab === 'alertas' && (
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No hay alertas</p>
              ) : (
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div 
                      key={alert.id} 
                      className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                        alert.resolved_at ? 'border-gray-300 opacity-50' : 'border-yellow-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">⚠️</span>
                            <span className="font-medium">{alert.type}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              alert.resolved_at ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-800'
                            }`}>
                              {alert.resolved_at ? 'Resuelta' : 'Activa'}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">{alert.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(alert.created_at).toLocaleString()}
                          </p>
                        </div>
                        {!alert.resolved_at && (
                          <div className="flex gap-2">
                            {!alert.acknowledged && (
                              <button
                                onClick={() => acknowledgeAlert(alert.id)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                Reconocer
                              </button>
                            )}
                            <button
                              onClick={() => resolveAlert(alert.id)}
                              className="text-sm text-green-600 hover:text-green-800"
                            >
                              Resolver
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FLUJO DE CAJA TAB */}
          {activeTab === 'flujo' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Período</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Saldo Inicial</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Ingresos</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Egresos</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Flujo Neto</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Saldo Final</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cashFlow.map((period) => (
                      <tr key={period.period} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{period.period}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(period.startingBalance)}</td>
                        <td className="px-4 py-3 text-right text-green-600">+{formatCurrency(period.projectedIncome)}</td>
                        <td className="px-4 py-3 text-right text-red-600">-{formatCurrency(period.projectedExpenses)}</td>
                        <td className={`px-4 py-3 text-right font-medium ${
                          period.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {period.netFlow >= 0 ? '+' : ''}{formatCurrency(period.netFlow)}
                        </td>
                        <td className={`px-4 py-3 text-right font-bold ${
                          period.endingBalance >= 0 ? 'text-blue-600' : 'text-orange-600'
                        }`}>
                          {formatCurrency(period.endingBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {cashFlow.length === 0 && (
                  <p className="text-center py-8 text-gray-500">No hay datos de flujo de caja</p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">Nuevo Pago</h2>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="expense"
                    checked={paymentForm.type === 'expense'}
                    onChange={() => setPaymentForm({ ...paymentForm, type: 'expense' })}
                  />
                  <span className="text-red-600">Gasto</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="income"
                    checked={paymentForm.type === 'income'}
                    onChange={() => setPaymentForm({ ...paymentForm, type: 'income' })}
                  />
                  <span className="text-green-600">Ingreso</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Concepto *</label>
                <input
                  type="text"
                  value={paymentForm.concept}
                  onChange={e => setPaymentForm({ ...paymentForm, concept: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
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
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={paymentForm.category}
                    onChange={e => setPaymentForm({ ...paymentForm, category: e.target.value as typeof paymentForm.category })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {PAYMENT_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Obra</label>
                <select
                  value={paymentForm.project_id}
                  onChange={e => setPaymentForm({ ...paymentForm, project_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Sin obra específica</option>
                  {obras.map(obra => (
                    <option key={obra.id} value={obra.id}>{obra.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento</label>
                <input
                  type="date"
                  value={paymentForm.due_date}
                  onChange={e => setPaymentForm({ ...paymentForm, due_date: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Crear Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
