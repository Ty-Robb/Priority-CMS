
"use client";

import type { PageStructure } from '@/types';
import { CanvasBlockRenderer } from './canvas-block-renderer';

interface PageCanvasProps {
  page: PageStructure | null;
}

export function PageCanvas({ page }: PageCanvasProps) {
  if (!page) {
    return (
      <div className="p-8 border border-dashed border-muted-foreground rounded-lg text-center text-muted-foreground">
        No page structure to display. Generate content using the chat or load a page.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-neutral-900 shadow-lg rounded-lg border border-border min-h-[400px]">
      <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-6 pb-2 border-b border-border">
        {page.title}
      </h1>
      <div>
        {page.blocks.map(block => (
          <CanvasBlockRenderer key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
}
