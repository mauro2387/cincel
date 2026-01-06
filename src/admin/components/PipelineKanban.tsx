/**
 * Pipeline Kanban - Vista de pipeline con drag-and-drop
 */

import React, { useState } from 'react';
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { usePipelineStore, PIPELINE_STAGES } from '../store/pipelineStore';
import { LeadCard } from './LeadCard';
import { LeadDetailModal } from './LeadDetailModal';
import { NewLeadModal } from './NewLeadModal';
import type { LeadEstado } from '../../lib/database.types';

export const PipelineKanban: React.FC = () => {
  const { leads, moveLead, selectedLeadId, selectLead } = usePipelineStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [newLeadStage, setNewLeadStage] = useState<LeadEstado>('nuevo');
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;
  const selectedLead = selectedLeadId ? leads.find((l) => l.id === selectedLeadId) : null;
  
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const overId = over.id as string;
      
      // Check if dropped on a stage column
      const isStage = PIPELINE_STAGES.some((s) => s.id === overId);
      
      if (isStage) {
        moveLead(active.id as string, overId as LeadEstado);
      }
    }
    
    setActiveId(null);
  };
  
  const handleAddLead = (stage: LeadEstado) => {
    setNewLeadStage(stage);
    setShowNewLeadModal(true);
  };
  
  // Get leads by stage
  const getLeadsForStage = (stageId: LeadEstado) => {
    return leads.filter((lead) => lead.estado === stageId);
  };
  
  // Calculate stage stats
  const getStageStats = (stageId: LeadEstado) => {
    const stageLeads = getLeadsForStage(stageId);
    const total = stageLeads.reduce((sum, lead) => sum + (lead.presupuesto_estimado || 0), 0);
    return {
      count: stageLeads.length,
      total,
    };
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full overflow-x-auto">
        <div className="flex gap-4 p-4 min-w-max h-full">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = getLeadsForStage(stage.id);
            const stats = getStageStats(stage.id);
            
            return (
              <div
                key={stage.id}
                id={stage.id}
                className="w-72 flex-shrink-0 flex flex-col bg-gray-100 rounded-lg"
              >
                {/* Stage Header */}
                <div className={`${stage.color} text-white px-4 py-3 rounded-t-lg`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{stage.label}</h3>
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                      {stats.count}
                    </span>
                  </div>
                  {stats.total > 0 && (
                    <p className="text-xs text-white/80 mt-1">
                      ${stats.total.toLocaleString('es-UY')}
                    </p>
                  )}
                </div>
                
                {/* Stage Content */}
                <SortableContext
                  items={stageLeads.map((l) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div 
                    className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]"
                    data-stage={stage.id}
                  >
                    {stageLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onClick={() => selectLead(lead.id)}
                        isDragging={activeId === lead.id}
                      />
                    ))}
                    
                    {stageLeads.length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        Sin leads
                      </div>
                    )}
                  </div>
                </SortableContext>
                
                {/* Add Lead Button */}
                <button
                  onClick={() => handleAddLead(stage.id)}
                  className="m-2 p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-400 hover:text-amber-600 transition-colors text-sm"
                >
                  + Agregar lead
                </button>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Drag Overlay */}
      <DragOverlay>
        {activeLead && (
          <LeadCard lead={activeLead} isDragging isOverlay />
        )}
      </DragOverlay>
      
      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => selectLead(null)}
        />
      )}
      
      {/* New Lead Modal */}
      {showNewLeadModal && (
        <NewLeadModal
          initialStage={newLeadStage}
          onClose={() => setShowNewLeadModal(false)}
        />
      )}
    </DndContext>
  );
};
