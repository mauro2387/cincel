/**
 * ObraDetallePagePro - Vista de Proyecto Enterprise
 * Página de detalle completa con 8 tabs profesionales
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useObrasStore, type BitacoraEntry } from '../store/obrasStore';
import { useProjectDetailStore } from '../store/projectDetailStore';
import { useChangeOrderStore } from '../store/changeOrderStore';
import { usePurchaseStore } from '../store/purchaseStore';
import { useFinanceStore } from '../store/financeStore';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

// ============================================
// TIPOS Y CONSTANTES
// ============================================

type TabId = 'resumen' | 'bitacora' | 'fotos' | 'tareas' | 'costos' | 'ordenes' | 'documentos' | 'equipo';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'resumen', label: 'Resumen', icon: '📊' },
  { id: 'bitacora', label: 'Bitácora', icon: '📝' },
  { id: 'fotos', label: 'Fotos', icon: '📷' },
  { id: 'tareas', label: 'Tareas', icon: '✓' },
  { id: 'costos', label: 'Costos', icon: '💰' },
  { id: 'ordenes', label: 'Órdenes', icon: '📦' },
  { id: 'documentos', label: 'Documentos', icon: '📄' },
  { id: 'equipo', label: 'Equipo', icon: '👥' },
];

const ENTRY_TYPES = [
  { id: 'work', label: 'Trabajo', icon: '🔨', color: 'bg-blue-500' },
  { id: 'weather', label: 'Clima', icon: '🌤️', color: 'bg-yellow-500' },
  { id: 'delivery', label: 'Entrega', icon: '📦', color: 'bg-green-500' },
  { id: 'inspection', label: 'Inspección', icon: '🔍', color: 'bg-purple-500' },
  { id: 'issue', label: 'Problema', icon: '⚠️', color: 'bg-red-500' },
  { id: 'note', label: 'Nota', icon: '📌', color: 'bg-gray-500' },
];

// ============================================
// COMPONENTES AUXILIARES
// ============================================

const CircularProgress = ({ value, size = 120, strokeWidth = 10, color = '#3b82f6' }: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000"
      />
    </svg>
  );
};

const StatCard = ({ icon, label, value, subValue, trend, color = 'blue' }: {
  icon: string;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: { value: number; label: string };
  color?: string;
}) => {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-orange-500',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-indigo-600',
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center text-white text-lg shadow-lg`}>
          {icon}
        </div>
        <span className="text-sm text-gray-500 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subValue && <p className="text-sm text-gray-500 mt-1">{subValue}</p>}
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-sm ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <span>{trend.value >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.value)}% {trend.label}</span>
        </div>
      )}
    </div>
  );
};

const Timeline = ({ entries }: { entries: BitacoraEntry[] }) => (
  <div className="relative pl-8">
    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
    {entries.map((entry, idx) => {
      const typeConfig = ENTRY_TYPES[5]; // Default to 'note'
      return (
        <div key={entry.id || idx} className="relative pb-6 last:pb-0">
          <div className={`absolute left-0 -translate-x-1/2 w-6 h-6 ${typeConfig.color} rounded-full flex items-center justify-center text-white text-xs`}>
            {typeConfig.icon}
          </div>
          <div className="ml-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.color} text-white`}>
                {entry.titulo}
              </span>
              <span className="text-xs text-gray-400">
                {entry.fecha && format(parseISO(entry.fecha), 'dd MMM yyyy HH:mm', { locale: es })}
              </span>
            </div>
            <p className="text-gray-900">{entry.descripcion}</p>
            {entry.fotos && entry.fotos.length > 0 && (
              <div className="flex gap-2 mt-3">
                {entry.fotos.slice(0, 3).map((photo: string, i: number) => (
                  <img key={i} src={photo} alt="" className="w-16 h-16 rounded-lg object-cover" />
                ))}
                {entry.fotos.length > 3 && (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                    +{entry.fotos.length - 3}
                  </div>
                )}
              </div>
            )}
            {entry.created_by && (
              <p className="text-xs text-gray-400 mt-2">Por: {entry.created_by}</p>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function ObraDetallePagePro() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { obras, addBitacoraEntry, getBitacoraByObra, getTareasByObra, getFotosByObra } = useObrasStore();
  const { fetchPhotos } = useProjectDetailStore();
  const { changeOrders, fetchChangeOrders } = useChangeOrderStore();
  const { purchaseOrders, fetchPurchaseOrders } = usePurchaseStore();
  const { payments, fetchPayments } = useFinanceStore();
  
  const [activeTab, setActiveTab] = useState<TabId>('resumen');
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [_showNewPhoto, setShowNewPhoto] = useState(false); // TODO: Add photo upload modal
  const [entryForm, setEntryForm] = useState({ type: 'work', description: '' });
  
  const obra = useMemo(() => obras.find(o => o.id === id), [obras, id]);
  
  useEffect(() => {
    if (id) {
      fetchPhotos(id);
      fetchChangeOrders(id);
      fetchPurchaseOrders();
      fetchPayments();
    }
  }, [id, fetchPhotos, fetchChangeOrders, fetchPurchaseOrders, fetchPayments]);

  // Get data for this project from obrasStore
  const projectBitacora = id ? getBitacoraByObra(id) : [];
  const projectTareas = id ? getTareasByObra(id) : [];
  const projectFotos = id ? getFotosByObra(id) : [];

  // ============================================
  // MÉTRICAS CALCULADAS
  // ============================================

  const metrics = useMemo(() => {
    if (!obra) return null;
    
    const projectOrders = purchaseOrders.filter(o => o.project_id === id);
    const projectPayments = payments.filter(p => p.project_id === id);
    
    const totalBudget = obra.presupuesto_total || 0;
    const totalSpent = obra.costo_actual || projectOrders.reduce((s, o) => s + (o.total || 0), 0);
    const totalIncome = projectPayments.filter(p => p.type === 'income').reduce((s, p) => s + p.amount, 0);
    
    const startDate = obra.fecha_inicio ? parseISO(obra.fecha_inicio) : new Date();
    const endDate = obra.fecha_fin_estimada ? parseISO(obra.fecha_fin_estimada) : addDays(startDate, 180);
    const totalDays = differenceInDays(endDate, startDate);
    const elapsedDays = differenceInDays(new Date(), startDate);
    const timeProgress = Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100));
    
    const completedTasks = projectTareas.filter(t => t.estado === 'completada').length;
    const taskProgress = projectTareas.length > 0 ? (completedTasks / projectTareas.length) * 100 : 0;
    
    const budgetUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    return {
      totalBudget,
      totalSpent,
      totalIncome,
      budgetRemaining: totalBudget - totalSpent,
      budgetUsed,
      timeProgress,
      taskProgress,
      totalDays,
      elapsedDays,
      daysRemaining: totalDays - elapsedDays,
      totalTasks: projectTareas.length,
      completedTasks,
      pendingTasks: projectTareas.length - completedTasks,
      totalOrders: projectOrders.length,
      pendingOrders: projectOrders.filter(o => !['received', 'cancelled'].includes(o.status)).length,
      logEntries: projectBitacora.length,
      photoCount: projectFotos.length,
      teamSize: 0,
      changeOrders: changeOrders.filter(c => c.project_id === id),
    };
  }, [obra, purchaseOrders, payments, projectTareas, projectBitacora, projectFotos, changeOrders, id]);

  const handleAddEntry = () => {
    if (!id || !entryForm.description) return;
    addBitacoraEntry({
      obra_id: id,
      fecha: new Date().toISOString(),
      titulo: ENTRY_TYPES.find(t => t.id === entryForm.type)?.label || 'Nota',
      descripcion: entryForm.description,
      trabajadores_presentes: 0,
      horas_trabajadas: 0,
      actividades: [],
      fotos: [],
      created_by: 'Usuario',
    });
    setShowNewEntry(false);
    setEntryForm({ type: 'work', description: '' });
  };

  const formatCurrency = (value: number) => `$${value.toLocaleString('es-UY')}`;

  if (!obra) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">🔍</span>
          <h2 className="text-xl font-bold mt-4 text-gray-900">Obra no encontrada</h2>
          <button onClick={() => navigate('/admin/obras')} className="mt-4 text-blue-600 hover:underline">
            ← Volver a obras
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDERIZADO
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Hero */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white">
        <div className="px-6 py-6">
          <button onClick={() => navigate('/admin/obras')} className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mb-4">
            ← Volver a Obras
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  obra.estado === 'en_progreso' ? 'bg-green-500' :
                  obra.estado === 'completada' ? 'bg-blue-500' :
                  obra.estado === 'pausada' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }`}>
                  {obra.estado?.replace('_', ' ').toUpperCase() || 'ACTIVO'}
                </span>
                <span className="text-slate-400 font-mono text-sm">{obra.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">{obra.nombre}</h1>
              <p className="text-slate-300 max-w-2xl">{obra.descripcion || obra.direccion}</p>
              
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">📍</span>
                  <span>{obra.direccion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">📅</span>
                  <span>
                    {obra.fecha_inicio && format(parseISO(obra.fecha_inicio), 'dd MMM', { locale: es })} - {obra.fecha_fin_estimada && format(parseISO(obra.fecha_fin_estimada), 'dd MMM yyyy', { locale: es })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">👷</span>
                  <span>{obra.encargado || 'Sin asignar'}</span>
                </div>
              </div>
            </div>
            
            {/* Progress Ring */}
            <div className="relative">
              <CircularProgress value={obra.porcentaje_avance || metrics?.taskProgress || 0} size={120} color="#22c55e" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{Math.round(obra.porcentaje_avance || metrics?.taskProgress || 0)}%</span>
                <span className="text-xs text-slate-400">Avance</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="px-6 flex gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 rounded-t-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-white text-slate-900' 
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* TAB: RESUMEN */}
        {activeTab === 'resumen' && metrics && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard 
                icon="💰" 
                label="Presupuesto" 
                value={formatCurrency(metrics.totalBudget)}
                subValue={`${metrics.budgetUsed.toFixed(1)}% usado`}
                color="blue"
              />
              <StatCard 
                icon="📊" 
                label="Gastado" 
                value={formatCurrency(metrics.totalSpent)}
                subValue={`Restante: ${formatCurrency(metrics.budgetRemaining)}`}
                color={metrics.budgetUsed > 100 ? 'red' : metrics.budgetUsed > 80 ? 'yellow' : 'green'}
              />
              <StatCard 
                icon="⏱️" 
                label="Tiempo" 
                value={`${metrics.daysRemaining} días`}
                subValue={`${metrics.elapsedDays}/${metrics.totalDays} días transcurridos`}
                color={metrics.daysRemaining < 30 ? 'red' : 'purple'}
              />
              <StatCard 
                icon="✓" 
                label="Tareas" 
                value={`${metrics.completedTasks}/${metrics.totalTasks}`}
                subValue={`${metrics.pendingTasks} pendientes`}
                color="green"
              />
            </div>

            {/* Progress Bars */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Progreso General</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Avance Físico</span>
                      <span className="font-medium">{Math.round(obra.porcentaje_avance || 0)}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all" style={{ width: `${obra.porcentaje_avance || 0}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Tiempo Transcurrido</span>
                      <span className="font-medium">{Math.round(metrics.timeProgress)}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all" style={{ width: `${metrics.timeProgress}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Presupuesto Usado</span>
                      <span className="font-medium">{Math.round(metrics.budgetUsed)}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          metrics.budgetUsed > 100 ? 'bg-red-500' : metrics.budgetUsed > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`} 
                        style={{ width: `${Math.min(metrics.budgetUsed, 100)}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => { setActiveTab('bitacora'); setShowNewEntry(true); }}
                    className="p-4 bg-blue-50 rounded-xl text-left hover:bg-blue-100 transition-colors"
                  >
                    <span className="text-2xl">📝</span>
                    <p className="font-medium text-gray-900 mt-2">Nueva Entrada</p>
                    <p className="text-xs text-gray-500">Agregar a bitácora</p>
                  </button>
                  <button 
                    onClick={() => { setActiveTab('fotos'); setShowNewPhoto(true); }}
                    className="p-4 bg-green-50 rounded-xl text-left hover:bg-green-100 transition-colors"
                  >
                    <span className="text-2xl">📷</span>
                    <p className="font-medium text-gray-900 mt-2">Subir Foto</p>
                    <p className="text-xs text-gray-500">Documentar avance</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('tareas')}
                    className="p-4 bg-purple-50 rounded-xl text-left hover:bg-purple-100 transition-colors"
                  >
                    <span className="text-2xl">✓</span>
                    <p className="font-medium text-gray-900 mt-2">Ver Tareas</p>
                    <p className="text-xs text-gray-500">{metrics.pendingTasks} pendientes</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('ordenes')}
                    className="p-4 bg-orange-50 rounded-xl text-left hover:bg-orange-100 transition-colors"
                  >
                    <span className="text-2xl">📦</span>
                    <p className="font-medium text-gray-900 mt-2">Órdenes</p>
                    <p className="text-xs text-gray-500">{metrics.pendingOrders} en curso</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Actividad Reciente</h3>
                <button onClick={() => setActiveTab('bitacora')} className="text-sm text-blue-600 hover:underline">
                  Ver todo →
                </button>
              </div>
              {projectBitacora.length > 0 ? (
                <Timeline entries={projectBitacora.slice(0, 5)} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl">📝</span>
                  <p className="mt-2">No hay entradas en la bitácora</p>
                  <button 
                    onClick={() => setShowNewEntry(true)}
                    className="mt-2 text-blue-600 hover:underline"
                  >
                    Agregar primera entrada
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: BITÁCORA */}
        {activeTab === 'bitacora' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Bitácora de Obra</h2>
              <button 
                onClick={() => setShowNewEntry(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                + Nueva Entrada
              </button>
            </div>
            
            {/* Entry Type Filter */}
            <div className="flex gap-2 flex-wrap">
              {ENTRY_TYPES.map(type => (
                <button key={type.id} className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${type.color} text-white`}>
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
            
            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {projectBitacora.length > 0 ? (
                <Timeline entries={projectBitacora} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl">📝</span>
                  <p className="mt-4 text-lg">Sin entradas en la bitácora</p>
                  <button onClick={() => setShowNewEntry(true)} className="mt-2 text-blue-600 hover:underline">
                    Crear primera entrada
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: FOTOS */}
        {activeTab === 'fotos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Galería de Fotos</h2>
              <button 
                onClick={() => setShowNewPhoto(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
              >
                📷 Subir Foto
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {projectFotos.map((foto, idx) => (
                <div key={foto.id || idx} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer">
                  <img 
                    src={foto.url || '/placeholder.jpg'} 
                    alt={foto.titulo || ''} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <p className="text-sm font-medium truncate">{foto.titulo || foto.descripcion}</p>
                      <p className="text-xs opacity-75">{foto.fecha && format(parseISO(foto.fecha), 'dd MMM yyyy', { locale: es })}</p>
                    </div>
                  </div>
                </div>
              ))}
              {projectFotos.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <span className="text-6xl">📷</span>
                  <p className="mt-4 text-lg">Sin fotos cargadas</p>
                  <button onClick={() => setShowNewPhoto(true)} className="mt-2 text-blue-600 hover:underline">
                    Subir primera foto
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: TAREAS */}
        {activeTab === 'tareas' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Tareas del Proyecto</h2>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700">
                + Nueva Tarea
              </button>
            </div>
            
            {/* Task Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{metrics?.totalTasks || 0}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{metrics?.completedTasks || 0}</p>
                <p className="text-sm text-gray-500">Completadas</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">{metrics?.pendingTasks || 0}</p>
                <p className="text-sm text-gray-500">Pendientes</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{Math.round(metrics?.taskProgress || 0)}%</p>
                <p className="text-sm text-gray-500">Progreso</p>
              </div>
            </div>
            
            {/* Task List */}
            <div className="bg-white rounded-2xl shadow-lg divide-y divide-gray-100">
              {projectTareas.map(tarea => (
                <div key={tarea.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                  <button className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    tarea.estado === 'completada' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                  }`}>
                    {tarea.estado === 'completada' && '✓'}
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium ${tarea.estado === 'completada' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {tarea.titulo}
                    </p>
                    <p className="text-xs text-gray-500">{tarea.asignado_a || 'Sin asignar'} • {tarea.fecha_vencimiento && format(parseISO(tarea.fecha_vencimiento), 'dd MMM', { locale: es })}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tarea.prioridad === 'alta' || tarea.prioridad === 'urgente' ? 'bg-red-100 text-red-700' :
                    tarea.prioridad === 'media' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {tarea.prioridad || 'Normal'}
                  </span>
                </div>
              ))}
              {projectTareas.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl">✓</span>
                  <p className="mt-4 text-lg">Sin tareas asignadas</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: COSTOS */}
        {activeTab === 'costos' && metrics && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Control de Costos</h2>
            
            {/* Budget Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                <p className="text-blue-100 text-sm">Presupuesto Total</p>
                <p className="text-4xl font-bold mt-2">{formatCurrency(metrics.totalBudget)}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                <p className="text-green-100 text-sm">Ejecutado</p>
                <p className="text-4xl font-bold mt-2">{formatCurrency(metrics.totalSpent)}</p>
                <p className="text-green-200 text-sm mt-1">{metrics.budgetUsed.toFixed(1)}% del presupuesto</p>
              </div>
              <div className={`bg-gradient-to-br ${metrics.budgetRemaining >= 0 ? 'from-emerald-500 to-teal-600' : 'from-red-500 to-rose-600'} rounded-2xl p-6 text-white`}>
                <p className="text-white/80 text-sm">{metrics.budgetRemaining >= 0 ? 'Saldo Disponible' : 'Sobrecosto'}</p>
                <p className="text-4xl font-bold mt-2">{formatCurrency(Math.abs(metrics.budgetRemaining))}</p>
              </div>
            </div>

            {/* Change Orders */}
            {metrics.changeOrders.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Órdenes de Cambio</h3>
                <div className="space-y-3">
                  {metrics.changeOrders.map(co => (
                    <div key={co.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">{co.title}</p>
                        <p className="text-sm text-gray-500">{co.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${(co.cost_impact || 0) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {(co.cost_impact || 0) >= 0 ? '+' : ''}{formatCurrency(co.cost_impact || 0)}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          co.status === 'approved' ? 'bg-green-100 text-green-700' :
                          co.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {co.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: ÓRDENES */}
        {activeTab === 'ordenes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Órdenes de Compra</h2>
              <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700">
                + Nueva Orden
              </button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg divide-y divide-gray-100">
              {purchaseOrders.filter(o => o.project_id === id).map(order => (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                      📦
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.code}</p>
                      <p className="text-sm text-gray-500">Orden de compra</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(order.total || 0)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === 'received' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
              {purchaseOrders.filter(o => o.project_id === id).length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl">📦</span>
                  <p className="mt-4 text-lg">Sin órdenes de compra</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: DOCUMENTOS */}
        {activeTab === 'documentos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Documentos</h2>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700">
                📄 Subir Documento
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Placeholder document cards */}
              {['Contrato', 'Planos', 'Permisos', 'Presupuesto', 'Cronograma'].map((doc, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-2xl">
                      📄
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{doc}</p>
                      <p className="text-xs text-gray-500">PDF • 2.4 MB</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: EQUIPO */}
        {activeTab === 'equipo' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Equipo del Proyecto</h2>
              <button className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700">
                + Agregar Miembro
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Show encargado as team member */}
              {obra.encargado && (
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {obra.encargado[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{obra.encargado}</p>
                      <p className="text-sm text-gray-500">Encargado</p>
                    </div>
                  </div>
                </div>
              )}
              {!obra.encargado && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <span className="text-6xl">👥</span>
                  <p className="mt-4 text-lg">Sin miembros asignados</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Nueva Entrada Bitácora */}
      {showNewEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">📝 Nueva Entrada</h3>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAddEntry(); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Entrada</label>
                <div className="grid grid-cols-3 gap-2">
                  {ENTRY_TYPES.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setEntryForm({ ...entryForm, type: type.id })}
                      className={`p-3 rounded-lg text-center transition-all ${
                        entryForm.type === type.id 
                          ? `${type.color} text-white` 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-xl">{type.icon}</span>
                      <p className="text-xs mt-1">{type.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={entryForm.description}
                  onChange={e => setEntryForm({ ...entryForm, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Describe el trabajo realizado, evento o situación..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewEntry(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                >
                  Guardar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
