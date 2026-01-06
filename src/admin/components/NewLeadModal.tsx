/**
 * New Lead Modal - Modal para crear un nuevo lead
 */

import React, { useState } from 'react';
import { usePipelineStore, PIPELINE_STAGES } from '../store/pipelineStore';
import type { LeadEstado, LeadOrigen, TipoObra } from '../../lib/database.types';

interface NewLeadModalProps {
  initialStage?: LeadEstado;
  onClose: () => void;
}

const ORIGENES: { value: LeadOrigen; label: string }[] = [
  { value: 'whatsapp', label: '💬 WhatsApp' },
  { value: 'instagram', label: '📸 Instagram' },
  { value: 'facebook', label: '👤 Facebook' },
  { value: 'web', label: '🌐 Sitio Web' },
  { value: 'referido', label: '🤝 Referido' },
  { value: 'google', label: '🔍 Google' },
  { value: 'telefono', label: '📞 Teléfono' },
  { value: 'otro', label: '📋 Otro' },
];

const TIPOS_OBRA: { value: TipoObra; label: string }[] = [
  { value: 'reforma', label: 'Reforma' },
  { value: 'obra_nueva', label: 'Obra Nueva' },
  { value: 'ampliacion', label: 'Ampliación' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'piscina', label: 'Piscina' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'otro', label: 'Otro' },
];

const URGENCIAS = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
];

export const NewLeadModal: React.FC<NewLeadModalProps> = ({ 
  initialStage = 'nuevo',
  onClose 
}) => {
  const { addLead } = usePipelineStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    zona: '',
    direccion: '',
    origen: 'web' as LeadOrigen,
    tipo_obra: null as TipoObra | null,
    presupuesto_estimado: '' as string | number,
    urgencia: 'media',
    estado: initialStage,
    tags: '',
    notas_internas: '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await addLead({
        nombre: formData.nombre,
        telefono: formData.telefono || null,
        email: formData.email || null,
        zona: formData.zona || null,
        direccion: formData.direccion || null,
        origen: formData.origen,
        tipo_obra: formData.tipo_obra,
        presupuesto_estimado: formData.presupuesto_estimado ? Number(formData.presupuesto_estimado) : null,
        urgencia: formData.urgencia || null,
        estado: formData.estado as LeadEstado,
        responsable_id: null,
        motivo_perdida: null,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
        notas_internas: formData.notas_internas || null,
        ultima_interaccion: new Date().toISOString(),
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating lead:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-amber-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Nuevo Lead</h2>
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
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Nombre del cliente potencial"
              />
            </div>
            
            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="+598 99 123 456"
              />
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="email@ejemplo.com"
              />
            </div>
            
            {/* Zona */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zona
              </label>
              <input
                type="text"
                name="zona"
                value={formData.zona}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Ej: Pocitos, Carrasco..."
              />
            </div>
            
            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Dirección completa"
              />
            </div>
            
            {/* Origen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Origen
              </label>
              <select
                name="origen"
                value={formData.origen}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                {ORIGENES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Tipo de Obra */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Obra
              </label>
              <select
                name="tipo_obra"
                value={formData.tipo_obra || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">Seleccionar...</option>
                {TIPOS_OBRA.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Presupuesto Estimado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Presupuesto Estimado (USD)
              </label>
              <input
                type="number"
                name="presupuesto_estimado"
                value={formData.presupuesto_estimado}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="50000"
                min="0"
              />
            </div>
            
            {/* Urgencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Urgencia
              </label>
              <select
                name="urgencia"
                value={formData.urgencia}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                {URGENCIAS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado Inicial
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Tags */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Etiquetas
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="cocina, urgente, referido (separadas por coma)"
              />
            </div>
            
            {/* Notas */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas Internas
              </label>
              <textarea
                name="notas_internas"
                value={formData.notas_internas}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Notas sobre el lead..."
              />
            </div>
          </div>
        </form>
        
        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-2 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !formData.nombre}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Guardando...' : 'Crear Lead'}
          </button>
        </div>
      </div>
    </div>
  );
};
