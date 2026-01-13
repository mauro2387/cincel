/**
 * CuadrillasPage - Página de Gestión de Cuadrillas
 * Administración de equipos de trabajo y personal
 */

import { useState, useEffect } from 'react';
import { useCrewsStore, CREW_TYPES, CREW_SPECIALTIES, MEMBER_ROLES } from '../store/crewsStore';
import type { CrewType } from '../../lib/database.types';

export default function CuadrillasPage() {
  const { 
    crews, 
    fetchCrews, 
    addCrew, 
    updateCrew, 
    deleteCrew,
    addMember,
    updateMember,
    deleteMember,
    selectCrew,
    selectedCrewId,

    isLoading 
  } = useCrewsStore();
  
  const [showNewCrewModal, setShowNewCrewModal] = useState(false);
  const [showCrewDetailModal, setShowCrewDetailModal] = useState(false);
  const [showNewMemberModal, setShowNewMemberModal] = useState(false);
  const [filterType, setFilterType] = useState<CrewType | ''>('');
  const [filterActive, setFilterActive] = useState<boolean | null>(true);
  
  // New crew form
  const [newCrew, setNewCrew] = useState({
    name: '',
    type: 'own' as CrewType,
    supervisor: '',
    supervisor_phone: '',
    specialty: '',
    hourly_rate: 0,
    daily_rate: 0,
    notes: '',
    active: true,
    supplier_id: null as string | null,
  });
  
  // New member form
  const [newMember, setNewMember] = useState({
    name: '',
    document_id: '',
    role: '',
    specialty: '',
    hourly_rate: 0,
    phone: '',
    emergency_contact: '',
    active: true,
  });

  useEffect(() => {
    fetchCrews();
  }, [fetchCrews]);

  const filteredCrews = crews.filter(c => {
    if (filterType && c.type !== filterType) return false;
    if (filterActive !== null && c.active !== filterActive) return false;
    return true;
  });

  const selectedCrew = crews.find(c => c.id === selectedCrewId);

  const handleCreateCrew = async () => {
    if (!newCrew.name) return;
    
    await addCrew(newCrew);
    
    setNewCrew({
      name: '',
      type: 'own',
      supervisor: '',
      supervisor_phone: '',
      specialty: '',
      hourly_rate: 0,
      daily_rate: 0,
      notes: '',
      active: true,
      supplier_id: null,
    });
    setShowNewCrewModal(false);
  };

  const handleCreateMember = async () => {
    if (!newMember.name || !selectedCrewId) return;
    
    await addMember({
      ...newMember,
      crew_id: selectedCrewId,
      emergency_contact: newMember.emergency_contact || null,
      specialty: newMember.specialty || null,
    });
    
    setNewMember({
      name: '',
      document_id: '',
      role: '',
      specialty: '',
      hourly_rate: 0,
      phone: '',
      emergency_contact: '',
      active: true,
    });
    setShowNewMemberModal(false);
  };

  const handleToggleCrewActive = async (crewId: string, currentActive: boolean) => {
    await updateCrew(crewId, { active: !currentActive });
  };

  const handleToggleMemberActive = async (memberId: string, currentActive: boolean) => {
    await updateMember(memberId, { active: !currentActive });
  };

  // Stats
  const stats = {
    total: crews.length,
    active: crews.filter(c => c.active).length,
    own: crews.filter(c => c.type === 'own').length,
    subcontractor: crews.filter(c => c.type === 'subcontractor').length,
    totalMembers: crews.reduce((sum, c) => sum + (c.members?.length || 0), 0),
  };

  const getTypeConfig = (type: CrewType) => {
    return CREW_TYPES.find(t => t.value === type) || CREW_TYPES[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cuadrillas</h1>
          <p className="text-gray-600">Gestión de equipos de trabajo y personal</p>
        </div>
        <button
          onClick={() => setShowNewCrewModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>👷</span>
          Nueva Cuadrilla
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Cuadrillas</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-500">Activas</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-l-blue-500">
          <div className="text-2xl font-bold text-blue-600">{stats.own}</div>
          <div className="text-sm text-gray-500">Propias</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-l-purple-500">
          <div className="text-2xl font-bold text-purple-600">{stats.subcontractor}</div>
          <div className="text-sm text-gray-500">Subcontratistas</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">{stats.totalMembers}</div>
          <div className="text-sm text-gray-500">Total Personal</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as CrewType | '')}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            {CREW_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
          
          <select
            value={filterActive === null ? '' : filterActive ? 'active' : 'inactive'}
            onChange={(e) => {
              if (e.target.value === '') setFilterActive(null);
              else setFilterActive(e.target.value === 'active');
            }}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas</option>
            <option value="active">✅ Activas</option>
            <option value="inactive">⏸️ Inactivas</option>
          </select>
        </div>
      </div>

      {/* Crews Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredCrews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <span className="text-4xl mb-4 block">👷</span>
          <h3 className="text-lg font-medium text-gray-900">No hay cuadrillas</h3>
          <p className="text-gray-500">Crea tu primera cuadrilla de trabajo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCrews.map(crew => {
            const typeConfig = getTypeConfig(crew.type || 'own');
            return (
              <div 
                key={crew.id}
                className={`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer ${!crew.active ? 'opacity-60' : ''}`}
                onClick={() => {
                  selectCrew(crew.id);
                  setShowCrewDetailModal(true);
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`p-2 rounded-lg ${typeConfig.color} text-white`}>
                      {typeConfig.icon}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{crew.name}</h3>
                      <span className="text-xs text-gray-500">{typeConfig.label}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${crew.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                    {crew.active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                
                {crew.specialty && (
                  <p className="text-sm text-gray-600 mb-2">🔧 {crew.specialty}</p>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <span>👤 {crew.supervisor || 'Sin supervisor'}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">
                    👥 {crew.members?.length || 0} integrantes
                  </span>
                  {crew.daily_rate && (
                    <span className="text-green-600 font-medium">
                      ${crew.daily_rate.toLocaleString()}/día
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Crew Modal */}
      {showNewCrewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">👷 Nueva Cuadrilla</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={newCrew.name}
                    onChange={(e) => setNewCrew(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Cuadrilla Albañilería"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={newCrew.type}
                    onChange={(e) => setNewCrew(prev => ({ ...prev, type: e.target.value as CrewType }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {CREW_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor</label>
                    <input
                      type="text"
                      value={newCrew.supervisor}
                      onChange={(e) => setNewCrew(prev => ({ ...prev, supervisor: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tel. Supervisor</label>
                    <input
                      type="tel"
                      value={newCrew.supervisor_phone}
                      onChange={(e) => setNewCrew(prev => ({ ...prev, supervisor_phone: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="099..."
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                  <select
                    value={newCrew.specialty}
                    onChange={(e) => setNewCrew(prev => ({ ...prev, specialty: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar</option>
                    {CREW_SPECIALTIES.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarifa por Hora</label>
                    <input
                      type="number"
                      value={newCrew.hourly_rate || ''}
                      onChange={(e) => setNewCrew(prev => ({ ...prev, hourly_rate: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="$/hora"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarifa por Día</label>
                    <input
                      type="number"
                      value={newCrew.daily_rate || ''}
                      onChange={(e) => setNewCrew(prev => ({ ...prev, daily_rate: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="$/día"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <textarea
                    value={newCrew.notes}
                    onChange={(e) => setNewCrew(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Observaciones..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewCrewModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateCrew}
                  disabled={!newCrew.name}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crew Detail Modal */}
      {showCrewDetailModal && selectedCrew && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <span className={`p-3 rounded-lg ${getTypeConfig(selectedCrew.type || 'own').color} text-white text-2xl`}>
                    {getTypeConfig(selectedCrew.type || 'own').icon}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold">{selectedCrew.name}</h2>
                    <p className="text-gray-500">{getTypeConfig(selectedCrew.type || 'own').label}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCrewDetailModal(false);
                    selectCrew(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ✕
                </button>
              </div>
              
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Supervisor:</span>
                  <p className="font-medium">{selectedCrew.supervisor || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Teléfono:</span>
                  <p className="font-medium">{selectedCrew.supervisor_phone || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Tarifa/día:</span>
                  <p className="font-medium text-green-600">${selectedCrew.daily_rate?.toLocaleString() || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Estado:</span>
                  <p className={`font-medium ${selectedCrew.active ? 'text-green-600' : 'text-gray-500'}`}>
                    {selectedCrew.active ? '✅ Activa' : '⏸️ Inactiva'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Members */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">
                  👥 Integrantes ({selectedCrew.members?.length || 0})
                </h3>
                <button
                  onClick={() => setShowNewMemberModal(true)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  ➕ Agregar
                </button>
              </div>
              
              {selectedCrew.members && selectedCrew.members.length > 0 ? (
                <div className="space-y-2">
                  {selectedCrew.members.map(member => (
                    <div 
                      key={member.id}
                      className={`p-3 rounded-lg border ${member.active ? 'bg-white' : 'bg-gray-50 opacity-60'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{member.name}</span>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">
                              {member.role}
                            </span>
                          </div>
                          {member.specialty && (
                            <p className="text-sm text-gray-500">🔧 {member.specialty}</p>
                          )}
                          <p className="text-sm text-gray-500">
                            📱 {member.phone || 'Sin teléfono'}
                            {member.document_id && ` • CI: ${member.document_id}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {member.hourly_rate && (
                            <span className="text-sm text-green-600">${member.hourly_rate}/h</span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleMemberActive(member.id, member.active);
                            }}
                            className={`px-2 py-1 text-xs rounded ${member.active ? 'bg-gray-100 hover:bg-gray-200' : 'bg-green-100 hover:bg-green-200'}`}
                          >
                            {member.active ? '⏸️' : '▶️'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('¿Eliminar este integrante?')) {
                                deleteMember(member.id);
                              }
                            }}
                            className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay integrantes en esta cuadrilla</p>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={() => handleToggleCrewActive(selectedCrew.id, selectedCrew.active)}
                  className={`px-4 py-2 rounded-lg ${selectedCrew.active ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                >
                  {selectedCrew.active ? '⏸️ Desactivar' : '▶️ Activar'}
                </button>
                <button
                  onClick={() => {
                    if (confirm('¿Estás seguro de eliminar esta cuadrilla?')) {
                      deleteCrew(selectedCrew.id);
                      setShowCrewDetailModal(false);
                      selectCrew(null);
                    }
                  }}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Member Modal */}
      {showNewMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">👤 Nuevo Integrante</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                    <input
                      type="text"
                      value={newMember.document_id}
                      onChange={(e) => setNewMember(prev => ({ ...prev, document_id: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="CI"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={newMember.phone}
                      onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                    <select
                      value={newMember.role}
                      onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar</option>
                      {MEMBER_ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarifa/Hora</label>
                    <input
                      type="number"
                      value={newMember.hourly_rate || ''}
                      onChange={(e) => setNewMember(prev => ({ ...prev, hourly_rate: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                  <input
                    type="text"
                    value={newMember.specialty}
                    onChange={(e) => setNewMember(prev => ({ ...prev, specialty: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Opcional"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contacto de Emergencia</label>
                  <input
                    type="text"
                    value={newMember.emergency_contact}
                    onChange={(e) => setNewMember(prev => ({ ...prev, emergency_contact: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Tel - Nombre (parentesco)"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewMemberModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateMember}
                  disabled={!newMember.name}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
