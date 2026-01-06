/**
 * Tareas Page - Sistema de Tareas y Recordatorios
 */

import React, { useState } from 'react';
import { format, parseISO, isToday, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTareasStore } from '../store/tareasStore';
import type { Tarea, TareaPrioridad, TareaTipo } from '../store/tareasStore';

// Iconos
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const DotsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Helpers
const getTipoIcon = (tipo: TareaTipo) => {
  switch (tipo) {
    case 'llamada':
      return <PhoneIcon />;
    case 'reunion':
      return <UsersIcon />;
    case 'visita':
      return <LocationIcon />;
    case 'cotizacion':
      return <DocumentIcon />;
    case 'seguimiento':
      return <RefreshIcon />;
    default:
      return <DotsIcon />;
  }
};

const getTipoColor = (tipo: TareaTipo) => {
  switch (tipo) {
    case 'llamada':
      return 'bg-blue-100 text-blue-600';
    case 'reunion':
      return 'bg-purple-100 text-purple-600';
    case 'visita':
      return 'bg-green-100 text-green-600';
    case 'cotizacion':
      return 'bg-yellow-100 text-yellow-600';
    case 'seguimiento':
      return 'bg-pink-100 text-pink-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const getPrioridadColor = (prioridad: TareaPrioridad) => {
  switch (prioridad) {
    case 'urgente':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'alta':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'media':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'baja':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

// Componente Tarea Card
const TareaCard: React.FC<{
  tarea: Tarea;
  onComplete: () => void;
  onEdit: () => void;
}> = ({ tarea, onComplete, onEdit }) => {
  const isVencida = tarea.fecha_vencimiento && isPast(parseISO(tarea.fecha_vencimiento)) && tarea.estado !== 'completada';
  const esHoy = tarea.fecha_vencimiento && isToday(parseISO(tarea.fecha_vencimiento));

  return (
    <div
      className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${
        isVencida ? 'border-red-200 bg-red-50' : ''
      } ${tarea.estado === 'completada' ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onComplete}
          className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            tarea.estado === 'completada'
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-blue-500'
          }`}
        >
          {tarea.estado === 'completada' && <CheckIcon />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={onEdit}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`p-1.5 rounded-lg ${getTipoColor(tarea.tipo)}`}>
              {getTipoIcon(tarea.tipo)}
            </span>
            <h4
              className={`font-medium ${
                tarea.estado === 'completada' ? 'line-through text-gray-400' : 'text-gray-900'
              }`}
            >
              {tarea.titulo}
            </h4>
          </div>

          {tarea.descripcion && (
            <p className="text-sm text-gray-500 mb-2 line-clamp-2">{tarea.descripcion}</p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {/* Prioridad */}
            <span className={`px-2 py-0.5 text-xs rounded-full border ${getPrioridadColor(tarea.prioridad)}`}>
              {tarea.prioridad}
            </span>

            {/* Fecha */}
            {tarea.fecha_vencimiento && (
              <span
                className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${
                  isVencida
                    ? 'bg-red-100 text-red-700'
                    : esHoy
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <CalendarIcon />
                {isVencida ? 'Vencida' : esHoy ? 'Hoy' : format(parseISO(tarea.fecha_vencimiento), 'dd MMM', { locale: es })}
              </span>
            )}

            {/* Asignado */}
            {tarea.asignado_a && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                {tarea.asignado_a}
              </span>
            )}

            {/* Etiquetas */}
            {tarea.etiquetas.slice(0, 2).map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal Nueva Tarea
const NuevaTareaModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (tarea: Omit<Tarea, 'id' | 'created_at' | 'updated_at'>) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'seguimiento' as TareaTipo,
    prioridad: 'media' as TareaPrioridad,
    asignado_a: '',
    fecha_vencimiento: '',
    etiquetas: [] as string[],
  });

  const handleSubmit = () => {
    if (!form.titulo) return;
    onSave({
      ...form,
      estado: 'pendiente',
      created_by: 'Usuario',
    });
    setForm({
      titulo: '',
      descripcion: '',
      tipo: 'seguimiento',
      prioridad: 'media',
      asignado_a: '',
      fecha_vencimiento: '',
      etiquetas: [],
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Nueva Tarea</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <XIcon />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Llamar a cliente para seguimiento"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Detalles adicionales..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as TareaTipo })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="llamada">Llamada</option>
                <option value="reunion">Reunión</option>
                <option value="visita">Visita</option>
                <option value="seguimiento">Seguimiento</option>
                <option value="cotizacion">Cotización</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select
                value={form.prioridad}
                onChange={(e) => setForm({ ...form, prioridad: e.target.value as TareaPrioridad })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite</label>
              <input
                type="datetime-local"
                value={form.fecha_vencimiento}
                onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asignar a</label>
              <select
                value={form.asignado_a}
                onChange={(e) => setForm({ ...form, asignado_a: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin asignar</option>
                <option value="Roberto">Roberto</option>
                <option value="Miguel">Miguel</option>
                <option value="Ana">Ana</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.titulo}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Crear Tarea
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Principal
export const TareasPage: React.FC = () => {
  const {
    tareas,
    filtroEstado,
    filtroPrioridad,
    setFiltroEstado,
    setFiltroPrioridad,
    getTareasFiltradas,
    getTareasHoy,
    getTareasVencidas,
    completarTarea,
    addTarea,
  } = useTareasStore();

  const [showNewModal, setShowNewModal] = useState(false);
  const [_vista, _setVista] = useState<'lista' | 'kanban'>('lista');

  const tareasFiltradas = getTareasFiltradas();
  const tareasHoy = getTareasHoy();
  const tareasVencidas = getTareasVencidas();

  const handleComplete = (id: string) => {
    completarTarea(id);
  };

  // Stats
  const totalPendientes = tareas.filter((t) => t.estado === 'pendiente').length;
  const totalEnProgreso = tareas.filter((t) => t.estado === 'en_progreso').length;
  const totalCompletadas = tareas.filter((t) => t.estado === 'completada').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
          <p className="text-gray-500">Gestiona tus tareas y recordatorios</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <PlusIcon /> Nueva Tarea
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Pendientes</p>
          <p className="text-2xl font-bold text-gray-900">{totalPendientes}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">En Progreso</p>
          <p className="text-2xl font-bold text-blue-600">{totalEnProgreso}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Completadas</p>
          <p className="text-2xl font-bold text-green-600">{totalCompletadas}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-yellow-200 bg-yellow-50">
          <p className="text-sm text-yellow-700">Para Hoy</p>
          <p className="text-2xl font-bold text-yellow-700">{tareasHoy.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-red-200 bg-red-50">
          <p className="text-sm text-red-700">Vencidas</p>
          <p className="text-2xl font-bold text-red-700">{tareasVencidas.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          <span className="text-sm text-gray-500 self-center">Estado:</span>
          {(['todas', 'pendiente', 'en_progreso', 'completada'] as const).map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filtroEstado === estado
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border'
              }`}
            >
              {estado === 'todas' ? 'Todas' : estado === 'en_progreso' ? 'En Progreso' : estado.charAt(0).toUpperCase() + estado.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <span className="text-sm text-gray-500 self-center">Prioridad:</span>
          {(['todas', 'urgente', 'alta', 'media', 'baja'] as const).map((prioridad) => (
            <button
              key={prioridad}
              onClick={() => setFiltroPrioridad(prioridad)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filtroPrioridad === prioridad
                  ? prioridad === 'urgente'
                    ? 'bg-red-100 text-red-700'
                    : prioridad === 'alta'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-blue-100 text-blue-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border'
              }`}
            >
              {prioridad === 'todas' ? 'Todas' : prioridad.charAt(0).toUpperCase() + prioridad.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tareas vencidas */}
      {tareasVencidas.length > 0 && filtroEstado !== 'completada' && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-red-600 uppercase mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Tareas Vencidas ({tareasVencidas.length})
          </h3>
          <div className="space-y-3">
            {tareasVencidas.map((tarea) => (
              <TareaCard
                key={tarea.id}
                tarea={tarea}
                onComplete={() => handleComplete(tarea.id)}
                onEdit={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tareas para hoy */}
      {tareasHoy.length > 0 && filtroEstado !== 'completada' && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-blue-600 uppercase mb-3">
            Para Hoy ({tareasHoy.length})
          </h3>
          <div className="space-y-3">
            {tareasHoy.map((tarea) => (
              <TareaCard
                key={tarea.id}
                tarea={tarea}
                onComplete={() => handleComplete(tarea.id)}
                onEdit={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Lista de tareas */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
          {filtroEstado === 'completada' ? 'Completadas' : 'Todas las Tareas'} ({tareasFiltradas.length})
        </h3>
        <div className="space-y-3">
          {tareasFiltradas.map((tarea) => (
            <TareaCard
              key={tarea.id}
              tarea={tarea}
              onComplete={() => handleComplete(tarea.id)}
              onEdit={() => {}}
            />
          ))}
        </div>

        {tareasFiltradas.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No hay tareas que mostrar</p>
          </div>
        )}
      </div>

      {/* Modal Nueva Tarea */}
      <NuevaTareaModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSave={(tarea) => addTarea(tarea)}
      />
    </div>
  );
};

export default TareasPage;
