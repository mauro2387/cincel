/**
 * Obras Page V2 - Gestión completa de obras
 * Bitácora, tareas, fotos, control de costos
 */

import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  useObrasStore,
  Obra,
  ObraEstado,
  BitacoraEntry,
  TareaObra,
  CostoObra,
} from '../store/obrasStore';

// Iconos
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClipboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const CashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PhotoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Helpers
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(value);

const getEstadoColor = (estado: ObraEstado) => {
  switch (estado) {
    case 'planificacion':
      return 'bg-blue-100 text-blue-700';
    case 'en_progreso':
      return 'bg-green-100 text-green-700';
    case 'pausada':
      return 'bg-yellow-100 text-yellow-700';
    case 'completada':
      return 'bg-purple-100 text-purple-700';
    case 'cancelada':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getEstadoLabel = (estado: ObraEstado) => {
  switch (estado) {
    case 'planificacion':
      return 'Planificación';
    case 'en_progreso':
      return 'En Progreso';
    case 'pausada':
      return 'Pausada';
    case 'completada':
      return 'Completada';
    case 'cancelada':
      return 'Cancelada';
    default:
      return estado;
  }
};

// Componente Card de Obra
const ObraCard: React.FC<{ obra: Obra; onClick: () => void }> = ({ obra, onClick }) => {
  const porcentajeCosto = obra.presupuesto_total > 0 ? (obra.costo_actual / obra.presupuesto_total) * 100 : 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{obra.nombre}</h3>
          <p className="text-sm text-gray-500">{obra.cliente_nombre}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(obra.estado)}`}>
          {getEstadoLabel(obra.estado)}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{obra.direccion}</p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Avance</span>
          <span className="font-medium">{obra.porcentaje_avance}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${obra.porcentaje_avance}%` }}
          />
        </div>
      </div>

      {/* Cost bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Costo vs Presupuesto</span>
          <span className={`font-medium ${porcentajeCosto > 90 ? 'text-red-600' : ''}`}>
            {porcentajeCosto.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              porcentajeCosto > 90 ? 'bg-red-500' : porcentajeCosto > 70 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(porcentajeCosto, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatCurrency(obra.costo_actual)}</span>
          <span>{formatCurrency(obra.presupuesto_total)}</span>
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        {obra.fecha_inicio && (
          <div className="flex items-center gap-1">
            <CalendarIcon />
            <span>Inicio: {format(parseISO(obra.fecha_inicio), 'dd/MM/yy')}</span>
          </div>
        )}
        {obra.fecha_fin_estimada && (
          <div className="flex items-center gap-1">
            <CalendarIcon />
            <span>Fin: {format(parseISO(obra.fecha_fin_estimada), 'dd/MM/yy')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente Detalle de Obra
const ObraDetail: React.FC<{
  obra: Obra;
  onClose: () => void;
}> = ({ obra, onClose }) => {
  const [activeTab, setActiveTab] = useState<'bitacora' | 'tareas' | 'costos' | 'fotos'>('bitacora');
  const {
    getBitacoraByObra,
    getTareasByObra,
    getCostosByObra,
    getFotosByObra,
    addBitacoraEntry,
    updateTarea,
    addCosto,
    updateObra,
  } = useObrasStore();

  const bitacora = getBitacoraByObra(obra.id);
  const tareas = getTareasByObra(obra.id);
  const costos = getCostosByObra(obra.id);
  const fotos = getFotosByObra(obra.id);

  const [showNewBitacora, setShowNewBitacora] = useState(false);
  const [showNewCosto, setShowNewCosto] = useState(false);
  const [newBitacora, setNewBitacora] = useState({
    titulo: '',
    descripcion: '',
    trabajadores_presentes: 0,
    horas_trabajadas: 0,
    clima: '',
  });
  const [newCosto, setNewCosto] = useState({
    categoria: 'materiales' as CostoObra['categoria'],
    concepto: '',
    monto: 0,
    proveedor: '',
  });

  const porcentajeCosto = obra.presupuesto_total > 0 ? (obra.costo_actual / obra.presupuesto_total) * 100 : 0;

  const handleAddBitacora = () => {
    if (newBitacora.titulo) {
      addBitacoraEntry({
        obra_id: obra.id,
        fecha: new Date().toISOString().split('T')[0],
        titulo: newBitacora.titulo,
        descripcion: newBitacora.descripcion,
        clima: newBitacora.clima,
        trabajadores_presentes: newBitacora.trabajadores_presentes,
        horas_trabajadas: newBitacora.horas_trabajadas,
        actividades: [],
        fotos: [],
        created_by: 'Usuario',
      });
      setNewBitacora({ titulo: '', descripcion: '', trabajadores_presentes: 0, horas_trabajadas: 0, clima: '' });
      setShowNewBitacora(false);
    }
  };

  const handleAddCosto = () => {
    if (newCosto.concepto && newCosto.monto > 0) {
      addCosto({
        obra_id: obra.id,
        categoria: newCosto.categoria,
        concepto: newCosto.concepto,
        monto: newCosto.monto,
        fecha: new Date().toISOString().split('T')[0],
        proveedor: newCosto.proveedor,
        estado: 'pendiente',
      });
      setNewCosto({ categoria: 'materiales', concepto: '', monto: 0, proveedor: '' });
      setShowNewCosto(false);
    }
  };

  const tabs = [
    { id: 'bitacora', label: 'Bitácora', icon: <ClipboardIcon />, count: bitacora.length },
    { id: 'tareas', label: 'Tareas', icon: <CheckIcon />, count: tareas.filter(t => t.estado !== 'completada').length },
    { id: 'costos', label: 'Costos', icon: <CashIcon />, count: costos.length },
    { id: 'fotos', label: 'Fotos', icon: <PhotoIcon />, count: fotos.length },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeftIcon />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">{obra.nombre}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(obra.estado)}`}>
                  {getEstadoLabel(obra.estado)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{obra.cliente_nombre} • {obra.direccion}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Avance</p>
              <p className="text-2xl font-bold text-gray-900">{obra.porcentaje_avance}%</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Presupuesto</p>
              <p className="text-lg font-semibold">{formatCurrency(obra.presupuesto_total)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Gastado</p>
              <p className={`text-lg font-semibold ${porcentajeCosto > 90 ? 'text-red-600' : ''}`}>
                {formatCurrency(obra.costo_actual)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Disponible</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(obra.presupuesto_total - obra.costo_actual)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Encargado</p>
              <p className="text-lg font-semibold">{obra.encargado || '-'}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count > 0 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Bitácora */}
          {activeTab === 'bitacora' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Bitácora de Obra</h3>
                <button
                  onClick={() => setShowNewBitacora(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <PlusIcon /> Nueva Entrada
                </button>
              </div>

              {showNewBitacora && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium mb-3">Nueva entrada de bitácora</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Título"
                      value={newBitacora.titulo}
                      onChange={(e) => setNewBitacora({ ...newBitacora, titulo: e.target.value })}
                      className="px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Clima"
                      value={newBitacora.clima}
                      onChange={(e) => setNewBitacora({ ...newBitacora, clima: e.target.value })}
                      className="px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Trabajadores"
                      value={newBitacora.trabajadores_presentes || ''}
                      onChange={(e) => setNewBitacora({ ...newBitacora, trabajadores_presentes: parseInt(e.target.value) || 0 })}
                      className="px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Horas trabajadas"
                      value={newBitacora.horas_trabajadas || ''}
                      onChange={(e) => setNewBitacora({ ...newBitacora, horas_trabajadas: parseInt(e.target.value) || 0 })}
                      className="px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <textarea
                    placeholder="Descripción de actividades..."
                    value={newBitacora.descripcion}
                    onChange={(e) => setNewBitacora({ ...newBitacora, descripcion: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg mb-4"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowNewBitacora(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddBitacora}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {bitacora.map((entry) => (
                  <div key={entry.id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{entry.titulo}</h4>
                        <p className="text-sm text-gray-500">
                          {format(parseISO(entry.fecha), "EEEE, d 'de' MMMM", { locale: es })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {entry.clima && <span>☁️ {entry.clima}</span>}
                        <span className="flex items-center gap-1">
                          <UsersIcon /> {entry.trabajadores_presentes}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon /> {entry.horas_trabajadas}h
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600">{entry.descripcion}</p>
                    {entry.materiales_usados && entry.materiales_usados.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium text-gray-700 mb-2">Materiales utilizados:</p>
                        <div className="flex flex-wrap gap-2">
                          {entry.materiales_usados.map((mat, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                              {mat.material}: {mat.cantidad} {mat.unidad}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {entry.incidentes && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800">⚠️ Incidente:</p>
                        <p className="text-sm text-yellow-700">{entry.incidentes}</p>
                      </div>
                    )}
                  </div>
                ))}
                {bitacora.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No hay entradas en la bitácora</p>
                )}
              </div>
            </div>
          )}

          {/* Tareas */}
          {activeTab === 'tareas' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Tareas de la Obra</h3>
              </div>
              <div className="space-y-3">
                {tareas.map((tarea) => (
                  <div
                    key={tarea.id}
                    className={`bg-white border rounded-lg p-4 ${
                      tarea.estado === 'completada' ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateTarea(tarea.id, {
                            estado: tarea.estado === 'completada' ? 'pendiente' : 'completada',
                          })
                        }
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          tarea.estado === 'completada'
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {tarea.estado === 'completada' && <CheckIcon />}
                      </button>
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            tarea.estado === 'completada' ? 'line-through text-gray-400' : 'text-gray-900'
                          }`}
                        >
                          {tarea.titulo}
                        </p>
                        {tarea.descripcion && (
                          <p className="text-sm text-gray-500">{tarea.descripcion}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {tarea.asignado_a && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {tarea.asignado_a}
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            tarea.prioridad === 'urgente'
                              ? 'bg-red-100 text-red-700'
                              : tarea.prioridad === 'alta'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {tarea.prioridad}
                        </span>
                      </div>
                    </div>
                    {tarea.porcentaje_avance > 0 && tarea.porcentaje_avance < 100 && (
                      <div className="mt-3">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${tarea.porcentaje_avance}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{tarea.porcentaje_avance}% completado</p>
                      </div>
                    )}
                  </div>
                ))}
                {tareas.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No hay tareas asignadas</p>
                )}
              </div>
            </div>
          )}

          {/* Costos */}
          {activeTab === 'costos' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Control de Costos</h3>
                <button
                  onClick={() => setShowNewCosto(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <PlusIcon /> Agregar Costo
                </button>
              </div>

              {showNewCosto && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium mb-3">Nuevo costo</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <select
                      value={newCosto.categoria}
                      onChange={(e) => setNewCosto({ ...newCosto, categoria: e.target.value as CostoObra['categoria'] })}
                      className="px-3 py-2 border rounded-lg"
                    >
                      <option value="materiales">Materiales</option>
                      <option value="mano_obra">Mano de Obra</option>
                      <option value="equipos">Equipos</option>
                      <option value="subcontratos">Subcontratos</option>
                      <option value="permisos">Permisos</option>
                      <option value="otros">Otros</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Concepto"
                      value={newCosto.concepto}
                      onChange={(e) => setNewCosto({ ...newCosto, concepto: e.target.value })}
                      className="px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Monto"
                      value={newCosto.monto || ''}
                      onChange={(e) => setNewCosto({ ...newCosto, monto: parseFloat(e.target.value) || 0 })}
                      className="px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Proveedor (opcional)"
                      value={newCosto.proveedor}
                      onChange={(e) => setNewCosto({ ...newCosto, proveedor: e.target.value })}
                      className="px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowNewCosto(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddCosto}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              )}

              {/* Resumen por categoría */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {['mano_obra', 'materiales', 'subcontratos'].map((cat) => {
                  const total = costos
                    .filter((c) => c.categoria === cat)
                    .reduce((sum, c) => sum + c.monto, 0);
                  const labels: Record<string, string> = {
                    mano_obra: 'Mano de Obra',
                    materiales: 'Materiales',
                    subcontratos: 'Subcontratos',
                  };
                  return (
                    <div key={cat} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">{labels[cat]}</p>
                      <p className="text-xl font-semibold">{formatCurrency(total)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Lista de costos */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Fecha</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Concepto</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Categoría</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Proveedor</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Monto</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costos.map((costo) => (
                      <tr key={costo.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{format(parseISO(costo.fecha), 'dd/MM/yy')}</td>
                        <td className="py-3 px-4 text-sm font-medium">{costo.concepto}</td>
                        <td className="py-3 px-4 text-sm capitalize">{costo.categoria.replace('_', ' ')}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{costo.proveedor || '-'}</td>
                        <td className="py-3 px-4 text-sm text-right font-medium">{formatCurrency(costo.monto)}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              costo.estado === 'pagado'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {costo.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-medium">
                      <td colSpan={4} className="py-3 px-4 text-right">Total:</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(obra.costo_actual)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Fotos */}
          {activeTab === 'fotos' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Galería de Fotos</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  <PlusIcon /> Subir Fotos
                </button>
              </div>
              {fotos.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <PhotoIcon />
                  <p className="text-gray-500 mt-2">No hay fotos todavía</p>
                  <p className="text-sm text-gray-400">Sube fotos del progreso de la obra</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {fotos.map((foto) => (
                    <div key={foto.id} className="aspect-square rounded-lg overflow-hidden">
                      <img src={foto.url} alt={foto.titulo} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente Principal
export const ObrasPageV2: React.FC = () => {
  const { obras } = useObrasStore();
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<ObraEstado | 'todas'>('todas');

  const obrasFiltradas = obras.filter((o) => filtroEstado === 'todas' || o.estado === filtroEstado);

  const estados: { value: ObraEstado | 'todas'; label: string }[] = [
    { value: 'todas', label: 'Todas' },
    { value: 'planificacion', label: 'Planificación' },
    { value: 'en_progreso', label: 'En Progreso' },
    { value: 'pausada', label: 'Pausadas' },
    { value: 'completada', label: 'Completadas' },
  ];

  // Stats
  const obrasActivas = obras.filter((o) => o.estado === 'en_progreso').length;
  const totalPresupuestado = obras.reduce((sum, o) => sum + o.presupuesto_total, 0);
  const totalGastado = obras.reduce((sum, o) => sum + o.costo_actual, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Obras</h1>
          <p className="text-gray-500">Administra tus proyectos de construcción</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          <PlusIcon /> Nueva Obra
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Obras Activas</p>
          <p className="text-2xl font-bold text-gray-900">{obrasActivas}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Total Obras</p>
          <p className="text-2xl font-bold text-gray-900">{obras.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Presupuesto Total</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPresupuestado)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Gastado</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalGastado)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {estados.map((estado) => (
          <button
            key={estado.value}
            onClick={() => setFiltroEstado(estado.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtroEstado === estado.value
                ? 'bg-blue-100 text-blue-700'
                : 'bg-white text-gray-600 hover:bg-gray-50 border'
            }`}
          >
            {estado.label}
          </button>
        ))}
      </div>

      {/* Grid de obras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {obrasFiltradas.map((obra) => (
          <ObraCard key={obra.id} obra={obra} onClick={() => setSelectedObra(obra)} />
        ))}
      </div>

      {obrasFiltradas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay obras que mostrar</p>
        </div>
      )}

      {/* Modal de detalle */}
      {selectedObra && (
        <ObraDetail obra={selectedObra} onClose={() => setSelectedObra(null)} />
      )}
    </div>
  );
};

export default ObrasPageV2;
