/**
 * CalidadPage - Página de Control de Calidad
 * Gestión de checklists y verificaciones de calidad
 * Alineado con database.types.ts (setup_cos_completo.sql)
 */

import { useState, useEffect } from 'react';
import { 
  useQualityStore, 
  CHECKLIST_STATUSES, 
  CHECKLIST_CATEGORIES, 
  getStatusConfig,
  getCategoryLabel,
  getItemStatusConfig,
  type ChecklistWithItems 
} from '../store/qualityStore';
import { useObrasStore } from '../store/obrasStore';
import type { ChecklistStatus, ChecklistCategory, ChecklistItemStatus } from '../../lib/database.types';

export default function CalidadPage() {
  const { 
    checklists, 
    fetchChecklists, 
    addChecklist, 
    updateChecklist, 
    deleteChecklist,
    addItem,
    checkItem,
    selectChecklist,
    selectedChecklistId,
    isLoading 
  } = useQualityStore();
  const { obras } = useObrasStore();
  
  const [showNewModal, setShowNewModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterProject, setFilterProject] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<ChecklistStatus | ''>('');
  const [filterCategory, setFilterCategory] = useState<ChecklistCategory | ''>('');
  
  // New checklist form
  const [newChecklist, setNewChecklist] = useState({
    project_id: '',
    name: '',
    category: '' as ChecklistCategory | '',
    due_date: '',
  });
  
  // New item form
  const [newItemDescription, setNewItemDescription] = useState('');

  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);

  const filteredChecklists = checklists.filter((c: ChecklistWithItems) => {
    if (filterProject && c.project_id !== filterProject) return false;
    if (filterStatus && c.status !== filterStatus) return false;
    if (filterCategory && c.category !== filterCategory) return false;
    return true;
  });

  const selectedChecklist = checklists.find((c: ChecklistWithItems) => c.id === selectedChecklistId);

  const handleCreateChecklist = async () => {
    if (!newChecklist.name || !newChecklist.project_id || !newChecklist.category) return;
    
    await addChecklist({
      project_id: newChecklist.project_id,
      name: newChecklist.name,
      category: newChecklist.category as ChecklistCategory,
      status: 'pending',
      due_date: newChecklist.due_date || null,
      completed_date: null,
      inspector: null,
      approved_by: null,
      approved_at: null,
      score: null,
      notes: null,
      photos: null,
    });
    
    setNewChecklist({
      project_id: '',
      name: '',
      category: '',
      due_date: '',
    });
    setShowNewModal(false);
  };

  const handleAddItem = async () => {
    if (!newItemDescription || !selectedChecklistId) return;
    
    const maxOrder = selectedChecklist?.items?.reduce((max: number, item) => 
      Math.max(max, item.order_number), 0) || 0;
    
    await addItem({
      checklist_id: selectedChecklistId,
      description: newItemDescription,
      order_number: maxOrder + 1,
      category: null,
      status: 'pending',
      notes: null,
      photo_url: null,
    });
    
    setNewItemDescription('');
  };

  const handleCheckItem = async (itemId: string, status: ChecklistItemStatus) => {
    await checkItem(itemId, 'current-user', status, undefined);
  };

  const handleApproveChecklist = async () => {
    if (!selectedChecklistId) return;
    await updateChecklist(selectedChecklistId, {
      status: 'approved',
      completed_date: new Date().toISOString().split('T')[0],
      approved_at: new Date().toISOString(),
      approved_by: 'current-user',
    });
  };

  const getProjectName = (projectId: string) => {
    const obra = obras.find(o => o.id === projectId);
    return obra?.nombre || 'Proyecto no encontrado';
  };

  // Stats
  const stats = {
    total: checklists.length,
    pending: checklists.filter((c: ChecklistWithItems) => c.status === 'pending').length,
    inProgress: checklists.filter((c: ChecklistWithItems) => c.status === 'in_progress').length,
    completed: checklists.filter((c: ChecklistWithItems) => c.status === 'completed').length,
    approved: checklists.filter((c: ChecklistWithItems) => c.status === 'approved').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Control de Calidad</h1>
          <p className="text-gray-600">Gestión de checklists y verificaciones</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>➕</span>
          Nuevo Checklist
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-500">{stats.pending}</div>
          <div className="text-sm text-gray-500">Pendientes</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-500">En Progreso</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">{stats.completed}</div>
          <div className="text-sm text-gray-500">Completados</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-sm text-gray-500">Aprobados</div>
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ChecklistStatus | '')}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            {CHECKLIST_STATUSES.map(status => (
              <option key={status.value} value={status.value}>
                {status.icon} {status.label}
              </option>
            ))}
          </select>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as ChecklistCategory | '')}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            {CHECKLIST_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Checklists Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredChecklists.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <span className="text-4xl mb-4 block">📋</span>
          <h3 className="text-lg font-medium text-gray-900">No hay checklists</h3>
          <p className="text-gray-500">Crea tu primer checklist de calidad</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChecklists.map((checklist: ChecklistWithItems) => {
            const statusConfig = getStatusConfig(checklist.status);
            return (
              <div 
                key={checklist.id}
                className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  selectChecklist(checklist.id);
                  setShowDetailModal(true);
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{checklist.name}</h3>
                    <p className="text-sm text-gray-500">{getProjectName(checklist.project_id)}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.color} text-white`}>
                    {statusConfig.icon} {statusConfig.label}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    {getCategoryLabel(checklist.category)}
                  </span>
                  {checklist.due_date && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">
                      📅 {checklist.due_date}
                    </span>
                  )}
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{checklist.completedItems || 0} / {checklist.totalItems || 0} items</span>
                    <span>{checklist.completionPercentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        checklist.status === 'approved' ? 'bg-green-500' :
                        checklist.status === 'completed' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${checklist.completionPercentage || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Checklist Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Nuevo Checklist</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto *</label>
                <select
                  value={newChecklist.project_id}
                  onChange={(e) => setNewChecklist(prev => ({ ...prev, project_id: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar proyecto</option>
                  {obras.map(obra => (
                    <option key={obra.id} value={obra.id}>{obra.nombre}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={newChecklist.name}
                  onChange={(e) => setNewChecklist(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Control de Cimientos"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                <select
                  value={newChecklist.category}
                  onChange={(e) => setNewChecklist(prev => ({ ...prev, category: e.target.value as ChecklistCategory }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar</option>
                  {CHECKLIST_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Límite</label>
                <input
                  type="date"
                  value={newChecklist.due_date}
                  onChange={(e) => setNewChecklist(prev => ({ ...prev, due_date: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                onClick={handleCreateChecklist}
                disabled={!newChecklist.name || !newChecklist.project_id || !newChecklist.category}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Detail Modal */}
      {showDetailModal && selectedChecklist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{selectedChecklist.name}</h2>
                  <p className="text-gray-500">{getProjectName(selectedChecklist.project_id)}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    selectChecklist(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex items-center gap-4 mt-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusConfig(selectedChecklist.status).color} text-white`}>
                  {getStatusConfig(selectedChecklist.status).label}
                </span>
                <span className="text-sm text-gray-500">
                  {getCategoryLabel(selectedChecklist.category)}
                </span>
                {selectedChecklist.due_date && (
                  <span className="text-sm text-gray-500">
                    📅 Vence: {selectedChecklist.due_date}
                  </span>
                )}
              </div>
              
              {/* Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progreso</span>
                  <span>{selectedChecklist.completionPercentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all"
                    style={{ width: `${selectedChecklist.completionPercentage || 0}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="font-semibold mb-4">Items de Verificación</h3>
              
              {selectedChecklist.items?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay items en este checklist</p>
              ) : (
                <div className="space-y-3">
                  {selectedChecklist.items?.map(item => {
                    const itemStatusConfig = getItemStatusConfig(item.status);
                    return (
                      <div 
                        key={item.id}
                        className={`p-4 rounded-lg border ${
                          item.status === 'passed' ? 'bg-green-50 border-green-200' :
                          item.status === 'failed' ? 'bg-red-50 border-red-200' :
                          'bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <p className={`font-medium ${item.status === 'passed' ? 'line-through text-gray-500' : ''}`}>
                              {item.description}
                            </p>
                            {item.notes && (
                              <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            {item.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleCheckItem(item.id, 'passed')}
                                  className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200"
                                  title="Aprobar"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => handleCheckItem(item.id, 'failed')}
                                  className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                  title="Rechazar"
                                >
                                  ✕
                                </button>
                                <button
                                  onClick={() => handleCheckItem(item.id, 'na')}
                                  className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                                  title="No Aplica"
                                >
                                  N/A
                                </button>
                              </>
                            )}
                            {item.status !== 'pending' && (
                              <span className={`px-2 py-1 text-xs rounded ${itemStatusConfig.color} text-white`}>
                                {itemStatusConfig.icon} {itemStatusConfig.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Add Item Form */}
              {selectedChecklist.status !== 'approved' && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-3">Agregar Item</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newItemDescription}
                      onChange={(e) => setNewItemDescription(e.target.value)}
                      placeholder="Descripción del item..."
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddItem}
                      disabled={!newItemDescription}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer Actions */}
            <div className="p-4 border-t bg-gray-50 flex justify-between">
              <button
                onClick={() => {
                  if (confirm('¿Estás seguro de eliminar este checklist?')) {
                    deleteChecklist(selectedChecklist.id);
                    setShowDetailModal(false);
                    selectChecklist(null);
                  }
                }}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                Eliminar
              </button>
              
              <div className="flex gap-2">
                {selectedChecklist.status !== 'approved' && selectedChecklist.completionPercentage === 100 && (
                  <button
                    onClick={handleApproveChecklist}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    ✅ Aprobar Checklist
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
