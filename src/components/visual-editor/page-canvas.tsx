
"use client";

import type { KeyboardEvent } from 'react';
import React, { useState, useEffect } from 'react';
import type { PageStructure, VisualBlock, VisualBlockPropsUnion } from '@/types';
import { CanvasBlockRenderer } from './canvas-block-renderer';
import { Input } from '@/components/ui/input'; // For inline editing

interface PageCanvasProps {
  page: PageStructure | null;
  onUpdatePageStructure: (updatedPage: PageStructure) => void;
}

export function PageCanvas({ page, onUpdatePageStructure }: PageCanvasProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState(page?.title || '');

  useEffect(() => {
    // Update local editable title if the page prop changes from outside
    if (page) {
      setEditableTitle(page.title);
    }
  }, [page?.title]);

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
      setEditableTitle(page.title); // Revert changes
      setIsEditingTitle(false);
    }
  };

  const handleUpdateBlock = (blockId: string, newProps: Partial<VisualBlockPropsUnion>) => {
    const updatedBlocks = page.blocks.map(block =>
      block.id === blockId ? { ...block, props: { ...block.props, ...newProps } } : block
    );
    // This needs to handle nested blocks eventually for containers
    onUpdatePageStructure({ ...page, blocks: updatedBlocks });
  };


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
    </div>
  );
}
