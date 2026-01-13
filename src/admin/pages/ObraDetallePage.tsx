/**
 * ObraDetallePage - Página de detalle de obra con 8 tabs
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useObrasStore } from '../store/obrasStore';
import { useProjectDetailStore } from '../store/projectDetailStore';
import { useChangeOrderStore } from '../store/changeOrderStore';

type TabId = 'resumen' | 'bitacora' | 'fotos' | 'tareas' | 'costos' | 'ordenes' | 'documentos' | 'equipo';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'resumen', label: 'Resumen', icon: '📊' },
  { id: 'bitacora', label: 'Bitácora', icon: '📝' },
  { id: 'fotos', label: 'Fotos', icon: '📷' },
  { id: 'tareas', label: 'Tareas', icon: '✅' },
  { id: 'costos', label: 'Costos', icon: '💰' },
  { id: 'ordenes', label: 'Órdenes de Cambio', icon: '🔄' },
  { id: 'documentos', label: 'Documentos', icon: '📄' },
  { id: 'equipo', label: 'Equipo', icon: '👷' },
];

export default function ObraDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('resumen');
  
  const { obras } = useObrasStore();
  const { 
    logs, photos, tasks, costs, workLogs, financials, isLoading,
    loadAllProjectData, clearProjectData, addLog, addTask, 
    updateTaskStatus, addCost
  } = useProjectDetailStore();
  const { changeOrders, fetchChangeOrders } = useChangeOrderStore();
  
  const obra = obras.find(o => o.id === id);

  useEffect(() => {
    if (id && obra) {
      loadAllProjectData(id, obra.presupuesto_total || 0);
      fetchChangeOrders(id);
    }
    return () => clearProjectData();
  }, [id, obra, loadAllProjectData, clearProjectData, fetchChangeOrders]);

  // Form states
  const [newLog, setNewLog] = useState({ title: '', description: '', type: 'progress' as const });
  const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '' });
  const [newCost, setNewCost] = useState({ concept: '', amount: '', category: 'material' as const });

  if (!obra) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Obra no encontrada</p>
        <button onClick={() => navigate('/admin/obras')} className="mt-4 text-blue-600 hover:underline">
          ← Volver a obras
        </button>
      </div>
    );
  }

  const handleAddLog = async () => {
    if (!id || !newLog.title) return;
    await addLog({
      project_id: id,
      date: new Date().toISOString().split('T')[0],
      title: newLog.title,
      description: newLog.description,
      type: newLog.type,
      author: 'Usuario'
    });
    setNewLog({ title: '', description: '', type: 'progress' });
  };

  const handleAddTask = async () => {
    if (!id || !newTask.title) return;
    await addTask({
      project_id: id,
      title: newTask.title,
      description: newTask.description || null,
      status: 'pending',
      priority: 'medium',
      responsible: null,
      due_date: newTask.due_date || null
    });
    setNewTask({ title: '', description: '', due_date: '' });
  };

  const handleAddCost = async () => {
    if (!id || !newCost.concept || !newCost.amount) return;
    await addCost({
      project_id: id,
      concept: newCost.concept,
      category: newCost.category,
      amount: parseFloat(newCost.amount),
      date: new Date().toISOString().split('T')[0],
      supplier: null,
      invoice: null,
      notes: null
    });
    setNewCost({ concept: '', amount: '', category: 'material' });
  };

  const getEstadoStyles = (estado: string) => {
    switch (estado) {
      case 'en_progreso': return 'bg-blue-100 text-blue-800';
      case 'completada': return 'bg-green-100 text-green-800';
      case 'pausada': return 'bg-yellow-100 text-yellow-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/admin/obras')} className="text-sm text-gray-500 hover:text-gray-700 mb-2">
            ← Volver a obras
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{obra.nombre}</h1>
          <p className="text-gray-500">{obra.direccion}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoStyles(obra.estado)}`}>
            {obra.estado.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Tab Content */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow p-6">
          {/* RESUMEN */}
          {activeTab === 'resumen' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Presupuesto</p>
                <p className="text-2xl font-bold text-blue-900">
                  ${(financials?.totalBudget || obra.presupuesto_total || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Costo Actual</p>
                <p className="text-2xl font-bold text-green-900">
                  ${(financials?.currentCost || obra.costo_actual || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-600 font-medium">Restante</p>
                <p className="text-2xl font-bold text-yellow-900">
                  ${(financials?.remainingBudget || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium">Tareas Completadas</p>
                <p className="text-2xl font-bold text-purple-900">
                  {tasks.filter(t => t.status === 'completed').length} / {tasks.length}
                </p>
              </div>
              <div className="col-span-full">
                <h3 className="font-semibold mb-2">Descripción</h3>
                <p className="text-gray-600">{obra.descripcion || 'Sin descripción'}</p>
              </div>
              <div className="col-span-full">
                <h3 className="font-semibold mb-2">Avance</h3>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-600 h-4 rounded-full transition-all"
                    style={{ width: `${obra.porcentaje_avance || 0}%` }}
                  />
                </div>
                <p className="text-right text-sm text-gray-500 mt-1">{obra.porcentaje_avance || 0}%</p>
              </div>
            </div>
          )}

          {/* BITÁCORA */}
          {activeTab === 'bitacora' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Título de la entrada..."
                  value={newLog.title}
                  onChange={e => setNewLog({ ...newLog, title: e.target.value })}
                  className="flex-1 border rounded px-3 py-2"
                />
                <select
                  value={newLog.type}
                  onChange={e => setNewLog({ ...newLog, type: e.target.value as typeof newLog.type })}
                  className="border rounded px-3 py-2"
                >
                  <option value="progress">Progreso</option>
                  <option value="issue">Problema</option>
                  <option value="decision">Decisión</option>
                  <option value="change">Cambio</option>
                  <option value="visit">Visita</option>
                  <option value="other">Otro</option>
                </select>
                <button onClick={handleAddLog} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Agregar
                </button>
              </div>
              <textarea
                placeholder="Descripción..."
                value={newLog.description}
                onChange={e => setNewLog({ ...newLog, description: e.target.value })}
                className="w-full border rounded px-3 py-2 h-24"
              />
              <div className="divide-y">
                {logs.map(log => (
                  <div key={log.id} className="py-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        log.type === 'issue' ? 'bg-red-100 text-red-800' :
                        log.type === 'decision' ? 'bg-purple-100 text-purple-800' :
                        log.type === 'change' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.type}
                      </span>
                      <span className="font-medium">{log.title}</span>
                      <span className="text-gray-400 text-sm ml-auto">
                        {new Date(log.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {log.description && <p className="text-gray-600 mt-1">{log.description}</p>}
                  </div>
                ))}
                {logs.length === 0 && <p className="text-gray-500 py-4">No hay entradas en la bitácora</p>}
              </div>
            </div>
          )}

          {/* FOTOS */}
          {activeTab === 'fotos' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map(photo => (
                  <div key={photo.id} className="relative group">
                    <img src={photo.url} alt={photo.description || ''} className="w-full h-40 object-cover rounded" />
                    {photo.description && (
                      <p className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b">
                        {photo.description}
                      </p>
                    )}
                  </div>
                ))}
                {photos.length === 0 && <p className="col-span-full text-gray-500">No hay fotos</p>}
              </div>
            </div>
          )}

          {/* TAREAS */}
          {activeTab === 'tareas' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nueva tarea..."
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  className="flex-1 border rounded px-3 py-2"
                />
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                  className="border rounded px-3 py-2"
                />
                <button onClick={handleAddTask} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Agregar
                </button>
              </div>
              <div className="divide-y">
                {tasks.map(task => (
                  <div key={task.id} className="py-3 flex items-center gap-3">
                    <button
                      onClick={() => updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        task.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                      }`}
                    >
                      {task.status === 'completed' && '✓'}
                    </button>
                    <div className="flex-1">
                      <p className={task.status === 'completed' ? 'line-through text-gray-400' : ''}>
                        {task.title}
                      </p>
                      {task.due_date && (
                        <p className="text-sm text-gray-500">Vence: {new Date(task.due_date).toLocaleDateString()}</p>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
                {tasks.length === 0 && <p className="text-gray-500 py-4">No hay tareas</p>}
              </div>
            </div>
          )}

          {/* COSTOS */}
          {activeTab === 'costos' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Concepto..."
                  value={newCost.concept}
                  onChange={e => setNewCost({ ...newCost, concept: e.target.value })}
                  className="flex-1 border rounded px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Monto"
                  value={newCost.amount}
                  onChange={e => setNewCost({ ...newCost, amount: e.target.value })}
                  className="w-32 border rounded px-3 py-2"
                />
                <select
                  value={newCost.category}
                  onChange={e => setNewCost({ ...newCost, category: e.target.value as typeof newCost.category })}
                  className="border rounded px-3 py-2"
                >
                  <option value="material">Materiales</option>
                  <option value="labor">Mano de obra</option>
                  <option value="equipment">Equipos</option>
                  <option value="subcontract">Subcontrato</option>
                  <option value="other">Otros</option>
                </select>
                <button onClick={handleAddCost} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Agregar
                </button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2">Concepto</th>
                    <th className="py-2">Categoría</th>
                    <th className="py-2 text-right">Monto</th>
                    <th className="py-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {costs.map(cost => (
                    <tr key={cost.id} className="border-b">
                      <td className="py-2">{cost.concept}</td>
                      <td className="py-2">{cost.category}</td>
                      <td className="py-2 text-right">${cost.amount.toLocaleString()}</td>
                      <td className="py-2 text-gray-500">{new Date(cost.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold">
                    <td colSpan={2} className="py-2">Total</td>
                    <td className="py-2 text-right">${costs.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
              {costs.length === 0 && <p className="text-gray-500 py-4">No hay costos registrados</p>}
            </div>
          )}

          {/* ÓRDENES DE CAMBIO */}
          {activeTab === 'ordenes' && (
            <div className="space-y-4">
              <div className="divide-y">
                {changeOrders.map(order => (
                  <div key={order.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{order.title}</span>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-100">{order.type}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          order.status === 'approved' ? 'bg-green-100 text-green-800' :
                          order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{order.description}</p>
                    <p className="text-sm mt-1">
                      <span className="text-gray-500">Impacto:</span> ${order.cost_impact?.toLocaleString() || 0}
                    </p>
                  </div>
                ))}
                {changeOrders.length === 0 && <p className="text-gray-500 py-4">No hay órdenes de cambio</p>}
              </div>
            </div>
          )}

          {/* DOCUMENTOS */}
          {activeTab === 'documentos' && (
            <div className="text-gray-500 py-8 text-center">
              <p>📄 Módulo de documentos</p>
              <p className="text-sm">Próximamente: gestión de planos, contratos y documentos</p>
            </div>
          )}

          {/* EQUIPO */}
          {activeTab === 'equipo' && (
            <div className="space-y-4">
              <h3 className="font-semibold">Registro de trabajo diario</h3>
              <div className="divide-y">
                {workLogs.map(log => (
                  <div key={log.id} className="py-3">
                    <div className="flex justify-between">
                      <span className="font-medium">{log.supervisor}</span>
                      <span className="text-gray-500">{new Date(log.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600">{log.summary}</p>
                    {log.weather && <span className="text-xs text-gray-400">Clima: {log.weather}</span>}
                  </div>
                ))}
                {workLogs.length === 0 && <p className="text-gray-500 py-4">No hay registros de trabajo</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
