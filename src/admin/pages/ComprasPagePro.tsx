/**
 * ComprasPagePro - Sistema de Procurement Enterprise
 * Gestión completa de órdenes de compra, solicitudes y recepciones
 */

import { useState, useEffect, useMemo } from 'react';
import { usePurchaseStore, type PurchaseOrder } from '../store/purchaseStore';
import { useObrasStore } from '../store/obrasStore';
import { format, parseISO, differenceInDays, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';

// ============================================
// TIPOS Y CONSTANTES
// ============================================

type ViewMode = 'kanban' | 'lista' | 'calendario' | 'analytics';

const WORKFLOW_STAGES = [
  { id: 'draft', label: 'Borrador', icon: '📝', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
  { id: 'sent', label: 'Enviada', icon: '📤', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  { id: 'confirmed', label: 'Confirmada', icon: '✅', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  { id: 'partial', label: 'Parcial', icon: '📦', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
  { id: 'received', label: 'Recibida', icon: '🏁', color: 'emerald', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' },
  { id: 'cancelled', label: 'Cancelada', icon: '❌', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700' },
];

// ============================================
// COMPONENTES
// ============================================

const MetricCard = ({ label, value, icon, color, trend, subtitle }: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: { value: number; direction: 'up' | 'down' };
  subtitle?: string;
}) => (
  <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all`}>
    <div className="flex items-start justify-between">
      <span className="text-3xl">{icon}</span>
      {trend && (
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          trend.direction === 'up' ? 'bg-green-400/30' : 'bg-red-400/30'
        }`}>
          {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
        </div>
      )}
    </div>
    <p className="text-white/80 text-sm mt-4">{label}</p>
    <p className="text-3xl font-bold mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    {subtitle && <p className="text-white/60 text-xs mt-1">{subtitle}</p>}
  </div>
);

const KanbanCard = ({ order, suppliers, obras, onStatusChange, onView }: {
  order: any;
  suppliers: any[];
  obras: any[];
  onStatusChange: (id: string, status: PurchaseOrder['status']) => void;
  onView: (order: any) => void;
}) => {
  const supplier = suppliers.find(s => s.id === order.supplier_id);
  const obra = obras.find(o => o.id === order.project_id);
  const daysUntilDelivery = order.expected_delivery 
    ? differenceInDays(parseISO(order.expected_delivery), new Date())
    : null;
  
  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all cursor-pointer group"
      onClick={() => onView(order)}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="font-mono text-sm text-gray-500">{order.code}</span>
        {daysUntilDelivery !== null && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            daysUntilDelivery < 0 ? 'bg-red-100 text-red-700' :
            daysUntilDelivery <= 3 ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {daysUntilDelivery < 0 ? `${Math.abs(daysUntilDelivery)}d atraso` :
             daysUntilDelivery === 0 ? 'Hoy' :
             `${daysUntilDelivery}d`}
          </span>
        )}
      </div>
      
      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {supplier?.name || 'Proveedor no asignado'}
      </h4>
      
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
        <span className="w-2 h-2 rounded-full bg-blue-500" />
        {obra?.nombre || 'Sin proyecto'}
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="font-bold text-gray-900">
          ${order.total?.toLocaleString() || '0'}
        </span>
        <span className="text-xs text-gray-400">
          {order.order_date && format(parseISO(order.order_date), 'dd MMM', { locale: es })}
        </span>
      </div>
      
      {/* Quick Actions on Hover */}
      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        {order.status === 'draft' && (
          <button
            onClick={(e) => { e.stopPropagation(); onStatusChange(order.id, 'sent'); }}
            className="flex-1 text-xs bg-blue-100 text-blue-700 py-1.5 rounded-lg font-medium hover:bg-blue-200"
          >
            Enviar
          </button>
        )}
        {order.status === 'sent' && (
          <button
            onClick={(e) => { e.stopPropagation(); onStatusChange(order.id, 'confirmed'); }}
            className="flex-1 text-xs bg-green-100 text-green-700 py-1.5 rounded-lg font-medium hover:bg-green-200"
          >
            Confirmar
          </button>
        )}
        {order.status === 'confirmed' && (
          <button
            onClick={(e) => { e.stopPropagation(); onStatusChange(order.id, 'received'); }}
            className="flex-1 text-xs bg-emerald-100 text-emerald-700 py-1.5 rounded-lg font-medium hover:bg-emerald-200"
          >
            Recibir
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function ComprasPagePro() {
  const { purchaseOrders, suppliers, isLoading, fetchPurchaseOrders, fetchSuppliers, addPurchaseOrder, updateOrderStatus } = usePurchaseStore();
  const { obras } = useObrasStore();
  
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showOrderDetail, setShowOrderDetail] = useState<any>(null);
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterSupplier, setFilterSupplier] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    project_id: '',
    supplier_id: '',
    items: [{ description: '', quantity: '', unit: 'un', unit_price: '' }],
    expected_delivery: '',
    notes: '',
    delivery_address: ''
  });

  useEffect(() => {
    fetchPurchaseOrders();
    fetchSuppliers();
  }, [fetchPurchaseOrders, fetchSuppliers]);

  // ============================================
  // MÉTRICAS
  // ============================================

  const metrics = useMemo(() => {
    const filtered = purchaseOrders.filter(o => {
      if (filterProject !== 'all' && o.project_id !== filterProject) return false;
      if (filterSupplier !== 'all' && o.supplier_id !== filterSupplier) return false;
      if (searchTerm && !o.code?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
    
    const totalValue = filtered.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingValue = filtered
      .filter(o => ['draft', 'sent', 'confirmed', 'partial'].includes(o.status))
      .reduce((sum, o) => sum + (o.total || 0), 0);
    
    const byStatus = WORKFLOW_STAGES.reduce((acc, stage) => {
      acc[stage.id] = filtered.filter(o => o.status === stage.id);
      return acc;
    }, {} as Record<string, any[]>);
    
    const overdueOrders = filtered.filter(o => 
      o.expected_delivery && 
      isAfter(new Date(), parseISO(o.expected_delivery)) && 
      !['received', 'cancelled'].includes(o.status)
    );
    
    return {
      total: filtered.length,
      totalValue,
      pendingValue,
      byStatus,
      overdueCount: overdueOrders.length,
      thisMonth: filtered.filter(o => {
        const orderDate = o.order_date ? parseISO(o.order_date) : null;
        const now = new Date();
        return orderDate && orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }).length,
    };
  }, [purchaseOrders, filterProject, filterSupplier, searchTerm]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: '', unit: 'un', unit_price: '' }]
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return sum + (qty * price);
    }, 0);
  };

  const handleCreateOrder = async () => {
    if (!formData.project_id || !formData.supplier_id || formData.items.length === 0) return;
    
    const subtotal = calculateSubtotal();
    const taxAmount = subtotal * 0.22; // 22% IVA
    
    await addPurchaseOrder({
      project_id: formData.project_id,
      supplier_id: formData.supplier_id,
      status: 'draft',
      order_date: format(new Date(), 'yyyy-MM-dd'),
      expected_delivery: formData.expected_delivery || null,
      subtotal,
      tax_amount: taxAmount,
      total: subtotal + taxAmount,
      notes: formData.notes || null
    });
    
    setShowNewOrder(false);
    setFormData({
      project_id: '',
      supplier_id: '',
      items: [{ description: '', quantity: '', unit: 'un', unit_price: '' }],
      expected_delivery: '',
      notes: '',
      delivery_address: ''
    });
  };

  const formatCurrency = (value: number) => `$${value.toLocaleString('es-UY')}`;

  // ============================================
  // RENDERIZADO
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  🛒
                </span>
                Centro de Compras
              </h1>
              <p className="text-gray-500 mt-1">Órdenes de compra, proveedores y recepciones</p>
            </div>
            <button
              onClick={() => setShowNewOrder(true)}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              Nueva Orden
            </button>
          </div>
          
          {/* Filters & View Toggle */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por código..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>
              <select
                value={filterProject}
                onChange={e => setFilterProject(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Todas las obras</option>
                {obras.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
              </select>
              <select
                value={filterSupplier}
                onChange={e => setFilterSupplier(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Todos los proveedores</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {[
                { id: 'kanban', icon: '📊', label: 'Kanban' },
                { id: 'lista', icon: '📋', label: 'Lista' },
                { id: 'analytics', icon: '📈', label: 'Analytics' },
              ].map(view => (
                <button
                  key={view.id}
                  onClick={() => setViewMode(view.id as ViewMode)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === view.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {view.icon} {view.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <MetricCard
                label="Órdenes Activas"
                value={metrics.total - (metrics.byStatus['received']?.length || 0) - (metrics.byStatus['cancelled']?.length || 0)}
                icon="📋"
                color="from-blue-500 to-blue-600"
              />
              <MetricCard
                label="Valor Pendiente"
                value={formatCurrency(metrics.pendingValue)}
                icon="💰"
                color="from-orange-500 to-red-500"
              />
              <MetricCard
                label="Atrasadas"
                value={metrics.overdueCount}
                icon="⚠️"
                color={metrics.overdueCount > 0 ? "from-red-500 to-red-600" : "from-green-500 to-green-600"}
                subtitle={metrics.overdueCount > 0 ? 'Requiere atención' : 'Todo al día'}
              />
              <MetricCard
                label="Este Mes"
                value={metrics.thisMonth}
                icon="📅"
                color="from-purple-500 to-purple-600"
                subtitle={`${formatCurrency(metrics.totalValue)} total`}
              />
            </div>

            {/* KANBAN VIEW */}
            {viewMode === 'kanban' && (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {WORKFLOW_STAGES.filter(s => s.id !== 'cancelled').map(stage => (
                  <div key={stage.id} className="flex-shrink-0 w-80">
                    <div className={`rounded-t-xl ${stage.bgColor} px-4 py-3 flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <span>{stage.icon}</span>
                        <span className={`font-semibold ${stage.textColor}`}>{stage.label}</span>
                      </div>
                      <span className={`${stage.bgColor} ${stage.textColor} px-2 py-0.5 rounded-full text-sm font-bold`}>
                        {metrics.byStatus[stage.id]?.length || 0}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-b-xl p-3 min-h-[400px] space-y-3">
                      {metrics.byStatus[stage.id]?.map(order => (
                        <KanbanCard
                          key={order.id}
                          order={order}
                          suppliers={suppliers}
                          obras={obras}
                          onStatusChange={updateOrderStatus}
                          onView={setShowOrderDetail}
                        />
                      ))}
                      {(!metrics.byStatus[stage.id] || metrics.byStatus[stage.id].length === 0) && (
                        <div className="text-center py-8 text-gray-400">
                          <span className="text-4xl">📭</span>
                          <p className="mt-2 text-sm">Sin órdenes</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LIST VIEW */}
            {viewMode === 'lista' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Código</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Proveedor</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Proyecto</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Entrega Est.</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {purchaseOrders.map(order => {
                      const supplier = suppliers.find(s => s.id === order.supplier_id);
                      const obra = obras.find(o => o.id === order.project_id);
                      const stage = WORKFLOW_STAGES.find(s => s.id === order.status);
                      
                      return (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm font-medium text-gray-900">{order.code}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">{supplier?.name || '-'}</p>
                              <p className="text-xs text-gray-500">{supplier?.category || ''}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{obra?.nombre || '-'}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {order.order_date && format(parseISO(order.order_date), 'dd/MM/yyyy')}
                          </td>
                          <td className="px-4 py-3">
                            {order.expected_delivery && (
                              <span className={`text-sm ${
                                isAfter(new Date(), parseISO(order.expected_delivery)) && !['received', 'cancelled'].includes(order.status)
                                  ? 'text-red-600 font-medium'
                                  : 'text-gray-600'
                              }`}>
                                {format(parseISO(order.expected_delivery), 'dd/MM/yyyy')}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">
                            {formatCurrency(order.total || 0)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${stage?.bgColor} ${stage?.textColor}`}>
                              {stage?.icon} {stage?.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setShowOrderDetail(order)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Ver detalle"
                              >
                                👁️
                              </button>
                              {order.status === 'draft' && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'sent')}
                                  className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Enviar"
                                >
                                  📤
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ANALYTICS VIEW */}
            {viewMode === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Orders by Status */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Órdenes por Estado</h3>
                  <div className="space-y-3">
                    {WORKFLOW_STAGES.map(stage => {
                      const count = metrics.byStatus[stage.id]?.length || 0;
                      const percentage = metrics.total > 0 ? (count / metrics.total) * 100 : 0;
                      return (
                        <div key={stage.id}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="flex items-center gap-2">
                              <span>{stage.icon}</span>
                              <span className="text-gray-600">{stage.label}</span>
                            </span>
                            <span className="font-medium">{count}</span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${stage.bgColor} transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Suppliers */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Top Proveedores</h3>
                  <div className="space-y-3">
                    {suppliers.slice(0, 5).map((supplier, idx) => {
                      const supplierOrders = purchaseOrders.filter(o => o.supplier_id === supplier.id);
                      const supplierTotal = supplierOrders.reduce((sum, o) => sum + (o.total || 0), 0);
                      return (
                        <div key={supplier.id} className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-600' : 'bg-gray-300'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{supplier.name}</p>
                            <p className="text-xs text-gray-500">{supplierOrders.length} órdenes</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatCurrency(supplierTotal)}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-xs ${i < (supplier.rating || 0) ? 'text-yellow-500' : 'text-gray-300'}`}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Monthly Trend */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:col-span-2">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Valor de Compras por Proyecto</h3>
                  <div className="space-y-4">
                    {obras.slice(0, 6).map(obra => {
                      const obraOrders = purchaseOrders.filter(o => o.project_id === obra.id);
                      const obraTotal = obraOrders.reduce((sum, o) => sum + (o.total || 0), 0);
                      const maxTotal = Math.max(...obras.map(o => 
                        purchaseOrders.filter(po => po.project_id === o.id).reduce((s, po) => s + (po.total || 0), 0)
                      ));
                      const percentage = maxTotal > 0 ? (obraTotal / maxTotal) * 100 : 0;
                      
                      return (
                        <div key={obra.id}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium text-gray-900">{obra.nombre}</span>
                            <span className="text-gray-600">{formatCurrency(obraTotal)}</span>
                          </div>
                          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* NEW ORDER MODAL */}
      {showNewOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b bg-gradient-to-r from-orange-500 to-red-600">
              <h3 className="text-xl font-bold text-white">🛒 Nueva Orden de Compra</h3>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateOrder(); }} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto *</label>
                  <select
                    value={formData.project_id}
                    onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {obras.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
                  <select
                    value={formData.supplier_id}
                    onChange={e => setFormData({ ...formData, supplier_id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Items de la Orden</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    + Agregar Item
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Descripción"
                          value={item.description}
                          onChange={e => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full border rounded px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          placeholder="Cant."
                          value={item.quantity}
                          onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full border rounded px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div className="w-20">
                        <select
                          value={item.unit}
                          onChange={e => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full border rounded px-2 py-1.5 text-sm"
                        >
                          <option value="un">un</option>
                          <option value="kg">kg</option>
                          <option value="m">m</option>
                          <option value="m2">m²</option>
                          <option value="m3">m³</option>
                          <option value="lt">lt</option>
                          <option value="gl">gl</option>
                        </select>
                      </div>
                      <div className="w-28">
                        <input
                          type="number"
                          placeholder="Precio"
                          value={item.unit_price}
                          onChange={e => handleItemChange(idx, 'unit_price', e.target.value)}
                          className="w-full border rounded px-2 py-1.5 text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">IVA (22%)</span>
                  <span className="font-medium">{formatCurrency(calculateSubtotal() * 0.22)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-3 pt-3 border-t">
                  <span>Total</span>
                  <span className="text-orange-600">{formatCurrency(calculateSubtotal() * 1.22)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Entrega Esperada</label>
                  <input
                    type="date"
                    value={formData.expected_delivery}
                    onChange={e => setFormData({ ...formData, expected_delivery: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Entrega</label>
                  <input
                    type="text"
                    value={formData.delivery_address}
                    onChange={e => setFormData({ ...formData, delivery_address: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                    placeholder="Dirección de la obra..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  placeholder="Instrucciones especiales, condiciones..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewOrder(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-700"
                >
                  Crear Orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAIL MODAL */}
      {showOrderDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Orden {showOrderDetail.code}</h3>
                <p className="text-sm text-gray-500">
                  Creada el {showOrderDetail.order_date && format(parseISO(showOrderDetail.order_date), 'dd/MM/yyyy')}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                WORKFLOW_STAGES.find(s => s.id === showOrderDetail.status)?.bgColor
              } ${WORKFLOW_STAGES.find(s => s.id === showOrderDetail.status)?.textColor}`}>
                {WORKFLOW_STAGES.find(s => s.id === showOrderDetail.status)?.icon}{' '}
                {WORKFLOW_STAGES.find(s => s.id === showOrderDetail.status)?.label}
              </span>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Proveedor</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {suppliers.find(s => s.id === showOrderDetail.supplier_id)?.name || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Proyecto</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {obras.find(o => o.id === showOrderDetail.project_id)?.nombre || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Entrega Esperada</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {showOrderDetail.expected_delivery 
                      ? format(parseISO(showOrderDetail.expected_delivery), 'dd/MM/yyyy')
                      : 'No especificada'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    {formatCurrency(showOrderDetail.total || 0)}
                  </p>
                </div>
              </div>
              
              {showOrderDetail.notes && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Notas</p>
                  <p className="text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg">{showOrderDetail.notes}</p>
                </div>
              )}
              
              {/* Workflow Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowOrderDetail(null)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cerrar
                </button>
                {showOrderDetail.status === 'draft' && (
                  <button
                    onClick={() => { updateOrderStatus(showOrderDetail.id, 'sent'); setShowOrderDetail(null); }}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                  >
                    📤 Enviar al Proveedor
                  </button>
                )}
                {showOrderDetail.status === 'sent' && (
                  <button
                    onClick={() => { updateOrderStatus(showOrderDetail.id, 'confirmed'); setShowOrderDetail(null); }}
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"
                  >
                    ✅ Confirmar Recepción
                  </button>
                )}
                {showOrderDetail.status === 'confirmed' && (
                  <button
                    onClick={() => { updateOrderStatus(showOrderDetail.id, 'received'); setShowOrderDetail(null); }}
                    className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700"
                  >
                    🏁 Marcar Recibido
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
