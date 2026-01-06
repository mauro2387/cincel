/**
 * Cotizaciones Page - Gestión de cotizaciones/presupuestos
 */

import React, { useState, useMemo } from 'react';
import { useCrmStore } from '../store/crmStore';
import type { Cotizacion } from '../store/crmStore';

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

type EstadoCotizacion = Cotizacion['estado'];

const estadoColors: Record<EstadoCotizacion, { bg: string; text: string }> = {
  borrador: { bg: 'bg-gray-100', text: 'text-gray-700' },
  enviada: { bg: 'bg-blue-100', text: 'text-blue-700' },
  pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  aprobada: { bg: 'bg-green-100', text: 'text-green-700' },
  rechazada: { bg: 'bg-red-100', text: 'text-red-700' },
};

const estadoLabels: Record<EstadoCotizacion, string> = {
  borrador: 'Borrador',
  enviada: 'Enviada',
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
};

interface ItemCotizacion {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

export const CotizacionesPage: React.FC = () => {
  const { cotizaciones, clientes, addCotizacion, updateCotizacion, deleteCotizacion } = useCrmStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoCotizacion | 'todos'>('todos');
  const [showModal, setShowModal] = useState(false);
  const [selectedCotizacion, setSelectedCotizacion] = useState<Cotizacion | null>(null);

  const [formData, setFormData] = useState({
    clienteId: '',
    titulo: '',
    descripcion: '',
    validezDias: 30,
    items: [{ descripcion: '', cantidad: 1, precioUnitario: 0 }] as ItemCotizacion[],
  });

  const filteredCotizaciones = useMemo(() => {
    return cotizaciones.filter((cotizacion) => {
      const cliente = clientes.find(c => c.id === cotizacion.clienteId);
      const matchesSearch =
        cotizacion.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cotizacion.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEstado = estadoFilter === 'todos' || cotizacion.estado === estadoFilter;
      return matchesSearch && matchesEstado;
    });
  }, [cotizaciones, clientes, searchTerm, estadoFilter]);

  const calcularTotal = (items: ItemCotizacion[]) => {
    return items.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = calcularTotal(formData.items);
    
    if (selectedCotizacion) {
      updateCotizacion(selectedCotizacion.id, {
        ...formData,
        total,
      });
    } else {
      addCotizacion({
        ...formData,
        total,
      });
    }
    closeModal();
  };

  const openModal = (cotizacion?: Cotizacion) => {
    if (cotizacion) {
      setSelectedCotizacion(cotizacion);
      setFormData({
        clienteId: cotizacion.clienteId,
        titulo: cotizacion.titulo,
        descripcion: cotizacion.descripcion || '',
        validezDias: cotizacion.validezDias,
        items: cotizacion.items.length > 0 ? cotizacion.items : [{ descripcion: '', cantidad: 1, precioUnitario: 0 }],
      });
    } else {
      setSelectedCotizacion(null);
      setFormData({
        clienteId: '',
        titulo: '',
        descripcion: '',
        validezDias: 30,
        items: [{ descripcion: '', cantidad: 1, precioUnitario: 0 }],
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCotizacion(null);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { descripcion: '', cantidad: 1, precioUnitario: 0 }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: keyof ItemCotizacion, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta cotización?')) {
      deleteCotizacion(id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  // Totales
  const totalPendiente = cotizaciones
    .filter(c => c.estado === 'pendiente' || c.estado === 'enviada')
    .reduce((acc, c) => acc + c.total, 0);
  const totalAprobado = cotizaciones
    .filter(c => c.estado === 'aprobada')
    .reduce((acc, c) => acc + c.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cotizaciones</h1>
          <p className="text-gray-500">Gestiona tus presupuestos y propuestas</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <PlusIcon />
          Nueva Cotización
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">Total Cotizaciones</p>
          <p className="text-2xl font-bold text-gray-900">{cotizaciones.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPendiente)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">Aprobadas</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalAprobado)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por número, título o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
          </div>
          
          {/* Estado Filter */}
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value as EstadoCotizacion | 'todos')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="todos">Todos los estados</option>
            {Object.entries(estadoLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Número</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Título</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Cliente</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Total</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Estado</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Fecha</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCotizaciones.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No se encontraron cotizaciones
                  </td>
                </tr>
              ) : (
                filteredCotizaciones.map((cotizacion) => {
                  const cliente = clientes.find(c => c.id === cotizacion.clienteId);
                  return (
                    <tr key={cotizacion.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm font-medium text-gray-900">{cotizacion.numero}</span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900">{cotizacion.titulo}</p>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{cliente?.nombre || 'N/A'}</td>
                      <td className="px-4 py-4 font-medium text-gray-900">{formatCurrency(cotizacion.total)}</td>
                      <td className="px-4 py-4">
                        <select
                          value={cotizacion.estado}
                          onChange={(e) => updateCotizacion(cotizacion.id, { estado: e.target.value as EstadoCotizacion })}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${estadoColors[cotizacion.estado].bg} ${estadoColors[cotizacion.estado].text}`}
                        >
                          {Object.entries(estadoLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">{formatDate(cotizacion.fechaCreacion)}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(cotizacion)}
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(cotizacion.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">
                {selectedCotizacion ? 'Editar Cotización' : 'Nueva Cotización'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                  <select
                    value={formData.clienteId}
                    onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Ej: Presupuesto construcción casa"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Validez (días)</label>
                  <input
                    type="number"
                    value={formData.validezDias}
                    onChange={(e) => setFormData({ ...formData, validezDias: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    min={1}
                  />
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Items</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-sm text-amber-600 hover:text-amber-700"
                  >
                    + Agregar item
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={item.descripcion}
                        onChange={(e) => updateItem(index, 'descripcion', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Descripción"
                        required
                      />
                      <input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) => updateItem(index, 'cantidad', Number(e.target.value))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Cant."
                        min={1}
                        required
                      />
                      <input
                        type="number"
                        value={item.precioUnitario}
                        onChange={(e) => updateItem(index, 'precioUnitario', Number(e.target.value))}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Precio"
                        min={0}
                        required
                      />
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <span className="font-medium text-gray-700">Total</span>
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(calcularTotal(formData.items))}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  {selectedCotizacion ? 'Guardar Cambios' : 'Crear Cotización'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
