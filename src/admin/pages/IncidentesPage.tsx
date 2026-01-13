/**
 * IncidentesPage - Página de Gestión de Incidentes
 * Registro y seguimiento de incidentes de obra
 * Alineado con database.types.ts (setup_cos_completo.sql)
 */

import { useState, useEffect } from 'react';
import { 
  useIncidentsStore, 
  INCIDENT_TYPES, 
  INCIDENT_SEVERITIES, 
  INCIDENT_STATUSES,
  getTypeConfig,
  getSeverityConfig,
  getStatusConfig 
} from '../store/incidentsStore';
import { useObrasStore } from '../store/obrasStore';
import type { Incident, IncidentType, IncidentSeverity, IncidentStatus } from '../../lib/database.types';

export default function IncidentesPage() {
  const { 
    incidents, 
    fetchIncidents, 
    addIncident, 
    deleteIncident,
    resolveIncident,
    selectIncident,
    selectedIncidentId,
    getStats,
    isLoading 
  } = useIncidentsStore();
  const { obras } = useObrasStore();
  
  const [showNewModal, setShowNewModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterProject, setFilterProject] = useState<string>('');
  const [filterType, setFilterType] = useState<IncidentType | ''>('');
  const [filterSeverity, setFilterSeverity] = useState<IncidentSeverity | ''>('');
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | ''>('');
  
  // New incident form
  const [newIncident, setNewIncident] = useState({
    project_id: '',
    title: '',
    description: '',
    type: 'other' as IncidentType,
    severity: 'moderate' as IncidentSeverity,
    location: '',
    date_occurred: new Date().toISOString().slice(0, 16),
    witnesses: '',
    immediate_actions: '',
  });

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const filteredIncidents = incidents.filter((i: Incident) => {
    if (filterProject && i.project_id !== filterProject) return false;
    if (filterType && i.type !== filterType) return false;
    if (filterSeverity && i.severity !== filterSeverity) return false;
    if (filterStatus && i.status !== filterStatus) return false;
    return true;
  });

  const selectedIncident = incidents.find((i: Incident) => i.id === selectedIncidentId);
  const stats = getStats();

  const handleCreateIncident = async () => {
    if (!newIncident.title || !newIncident.project_id) return;
    
    await addIncident({
      project_id: newIncident.project_id,
      type: newIncident.type,
      severity: newIncident.severity,
      title: newIncident.title,
      description: newIncident.description,
      location: newIncident.location || null,
      date_occurred: new Date(newIncident.date_occurred).toISOString(),
      date_reported: new Date().toISOString(),
      reported_by: 'Usuario actual',
      witnesses: newIncident.witnesses || null,
      immediate_actions: newIncident.immediate_actions || null,
      root_cause: null,
      corrective_actions: null,
      preventive_actions: null,
      cost_impact: null,
      time_impact_days: null,
      status: 'reported',
      resolved_at: null,
      resolved_by: null,
      photos: [],
      attachments: [],
    });
    
    setNewIncident({
      project_id: '',
      title: '',
      description: '',
      type: 'other',
      severity: 'moderate',
      location: '',
      date_occurred: new Date().toISOString().slice(0, 16),
      witnesses: '',
      immediate_actions: '',
    });
    setShowNewModal(false);
  };

  const handleResolve = async () => {
    if (!selectedIncidentId) return;
    await resolveIncident(selectedIncidentId, 'admin-1');
    setShowDetailModal(false);
    selectIncident(null);
  };

  const getProjectName = (projectId: string) => {
    const obra = obras.find(o => o.id === projectId);
    return obra?.nombre || 'Proyecto no encontrado';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Incidentes</h1>
          <p className="text-gray-600">Registro y seguimiento de incidentes de obra</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <span>⚠️</span>
          Reportar Incidente
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
          <div className="text-sm text-gray-500">Abiertos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          <div className="text-sm text-gray-500">Críticos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-600">{stats.thisMonth}</div>
          <div className="text-sm text-gray-500">Este mes</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap gap-4">
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los proyectos</option>
            {obras.map(obra => (
              <option key={obra.id} value={obra.id}>{obra.nombre}</option>
            ))}
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as IncidentType | '')}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            {INCIDENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
          
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as IncidentSeverity | '')}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las severidades</option>
            {INCIDENT_SEVERITIES.map((sev) => (
              <option key={sev.value} value={sev.value}>
                {sev.icon} {sev.label}
              </option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as IncidentStatus | '')}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            {INCIDENT_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.icon} {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Incidents List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <span className="text-4xl mb-4 block">✅</span>
          <h3 className="text-lg font-medium text-gray-900">No hay incidentes</h3>
          <p className="text-gray-500">No se han reportado incidentes con los filtros seleccionados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIncidents.map((incident: Incident) => {
            const typeConfig = getTypeConfig(incident.type);
            const severityConfig = getSeverityConfig(incident.severity);
            const statusConfig = getStatusConfig(incident.status);
            return (
              <div 
                key={incident.id}
                className={`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer ${
                  incident.severity === 'critical' ? 'border-l-4 border-l-red-500' :
                  incident.severity === 'major' ? 'border-l-4 border-l-orange-500' : ''
                }`}
                onClick={() => {
                  selectIncident(incident.id);
                  setShowDetailModal(true);
                }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className={`p-2 rounded-lg ${typeConfig.color} text-white text-xl`}>
                      {typeConfig.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400">{incident.code}</span>
                        <span className={`px-2 py-0.5 text-xs rounded ${severityConfig.color} text-white`}>
                          {severityConfig.label}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded ${statusConfig.color} text-white`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                      <p className="text-sm text-gray-500">
                        {getProjectName(incident.project_id)} • {incident.location || 'Sin ubicación'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    <p>Ocurrió: {new Date(incident.date_occurred).toLocaleDateString('es-AR')}</p>
                    <p>Reportado: {new Date(incident.date_reported).toLocaleDateString('es-AR')}</p>
                  </div>
                </div>
                
                {incident.description && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">{incident.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Incident Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">Reportar Incidente</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto *</label>
                  <select
                    value={newIncident.project_id}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, project_id: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Seleccionar proyecto</option>
                    {obras.map(obra => (
                      <option key={obra.id} value={obra.id}>{obra.nombre}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                  <input
                    type="text"
                    value={newIncident.location}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Ej: Sector A - Nivel 2"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título del Incidente *</label>
                <input
                  type="text"
                  value={newIncident.title}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Breve descripción del incidente"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                  <select
                    value={newIncident.type}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, type: e.target.value as IncidentType }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    {INCIDENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severidad *</label>
                  <select
                    value={newIncident.severity}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, severity: e.target.value as IncidentSeverity }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    {INCIDENT_SEVERITIES.map((sev) => (
                      <option key={sev.value} value={sev.value}>
                        {sev.icon} {sev.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha/Hora *</label>
                  <input
                    type="datetime-local"
                    value={newIncident.date_occurred}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, date_occurred: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Detallada</label>
                <textarea
                  value={newIncident.description}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Describe qué sucedió, cómo, y cualquier detalle relevante..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Testigos (separados por coma)</label>
                <input
                  type="text"
                  value={newIncident.witnesses}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, witnesses: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Ej: Juan Pérez, María García"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acciones Inmediatas Tomadas</label>
                <textarea
                  value={newIncident.immediate_actions}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, immediate_actions: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  rows={2}
                  placeholder="¿Qué se hizo inmediatamente después del incidente?"
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
                onClick={handleCreateIncident}
                disabled={!newIncident.title || !newIncident.project_id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reportar Incidente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incident Detail Modal */}
      {showDetailModal && selectedIncident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <span className={`p-3 rounded-lg ${getTypeConfig(selectedIncident.type).color} text-white text-2xl`}>
                    {getTypeConfig(selectedIncident.type).icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono text-gray-400">{selectedIncident.code}</span>
                      <span className={`px-2 py-0.5 text-xs rounded ${getSeverityConfig(selectedIncident.severity).color} text-white`}>
                        {getSeverityConfig(selectedIncident.severity).label}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded ${getStatusConfig(selectedIncident.status).color} text-white`}>
                        {getStatusConfig(selectedIncident.status).label}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold">{selectedIncident.title}</h2>
                    <p className="text-gray-500">{getProjectName(selectedIncident.project_id)}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    selectIncident(null);
                  }}
                  className="p-2 hover:bg-gray-200 rounded-full"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Ubicación</p>
                  <p className="font-medium">{selectedIncident.location || 'No especificada'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Ocurrió</p>
                  <p className="font-medium">{new Date(selectedIncident.date_occurred).toLocaleString('es-AR')}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Reportado</p>
                  <p className="font-medium">{new Date(selectedIncident.date_reported).toLocaleString('es-AR')}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Reportado por</p>
                  <p className="font-medium">{selectedIncident.reported_by}</p>
                </div>
              </div>
              
              {/* Description */}
              {selectedIncident.description && (
                <div>
                  <h3 className="font-semibold mb-2">Descripción</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedIncident.description}</p>
                </div>
              )}
              
              {/* Witnesses */}
              {selectedIncident.witnesses && (
                <div>
                  <h3 className="font-semibold mb-2">Testigos</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedIncident.witnesses}</p>
                </div>
              )}
              
              {/* Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedIncident.immediate_actions && (
                  <div>
                    <h3 className="font-semibold mb-2 text-blue-600">Acciones Inmediatas</h3>
                    <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">{selectedIncident.immediate_actions}</p>
                  </div>
                )}
                
                {selectedIncident.root_cause && (
                  <div>
                    <h3 className="font-semibold mb-2 text-orange-600">Causa Raíz</h3>
                    <p className="text-gray-700 bg-orange-50 p-4 rounded-lg">{selectedIncident.root_cause}</p>
                  </div>
                )}
                
                {selectedIncident.corrective_actions && (
                  <div>
                    <h3 className="font-semibold mb-2 text-green-600">Acciones Correctivas</h3>
                    <p className="text-gray-700 bg-green-50 p-4 rounded-lg">{selectedIncident.corrective_actions}</p>
                  </div>
                )}
                
                {selectedIncident.preventive_actions && (
                  <div>
                    <h3 className="font-semibold mb-2 text-purple-600">Acciones Preventivas</h3>
                    <p className="text-gray-700 bg-purple-50 p-4 rounded-lg">{selectedIncident.preventive_actions}</p>
                  </div>
                )}
              </div>
              
              {/* Impact */}
              {(selectedIncident.cost_impact || selectedIncident.time_impact_days) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedIncident.cost_impact && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-600">Impacto Económico</p>
                      <p className="text-2xl font-bold text-red-700">
                        ${selectedIncident.cost_impact.toLocaleString('es-AR')}
                      </p>
                    </div>
                  )}
                  {selectedIncident.time_impact_days && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-yellow-600">Impacto en Tiempo</p>
                      <p className="text-2xl font-bold text-yellow-700">
                        {selectedIncident.time_impact_days} días
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Footer Actions */}
            <div className="p-4 border-t bg-gray-50 flex justify-between">
              <button
                onClick={() => {
                  if (confirm('¿Estás seguro de eliminar este incidente?')) {
                    deleteIncident(selectedIncident.id);
                    setShowDetailModal(false);
                    selectIncident(null);
                  }
                }}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                Eliminar
              </button>
              
              <div className="flex gap-2">
                {(selectedIncident.status === 'reported' || selectedIncident.status === 'investigating') && (
                  <button
                    onClick={handleResolve}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    ✅ Marcar como Resuelto
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
