/**
 * Leads Page - Gestión de leads/prospectos
 */

import React, { useState, useMemo } from 'react';
import { useCrmStore } from '../store/crmStore';
import type { Lead } from '../store/crmStore';

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

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

type EstadoLead = Lead['estado'];

const estadoColors: Record<EstadoLead, { bg: string; text: string }> = {
  nuevo: { bg: 'bg-blue-100', text: 'text-blue-700' },
  contactado: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  en_negociacion: { bg: 'bg-purple-100', text: 'text-purple-700' },
  convertido: { bg: 'bg-green-100', text: 'text-green-700' },
  perdido: { bg: 'bg-red-100', text: 'text-red-700' },
};

const estadoLabels: Record<EstadoLead, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  en_negociacion: 'En Negociación',
  convertido: 'Convertido',
  perdido: 'Perdido',
};

export const LeadsPage: React.FC = () => {
  const { leads, addLead, updateLead, deleteLead, addNota, convertLeadToCliente } = useCrmStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoLead | 'todos'>('todos');
  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tipoProyecto: '',
    presupuestoEstimado: '',
    mensaje: '',
    origen: 'web' as Lead['origen'],
  });

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.telefono.includes(searchTerm);
      const matchesEstado = estadoFilter === 'todos' || lead.estado === estadoFilter;
      return matchesSearch && matchesEstado;
    });
  }, [leads, searchTerm, estadoFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLead) {
      updateLead(selectedLead.id, {
        ...formData,
        presupuestoEstimado: Number(formData.presupuestoEstimado) || undefined,
      });
    } else {
      addLead({
        ...formData,
        presupuestoEstimado: Number(formData.presupuestoEstimado) || undefined,
      });
    }
    closeModal();
  };

  const openModal = (lead?: Lead) => {
    if (lead) {
      setSelectedLead(lead);
      setFormData({
        nombre: lead.nombre,
        email: lead.email,
        telefono: lead.telefono,
        tipoProyecto: lead.tipoProyecto,
        presupuestoEstimado: lead.presupuestoEstimado?.toString() || '',
        mensaje: lead.mensaje || '',
        origen: lead.origen,
      });
    } else {
      setSelectedLead(null);
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        tipoProyecto: '',
        presupuestoEstimado: '',
        mensaje: '',
        origen: 'web',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLead(null);
  };

  const handleAddNote = () => {
    if (selectedLead && newNote.trim()) {
      addNota(selectedLead.id, newNote.trim(), 'leads');
      setNewNote('');
      setShowNoteModal(false);
    }
  };

  const handleConvert = (lead: Lead) => {
    if (confirm(`¿Convertir a ${lead.nombre} en cliente?`)) {
      convertLeadToCliente(lead.id);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este lead?')) {
      deleteLead(id);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
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
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500">Gestiona tus prospectos y oportunidades</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <PlusIcon />
          Nuevo Lead
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <SearchIcon />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
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
            onChange={(e) => setEstadoFilter(e.target.value as EstadoLead | 'todos')}
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {Object.entries(estadoLabels).map(([estado, label]) => {
          const count = leads.filter(l => l.estado === estado).length;
          const colors = estadoColors[estado as EstadoLead];
          return (
            <button
              key={estado}
              onClick={() => setEstadoFilter(estadoFilter === estado ? 'todos' : estado as EstadoLead)}
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Lead</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Contacto</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Proyecto</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Presupuesto</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Estado</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Fecha</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No se encontraron leads
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{lead.nombre}</p>
                      <p className="text-sm text-gray-400">{lead.origen}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MailIcon />
                        <span>{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <PhoneIcon />
                        <span>{lead.telefono}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{lead.tipoProyecto}</td>
                    <td className="px-4 py-4 text-gray-600">{formatCurrency(lead.presupuestoEstimado)}</td>
                    <td className="px-4 py-4">
                      <select
                        value={lead.estado}
                        onChange={(e) => updateLead(lead.id, { estado: e.target.value as EstadoLead })}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${estadoColors[lead.estado].bg} ${estadoColors[lead.estado].text}`}
                      >
                        {Object.entries(estadoLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">{formatDate(lead.fechaCreacion)}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(lead)}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowNoteModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Agregar nota"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                        </button>
                        {lead.estado !== 'convertido' && lead.estado !== 'perdido' && (
                          <button
                            onClick={() => handleConvert(lead)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Convertir a cliente"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">
                {selectedLead ? 'Editar Lead' : 'Nuevo Lead'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Proyecto *</label>
                <select
                  value={formData.tipoProyecto}
                  onChange={(e) => setFormData({ ...formData, tipoProyecto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="Construcción Residencial">Construcción Residencial</option>
                  <option value="Construcción Comercial">Construcción Comercial</option>
                  <option value="Reforma">Reforma</option>
                  <option value="Remodelación">Remodelación</option>
                  <option value="Ampliación">Ampliación</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Presupuesto Estimado</label>
                <input
                  type="number"
                  value={formData.presupuestoEstimado}
                  onChange={(e) => setFormData({ ...formData, presupuestoEstimado: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="$"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
                <select
                  value={formData.origen}
                  onChange={(e) => setFormData({ ...formData, origen: e.target.value as Lead['origen'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="web">Web</option>
                  <option value="telefono">Teléfono</option>
                  <option value="referido">Referido</option>
                  <option value="redes_sociales">Redes Sociales</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <textarea
                  value={formData.mensaje}
                  onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  rows={3}
                />
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
                  {selectedLead ? 'Guardar Cambios' : 'Crear Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nota */}
      {showNoteModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Agregar Nota</h2>
              <p className="text-sm text-gray-500">{selectedLead.nombre}</p>
            </div>
            <div className="p-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                rows={4}
                placeholder="Escribe una nota..."
                autoFocus
              />
              
              {/* Notas existentes */}
              {selectedLead.notas && selectedLead.notas.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Notas anteriores:</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedLead.notas.map((nota) => (
                      <div key={nota.id} className="p-2 bg-gray-50 rounded-lg text-sm">
                        <p className="text-gray-700">{nota.texto}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(nota.fecha)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowNoteModal(false);
                    setNewNote('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  Guardar Nota
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
