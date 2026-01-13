/**
 * CobrosPage - Gestión de Cuentas por Cobrar
 * Facturas pendientes, hitos de contrato, aging analysis
 * Responde: "¿Quién me debe? ¿Cuánto está vencido?"
 */

import { useState, useEffect } from 'react';
import { 
  useReceivablesPayablesStore,
  RECEIVABLE_TYPES,
  RECEIVABLE_STATUSES,
  getReceivableTypeConfig,
  getReceivableStatusConfig
} from '../store/receivablesPayablesStore';
import { useObrasStore } from '../store/obrasStore';
import { useClientesStore } from '../store/clientesStore';
import type { Receivable, ReceivableType, ReceivableStatus } from '../../lib/database.types';

// Formatear moneda
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function CobrosPage() {
  const {
    receivables,
    fetchReceivables,
    addReceivable,
    updateReceivable: _updateReceivable,
    recordPayment,
    getReceivablesAging,
    getTotalReceivables,
    getOverdueReceivables,
    getExpectedIncome,
    loading,
  } = useReceivablesPayablesStore();
  
  const { obras } = useObrasStore();
  const { clientes } = useClientesStore();
  
  const [showNewModal, setShowNewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterClient, setFilterClient] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'due_date' | 'amount' | 'days_overdue'>('due_date');
  
  // Form para nuevo cobro
  const [newReceivable, setNewReceivable] = useState({
    project_id: '',
    client_id: '',
    type: 'milestone' as ReceivableType,
    invoice_number: '',
    description: '',
    amount: 0,
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });
  
  // Form para registrar pago
  const [payment, setPayment] = useState({
    amount: 0,
    notes: '',
  });

  useEffect(() => {
    fetchReceivables();
  }, [fetchReceivables]);

  const aging = getReceivablesAging();
  const totalReceivables = getTotalReceivables();
  const overdueReceivablesList = getOverdueReceivables();
  const overdueAmount = overdueReceivablesList.reduce((sum, r) => sum + r.pending_amount, 0);
  const expected7Days = getExpectedIncome(7);
  const expected30Days = getExpectedIncome(30);
  
  // Porcentaje vencido
  const overduePercent = totalReceivables > 0 ? (overdueAmount / totalReceivables) * 100 : 0;

  // Filtrar y ordenar
  const filteredReceivables = receivables
    .filter(r => filterStatus === 'all' || r.status === filterStatus)
    .filter(r => filterClient === 'all' || r.client_id === filterClient)
    .sort((a, b) => {
      switch (sortBy) {
        case 'due_date':
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'amount':
          return (b.amount - b.paid_amount) - (a.amount - a.paid_amount);
        case 'days_overdue':
          return (b.days_overdue || 0) - (a.days_overdue || 0);
        default:
          return 0;
      }
    });

  const handleCreateReceivable = () => {
    if (!newReceivable.project_id || !newReceivable.client_id || !newReceivable.amount) return;
    
    addReceivable({
      project_id: newReceivable.project_id,
      client_id: newReceivable.client_id,
      contract_id: null,
      milestone_id: null,
      change_order_id: null,
      type: newReceivable.type,
      invoice_number: newReceivable.invoice_number || null,
      invoice_date: null,
      invoice_url: null,
      description: newReceivable.description || null,
      amount: newReceivable.amount,
      tax_amount: 0,
      total_amount: newReceivable.amount,
      paid_amount: 0,
      pending_amount: newReceivable.amount,
      due_date: newReceivable.due_date,
      expected_payment_date: null,
      status: 'pending' as ReceivableStatus,
      days_overdue: 0,
      notes: newReceivable.notes || null,
      created_by: null,
    });
    
    setShowNewModal(false);
    setNewReceivable({
      project_id: '',
      client_id: '',
      type: 'milestone',
      invoice_number: '',
      description: '',
      amount: 0,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleRecordPayment = () => {
    if (!selectedReceivable || !payment.amount) return;
    
    recordPayment(selectedReceivable.id, payment.amount);
    
    setShowPaymentModal(false);
    setSelectedReceivable(null);
    setPayment({ amount: 0, notes: '' });
  };

  const openPaymentModal = (receivable: Receivable) => {
    setSelectedReceivable(receivable);
    setPayment({
      amount: receivable.pending_amount,
      notes: '',
    });
    setShowPaymentModal(true);
  };

  const getClient = (clientId: string) => clientes.find(c => c.id === clientId);
  const getProject = (projectId: string) => obras.find(o => o.id === projectId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📥 Cuentas por Cobrar</h1>
          <p className="text-gray-600">Facturas pendientes, hitos y cobros esperados</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>➕</span>
          Nueva Factura
        </button>
      </div>

      {/* KPIs de Cobros */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total por Cobrar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-blue-200">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <span className="text-xl">💰</span>
            <span className="text-sm font-medium">TOTAL POR COBRAR</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalReceivables)}</div>
          <div className="text-xs text-gray-500 mt-1">
            {receivables.filter(r => r.status === 'pending').length} facturas pendientes
          </div>
        </div>
        
        {/* Vencido */}
        <div className={`p-4 rounded-xl shadow-sm border-2 ${
          overdueAmount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
        }`}>
          <div className={`flex items-center gap-2 mb-1 ${overdueAmount > 0 ? 'text-red-600' : 'text-gray-500'}`}>
            <span className="text-xl">⚠️</span>
            <span className="text-sm font-medium">VENCIDO</span>
          </div>
          <div className={`text-2xl font-bold ${overdueAmount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {formatCurrency(overdueAmount)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {overduePercent.toFixed(0)}% del total
          </div>
        </div>
        
        {/* Por vencer 7 días */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <span className="text-xl">📅</span>
            <span className="text-sm font-medium">PRÓXIMOS 7 DÍAS</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(expected7Days)}</div>
          <div className="text-xs text-gray-500 mt-1">
            Cobros esperados
          </div>
        </div>
        
        {/* Por vencer 30 días */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <span className="text-xl">📆</span>
            <span className="text-sm font-medium">PRÓXIMOS 30 DÍAS</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(expected30Days)}</div>
          <div className="text-xs text-gray-500 mt-1">
            Cobros esperados
          </div>
        </div>
        
        {/* DSO (Days Sales Outstanding) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <span className="text-xl">⏱️</span>
            <span className="text-sm font-medium">DSO PROMEDIO</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {receivables.length > 0 
              ? Math.round(receivables.reduce((sum, r) => sum + (r.days_overdue || 0), 0) / receivables.length)
              : 0} días
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Días promedio de cobro
          </div>
        </div>
      </div>

      {/* Aging Analysis */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <h3 className="font-semibold mb-4">📊 Análisis de Antigüedad (Aging)</h3>
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Vigente</div>
            <div className="text-xl font-bold text-green-600">{formatCurrency(aging.current)}</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">1-30 días</div>
            <div className="text-xl font-bold text-yellow-600">{formatCurrency(aging.overdue_1_30)}</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">31-60 días</div>
            <div className="text-xl font-bold text-orange-600">{formatCurrency(aging.overdue_31_60)}</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">61-90 días</div>
            <div className="text-xl font-bold text-red-600">{formatCurrency(aging.overdue_61_90)}</div>
          </div>
          <div className="text-center p-3 bg-red-100 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">&gt;90 días</div>
            <div className="text-xl font-bold text-red-700">{formatCurrency(aging.overdue_90_plus)}</div>
          </div>
        </div>
      </div>

      {/* Filtros y Lista */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Estado:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-sm"
            >
              <option value="all">Todos</option>
              {RECEIVABLE_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Cliente:</span>
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-sm"
            >
              <option value="all">Todos</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-1.5 border rounded-lg text-sm"
            >
              <option value="due_date">Vencimiento</option>
              <option value="amount">Monto</option>
              <option value="days_overdue">Días vencido</option>
            </select>
          </div>
          
          <span className="ml-auto text-sm text-gray-400">
            {filteredReceivables.length} registros
          </span>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">FACTURA</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">CLIENTE / OBRA</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">DESCRIPCIÓN</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">MONTO</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">PENDIENTE</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">VENCIMIENTO</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">ESTADO</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredReceivables.map(receivable => {
                const client = getClient(receivable.client_id);
                const project = getProject(receivable.project_id);
                const typeConfig = getReceivableTypeConfig(receivable.type);
                const statusConfig = getReceivableStatusConfig(receivable.status);
                const isOverdue = receivable.days_overdue && receivable.days_overdue > 0;
                
                return (
                  <tr key={receivable.id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{typeConfig.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {receivable.invoice_number || 'Sin número'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {receivable.invoice_date ? new Date(receivable.invoice_date).toLocaleDateString('es-UY') : '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{client?.nombre || '-'}</div>
                      <div className="text-xs text-gray-500">{project?.nombre || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {receivable.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {formatCurrency(receivable.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-right text-blue-600">
                      {formatCurrency(receivable.pending_amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        {new Date(receivable.due_date).toLocaleDateString('es-UY')}
                      </div>
                      {isOverdue && (
                        <div className="text-xs text-red-500">
                          {receivable.days_overdue} días vencido
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {receivable.status === 'pending' || receivable.status === 'overdue' ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openPaymentModal(receivable)}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                          >
                            💵 Cobrar
                          </button>
                        </div>
                      ) : receivable.status === 'partial' ? (
                        <button
                          onClick={() => openPaymentModal(receivable)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                        >
                          💵 Completar
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredReceivables.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    No hay cuentas por cobrar con los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Nueva Factura */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Nueva Factura por Cobrar</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Obra *</label>
                  <select
                    value={newReceivable.project_id}
                    onChange={(e) => setNewReceivable(prev => ({ ...prev, project_id: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar obra</option>
                    {obras.filter(o => o.estado === 'en_progreso' || o.estado === 'planificacion').map(o => (
                      <option key={o.id} value={o.id}>{o.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                  <select
                    value={newReceivable.client_id}
                    onChange={(e) => setNewReceivable(prev => ({ ...prev, client_id: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                  <select
                    value={newReceivable.type}
                    onChange={(e) => setNewReceivable(prev => ({ ...prev, type: e.target.value as ReceivableType }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {RECEIVABLE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nº Factura</label>
                  <input
                    type="text"
                    value={newReceivable.invoice_number}
                    onChange={(e) => setNewReceivable(prev => ({ ...prev, invoice_number: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="FAC-001"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                <input
                  type="text"
                  value={newReceivable.description}
                  onChange={(e) => setNewReceivable(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Avance de obra 30%"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                  <input
                    type="number"
                    value={newReceivable.amount || ''}
                    onChange={(e) => setNewReceivable(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento *</label>
                  <input
                    type="date"
                    value={newReceivable.due_date}
                    onChange={(e) => setNewReceivable(prev => ({ ...prev, due_date: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={newReceivable.notes}
                  onChange={(e) => setNewReceivable(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Notas adicionales..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateReceivable}
                disabled={!newReceivable.project_id || !newReceivable.client_id || !newReceivable.amount}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Crear Factura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Pago */}
      {showPaymentModal && selectedReceivable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">💵 Registrar Cobro</h2>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="text-sm text-gray-600">Factura: <strong>{selectedReceivable.invoice_number || selectedReceivable.code}</strong></div>
              <div className="text-sm text-gray-600">Monto total: <strong>{formatCurrency(selectedReceivable.total_amount)}</strong></div>
              <div className="text-sm text-gray-600">Pagado: <strong>{formatCurrency(selectedReceivable.paid_amount)}</strong></div>
              <div className="text-sm text-blue-600 font-medium mt-1">
                Pendiente: <strong>{formatCurrency(selectedReceivable.pending_amount)}</strong>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto a cobrar *</label>
                <input
                  type="number"
                  value={payment.amount || ''}
                  onChange={(e) => setPayment(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  max={selectedReceivable.pending_amount}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-lg font-medium"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setPayment(prev => ({ ...prev, amount: selectedReceivable!.pending_amount }))}
                    className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Total pendiente
                  </button>
                  <button
                    onClick={() => setPayment(prev => ({ ...prev, amount: Math.round(selectedReceivable!.pending_amount / 2) }))}
                    className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    50%
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <input
                  type="text"
                  value={payment.notes}
                  onChange={(e) => setPayment(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: Transferencia BROU"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedReceivable(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRecordPayment}
                disabled={!payment.amount || payment.amount > selectedReceivable.pending_amount}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Registrar Cobro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
