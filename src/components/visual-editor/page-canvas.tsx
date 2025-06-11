
"use client";

import type { KeyboardEvent } from 'react';
import React, { useState, useEffect } from 'react';
import type { PageStructure, VisualBlock, VisualBlockPropsUnion } from '@/types';
import { CanvasBlockRenderer } from './canvas-block-renderer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'; // Added for "Add Block" button
import { PlusCircle } from 'lucide-react'; // Icon for "Add Block" button
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
    } else {
      setEditableTitle(''); // Clear title if page is null
    }
  }, [page]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      setEditableTitle(page?.title || ''); 
      setIsEditingTitle(false);
    }
  };

  const handleUpdateBlock = (blockId: string, newProps: Partial<VisualBlockPropsUnion>) => {
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
  };
  
  function handleDragEnd(event: DragEndEvent) {
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
  }

  const handleDeleteBlock = (blockId: string) => {
    if (!page) return;
    // This needs to recursively find and delete nested blocks if necessary for container blocks
    // For now, focus on top-level. A more robust solution would handle children.
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
  };

  const handleAddNewTextBlock = () => {
    const newBlock: VisualBlock = {
      id: `block-text-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: 'text',
      props: { text: 'New paragraph. Double-click to edit me!', level: 'p' },
    };
    if (page) {
      onUpdatePageStructure({ ...page, blocks: [...page.blocks, newBlock] });
    } else {
      // If there's no page, create one with this block
      onUpdatePageStructure({
        id: `page-${Date.now()}`,
        title: 'New Page Title',
        blocks: [newBlock],
      });
      setEditableTitle('New Page Title'); // Set title for the new page
    }
  };

  if (!page) {
    return (
      <div className="p-8 border border-dashed border-muted-foreground rounded-lg text-center text-muted-foreground min-h-[400px] flex flex-col items-center justify-center">
        <p className="mb-4">No page structure to display. Generate content using the chat or add your first block.</p>
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
          {editableTitle || "Untitled Page"}
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
                pageStructure={page}
                onUpdatePageStructure={onUpdatePageStructure}
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
