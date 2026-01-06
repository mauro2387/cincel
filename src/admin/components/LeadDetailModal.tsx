/**
 * Lead Detail Modal - Modal con detalles completos del lead
 */

import React, { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { usePipelineStore, PIPELINE_STAGES, type LocalLead } from '../store/pipelineStore';
import type { LeadEstado } from '../../lib/database.types';

interface LeadDetailModalProps {
  lead: LocalLead;
  onClose: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, onClose }) => {
  const { updateLead, deleteLead } = usePipelineStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newNote, setNewNote] = useState('');
  
  const currentStage = PIPELINE_STAGES.find((s) => s.id === lead.estado);
  
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    const currentNotes = lead.notas_internas || '';
    const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es });
    const updatedNotes = `${currentNotes}\n\n[${timestamp}]\n${newNote.trim()}`.trim();
    
    await updateLead(lead.id, { notas_internas: updatedNotes });
    setNewNote('');
  };
  
  const handleStageChange = async (newStage: LeadEstado) => {
    await updateLead(lead.id, { estado: newStage });
  };
  
  const handleDelete = async () => {
    await deleteLead(lead.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`${currentStage?.color || 'bg-gray-500'} text-white px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{lead.nombre}</h2>
              <p className="text-white/80 text-sm">{currentStage?.label}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Info */}
            <div className="space-y-6">
              {/* Contact Info */}
              <section>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>📞</span> Contacto
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {lead.telefono && (
                    <p className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Teléfono:</span>
                      <a href={`tel:${lead.telefono}`} className="text-amber-600 hover:underline">
                        {lead.telefono}
                      </a>
                      <a
                        href={`https://wa.me/${lead.telefono.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700"
                        title="Abrir WhatsApp"
                      >
                        💬
                      </a>
                    </p>
                  )}
                  {lead.email && (
                    <p className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Email:</span>
                      <a href={`mailto:${lead.email}`} className="text-amber-600 hover:underline">
                        {lead.email}
                      </a>
                    </p>
                  )}
                  {lead.zona && (
                    <p className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Zona:</span>
                      <span>{lead.zona}</span>
                    </p>
                  )}
                  {lead.direccion && (
                    <p className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Dirección:</span>
                      <span>{lead.direccion}</span>
                    </p>
                  )}
                </div>
              </section>
              
              {/* Project Info */}
              <section>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>🏗️</span> Proyecto
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {lead.tipo_obra && (
                    <p className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Tipo:</span>
                      <span className="capitalize">{lead.tipo_obra.replace('_', ' ')}</span>
                    </p>
                  )}
                  {lead.presupuesto_estimado && (
                    <p className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Presupuesto est.:</span>
                      <span className="font-semibold text-amber-600">
                        ${lead.presupuesto_estimado.toLocaleString('es-UY')}
                      </span>
                    </p>
                  )}
                  {lead.urgencia && (
                    <p className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Urgencia:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        lead.urgencia === 'alta' ? 'bg-red-100 text-red-700' :
                        lead.urgencia === 'media' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {lead.urgencia}
                      </span>
                    </p>
                  )}
                  <p className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Origen:</span>
                    <span className="capitalize">{lead.origen}</span>
                  </p>
                </div>
              </section>
              
              {/* Tags */}
              {lead.tags && lead.tags.length > 0 && (
                <section>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>🏷️</span> Etiquetas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {lead.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}
              
              {/* Dates */}
              <section>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>📅</span> Fechas
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500">Creado:</span>
                    <span>{format(new Date(lead.created_at), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}</span>
                  </p>
                  {lead.ultima_interaccion && (
                    <p className="flex items-center gap-2">
                      <span className="text-gray-500">Última interacción:</span>
                      <span>
                        {formatDistanceToNow(new Date(lead.ultima_interaccion), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </span>
                    </p>
                  )}
                </div>
              </section>
            </div>
            
            {/* Right Column - Actions & Notes */}
            <div className="space-y-6">
              {/* Stage Selector */}
              <section>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>📊</span> Estado del Pipeline
                </h3>
                <select
                  value={lead.estado}
                  onChange={(e) => handleStageChange(e.target.value as LeadEstado)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  {PIPELINE_STAGES.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </section>
              
              {/* Quick Actions */}
              <section>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>⚡</span> Acciones Rápidas
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm">
                    <span>📞</span> Llamar
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm">
                    <span>💬</span> WhatsApp
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                    <span>📧</span> Email
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm">
                    <span>📋</span> Presupuesto
                  </button>
                </div>
              </section>
              
              {/* Notes */}
              <section>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>📝</span> Notas Internas
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {lead.notas_internas ? (
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans mb-4">
                      {lead.notas_internas}
                    </pre>
                  ) : (
                    <p className="text-gray-400 text-sm mb-4">Sin notas</p>
                  )}
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Agregar nota..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
          >
            Eliminar Lead
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
        
        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Eliminar lead?</h3>
              <p className="text-gray-600 mb-4">
                Esta acción no se puede deshacer. Se perderán todos los datos de {lead.nombre}.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
