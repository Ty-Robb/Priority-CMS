
"use client";

import type { KeyboardEvent } from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import type { PageStructure, VisualBlock, VisualBlockPropsUnion, ImageBlockProps, ButtonBlockProps, ListBlockProps, QuoteBlockProps } from '@/types';
import { CanvasBlockRenderer } from './canvas-block-renderer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, Image as ImageIcon, CaseSensitive, List as ListIcon, MessageSquareQuote } from 'lucide-react'; // Added new icons
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
import { addTextBlockToPage } from '@/ai/flows/add-text-block-to-page-flow'; 
import { useToast } from '@/hooks/use-toast'; 

interface PageCanvasProps {
  page: PageStructure | null;
  onUpdatePageStructure: (updatedPage: PageStructure) => void;
  initialTitle?: string;
  onUpdateTitle: (newTitle: string) => void;
}

export function PageCanvas({ page, onUpdatePageStructure, initialTitle, onUpdateTitle }: PageCanvasProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState(initialTitle || page?.title || '');
  const [isProcessingAI, setIsProcessingAI] = useState(false); 
  const { toast } = useToast();

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
    let targetPage = page;
    if (!targetPage) { // If page is null, create a basic one to set the title
        targetPage = {
            id: `page-${Date.now()}`,
            title: editableTitle,
            blocks: [],
        };
        onUpdatePageStructure(targetPage); // Update the parent with this new basic structure
    } else if (targetPage.title !== editableTitle) {
        onUpdatePageStructure({ ...targetPage, title: editableTitle });
    }
    onUpdateTitle(editableTitle); // Always update the title in parent state
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

  const ensurePageStructure = (): PageStructure => {
    if (page) return page;
    const newPage: PageStructure = {
      id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: editableTitle || "New Page",
      blocks: [],
    };
    onUpdatePageStructure(newPage); // Important: update parent state immediately
    if (!initialTitle && editableTitle) onUpdateTitle(editableTitle); // Ensure title is synced if it's the first action
    return newPage;
  };

  const handleAddNewBlock = (type: 'image' | 'button' | 'list' | 'quote') => {
    let currentStructure = ensurePageStructure();
    
    const newBlockId = `block-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    let newBlock: VisualBlock;

    switch (type) {
      case 'image':
        newBlock = {
          id: newBlockId,
          type: 'image',
          props: { src: 'https://placehold.co/600x400.png', alt: 'New placeholder image', dataAiHint: 'placeholder image', width:600, height:400 } as ImageBlockProps,
        };
        break;
      case 'button':
        newBlock = {
          id: newBlockId,
          type: 'button',
          props: { text: 'Click Me', variant: 'default' } as ButtonBlockProps,
        };
        break;
      case 'list':
        newBlock = {
          id: newBlockId,
          type: 'list',
          props: { items: [], ordered: false } as ListBlockProps,
        };
        break;
      case 'quote':
        newBlock = {
          id: newBlockId,
          type: 'quote',
          props: { text: 'Your inspiring quote here.', citation: 'Author' } as QuoteBlockProps,
        };
        break;
      default:
        console.error("Unknown block type to add:", type);
        return;
    }
    
    const updatedStructure = {
        ...currentStructure,
        blocks: [...currentStructure.blocks, newBlock],
    };
    onUpdatePageStructure(updatedStructure);
    toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} Block Added`, description: `A new ${type} block has been added to the page.` });
  };


  const handleAiAddTextBlock = async () => {
    setIsProcessingAI(true);
    toast({ title: "AI is adding a text block...", description: "Please wait a moment." });

    let basePageStructure = ensurePageStructure();
    
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
      setIsProcessingAI(false);
    }
  };

  const noContentYet = !page || page.blocks.length === 0;

  if (noContentYet && !isProcessingAI) { 
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
            {editableTitle || "Untitled Page"}
            </h1>
        )}
        <div className="border border-dashed border-muted-foreground rounded-lg text-center text-muted-foreground min-h-[300px] flex flex-col items-center justify-center bg-white dark:bg-neutral-900 py-8">
            <p className="mb-4">This page is empty. Start by adding a block.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <Button onClick={handleAiAddTextBlock} variant="outline" disabled={isProcessingAI}>
                    {isProcessingAI ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CaseSensitive className="mr-2 h-4 w-4" />}
                    Text (AI)
                </Button>
                <Button onClick={() => handleAddNewBlock('image')} variant="outline">
                    <ImageIcon className="mr-2 h-4 w-4" /> Image
                </Button>
                <Button onClick={() => handleAddNewBlock('button')} variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" /> Button
                </Button>
                <Button onClick={() => handleAddNewBlock('list')} variant="outline">
                    <ListIcon className="mr-2 h-4 w-4" /> List
                </Button>
                <Button onClick={() => handleAddNewBlock('quote')} variant="outline">
                    <MessageSquareQuote className="mr-2 h-4 w-4" /> Quote
                </Button>
            </div>
        </div>
      </div>
    );
  }
  
  if (!page && isProcessingAI) {
    return (
      <div className="p-8 border border-dashed border-muted-foreground rounded-lg text-center text-muted-foreground min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-neutral-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>AI is creating your first block...</p>
      </div>
    );
  }
  
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
      <div className="mt-6 pt-6 border-t">
        <p className="text-sm text-muted-foreground mb-2 text-center">Add new block to page:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            <Button onClick={handleAiAddTextBlock} variant="outline" className="w-full" disabled={isProcessingAI}>
            {isProcessingAI ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CaseSensitive className="mr-2 h-4 w-4" />}
            Text (AI)
            </Button>
            <Button onClick={() => handleAddNewBlock('image')} variant="outline" className="w-full">
                <ImageIcon className="mr-2 h-4 w-4" /> Image
            </Button>
            <Button onClick={() => handleAddNewBlock('button')} variant="outline" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Button
            </Button>
            <Button onClick={() => handleAddNewBlock('list')} variant="outline" className="w-full">
                <ListIcon className="mr-2 h-4 w-4" /> List
            </Button>
            <Button onClick={() => handleAddNewBlock('quote')} variant="outline" className="w-full">
                <MessageSquareQuote className="mr-2 h-4 w-4" /> Quote
            </Button>
        </div>
      </div>
    </div>
  );
}
