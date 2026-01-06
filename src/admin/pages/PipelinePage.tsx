/**
 * Pipeline Page - Página del pipeline Kanban de leads
 */

import React, { useState, useEffect } from 'react';
import { PipelineKanban } from '../components/PipelineKanban';
import { usePipelineStore, PIPELINE_STAGES } from '../store/pipelineStore';
import { NewLeadModal } from '../components/NewLeadModal';

export const PipelinePage: React.FC = () => {
  const { leads, fetchLeads, isLoading } = usePipelineStore();
  const [showNewLead, setShowNewLead] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);
  
  // Stats
  const totalLeads = leads.length;
  const totalValue = leads.reduce((sum, l) => sum + (l.presupuesto_estimado || 0), 0);
  const newLeadsToday = leads.filter((l) => {
    const today = new Date().toDateString();
    return new Date(l.created_at).toDateString() === today;
  }).length;
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pipeline de Ventas</h1>
            <p className="text-gray-500">Gestiona tus leads a través del embudo de ventas</p>
          </div>
          
          <button
            onClick={() => setShowNewLead(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Lead
          </button>
        </div>
        
        {/* Stats Bar */}
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Total:</span>
            <span className="font-semibold">{totalLeads} leads</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Valor pipeline:</span>
            <span className="font-semibold text-amber-600">
              ${totalValue.toLocaleString('es-UY')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Nuevos hoy:</span>
            <span className="font-semibold text-green-600">{newLeadsToday}</span>
          </div>
        </div>
        
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar leads..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Kanban
              </span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Lista
              </span>
            </button>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-3 text-gray-500">
              <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Cargando pipeline...
            </div>
          </div>
        ) : viewMode === 'kanban' ? (
          <PipelineKanban />
        ) : (
          <LeadsList leads={leads} searchQuery={searchQuery} />
        )}
      </div>
      
      {/* New Lead Modal */}
      {showNewLead && (
        <NewLeadModal onClose={() => setShowNewLead(false)} />
      )}
    </div>
  );
};

// List View Component
const LeadsList: React.FC<{ leads: any[]; searchQuery: string }> = ({ leads, searchQuery }) => {
  const { selectLead } = usePipelineStore();
  
  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      lead.nombre.toLowerCase().includes(q) ||
      lead.email?.toLowerCase().includes(q) ||
      lead.telefono?.includes(q) ||
      lead.zona?.toLowerCase().includes(q)
    );
  });
  
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Nombre</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Contacto</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Tipo</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Presupuesto</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Estado</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Origen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLeads.map((lead) => {
              const stage = PIPELINE_STAGES.find((s) => s.id === lead.estado);
              return (
                <tr
                  key={lead.id}
                  onClick={() => selectLead(lead.id)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{lead.nombre}</span>
                    {lead.zona && (
                      <span className="text-sm text-gray-500 block">{lead.zona}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {lead.telefono && <div>{lead.telefono}</div>}
                    {lead.email && <div className="text-gray-400">{lead.email}</div>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                    {lead.tipo_obra?.replace('_', ' ') || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-amber-600">
                    {lead.presupuesto_estimado
                      ? `$${lead.presupuesto_estimado.toLocaleString('es-UY')}`
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${stage?.color || 'bg-gray-500'}`}>
                      {stage?.label || lead.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                    {lead.origen}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredLeads.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchQuery ? 'No se encontraron leads' : 'Sin leads'}
          </div>
        )}
      </div>
    </div>
  );
};
