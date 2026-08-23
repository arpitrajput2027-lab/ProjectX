import React from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export interface SectionItem {
  id: string;
  label: string;
}

interface SortableItemProps {
  id: string;
  label: string;
  onClick: (id: string) => void;
  activeId: string | null;
}

function SortableItem({ id, label, onClick, activeId }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center p-3 mb-2 bg-white border rounded-lg shadow-sm group transition-colors ${
        activeId === id ? 'border-accent ring-1 ring-accent/50' : 'border-rule hover:border-rule-med'
      }`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab text-muted hover:text-ink mr-3 p-1 rounded"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <button 
        onClick={() => onClick(id)}
        className="flex-1 text-left text-sm font-medium text-ink-2 hover:text-ink truncate"
      >
        {label}
      </button>
    </div>
  );
}

interface SectionManagerProps {
  sections: SectionItem[];
  onReorder: (sections: SectionItem[]) => void;
  onNavigate: (sectionId: string) => void;
  activeSectionId: string | null;
}

export function SectionManager({ sections, onReorder, onNavigate, activeSectionId }: SectionManagerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      
      onReorder(arrayMove(sections, oldIndex, newIndex));
    }
  }

  return (
    <div className="w-64 h-full flex flex-col hidden lg:flex justify-center p-4 z-10">
      <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-xl border border-rule overflow-hidden">
        <div className="p-4 border-b border-rule bg-cream-2 text-center">
          <h3 className="font-serif text-ink font-medium text-base">Resume Sections</h3>
          <p className="text-[10px] text-muted mt-1">Drag to reorder, click to jump</p>
        </div>
        
        <div className="p-2 overflow-y-visible">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={sections.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section) => (
                <SortableItem 
                  key={section.id} 
                  id={section.id} 
                  label={section.label} 
                  onClick={onNavigate}
                  activeId={activeSectionId}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
