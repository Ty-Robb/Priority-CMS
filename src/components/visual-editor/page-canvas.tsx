
"use client";

import type { KeyboardEvent } from 'react';
import React, { useState, useEffect } from 'react';
import type { PageStructure, VisualBlock, VisualBlockPropsUnion } from '@/types';
import { CanvasBlockRenderer } from './canvas-block-renderer';
import { Input } from '@/components/ui/input'; // For inline editing
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

interface PageCanvasProps {
  page: PageStructure | null;
  onUpdatePageStructure: (updatedPage: PageStructure) => void;
}

export function PageCanvas({ page, onUpdatePageStructure }: PageCanvasProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState(page?.title || '');

  useEffect(() => {
    if (page) {
      setEditableTitle(page.title);
    }
  }, [page?.title]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!page) {
    return (
      <div className="p-8 border border-dashed border-muted-foreground rounded-lg text-center text-muted-foreground">
        No page structure to display. Generate content using the chat or load a page.
      </div>
    );
  }

  const handleTitleDoubleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditableTitle(event.target.value);
  };

  const handleTitleBlur = () => {
    if (page && page.title !== editableTitle) {
      onUpdatePageStructure({ ...page, title: editableTitle });
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleTitleBlur();
    } else if (event.key === 'Escape') {
      setEditableTitle(page.title); 
      setIsEditingTitle(false);
    }
  };

  const handleUpdateBlock = (blockId: string, newProps: Partial<VisualBlockPropsUnion>) => {
    // This function needs to recursively find and update nested blocks if necessary
    const updateRecursively = (blocks: VisualBlock[]): VisualBlock[] => {
      return blocks.map(block => {
        if (block.id === blockId) {
          return { ...block, props: { ...block.props, ...newProps } };
        }
        if (block.children) {
          return { ...block, children: updateRecursively(block.children) };
        }
        return block;
      });
    };
    const updatedBlocks = updateRecursively(page.blocks);
    onUpdatePageStructure({ ...page, blocks: updatedBlocks });
  };
  
  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    if (over && active.id !== over.id) {
      const oldIndex = page.blocks.findIndex(block => block.id === active.id);
      const newIndex = page.blocks.findIndex(block => block.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const updatedBlocks = arrayMove(page.blocks, oldIndex, newIndex);
        onUpdatePageStructure({...page, blocks: updatedBlocks});
      }
    }
  }

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-neutral-900 shadow-lg rounded-lg border border-border min-h-[400px]">
      {isEditingTitle ? (
        <Input
          type="text"
          value={editableTitle}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          className="font-headline text-3xl md:text-4xl font-bold text-primary mb-6 pb-2 border-b border-transparent focus:border-primary"
          autoFocus
        />
      ) : (
        <h1
          className="font-headline text-3xl md:text-4xl font-bold text-primary mb-6 pb-2 border-b border-border cursor-pointer hover:bg-muted/30"
          onDoubleClick={handleTitleDoubleClick}
          title="Double-click to edit title"
        >
          {page.title}
        </h1>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={page.blocks.map(b => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {page.blocks.map(block => (
              <CanvasBlockRenderer 
                key={block.id} 
                block={block} 
                onUpdateBlock={handleUpdateBlock} 
                pageStructure={page}
                onUpdatePageStructure={onUpdatePageStructure}
                />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
