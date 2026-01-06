/**
 * Obras Page - Gestión de obras/proyectos
 */

import React, { useState, useMemo } from 'react';
import { useCrmStore } from '../store/crmStore';
import type { Obra } from '../store/crmStore';

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

type EstadoObra = Obra['estado'];

const estadoColors: Record<EstadoObra, { bg: string; text: string }> = {
  planificacion: { bg: 'bg-gray-100', text: 'text-gray-700' },
  en_progreso: { bg: 'bg-amber-100', text: 'text-amber-700' },
  pausada: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  completada: { bg: 'bg-green-100', text: 'text-green-700' },
  cancelada: { bg: 'bg-red-100', text: 'text-red-700' },
};

const estadoLabels: Record<EstadoObra, string> = {
  planificacion: 'Planificación',
  en_progreso: 'En Progreso',
  pausada: 'Pausada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

export const ObrasPage: React.FC = () => {
  const { obras, clientes, addObra, updateObra, deleteObra } = useCrmStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoObra | 'todos'>('todos');
  const [showModal, setShowModal] = useState(false);
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [formData, setFormData] = useState({
    nombre: '',
    clienteId: '',
    direccion: '',
    tipo: '',
    presupuesto: '',
    fechaInicio: '',
    fechaFinEstimada: '',
    descripcion: '',
    progreso: 0,
    estado: 'planificacion' as EstadoObra,
  });

  const filteredObras = useMemo(() => {
    return obras.filter((obra) => {
      const cliente = clientes.find(c => c.id === obra.clienteId);
      const matchesSearch =
        obra.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obra.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEstado = estadoFilter === 'todos' || obra.estado === estadoFilter;
      return matchesSearch && matchesEstado;
    });
  }, [obras, clientes, searchTerm, estadoFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const obraData = {
      ...formData,
      presupuesto: Number(formData.presupuesto) || 0,
      fechaInicio: new Date(formData.fechaInicio),
      fechaFinEstimada: formData.fechaFinEstimada ? new Date(formData.fechaFinEstimada) : undefined,
    };

    if (selectedObra) {
      updateObra(selectedObra.id, obraData);
    } else {
      addObra(obraData);
    }
    closeModal();
  };

  const openModal = (obra?: Obra) => {
    if (obra) {
      setSelectedObra(obra);
      setFormData({
        nombre: obra.nombre,
        clienteId: obra.clienteId,
        direccion: obra.direccion,
        tipo: obra.tipo,
        presupuesto: obra.presupuesto.toString(),
        fechaInicio: new Date(obra.fechaInicio).toISOString().split('T')[0],
        fechaFinEstimada: obra.fechaFinEstimada 
          ? new Date(obra.fechaFinEstimada).toISOString().split('T')[0] 
          : '',
        descripcion: obra.descripcion || '',
        progreso: obra.progreso,
        estado: obra.estado,
      });
    } else {
      setSelectedObra(null);
      setFormData({
        nombre: '',
        clienteId: '',
        direccion: '',
        tipo: '',
        presupuesto: '',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFinEstimada: '',
        descripcion: '',
        progreso: 0,
        estado: 'planificacion',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedObra(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta obra?')) {
      deleteObra(id);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Obras</h1>
          <p className="text-gray-500">Gestiona tus proyectos de construcción</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <PlusIcon />
          Nueva Obra
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, dirección o cliente..."
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
            onChange={(e) => setEstadoFilter(e.target.value as EstadoObra | 'todos')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="todos">Todos los estados</option>
            {Object.entries(estadoLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {/* View Mode */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-amber-100 text-amber-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 ${viewMode === 'table' ? 'bg-amber-100 text-amber-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {Object.entries(estadoLabels).map(([estado, label]) => {
          const count = obras.filter(o => o.estado === estado).length;
          const colors = estadoColors[estado as EstadoObra];
          return (
            <button
              key={estado}
              onClick={() => setEstadoFilter(estadoFilter === estado ? 'todos' : estado as EstadoObra)}
              className={`p-3 rounded-lg text-center transition-all ${
                estadoFilter === estado ? `${colors.bg} ${colors.text} ring-2 ring-offset-2` : 'bg-white hover:bg-gray-50'
              }`}
            >
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm">{label}</p>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredObras.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
              No se encontraron obras
            </div>
          ) : (
            filteredObras.map((obra) => {
              const cliente = clientes.find(c => c.id === obra.clienteId);
              return (
                <div key={obra.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{obra.nombre}</h3>
                        <p className="text-sm text-gray-500">{cliente?.nombre || 'Sin cliente'}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${estadoColors[obra.estado].bg} ${estadoColors[obra.estado].text}`}>
                        {estadoLabels[obra.estado]}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{obra.direccion}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span>{formatCurrency(obra.presupuesto)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(obra.fechaInicio)}</span>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500">Progreso</span>
                        <span className="font-medium">{obra.progreso}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            obra.progreso >= 100 ? 'bg-green-500' :
                            obra.progreso >= 50 ? 'bg-amber-500' :
                            'bg-blue-500'
                          }`}
                          style={{ width: `${obra.progreso}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={obra.progreso}
                      onChange={(e) => updateObra(obra.id, { progreso: Number(e.target.value) })}
                      className="w-24 h-1 accent-amber-600"
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => openModal(obra)}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(obra.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Obra</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Cliente</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Presupuesto</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Progreso</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Estado</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Inicio</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredObras.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No se encontraron obras
                    </td>
                  </tr>
                ) : (
                  filteredObras.map((obra) => {
                    const cliente = clientes.find(c => c.id === obra.clienteId);
                    return (
                      <tr key={obra.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-900">{obra.nombre}</p>
                          <p className="text-sm text-gray-500">{obra.direccion}</p>
                        </td>
                        <td className="px-4 py-4 text-gray-600">{cliente?.nombre || 'N/A'}</td>
                        <td className="px-4 py-4 text-gray-600">{formatCurrency(obra.presupuesto)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full"
                                style={{ width: `${obra.progreso}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{obra.progreso}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={obra.estado}
                            onChange={(e) => updateObra(obra.id, { estado: e.target.value as EstadoObra })}
                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${estadoColors[obra.estado].bg} ${estadoColors[obra.estado].text}`}
                          >
                            {Object.entries(estadoLabels).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">{formatDate(obra.fechaInicio)}</td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openModal(obra)}
                              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(obra.id)}
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
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">
                {selectedObra ? 'Editar Obra' : 'Nueva Obra'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Obra *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Obra *</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Construcción Residencial">Construcción Residencial</option>
                    <option value="Construcción Comercial">Construcción Comercial</option>
                    <option value="Reforma">Reforma</option>
                    <option value="Remodelación">Remodelación</option>
                    <option value="Ampliación">Ampliación</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Presupuesto *</label>
                  <input
                    type="number"
                    value={formData.presupuesto}
                    onChange={(e) => setFormData({ ...formData, presupuesto: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin Estimada</label>
                  <input
                    type="date"
                    value={formData.fechaFinEstimada}
                    onChange={(e) => setFormData({ ...formData, fechaFinEstimada: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                {selectedObra && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <select
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoObra })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      >
                        {Object.entries(estadoLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Progreso: {formData.progreso}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.progreso}
                        onChange={(e) => setFormData({ ...formData, progreso: Number(e.target.value) })}
                        className="w-full accent-amber-600"
                      />
                    </div>
                  </>
                )}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    rows={3}
                  />
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
                  {selectedObra ? 'Guardar Cambios' : 'Crear Obra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
