/**
 * ProveedoresPagePro - Directorio de Proveedores Enterprise
 * Gestión completa con calificaciones, historial y analytics
 */

import { useState, useEffect, useMemo } from 'react';
import { usePurchaseStore } from '../store/purchaseStore';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// ============================================
// TIPOS Y CONSTANTES
// ============================================

type ViewMode = 'grid' | 'list' | 'analytics';

const SUPPLIER_TYPES = [
  { id: 'material', label: 'Materiales', icon: '🧱', color: 'bg-orange-500' },
  { id: 'labor', label: 'Mano de Obra', icon: '👷', color: 'bg-blue-500' },
  { id: 'equipment', label: 'Equipos', icon: '🚜', color: 'bg-green-500' },
  { id: 'subcontractor', label: 'Subcontratistas', icon: '🏗️', color: 'bg-purple-500' },
  { id: 'services', label: 'Servicios', icon: '⚙️', color: 'bg-indigo-500' },
  { id: 'other', label: 'Otros', icon: '📦', color: 'bg-gray-500' },
];

const CATEGORIES = [
  'Hormigón', 'Acero', 'Cemento', 'Ladrillos', 'Cerámicos', 'Pinturas',
  'Electricidad', 'Sanitaria', 'Carpintería', 'Aluminio', 'Vidrios',
  'Impermeabilización', 'Aislación', 'Pisos', 'Techos', 'Transporte',
  'Maquinaria', 'Herramientas', 'Seguridad', 'Limpieza', 'Otros'
];

// ============================================
// COMPONENTES
// ============================================

const RatingStars = ({ rating, size = 'md', interactive = false, onChange }: {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };
  
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={`${sizeClasses[size]} ${interactive ? 'cursor-pointer hover:scale-110' : ''} transition-transform`}
        >
          <span className={star <= rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
        </button>
      ))}
    </div>
  );
};

const SupplierCard = ({ supplier, orders, onSelect, onEdit }: {
  supplier: any;
  orders: any[];
  onSelect: () => void;
  onEdit: () => void;
}) => {
  const typeConfig = SUPPLIER_TYPES.find(t => t.id === supplier.category?.toLowerCase()) || SUPPLIER_TYPES[5];
  const supplierOrders = orders.filter(o => o.supplier_id === supplier.id);
  const totalValue = supplierOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  
  return (
    <div 
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
      onClick={onSelect}
    >
      {/* Header with gradient */}
      <div className={`h-2 ${typeConfig.color}`} />
      
      <div className="p-6">
        {/* Top Row */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 ${typeConfig.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
            {typeConfig.icon}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
              ● Activo
            </span>
            <span className="text-xs text-gray-400 font-mono">{supplier.code}</span>
          </div>
        </div>
        
        {/* Name & Category */}
        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
          {supplier.name}
        </h3>
        <p className="text-sm text-gray-500 mb-4">{supplier.category || typeConfig.label}</p>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <RatingStars rating={supplier.rating || 0} size="sm" />
          <span className="text-sm text-gray-500">({supplier.rating?.toFixed(1) || '0.0'})</span>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Órdenes</p>
            <p className="text-xl font-bold text-gray-900">{supplierOrders.length}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-900">${(totalValue / 1000).toFixed(0)}k</p>
          </div>
        </div>
        
        {/* Contact */}
        <div className="space-y-2 text-sm border-t pt-4">
          {supplier.contact_name && (
            <div className="flex items-center gap-2 text-gray-600">
              <span>👤</span>
              <span>{supplier.contact_name}</span>
            </div>
          )}
          {supplier.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <span>📞</span>
              <span>{supplier.phone}</span>
            </div>
          )}
          {supplier.email && (
            <div className="flex items-center gap-2 text-gray-600 truncate">
              <span>✉️</span>
              <span className="truncate">{supplier.email}</span>
            </div>
          )}
        </div>
        
        {/* Actions on hover */}
        <div className="flex gap-2 mt-4 pt-4 border-t opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            ✏️ Editar
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            📋 Ver Órdenes
          </button>
        </div>
      </div>
    </div>
  );
};

const SupplierRow = ({ supplier, orders, onSelect, onEdit }: {
  supplier: any;
  orders: any[];
  onSelect: () => void;
  onEdit: () => void;
}) => {
  const typeConfig = SUPPLIER_TYPES.find(t => t.id === supplier.category?.toLowerCase()) || SUPPLIER_TYPES[5];
  const supplierOrders = orders.filter(o => o.supplier_id === supplier.id);
  const totalValue = supplierOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = supplierOrders.filter(o => !['received', 'cancelled'].includes(o.status));
  
  return (
    <tr className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={onSelect}>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${typeConfig.color} rounded-lg flex items-center justify-center text-lg`}>
            {typeConfig.icon}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{supplier.name}</p>
            <p className="text-xs text-gray-500">{supplier.code}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig.color} text-white`}>
          {typeConfig.label}
        </span>
      </td>
      <td className="px-4 py-4 text-gray-600">{supplier.category || '-'}</td>
      <td className="px-4 py-4">
        <RatingStars rating={supplier.rating || 0} size="sm" />
      </td>
      <td className="px-4 py-4">
        <div>
          <p className="font-medium text-gray-900">{supplierOrders.length}</p>
          {pendingOrders.length > 0 && (
            <p className="text-xs text-orange-600">{pendingOrders.length} pendientes</p>
          )}
        </div>
      </td>
      <td className="px-4 py-4 text-right font-bold text-gray-900">
        ${totalValue.toLocaleString()}
      </td>
      <td className="px-4 py-4 text-center">
        <span className="inline-flex w-3 h-3 rounded-full bg-green-500" />
      </td>
      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            ✏️
          </button>
        </div>
      </td>
    </tr>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function ProveedoresPagePro() {
  const { suppliers, purchaseOrders, isLoading, fetchSuppliers, fetchPurchaseOrders, addSupplier, updateSupplier } = usePurchaseStore();
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'material',
    category: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });

  useEffect(() => {
    fetchSuppliers();
    fetchPurchaseOrders();
  }, [fetchSuppliers, fetchPurchaseOrders]);

  // ============================================
  // MÉTRICAS Y FILTRADO
  // ============================================

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      if (searchTerm && !s.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !s.code?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filterType !== 'all' && s.category?.toLowerCase() !== filterType) return false;
      if (filterCategory !== 'all' && s.category !== filterCategory) return false;
      return true;
    });
  }, [suppliers, searchTerm, filterType, filterCategory]);

  const metrics = useMemo(() => {
    const totalPurchases = purchaseOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const activeSuppliers = suppliers.length;
    const avgRating = suppliers.length > 0 
      ? suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / suppliers.length 
      : 0;
    
    const byType = SUPPLIER_TYPES.map(type => ({
      ...type,
      count: suppliers.filter(s => s.category?.toLowerCase() === type.id).length,
      total: purchaseOrders
        .filter(o => suppliers.find(s => s.id === o.supplier_id && s.category?.toLowerCase() === type.id))
        .reduce((sum, o) => sum + (o.total || 0), 0)
    }));
    
    const topSuppliers = [...suppliers]
      .map(s => ({
        ...s,
        orderCount: purchaseOrders.filter(o => o.supplier_id === s.id).length,
        totalValue: purchaseOrders.filter(o => o.supplier_id === s.id).reduce((sum, o) => sum + (o.total || 0), 0)
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);
    
    return {
      total: suppliers.length,
      active: activeSuppliers,
      totalPurchases,
      avgRating,
      byType,
      topSuppliers
    };
  }, [suppliers, purchaseOrders]);

  // ============================================
  // HANDLERS
  // ============================================

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'material',
      category: '',
      contact_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      notes: ''
    });
  };

  const handleOpenNew = () => {
    resetForm();
    setEditingSupplier(null);
    setShowNewSupplier(true);
  };

  const handleOpenEdit = (supplier: any) => {
    setFormData({
      name: supplier.name || '',
      type: 'material',
      category: supplier.category || '',
      contact_name: supplier.contact_name || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      city: supplier.city || '',
      notes: supplier.notes || ''
    });
    setEditingSupplier(supplier);
    setShowNewSupplier(true);
  };

  const handleSave = async () => {
    if (!formData.name) return;
    
    if (editingSupplier) {
      await updateSupplier(editingSupplier.id, formData);
    } else {
      await addSupplier(formData);
    }
    
    setShowNewSupplier(false);
    resetForm();
    setEditingSupplier(null);
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
                <span className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  🏢
                </span>
                Directorio de Proveedores
              </h1>
              <p className="text-gray-500 mt-1">Gestión y calificación de proveedores</p>
            </div>
            <button
              onClick={handleOpenNew}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              Nuevo Proveedor
            </button>
          </div>
          
          {/* Filters & View Toggle */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar proveedor..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todos los tipos</option>
                {SUPPLIER_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                ))}
              </select>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todas las categorías</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {[
                { id: 'grid', icon: '⊞', label: 'Grid' },
                { id: 'list', icon: '☰', label: 'Lista' },
                { id: 'analytics', icon: '📊', label: 'Analytics' },
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
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-5 text-white">
                <p className="text-purple-100 text-sm">Total Proveedores</p>
                <p className="text-3xl font-bold mt-1">{metrics.total}</p>
                <p className="text-purple-200 text-xs mt-1">{metrics.active} activos</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
                <p className="text-green-100 text-sm">Total Compras</p>
                <p className="text-3xl font-bold mt-1">${(metrics.totalPurchases / 1000000).toFixed(1)}M</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-5 text-white">
                <p className="text-yellow-100 text-sm">Calificación Promedio</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-3xl font-bold">{metrics.avgRating.toFixed(1)}</p>
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-5 text-white">
                <p className="text-blue-100 text-sm">Órdenes Totales</p>
                <p className="text-3xl font-bold mt-1">{purchaseOrders.length}</p>
              </div>
            </div>

            {/* Type Pills */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {metrics.byType.map(type => (
                <button
                  key={type.id}
                  onClick={() => setFilterType(filterType === type.id ? 'all' : type.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    filterType === type.id 
                      ? `${type.color} text-white shadow-lg` 
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span className="font-medium">{type.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                    filterType === type.id ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    {type.count}
                  </span>
                </button>
              ))}
            </div>

            {/* GRID VIEW */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSuppliers.map(supplier => (
                  <SupplierCard
                    key={supplier.id}
                    supplier={supplier}
                    orders={purchaseOrders}
                    onSelect={() => setSelectedSupplier(supplier)}
                    onEdit={() => handleOpenEdit(supplier)}
                  />
                ))}
                {filteredSuppliers.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <span className="text-6xl">🔍</span>
                    <p className="mt-4 text-lg font-medium text-gray-900">No se encontraron proveedores</p>
                    <p className="text-gray-500">Intenta con otros filtros o agrega un nuevo proveedor</p>
                  </div>
                )}
              </div>
            )}

            {/* LIST VIEW */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Proveedor</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Categoría</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rating</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Órdenes</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Estado</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSuppliers.map(supplier => (
                      <SupplierRow
                        key={supplier.id}
                        supplier={supplier}
                        orders={purchaseOrders}
                        onSelect={() => setSelectedSupplier(supplier)}
                        onEdit={() => handleOpenEdit(supplier)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ANALYTICS VIEW */}
            {viewMode === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* By Type Chart */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Proveedores por Tipo</h3>
                  <div className="space-y-4">
                    {metrics.byType.map(type => {
                      const percentage = metrics.total > 0 ? (type.count / metrics.total) * 100 : 0;
                      return (
                        <div key={type.id}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              <span className="text-gray-600">{type.label}</span>
                            </span>
                            <span className="font-medium">{type.count} ({percentage.toFixed(0)}%)</span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${type.color} transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Suppliers by Value */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Top Proveedores por Volumen</h3>
                  <div className="space-y-4">
                    {metrics.topSuppliers.map((supplier, idx) => {
                      const typeConfig = SUPPLIER_TYPES.find(t => t.id === supplier.category?.toLowerCase()) || SUPPLIER_TYPES[5];
                      return (
                        <div key={supplier.id} className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-600' : 'bg-gray-300'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{supplier.name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{typeConfig.icon} {typeConfig.label}</span>
                              <span>•</span>
                              <span>{supplier.orderCount} órdenes</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatCurrency(supplier.totalValue)}</p>
                            <RatingStars rating={supplier.rating || 0} size="sm" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Purchases by Type */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:col-span-2">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución de Compras</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {metrics.byType.map(type => (
                      <div key={type.id} className="text-center p-4 bg-gray-50 rounded-xl">
                        <div className={`w-12 h-12 ${type.color} rounded-xl flex items-center justify-center text-2xl mx-auto mb-3`}>
                          {type.icon}
                        </div>
                        <p className="text-sm text-gray-600">{type.label}</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(type.total)}</p>
                        <p className="text-xs text-gray-500">{type.count} proveedores</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* NEW/EDIT SUPPLIER MODAL */}
      {showNewSupplier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b bg-gradient-to-r from-purple-500 to-indigo-600">
              <h3 className="text-xl font-bold text-white">
                {editingSupplier ? '✏️ Editar Proveedor' : '🏢 Nuevo Proveedor'}
              </h3>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                  placeholder="Nombre de la empresa"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                  >
                    {SUPPLIER_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Seleccionar...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
                  <input
                    type="text"
                    value={formData.contact_name}
                    onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                    placeholder="Nombre del contacto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                    placeholder="+598 99 123 456"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                  placeholder="contacto@empresa.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                    placeholder="Av. Principal 123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                    placeholder="Montevideo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Información adicional, condiciones especiales..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowNewSupplier(false); setEditingSupplier(null); }}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-indigo-700"
                >
                  {editingSupplier ? 'Guardar Cambios' : 'Crear Proveedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPPLIER DETAIL MODAL */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 ${SUPPLIER_TYPES.find(t => t.id === selectedSupplier.category?.toLowerCase())?.color || 'bg-gray-500'} rounded-xl flex items-center justify-center text-3xl`}>
                    {SUPPLIER_TYPES.find(t => t.id === selectedSupplier.category?.toLowerCase())?.icon || '📦'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedSupplier.name}</h3>
                    <p className="text-gray-500">{selectedSupplier.code}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <RatingStars rating={selectedSupplier.rating || 0} />
                      <span className="text-sm text-gray-500">({selectedSupplier.rating?.toFixed(1) || '0.0'})</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSupplier(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase">Órdenes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {purchaseOrders.filter(o => o.supplier_id === selectedSupplier.id).length}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase">Total Compras</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(purchaseOrders.filter(o => o.supplier_id === selectedSupplier.id).reduce((s, o) => s + (o.total || 0), 0))}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase">Pendientes</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {purchaseOrders.filter(o => o.supplier_id === selectedSupplier.id && !['received', 'cancelled'].includes(o.status)).length}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {selectedSupplier.contact_name && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl">👤</span>
                    <div>
                      <p className="text-xs text-gray-500">Contacto</p>
                      <p className="font-medium">{selectedSupplier.contact_name}</p>
                    </div>
                  </div>
                )}
                {selectedSupplier.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl">📞</span>
                    <div>
                      <p className="text-xs text-gray-500">Teléfono</p>
                      <p className="font-medium">{selectedSupplier.phone}</p>
                    </div>
                  </div>
                )}
                {selectedSupplier.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl">✉️</span>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium">{selectedSupplier.email}</p>
                    </div>
                  </div>
                )}
                {selectedSupplier.address && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl">📍</span>
                    <div>
                      <p className="text-xs text-gray-500">Dirección</p>
                      <p className="font-medium">{selectedSupplier.address}, {selectedSupplier.city}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Orders */}
              <h4 className="font-bold text-gray-900 mb-3">Órdenes Recientes</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {purchaseOrders
                  .filter(o => o.supplier_id === selectedSupplier.id)
                  .slice(0, 10)
                  .map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{order.code}</p>
                        <p className="text-xs text-gray-500">
                          {order.order_date && format(parseISO(order.order_date), 'dd MMM yyyy', { locale: es })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(order.total || 0)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          order.status === 'received' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                }
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setSelectedSupplier(null)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => { handleOpenEdit(selectedSupplier); setSelectedSupplier(null); }}
                  className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700"
                >
                  ✏️ Editar Proveedor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
