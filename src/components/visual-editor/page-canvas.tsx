
"use client";

import type { KeyboardEvent } from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import type { PageStructure, VisualBlock, VisualBlockPropsUnion } from '@/types';
import { CanvasBlockRenderer } from './canvas-block-renderer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
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
  initialTitle?: string; // Changed from pageTitle to initialTitle for clarity
  onUpdateTitle: (newTitle: string) => void; // Callback to update parent's title state
}

export function PageCanvas({ page, onUpdatePageStructure, initialTitle, onUpdateTitle }: PageCanvasProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  // editableTitle is the local state for the input field when editing title
  const [editableTitle, setEditableTitle] = useState(initialTitle || page?.title || '');

  useEffect(() => {
    // Sync from prop if page or initialTitle changes and not currently editing
    if (!isEditingTitle) {
      setEditableTitle(initialTitle || page?.title || 'Untitled Page');
    }
  }, [page, initialTitle, isEditingTitle]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleTitleDoubleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditableTitle(event.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (page && page.title !== editableTitle) {
      onUpdatePageStructure({ ...page, title: editableTitle });
    }
    onUpdateTitle(editableTitle); // Update parent's title state
  };

  const handleTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleTitleBlur();
    } else if (event.key === 'Escape') {
      setEditableTitle(page?.title || initialTitle || ''); 
      setIsEditingTitle(false);
      // No need to call onUpdateTitle if escaping, keep original
    }
  };

  const handleUpdateBlock = useCallback((blockId: string, newProps: Partial<VisualBlockPropsUnion>) => {
    if (!page) return;
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
  }, [page, onUpdatePageStructure]);
  
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    if (!page) return;
    const {active, over} = event;
    if (over && active.id !== over.id) {
      const oldIndex = page.blocks.findIndex(block => block.id === active.id);
      const newIndex = page.blocks.findIndex(block => block.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const updatedBlocks = arrayMove(page.blocks, oldIndex, newIndex);
        onUpdatePageStructure({...page, blocks: updatedBlocks});
      }
    }
  }, [page, onUpdatePageStructure]);

  const handleDeleteBlock = useCallback((blockId: string) => {
    if (!page) return;
    const filterRecursively = (blocks: VisualBlock[]): VisualBlock[] => {
      const filtered = blocks.filter(block => block.id !== blockId);
      return filtered.map(block => {
        if (block.children) {
          return { ...block, children: filterRecursively(block.children) };
        }
        return block;
      });
    };
    const updatedBlocks = filterRecursively(page.blocks);
    onUpdatePageStructure({ ...page, blocks: updatedBlocks });
  }, [page, onUpdatePageStructure]);

  const handleAddNewTextBlock = useCallback(() => {
    const newBlock: VisualBlock = {
      id: `block-text-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: 'text',
      props: { text: 'New paragraph. Double-click to edit me!', level: 'p' },
    };
    if (page) {
      onUpdatePageStructure({ ...page, blocks: [...page.blocks, newBlock] });
    } else {
      const newPage: PageStructure = {
        id: `page-${Date.now()}`,
        title: editableTitle || "New Page Title", // Use current editableTitle or default
        blocks: [newBlock],
      };
      onUpdatePageStructure(newPage);
      if (!initialTitle) onUpdateTitle(newPage.title); // Update parent title if it was not set
    }
  }, [page, onUpdatePageStructure, editableTitle, initialTitle, onUpdateTitle]);

  if (!page) {
    return (
      <div className="p-8 border border-dashed border-muted-foreground rounded-lg text-center text-muted-foreground min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-neutral-900">
        <p className="mb-4">No page structure. Generate content via chat or add your first block.</p>
        <Button onClick={handleAddNewTextBlock} variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" /> Add First Text Block
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-neutral-900 shadow-lg rounded-lg border border-border min-h-[400px]">
      {isEditingTitle ? (
        <Input
          type="text"
          value={editableTitle}
          onChange={handleTitleInputChange}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          className="font-headline text-3xl md:text-4xl font-bold text-primary mb-6 pb-2 border-b-2 border-primary focus:border-primary bg-transparent"
          autoFocus
        />
      ) : (
        <h1
          className="font-headline text-3xl md:text-4xl font-bold text-primary mb-6 pb-2 border-b border-border cursor-pointer hover:bg-muted/30 rounded-sm px-2 -mx-2"
          onDoubleClick={handleTitleDoubleClick}
          title="Double-click to edit title"
        >
          {editableTitle}
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
                onDeleteBlock={handleDeleteBlock} 
                pageStructure={page} // Pass full structure for context if needed by renderer (though not used yet)
                onUpdatePageStructure={onUpdatePageStructure} // Pass down for potential deep updates (not used yet by renderer)
                />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="mt-6 text-center">
        <Button onClick={handleAddNewTextBlock} variant="outline" className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Text Block to End
        </Button>
      </div>
    </div>
  );
}

    