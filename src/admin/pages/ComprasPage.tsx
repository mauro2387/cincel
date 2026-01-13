/**
 * ComprasPage - Gestión de órdenes de compra
 */

import { useState, useEffect } from 'react';
import { usePurchaseStore } from '../store/purchaseStore';
import { useObrasStore } from '../store/obrasStore';

const STATUS_OPTIONS = [
  { id: 'draft', label: 'Borrador', color: 'gray' },
  { id: 'sent', label: 'Enviada', color: 'blue' },
  { id: 'confirmed', label: 'Confirmada', color: 'green' },
  { id: 'partial', label: 'Parcial', color: 'yellow' },
  { id: 'received', label: 'Recibida', color: 'green' },
  { id: 'cancelled', label: 'Cancelada', color: 'red' },
];

export default function ComprasPage() {
  const { purchaseOrders, suppliers, isLoading, fetchPurchaseOrders, fetchSuppliers, addPurchaseOrder, updateOrderStatus } = usePurchaseStore();
  const { obras } = useObrasStore();
  
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterObra, setFilterObra] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    project_id: '',
    supplier_id: '',
    subtotal: '',
    tax_amount: '',
    expected_delivery: ''
  });

  useEffect(() => {
    fetchPurchaseOrders();
    fetchSuppliers();
  }, [fetchPurchaseOrders, fetchSuppliers]);

  const filteredOrders = purchaseOrders.filter(order => {
    if (filterStatus !== 'all' && order.status !== filterStatus) return false;
    if (filterObra !== 'all' && order.project_id !== filterObra) return false;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = parseFloat(formData.subtotal) || 0;
    const taxAmount = parseFloat(formData.tax_amount) || 0;
    await addPurchaseOrder({
      project_id: formData.project_id,
      supplier_id: formData.supplier_id,
      status: 'draft',
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery: formData.expected_delivery || null,
      subtotal: subtotal,
      tax_amount: taxAmount,
      total: subtotal + taxAmount,
      notes: null
    });
    setShowModal(false);
    setFormData({ project_id: '', supplier_id: '', subtotal: '', tax_amount: '', expected_delivery: '' });
  };

  const getStatusColor = (status: string) => {
    const statusInfo = STATUS_OPTIONS.find(s => s.id === status);
    return statusInfo?.color || 'gray';
  };

  const stats = {
    total: purchaseOrders.length,
    draft: purchaseOrders.filter(o => o.status === 'draft').length,
    confirmed: purchaseOrders.filter(o => o.status === 'confirmed').length,
    totalValue: purchaseOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órdenes de Compra</h1>
          <p className="text-gray-500">Gestión de compras y adquisiciones</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span> Nueva Orden
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Órdenes</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4">
          <p className="text-sm text-yellow-600">Borradores</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.draft}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-sm text-green-600">Confirmadas</p>
          <p className="text-2xl font-bold text-green-700">{stats.confirmed}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <p className="text-sm text-blue-600">Valor Total</p>
          <p className="text-2xl font-bold text-blue-700">${stats.totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">Todos los estados</option>
          {STATUS_OPTIONS.map(status => (
            <option key={status.id} value={status.id}>{status.label}</option>
          ))}
        </select>
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

      {/* Orders List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Código</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Obra</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Proveedor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Fecha</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Total</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map(order => {
                const obra = obras.find(o => o.id === order.project_id);
                const supplier = suppliers.find(s => s.id === order.supplier_id);
                const statusColor = getStatusColor(order.status);
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">{order.code}</td>
                    <td className="px-4 py-3">{obra?.nombre || '-'}</td>
                    <td className="px-4 py-3">{supplier?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(order.order_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right font-medium">${order.total?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
                        {STATUS_OPTIONS.find(s => s.id === order.status)?.label || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {order.status === 'draft' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'sent')}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Enviar
                        </button>
                      )}
                      {order.status === 'sent' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Confirmar
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'received')}
                          className="text-purple-600 hover:text-purple-800 text-sm"
                        >
                          Marcar Recibido
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <p className="text-center py-8 text-gray-500">No hay órdenes de compra</p>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">Nueva Orden de Compra</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Obra *</label>
                <select
                  value={formData.project_id}
                  onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Seleccionar obra...</option>
                  {obras.map(obra => (
                    <option key={obra.id} value={obra.id}>{obra.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
                <select
                  value={formData.supplier_id}
                  onChange={e => setFormData({ ...formData, supplier_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Seleccionar proveedor...</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal *</label>
                  <input
                    type="number"
                    value={formData.subtotal}
                    onChange={e => setFormData({ ...formData, subtotal: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IVA</label>
                  <input
                    type="number"
                    value={formData.tax_amount}
                    onChange={e => setFormData({ ...formData, tax_amount: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entrega Esperada</label>
                <input
                  type="date"
                  value={formData.expected_delivery}
                  onChange={e => setFormData({ ...formData, expected_delivery: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Crear Orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
