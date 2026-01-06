/**
 * Clientes Page - Gestión de clientes
 */

import React, { useState, useMemo } from 'react';
import { useCrmStore } from '../store/crmStore';
import type { Cliente } from '../store/crmStore';

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

type EstadoCliente = Cliente['estado'];

const estadoColors: Record<EstadoCliente, { bg: string; text: string }> = {
  activo: { bg: 'bg-green-100', text: 'text-green-700' },
  inactivo: { bg: 'bg-gray-100', text: 'text-gray-700' },
  potencial: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

const estadoLabels: Record<EstadoCliente, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  potencial: 'Potencial',
};

export const ClientesPage: React.FC = () => {
  const { clientes, obras, addCliente, updateCliente, deleteCliente, addNota } = useCrmStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoCliente | 'todos'>('todos');
  const [showModal, setShowModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newNote, setNewNote] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    cuit: '',
    estado: 'potencial' as EstadoCliente,
  });

  const filteredClientes = useMemo(() => {
    return clientes.filter((cliente) => {
      const matchesSearch =
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.telefono.includes(searchTerm) ||
        (cliente.cuit && cliente.cuit.includes(searchTerm));
      const matchesEstado = estadoFilter === 'todos' || cliente.estado === estadoFilter;
      return matchesSearch && matchesEstado;
    });
  }, [clientes, searchTerm, estadoFilter]);

  const getClienteObras = (clienteId: string) => {
    return obras.filter(o => o.clienteId === clienteId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCliente) {
      updateCliente(selectedCliente.id, formData);
    } else {
      addCliente(formData);
    }
    closeModal();
  };

  const openModal = (cliente?: Cliente) => {
    if (cliente) {
      setSelectedCliente(cliente);
      setFormData({
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono,
        direccion: cliente.direccion || '',
        cuit: cliente.cuit || '',
        estado: cliente.estado,
      });
    } else {
      setSelectedCliente(null);
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        direccion: '',
        cuit: '',
        estado: 'potencial',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCliente(null);
  };

  const openDetailModal = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setShowDetailModal(true);
  };

  const handleAddNote = () => {
    if (selectedCliente && newNote.trim()) {
      addNota(selectedCliente.id, newNote.trim(), 'clientes');
      setNewNote('');
    }
  };

  const handleDelete = (id: string) => {
    const clienteObras = getClienteObras(id);
    if (clienteObras.length > 0) {
      alert(`No se puede eliminar. Este cliente tiene ${clienteObras.length} obra(s) asociada(s).`);
      return;
    }
    if (confirm('¿Eliminar este cliente?')) {
      deleteCliente(id);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500">Gestiona tu cartera de clientes</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <PlusIcon />
          Nuevo Cliente
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, email, teléfono o CUIT..."
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
            onChange={(e) => setEstadoFilter(e.target.value as EstadoCliente | 'todos')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="todos">Todos los estados</option>
            {Object.entries(estadoLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(estadoLabels).map(([estado, label]) => {
          const count = clientes.filter(c => c.estado === estado).length;
          const colors = estadoColors[estado as EstadoCliente];
          return (
            <button
              key={estado}
              onClick={() => setEstadoFilter(estadoFilter === estado ? 'todos' : estado as EstadoCliente)}
              className={`p-4 rounded-lg text-center transition-all ${
                estadoFilter === estado ? `${colors.bg} ${colors.text} ring-2 ring-offset-2` : 'bg-white hover:bg-gray-50'
              }`}
            >
              <p className="text-3xl font-bold">{count}</p>
              <p className="text-sm">{label}</p>
            </button>
          );
        })}
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClientes.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No se encontraron clientes
          </div>
        ) : (
          filteredClientes.map((cliente) => {
            const clienteObras = getClienteObras(cliente.id);
            const totalObras = clienteObras.reduce((acc, o) => acc + o.presupuesto, 0);
            return (
              <div key={cliente.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold">
                        {cliente.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{cliente.nombre}</h3>
                        <p className="text-sm text-gray-500">{cliente.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${estadoColors[cliente.estado].bg} ${estadoColors[cliente.estado].text}`}>
                      {estadoLabels[cliente.estado]}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{cliente.telefono}</span>
                  </div>
                  {cliente.direccion && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{cliente.direccion}</span>
                    </div>
                  )}
                  {cliente.cuit && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>CUIT: {cliente.cuit}</span>
                    </div>
                  )}

                  {/* Resumen de obras */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Obras: {clienteObras.length}</span>
                      <span className="font-medium text-amber-600">{formatCurrency(totalObras)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => openDetailModal(cliente)}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Ver detalles
                  </button>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openModal(cliente)}
                      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(cliente.id)}
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

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">
                {selectedCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CUIT</label>
                <input
                  type="text"
                  value={formData.cuit}
                  onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="XX-XXXXXXXX-X"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoCliente })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  {Object.entries(estadoLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
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
                  {selectedCliente ? 'Guardar Cambios' : 'Crear Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {showDetailModal && selectedCliente && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xl">
                  {selectedCliente.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{selectedCliente.nombre}</h2>
                  <p className="text-sm text-gray-500">Cliente desde {formatDate(selectedCliente.fechaCreacion)}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Info */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Información de Contacto</h3>
                <div className="space-y-2">
                  <p className="text-sm"><span className="text-gray-500">Email:</span> {selectedCliente.email}</p>
                  <p className="text-sm"><span className="text-gray-500">Teléfono:</span> {selectedCliente.telefono}</p>
                  {selectedCliente.direccion && (
                    <p className="text-sm"><span className="text-gray-500">Dirección:</span> {selectedCliente.direccion}</p>
                  )}
                  {selectedCliente.cuit && (
                    <p className="text-sm"><span className="text-gray-500">CUIT:</span> {selectedCliente.cuit}</p>
                  )}
                </div>
              </div>

              {/* Obras */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Obras ({getClienteObras(selectedCliente.id).length})</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {getClienteObras(selectedCliente.id).length === 0 ? (
                    <p className="text-sm text-gray-500">Sin obras registradas</p>
                  ) : (
                    getClienteObras(selectedCliente.id).map((obra) => (
                      <div key={obra.id} className="p-2 bg-gray-50 rounded-lg">
                        <p className="font-medium text-sm">{obra.nombre}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(obra.presupuesto)} - {obra.progreso}%</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="p-4 border-t border-gray-100">
              <h3 className="font-medium text-gray-900 mb-3">Notas</h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Agregar una nota..."
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  Agregar
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedCliente.notas && selectedCliente.notas.length > 0 ? (
                  selectedCliente.notas.map((nota) => (
                    <div key={nota.id} className="p-2 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{nota.texto}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(nota.fecha)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Sin notas</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
