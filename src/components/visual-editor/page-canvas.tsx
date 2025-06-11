
"use client";

import type { KeyboardEvent } from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import type { PageStructure, VisualBlock, VisualBlockPropsUnion } from '@/types';
import { CanvasBlockRenderer } from './canvas-block-renderer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react'; // Added Loader2
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
import { addTextBlockToPage } from '@/ai/flows/add-text-block-to-page-flow'; // Import the AI flow
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface PageCanvasProps {
  page: PageStructure | null;
  onUpdatePageStructure: (updatedPage: PageStructure) => void;
  initialTitle?: string;
  onUpdateTitle: (newTitle: string) => void;
}

export function PageCanvas({ page, onUpdatePageStructure, initialTitle, onUpdateTitle }: PageCanvasProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState(initialTitle || page?.title || '');
  const [isAddingTextBlock, setIsAddingTextBlock] = useState(false); // Loading state for AI
  const { toast } = useToast(); // Initialize toast

  useEffect(() => {
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
    onUpdateTitle(editableTitle);
  };

  const handleTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleTitleBlur();
    } else if (event.key === 'Escape') {
      setEditableTitle(page?.title || initialTitle || ''); 
      setIsEditingTitle(false);
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

  const handleAddNewTextBlock = async () => {
    setIsAddingTextBlock(true);
    toast({ title: "AI is adding a text block...", description: "Please wait a moment." });

    let basePageStructure = page;
    if (!basePageStructure) {
      // If no page exists, create a minimal structure to pass to the AI
      basePageStructure = {
        id: `page-${Date.now()}`,
        title: editableTitle || "New Page Title",
        blocks: [],
      };
      if (!initialTitle) onUpdateTitle(basePageStructure.title);
    }
    
    const newParagraphText = "New AI-added paragraph. Double-click me to edit!";

    try {
      const result = await addTextBlockToPage({
        currentPageStructure: basePageStructure,
        paragraphText: newParagraphText,
      });
      onUpdatePageStructure(result.updatedPageStructure);
      toast({ title: "Text Block Added by AI!", description: "The new block has been appended to your page." });
    } catch (error) {
      console.error("Error adding text block with AI:", error);
      toast({
        title: "AI Error",
        description: "Could not add the text block. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingTextBlock(false);
    }
  };

  if (!page && !isAddingTextBlock) { // Show placeholder only if not currently adding a block to a new page
    return (
      <div className="p-8 border border-dashed border-muted-foreground rounded-lg text-center text-muted-foreground min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-neutral-900">
        <p className="mb-4">No page structure. Generate content via chat or add your first block.</p>
        <Button onClick={handleAddNewTextBlock} variant="outline" disabled={isAddingTextBlock}>
          {isAddingTextBlock ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
          Add First Text Block (AI)
        </Button>
      </div>
    );
  }
  
  // If page is null but we are in the process of adding the first block
  if (!page && isAddingTextBlock) {
    return (
      <div className="p-8 border border-dashed border-muted-foreground rounded-lg text-center text-muted-foreground min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-neutral-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>AI is creating your first block...</p>
      </div>
    );
  }
  
  // This guard is now safe because the above conditions handle `page` being null.
  if (!page) return null; 


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
                pageStructure={page}
                onUpdatePageStructure={onUpdatePageStructure}
                />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="mt-6 text-center">
        <Button onClick={handleAddNewTextBlock} variant="outline" className="w-full sm:w-auto" disabled={isAddingTextBlock}>
          {isAddingTextBlock ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
           Add New Text Block (AI)
        </Button>
      </div>
    </div>
  );
}

    