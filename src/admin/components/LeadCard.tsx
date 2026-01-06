/**
 * Lead Card - Tarjeta de lead para el pipeline Kanban
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { LocalLead } from '../store/pipelineStore';

interface LeadCardProps {
  lead: LocalLead;
  onClick?: () => void;
  isDragging?: boolean;
  isOverlay?: boolean;
}

const ORIGEN_ICONS: Record<string, string> = {
  whatsapp: '💬',
  instagram: '📸',
  facebook: '👤',
  web: '🌐',
  referido: '🤝',
  google: '🔍',
  telefono: '📞',
  otro: '📋',
};

const URGENCIA_COLORS: Record<string, string> = {
  alta: 'bg-red-100 text-red-700',
  media: 'bg-yellow-100 text-yellow-700',
  baja: 'bg-green-100 text-green-700',
};

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onClick,
  isDragging,
  isOverlay,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: lead.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const timeAgo = lead.ultima_interaccion
    ? formatDistanceToNow(new Date(lead.ultima_interaccion), { 
        addSuffix: true, 
        locale: es 
      })
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-pointer
        hover:shadow-md hover:border-amber-300 transition-all
        ${isDragging ? 'opacity-50' : ''}
        ${isOverlay ? 'shadow-lg rotate-3' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-gray-900 text-sm leading-tight line-clamp-1">
          {lead.nombre}
        </h4>
        <span className="text-lg flex-shrink-0" title={lead.origen}>
          {ORIGEN_ICONS[lead.origen] || '📋'}
        </span>
      </div>
      
      {/* Contact Info */}
      <div className="space-y-1 text-xs text-gray-600 mb-2">
        {lead.telefono && (
          <p className="flex items-center gap-1">
            <span>📱</span>
            <span className="truncate">{lead.telefono}</span>
          </p>
        )}
        {lead.zona && (
          <p className="flex items-center gap-1">
            <span>📍</span>
            <span className="truncate">{lead.zona}</span>
          </p>
        )}
      </div>
      
      {/* Type & Budget */}
      {(lead.tipo_obra || lead.presupuesto_estimado) && (
        <div className="flex items-center gap-2 text-xs mb-2">
          {lead.tipo_obra && (
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">
              {lead.tipo_obra.replace('_', ' ')}
            </span>
          )}
          {lead.presupuesto_estimado && (
            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
              ${lead.presupuesto_estimado.toLocaleString('es-UY')}
            </span>
          )}
        </div>
      )}
      
      {/* Tags */}
      {lead.tags && lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {lead.tags.slice(0, 2).map((tag, i) => (
            <span
              key={i}
              className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px]"
            >
              {tag}
            </span>
          ))}
          {lead.tags.length > 2 && (
            <span className="text-gray-400 text-[10px]">
              +{lead.tags.length - 2}
            </span>
          )}
        </div>
      )}
      
      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        {lead.urgencia && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${URGENCIA_COLORS[lead.urgencia] || ''}`}>
            {lead.urgencia}
          </span>
        )}
        {timeAgo && (
          <span className="text-[10px] text-gray-400">
            {timeAgo}
          </span>
        )}
      </div>
    </div>
  );
};
