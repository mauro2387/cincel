/**
 * Presupuestos Page - Página de gestión de presupuestos
 */

import React, { useState, useEffect } from 'react';
import { 
  usePresupuestosStore, 
  type LocalPresupuesto, 
  type PresupuestoItem 
} from '../store/presupuestosStore';
import { usePipelineStore } from '../store/pipelineStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ESTADO_COLORS: Record<string, string> = {
  borrador: 'bg-gray-100 text-gray-700',
  enviado: 'bg-blue-100 text-blue-700',
  aceptado: 'bg-green-100 text-green-700',
  rechazado: 'bg-red-100 text-red-700',
  vencido: 'bg-yellow-100 text-yellow-700',
};

const ESTADO_LABELS: Record<string, string> = {
  borrador: 'Borrador',
  enviado: 'Enviado',
  aceptado: 'Aceptado',
  rechazado: 'Rechazado',
  vencido: 'Vencido',
};

export const PresupuestosPageV2: React.FC = () => {
  const { presupuestos, fetchPresupuestos, deletePresupuesto, duplicatePresupuesto } = usePresupuestosStore();
  const { leads } = usePipelineStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPresupuesto, setEditingPresupuesto] = useState<LocalPresupuesto | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  useEffect(() => {
    fetchPresupuestos();
  }, [fetchPresupuestos]);
  
  const filteredPresupuestos = presupuestos.filter((p) => {
    if (filterEstado && p.estado !== filterEstado) return false;
    if (!searchQuery) return true;
    
    const q = searchQuery.toLowerCase();
    return (
      p.titulo.toLowerCase().includes(q) ||
      p.numero.toLowerCase().includes(q) ||
      p.descripcion?.toLowerCase().includes(q)
    );
  });
  
  // Stats
  const stats = {
    total: presupuestos.length,
    borradores: presupuestos.filter((p) => p.estado === 'borrador').length,
    enviados: presupuestos.filter((p) => p.estado === 'enviado').length,
    aceptados: presupuestos.filter((p) => p.estado === 'aceptado').length,
    valorTotal: presupuestos
      .filter((p) => p.estado === 'aceptado')
      .reduce((sum, p) => sum + p.total, 0),
  };
  
  const handleEdit = (presupuesto: LocalPresupuesto) => {
    setEditingPresupuesto(presupuesto);
    setShowEditor(true);
  };
  
  const handleNew = () => {
    setEditingPresupuesto(null);
    setShowEditor(true);
  };
  
  const handleDuplicate = async (id: string) => {
    const newId = await duplicatePresupuesto(id);
    if (newId) {
      const newPresupuesto = presupuestos.find((p) => p.id === newId);
      if (newPresupuesto) {
        handleEdit(newPresupuesto);
      }
    }
  };
  
  const handleDelete = async (id: string) => {
    await deletePresupuesto(id);
    setShowDeleteConfirm(null);
  };
  
  const getLeadName = (leadId: string | null) => {
    if (!leadId) return null;
    const lead = leads.find((l) => l.id === leadId);
    return lead?.nombre;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Presupuestos</h1>
          <p className="text-gray-500">Gestiona tus cotizaciones y presupuestos</p>
        </div>
        
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Presupuesto
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Borradores</p>
          <p className="text-2xl font-bold text-gray-600">{stats.borradores}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Enviados</p>
          <p className="text-2xl font-bold text-blue-600">{stats.enviados}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Aceptados</p>
          <p className="text-2xl font-bold text-green-600">{stats.aceptados}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Valor Aceptados</p>
          <p className="text-2xl font-bold text-amber-600">
            ${stats.valorTotal.toLocaleString('es-UY')}
          </p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar presupuestos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        >
          <option value="">Todos los estados</option>
          <option value="borrador">Borrador</option>
          <option value="enviado">Enviado</option>
          <option value="aceptado">Aceptado</option>
          <option value="rechazado">Rechazado</option>
          <option value="vencido">Vencido</option>
        </select>
      </div>
      
      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Número</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Título</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Lead/Cliente</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Total</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Estado</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Fecha</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPresupuestos.map((presupuesto) => (
              <tr key={presupuesto.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-mono text-sm text-gray-600">
                    {presupuesto.numero}
                  </span>
                  {presupuesto.version > 1 && (
                    <span className="ml-1 text-xs text-gray-400">v{presupuesto.version}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900">{presupuesto.titulo}</span>
                  {presupuesto.descripcion && (
                    <p className="text-sm text-gray-500 truncate max-w-xs">
                      {presupuesto.descripcion}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {getLeadName(presupuesto.lead_id) || '-'}
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-amber-600">
                    ${presupuesto.total.toLocaleString('es-UY', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${ESTADO_COLORS[presupuesto.estado]}`}>
                    {ESTADO_LABELS[presupuesto.estado]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {format(new Date(presupuesto.created_at), 'dd/MM/yyyy', { locale: es })}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleEdit(presupuesto)}
                      className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDuplicate(presupuesto.id)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Duplicar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Descargar PDF"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(presupuesto.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredPresupuestos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchQuery || filterEstado ? 'No se encontraron presupuestos' : 'Sin presupuestos'}
          </div>
        )}
      </div>
      
      {/* Editor Modal */}
      {showEditor && (
        <PresupuestoEditor
          presupuesto={editingPresupuesto}
          onClose={() => {
            setShowEditor(false);
            setEditingPresupuesto(null);
          }}
        />
      )}
      
      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Eliminar presupuesto?</h3>
            <p className="text-gray-600 mb-4">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Presupuesto Editor Component
interface PresupuestoEditorProps {
  presupuesto: LocalPresupuesto | null;
  onClose: () => void;
}

const PresupuestoEditor: React.FC<PresupuestoEditorProps> = ({ presupuesto, onClose }) => {
  const { addPresupuesto, updatePresupuesto, calculateTotals } = usePresupuestosStore();
  const { leads } = usePipelineStore();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    lead_id: presupuesto?.lead_id || '',
    titulo: presupuesto?.titulo || '',
    descripcion: presupuesto?.descripcion || '',
    items: presupuesto?.items || [] as PresupuestoItem[],
    iva_porcentaje: presupuesto?.iva_porcentaje || 22,
    validez_dias: presupuesto?.validez_dias || 30,
    condiciones: presupuesto?.condiciones || 'Forma de pago: 50% anticipo, 50% contra entrega.\nPlazo de ejecución: A convenir.',
    notas_internas: presupuesto?.notas_internas || '',
    estado: presupuesto?.estado || 'borrador',
  });
  
  const totals = calculateTotals(formData.items, formData.iva_porcentaje);
  
  const handleAddItem = () => {
    const newItem: PresupuestoItem = {
      id: crypto.randomUUID(),
      categoria: 'mano_obra',
      rubro: '',
      descripcion: '',
      unidad: 'global',
      cantidad: 1,
      precio_unitario: 0,
      subtotal: 0,
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };
  
  const handleUpdateItem = (id: string, updates: Partial<PresupuestoItem>) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== id) return item;
        
        const updated = { ...item, ...updates };
        updated.subtotal = updated.cantidad * updated.precio_unitario;
        return updated;
      }),
    }));
  };
  
  const handleRemoveItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const data = {
        lead_id: formData.lead_id || null,
        cliente_id: null,
        obra_id: null,
        titulo: formData.titulo,
        descripcion: formData.descripcion || null,
        items: formData.items,
        ...totals,
        iva_porcentaje: formData.iva_porcentaje,
        validez_dias: formData.validez_dias,
        condiciones: formData.condiciones || null,
        notas_internas: formData.notas_internas || null,
        estado: formData.estado as 'borrador' | 'enviado' | 'aceptado' | 'rechazado' | 'vencido',
        pdf_url: null,
        created_by: 'demo-1',
        version: presupuesto?.version || 1,
      };
      
      if (presupuesto) {
        await updatePresupuesto(presupuesto.id, data);
      } else {
        await addPresupuesto(data);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving presupuesto:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-amber-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {presupuesto ? `Editar ${presupuesto.numero}` : 'Nuevo Presupuesto'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, titulo: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Ej: Reforma Baño - Juan Pérez"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Asociado
                </label>
                <select
                  value={formData.lead_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lead_id: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Sin asociar</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Descripción general del trabajo..."
                />
              </div>
            </div>
            
            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Items del Presupuesto</h3>
                <button
                  onClick={handleAddItem}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar Item
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Categoría</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Rubro</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Descripción</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600 w-20">Unidad</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600 w-20">Cant.</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600 w-28">P. Unit.</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600 w-28">Subtotal</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData.items.map((item) => (
                      <tr key={item.id} className="bg-white">
                        <td className="px-2 py-2">
                          <select
                            value={item.categoria}
                            onChange={(e) => handleUpdateItem(item.id, { 
                              categoria: e.target.value as PresupuestoItem['categoria'] 
                            })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-amber-500"
                          >
                            <option value="mano_obra">Mano de Obra</option>
                            <option value="materiales">Materiales</option>
                            <option value="viaticos">Viáticos</option>
                            <option value="otros">Otros</option>
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={item.rubro}
                            onChange={(e) => handleUpdateItem(item.id, { rubro: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-amber-500"
                            placeholder="Rubro"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={item.descripcion}
                            onChange={(e) => handleUpdateItem(item.id, { descripcion: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-amber-500"
                            placeholder="Descripción"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={item.unidad}
                            onChange={(e) => handleUpdateItem(item.id, { unidad: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-amber-500"
                            placeholder="un"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={item.cantidad}
                            onChange={(e) => handleUpdateItem(item.id, { cantidad: Number(e.target.value) })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-1 focus:ring-amber-500"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={item.precio_unitario}
                            onChange={(e) => handleUpdateItem(item.id, { precio_unitario: Number(e.target.value) })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-1 focus:ring-amber-500"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-2 py-2 text-right font-medium">
                          ${item.subtotal.toLocaleString('es-UY', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-2 py-2">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {formData.items.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    Haz clic en "Agregar Item" para comenzar
                  </div>
                )}
              </div>
            </div>
            
            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-80 bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mano de Obra:</span>
                  <span>${totals.subtotal_mano_obra.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Materiales:</span>
                  <span>${totals.subtotal_materiales.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Viáticos:</span>
                  <span>${totals.subtotal_viaticos.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</span>
                </div>
                {totals.subtotal_otros > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Otros:</span>
                    <span>${totals.subtotal_otros.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 flex justify-between text-sm">
                  <span className="text-gray-600">IVA ({formData.iva_porcentaje}%):</span>
                  <span>${totals.iva_monto.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-lg">
                  <span>TOTAL:</span>
                  <span className="text-amber-600">${totals.total.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
            
            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IVA (%)
                </label>
                <input
                  type="number"
                  value={formData.iva_porcentaje}
                  onChange={(e) => setFormData((prev) => ({ ...prev, iva_porcentaje: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  min="0"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validez (días)
                </label>
                <input
                  type="number"
                  value={formData.validez_dias}
                  onChange={(e) => setFormData((prev) => ({ ...prev, validez_dias: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData((prev) => ({ ...prev, estado: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="borrador">Borrador</option>
                  <option value="enviado">Enviado</option>
                  <option value="aceptado">Aceptado</option>
                  <option value="rechazado">Rechazado</option>
                  <option value="vencido">Vencido</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condiciones y Términos
              </label>
              <textarea
                value={formData.condiciones}
                onChange={(e) => setFormData((prev) => ({ ...prev, condiciones: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                placeholder="Condiciones de pago, plazos, garantías..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas Internas (no se muestran al cliente)
              </label>
              <textarea
                value={formData.notas_internas}
                onChange={(e) => setFormData((prev) => ({ ...prev, notas_internas: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                placeholder="Notas internas del equipo..."
              />
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-500">
            {presupuesto && `Última modificación: ${format(new Date(presupuesto.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}`}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.titulo}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
